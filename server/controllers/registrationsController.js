import { TowerControl } from 'lucide-react'
import { query } from '../db/query.js'
import { badRequest, isIsoDate, isNonEmptyString, toTrimmed } from '../lib/validators.js'

// formats and normalizes reg status strings
function normalizeRegistrationStatus(value) {
  if (typeof value !== 'string') return value
  const v = value.trim().toLowerCase()
  if (v === 'active') return 'Active'
  if (v === 'expired') return 'Expired'
  if (v === 'suspended') return 'Suspended'
  return value.trim()
}

// map row to registration details
function mapRowToListRegistration(row) {
  return {
    registration_number: row.registration_number,
    registration_status: row.registration_status,
    expiration_date: row.expiration_date,
    owner: {
			license_number: row.owner_license_number,
			full_name: row.owner_name,
    },
    vehicle: {
			plate_number: row.vehicle_plate_number,
			make: row.vehicle_make,
			model: row.vehicle_model,
			year: row.vehicle_year,
    }
  }
}

// map row to full vehicle details
function mapRowToRegistrationDetails(row) {
  return {
    registration_number: row.registration_number,
    registration_date: row.registration_date,
    registration_status: row.registration_status,
    expiration_date: row.expiration_date,
    owner: {
			license_number: row.owner_license_number,
			full_name: row.owner_name,
    },
    vehicle: {
			plate_number: row.vehicle_plate_number,
			make: row.vehicle_make,
			model: row.vehicle_model,
			year: row.vehicle_year,
    }
  }
}

// parses and trims all fields of body
function parseRegistrationPayload(body) {
	return {
		registration_number: toTrimmed(body.registration_number),
		registration_date: toTrimmed(body.registration_date),
		registration_status: normalizeRegistrationStatus(toTrimmed(body.registration_status)),
		vehicle_plate_number: toTrimmed(body.vehicle_plate_number),
		expiration_date: toTrimmed(body.expiration_date),
	}
}	

// validates payload
function validateRegistrationPayload(res, payload, { requireRegistrationNumber }) {
  if (requireRegistrationNumber && !isNonEmptyString(payload.registration_number)) {
    return badRequest(res, 'registration_number is required')
  }
  // registration number is an 11-digit integer
  if (payload.registration_number) {
    const ok = /\d{11}$/.test(payload.registration_number)
    if (!ok) return badRequest(res, "registration_number must match '12345678901'")
  }
  if (payload.vehicle_plate_number) {
    const ok = /^[A-Z]{3}-\d{4}$/.test(payload.vehicle_plate_number)
    if (!ok) return badRequest(res, "plate_number must match 'ABC-1234'")
  }

  if (!isNonEmptyString(payload.registration_status)) return badRequest(res, 'registration_type is required')

  const registrationsStatuses = new Set(['Active', 'Suspended', 'Expired'])
  if (!registrationsStatuses.has(payload.registration_status)) {
    return badRequest(res, 'registration_status must be "Active", "Expired", or "Suspended"')
  }

  if (!isIsoDate(payload.registration_date)) return badRequest(res, 'registration_date must be YYYY-MM-DD')
  if (!isIsoDate(payload.expiration_date)) return badRequest(res, 'expiration_date must be YYYY-MM-DD')
	
  const issuance = new Date(payload.registration_date)
  const expiration = new Date(payload.expiration_date)
  if (Number.isNaN(issuance.getTime()) || Number.isNaN(expiration.getTime())) {
    return badRequest(res, 'Invalid date values')
  }
  if (issuance > expiration) {
    return badRequest(res, 'issuance_date must be on/before expiration_date')
  }

  return null
}

// get and select registrations given parameters
export async function listRegistrations(req, res) {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  const status = typeof req.query.status === 'string' ? normalizeRegistrationStatus(req.query.status) : ''

  const where = []
  const params = []

  if (search) {
    // search by reg number, license plate, owner, and vehicle details
    const s = search.trim()
    const sPlate = normalizePlateNumber(s)
    const sOwnerLicense = normalizeLicenseNumber(s)
    where.push(
      `(r.registration_number = ? OR
      v.plate_number LIKE ? OR 
      v.make LIKE ? OR 
      v.model LIKE ? OR 
      CONCAT_WS(' ', d.first_name, d.middle_name, d.last_name) LIKE ? OR 
      d.license_number LIKE ?)`,
    )
    params.push(`%${s}%, %${sPlate}%`, `%${s}%`, `%${s}%`, `%${s}%`, `%${sOwnerLicense}%`)
  }

  // search by registration status
  if (type) {
    where.push('r.registration_status = ?')
    params.push(type)
  }

  const sql = `
    SELECT
      r.registration_number,
      DATE_FORMAT(r.expiration_date, '%Y-%m-%d') AS expiration_date,
      r.registration_status,
      v.make AS vehicle_make,
      v.model AS vehicle_model,
      v.year AS vehicle_year,
      v.plate_number AS vehicle_plate_number,
      CONCAT_WS(' ', d.first_name, d.middle_name, d.last_name) AS owner_name
    FROM vehicle_registrations r
    JOIN vehicles v ON r.vehicle_plate_number = v.plate_number
    JOIN drivers d ON d.license_number = v.owner_license_number
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY r.registration_number ASC
    LIMIT 200
  `

  const rows = await query(sql, params)
  res.json({ vehicle_registrations: rows.map(mapRowToListRegistration) })
}

