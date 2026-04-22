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
function parseRegistrationPaylod(body) {
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
      `(r.registration_number LIKE ? OR
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
      v.make,
      v.model,
      v.year,
      v.plate_number AS vehicle_plate_number,
      CONCAT_WS(' ', d.first_name, d.middle_name, d.last_name) AS owner_name
    FROM vehicle_registrations
    JOIN vehicles v ON r.vehicle_plate_number = v.plate_number
    JOIN drivers d ON d.license_number = v.owner_license_number
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY r.registration_number ASC
    LIMIT 200
  `

  const rows = await query(sql, params)
  res.json({ vehicle_registrations: rows.map(mapRowToListRegistration) })
}

export async function getVehicle(req, res) {
  // TODO: reg number format
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
    FROM vehicle_registrations
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


// TODO: update functions
export async function createVehicle(req, res) {
  const payload = parseVehiclePayload(req.body)
  const error = validateVehiclePayload(res, payload, { requirePlateNumber: true })
  if (error) return

  try {
    await query(
      `
        INSERT INTO vehicles (
          plate_number, engine_number, chassis_number, owner_license_number,
          vehicle_type, make, model, year, color
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payload.plate_number,
        payload.engine_number,
        payload.chassis_number,
        payload.owner_license_number,
        payload.vehicle_type,
        payload.make,
        payload.model,
        payload.year,
        payload.color,
      ],
    )
  } catch (e) {
    if (String(e?.code) === 'ER_DUP_ENTRY') {
      const msg = String(e?.sqlMessage ?? '').toLowerCase()
      if (msg.includes('uk_engine')) return res.status(409).json({ error: 'engine_number already exists' })
      if (msg.includes('uk_chassis')) return res.status(409).json({ error: 'chassis_number already exists' })
      return res.status(409).json({ error: 'Vehicle already exists' })
    }
    if (String(e?.code) === 'ER_NO_REFERENCED_ROW_2') {
      return badRequest(res, 'owner_license_number does not exist')
    }
    throw e
  }

  res.status(201).json({ ok: true })
}

export async function updateVehicle(req, res) {
  const plateNumber = normalizePlateNumber(req.params.plate_number)
  const payload = parseVehiclePayload(req.body)
  const error = validateVehiclePayload(res, payload, { requirePlateNumber: false })
  if (error) return

  if (payload.plate_number && payload.plate_number !== plateNumber) {
    // Allow updating the plate number (PK) by setting it explicitly.
    // This relies on ON UPDATE CASCADE on any dependent tables.
    try {
      await query(
        `
          UPDATE vehicles
          SET
            plate_number = ?,
            engine_number = ?,
            chassis_number = ?,
            owner_license_number = ?,
            vehicle_type = ?,
            make = ?,
            model = ?,
            year = ?,
            color = ?
          WHERE plate_number = ?
        `,
        [
          payload.plate_number,
          payload.engine_number,
          payload.chassis_number,
          payload.owner_license_number,
          payload.vehicle_type,
          payload.make,
          payload.model,
          payload.year,
          payload.color,
          plateNumber,
        ],
      )
    } catch (e) {
      if (String(e?.code) === 'ER_DUP_ENTRY') {
        const msg = String(e?.sqlMessage ?? '').toLowerCase()
        if (msg.includes('uk_engine')) return res.status(409).json({ error: 'engine_number already exists' })
        if (msg.includes('uk_chassis')) return res.status(409).json({ error: 'chassis_number already exists' })
        return res.status(409).json({ error: 'plate_number already exists' })
      }
      if (String(e?.code) === 'ER_NO_REFERENCED_ROW_2') {
        return badRequest(res, 'owner_license_number does not exist')
      }
      throw e
    }
  } else {
    try {
      await query(
        `
          UPDATE vehicles
          SET
            engine_number = ?,
            chassis_number = ?,
            owner_license_number = ?,
            vehicle_type = ?,
            make = ?,
            model = ?,
            year = ?,
            color = ?
          WHERE plate_number = ?
        `,
        [
          payload.engine_number,
          payload.chassis_number,
          payload.owner_license_number,
          payload.vehicle_type,
          payload.make,
          payload.model,
          payload.year,
          payload.color,
          plateNumber,
        ],
      )
    } catch (e) {
      if (String(e?.code) === 'ER_NO_REFERENCED_ROW_2') {
        return badRequest(res, 'owner_license_number does not exist')
      }
      throw e
    }
  }

  const exists = await query('SELECT plate_number FROM vehicles WHERE plate_number = ? LIMIT 1', [
    payload.plate_number ?? plateNumber,
  ])
  if (!exists.length) return res.status(404).json({ error: 'Vehicle not found' })

  res.json({ ok: true })
}

export async function deleteVehicle(req, res) {
  const plateNumber = normalizePlateNumber(req.params.plate_number)
  const result = await query('DELETE FROM vehicles WHERE plate_number = ?', [plateNumber])
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Vehicle not found' })
  res.status(204).end()
}
