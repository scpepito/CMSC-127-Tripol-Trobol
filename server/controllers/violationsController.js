import { TowerControl } from 'lucide-react'
import { query } from '../db/query.js'
import { badRequest, isIsoDate, isNonEmptyString, toTrimmed } from '../lib/validators.js'

// formats and normalizes reg status strings
function normalizeViolationStatus(value) {
  if (typeof value !== 'string') return value
  const v = value.trim().toLowerCase()
  if (v === 'unpaid') return 'Unpaid'
  if (v === 'paid') return 'Paid'
  if (v === 'contested') return 'Contested'
  return value.trim()
}

function isoToday() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function normalizeLicenseNumber(value) {
  if (typeof value !== 'string') return value
  return value.replace(/-/g, '').trim().toUpperCase()
}

function normalizePlateNumber(value) {
  if (typeof value !== 'string') return value
  const cleaned = value.replace(/\s+/g, '').toUpperCase()
  if (/^[A-Z]{3}\d{4}$/.test(cleaned)) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
  }
  return cleaned
}

// map row to violation details
function mapRowToListViolation(row) {
  return {
    violation_id: row.violation_id,
    violation_type: row.violation_type,
    violation_status: row.violation_status,
    date: row.date,
    violation_fine: row.violation_fine,
    driver: {
            license_number: row.driver_license_number,
            full_name: row.driver_name,
    },
    vehicle: {
            plate_number: row.vehicle_plate_number,
    }
  }
}