// get and select registration given its reg number
export async function getRegistration(req, res) {
  const registrationNumber = toTrimmed(req.params.registration_number)

  const rows = await query(
    `
    SELECT
      r.registration_number,
      DATE_FORMAT(r.registration_date, '%Y-%m-%d') AS registration_date,
      DATE_FORMAT(r.expiration_date, '%Y-%m-%d') AS expiration_date,
      r.registration_status,
      v.make,
      v.model,
      v.year,
      v.plate_number AS vehicle_plate_number,
      d.license_number,
      CONCAT_WS(' ', d.first_name, d.middle_name, d.last_name) AS owner_name
    FROM vehicle_registrations r
    JOIN vehicles v ON r.vehicle_plate_number = v.plate_number
    JOIN drivers d ON d.license_number = v.owner_license_number
    WHERE r.registration_number = ?
    LIMIT 1
    `,
    [registrationNumber],
  )

  if (!rows.length) return res.status(404).json({ error: 'Registration not found' })

  const registration = mapRowToRegistrationDetails(rows[0])

  res.json({ registration })
}

// creates and inserts a vehicle registration
export async function createRegistration(req, res) {
  const payload = parseRegistrationPayload(req.body)
  const error = validateRegistrationPayload(res, payload, { requireRegistrationNumber: true })
  if (error) return

  try {
    await query(
      `
        INSERT INTO vehicle_registrations (
          registration_number, registration_status, vehicle_plate_number,
          expiration_date, registration_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payload.registration_number,
        payload.registration_status,
        payload.vehicle_plate_number,
        payload.expiration_date,
        payload.registration_date,
      ],
    )
  } catch (e) {
    if (String(e?.code) === 'ER_DUP_ENTRY') {
      const msg = String(e?.sqlMessage ?? '').toLowerCase()
      return res.status(409).json({ error: 'Vehicle registration already exists' })
    }
    if (String(e?.code) === 'ER_NO_REFERENCED_ROW_2') {
      return badRequest(res, 'vehicle_plate_number does not exist')
    }
    if (Number(e?.errno) === 1265) {
      return badRequest(
        res,
        'Invalid registration_status for current DB schema',
        'Run server/db/schema.sql or `npm run db:upgrade-enums`.',
      )
    }
    throw e
  }

  res.status(201).json({ ok: true })
}

// update vehicle registration
export async function updateRegistration(req, res) {
  const regNumber = toTrimmed(req.params.registration_number)
  const payload = parseRegistrationPayload(req.body)
  const error = validateRegistrationPayload(res, payload, { requireRegistrationNumber: false })
  if (error) return

  try {
    // sql query
    await query(
      `
        UPDATE vehicles
        SET
          registration_status = ?,
          registration_date = ?,
          vehicle_plate_number = ?,
          expiration_date = ?
        WHERE registration_number = ?
      `,
      [
        payload.registration_status,
        payload.registration_date,
        payload.vehicle_plate_number,
        payload.expiration_date,
        regNumber
      ],
    )
  } catch (e) {
    // FK error
    if (String(e?.code) === 'ER_NO_REFERENCED_ROW_2') {
      return badRequest(res, 'vehicle_plate_number does not exist')
    }
    // status does not exist
    if (Number(e?.errno) === 1265) {
      return badRequest(
        res,
        'Invalid registration_status for current DB schema',
        'Run server/db/schema.sql or `npm run db:upgrade-enums`.',
      )
    }
    throw e
  } 

  const exists = await query('SELECT registration_number FROM vehicle_registrations WHERE registration_number = ? LIMIT 1', [
    payload.registration_number ?? regNumber,
  ])
  if (!exists.length) return res.status(404).json({ error: 'Vehicle not found' })

  res.json({ ok: true })
}

export async function deleteRegistration(req, res) {
  const regNumber = toTrimmed(req.params.registration_number)
  const result = await query('DELETE FROM vehicle_registrations WHERE registration_number = ?', [regNumber])
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Vehicle registration not found' })
  res.status(204).end()
}