// map row to full violation details
function mapRowToViolationDetails(row, violations) {
  return {
    violation_id: row.violation_id,
    violation_type: row.violation_type,
    violation_status: row.violation_status,
    apprehending_officer: row.apprehending_officer,
    date: row.date,
    violation_fine: row.violation_fine,
    location: {
    street: row.street,
    city: row.city,
    region: row.region,
    province: row.province,
    postal_code: row.postal_code,
    },
    driver: {
            license_number: row.driver_license_number,
            full_name: row.driver_name,
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
function parseViolationPayload(body) {
    return {
        violation_id: toTrimmed(body.violation_id),
        violation_type: toTrimmed(body.violation_type),
        violation_status: normalizeViolationStatus(body.violation_status),
        apprehending_officer: toTrimmed(body.apprehending_officer),
        date: toTrimmed(body.date),
        street: toTrimmed(body.street),
        city: toTrimmed(body.city),
        region: toTrimmed(body.region),
        province: toTrimmed(body.province),
        postal_code: toTrimmed(body.postal_code),
        violation_fine: toTrimmed(body.violation_fine),
        license_number: normalizeLicenseNumber(body.license_number),
        plate_number: normalizePlateNumber(toTrimmed(body.plate_number)),
    }
}	

// validates payload
function validateViolationPayload(res, payload, { requireViolationId }) {
    if (requireViolationId && !isNonEmptyString(payload.violation_id)) {
        return badRequest(res, 'violation_id is required')
    }
    // violation id is an 11-digit integer
    if (payload.violation_id) {
        const ok = /\d{11}$/.test(payload.violation_id)
        if (!ok) return badRequest(res, "violation_id must match '12345678901'")
    }

    if (!isNonEmptyString(payload.violation_type)) return badRequest(res, 'violation_type is required')

    if (!isNonEmptyString(payload.violation_status)) return badRequest(res, 'violation_status is required')
    const violationStatuses = new Set(['Paid', 'Unpaid', 'Contested'])
    if (!violationStatuses.has(payload.violation_status)) {
        return badRequest(res, 'violation_status must be "Paid", "Unpaid", or "Contested"')
    }
    
    if (!isIsoDate(payload.date)) return badRequest(res, 'date must be YYYY-MM-DD')
    const date = new Date(payload.date)
    const today = new Date(isoToday())
    if (Number.isNaN(date.getTime())) {
        return badRequest(res, 'Invalid date values')
    }
    if (date > today) {
        return badRequest(res, 'date must be on/before today')
    }
    
    if (!isNonEmptyString(payload.street)) return badRequest(res, 'street is required')
    if (!isNonEmptyString(payload.city)) return badRequest(res, 'city is required')
    if (!isNonEmptyString(payload.region)) return badRequest(res, 'region is required')
    if (!isNonEmptyString(payload.province)) return badRequest(res, 'province is required')

    if (typeof payload.violation_fine !== 'number' || Number.isNaN(payload.violation_fine)) {
        return badRequest(res, 'violation_fine must be a number')
    }
    if (payload.violation_fine < 0) {
        return badRequest(res, 'violation_fine cannot be negative')
    }

    if (payload.license_number) {
        const ok = /^[A-Z0-9]{11}$/.test(payload.license_number)
        if (!ok) return badRequest(res, 'license_number must be 11 alphanumeric characters (dashes optional)')
    } 

    if (payload.plate_number) {
        const ok = /^[A-Z]{3}-\d{4}$/.test(payload.plate_number)
        if (!ok) return badRequest(res, "plate_number must match 'ABC-1234'")
    }

    return null
}


//// I STOPPED CODING HEREEEEEEE

// get and select registrations given parameters
export async function listViolations(req, res) {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  const status = typeof req.query.status === 'string' ? normalizeViolationStatus(req.query.status) : ''

  const where = []
  const params = []

  if (search) {
    // search by ticket number, driver, violation type, date, location, or fine amount
    const s = search.trim()
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
  if (status) {
    where.push('r.registration_status = ?')
    params.push(status)
  }

  const sql = `
    SELECT
      v.violation_id,
      v.violation_type
      DATE_FORMAT(v.date, '%Y-%m-%d') AS date,
      v.location,
      v.apprehending_officer AS apprehending_officer,
      v.violation_status,
      v.license_number,
      v.plate_number,
      CONCAT_WS(' ', d.first_name, d.middle_name, d.last_name) AS driver_name
    FROM violations v
    JOIN vehicles v ON r.vehicle_plate_number = v.plate_number
    JOIN drivers d ON v.owner_license_number = d.license_number
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY r.registration_number ASC
    LIMIT 200
  ` // Set alias here

  const rows = await query(sql, params)
  if (!rows.length) return res.status(404).json({ error: 'No violation found' })
  res.json({ violations: rows.map(mapRowToListViolation) })
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
      v.make AS vehicle_make,
      v.model AS vehicle_model,
      v.year AS vehicle_year,
      v.plate_number AS vehicle_plate_number,
      d.license_number AS owner_license_number,
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

  // select registrations with same license plate
  const registrations = await query(
    `
    SELECT
      registration_number,
      DATE_FORMAT(registration_date, '%Y-%m-%d') AS registration_date,
      DATE_FORMAT(expiration_date, '%Y-%m-%d') AS expiration_date,
      registration_status
    FROM vehicle_registrations
    WHERE vehicle_plate_number = (
      SELECT vehicle_plate_number
      FROM vehicle_registrations
      WHERE registration_number = ?
      )
    ORDER BY registration_number DESC
    `,
    [registrationNumber],
  )

  if (!registrations.length) return res.status(404).json({ error: 'Registrations not found' })

  const registration = mapRowToRegistrationDetails(rows[0], registrations)
  
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
        ) VALUES (?, ?, ?, ?, ?)
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
      return badRequest(res, `'vehicle_plate_number does not exist' ${payload.vehicle_plate_number}`)
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
export async function updateViolation(req, res) {
  const violationId = toTrimmed(req.params.violation_id)
  const payload = parseViolationPayload(req.body)
  const error = validateRegistrationPayload(res, payload, { requireRegistrationNumber: false })
  if (error) return

  try {
    // sql query
    await query(
      `
        UPDATE vehicle_registrations
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

export async function deleteViolation(req, res) {
  const violationId = toTrimmed(req.params.violation_id)
  const result = await query('DELETE FROM violations WHERE violation_id = ?', [violationId])
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Violation ID not found' })
  res.status(204).end()
}
