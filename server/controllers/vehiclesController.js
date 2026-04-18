import { query } from '../db/query.js'
import { badRequest, isNonEmptyString, toTrimmed } from '../lib/validators.js'

function normalizePlateNumber(value) {
  if (typeof value !== 'string') return value
  const cleaned = value.replace(/\s+/g, '').toUpperCase()
  if (/^[A-Z]{3}\d{4}$/.test(cleaned)) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
  }
  return cleaned
}

function normalizeLicenseNumber(value) {
  if (typeof value !== 'string') return value
  return value.replace(/-/g, '').trim().toUpperCase()
}

function normalizeVehicleType(value) {
  if (typeof value !== 'string') return value
  const v = value.trim().toLowerCase()
  if (v === 'private car') return 'Private Car'
  if (v === 'motorcycle') return 'Motorcycle'
  if (v === 'public utility vehicle' || v === 'puv') return 'Public Utility Vehicle'
  return value.trim()
}

function mapRowToListVehicle(row) {
  return {
    plate_number: row.plate_number,
    vehicle_type: row.vehicle_type,
    make: row.make,
    model: row.model,
    year: row.year,
    color: row.color,
    owner: {
      license_number: row.owner_license_number,
      full_name: row.owner_name,
    },
  }
}

function mapRowToVehicleDetails(row) {
  return {
    plate_number: row.plate_number,
    engine_number: row.engine_number,
    chassis_number: row.chassis_number,
    vehicle_type: row.vehicle_type,
    make: row.make,
    model: row.model,
    year: row.year,
    color: row.color,
    owner: {
      license_number: row.owner_license_number,
      full_name: row.owner_name,
    },
  }
}

function parseVehiclePayload(body) {
  return {
    plate_number: normalizePlateNumber(toTrimmed(body.plate_number)),
    engine_number: toTrimmed(body.engine_number),
    chassis_number: toTrimmed(body.chassis_number),
    owner_license_number: normalizeLicenseNumber(toTrimmed(body.owner_license_number)),
    vehicle_type: normalizeVehicleType(body.vehicle_type),
    make: toTrimmed(body.make),
    model: toTrimmed(body.model),
    year: typeof body.year === 'number' ? body.year : Number(String(body.year ?? '').trim()),
    color: toTrimmed(body.color),
  }
}

function validateVehiclePayload(res, payload, { requirePlateNumber }) {
  if (requirePlateNumber && !isNonEmptyString(payload.plate_number)) {
    return badRequest(res, 'plate_number is required')
  }
  if (payload.plate_number) {
    const ok = /^[A-Z]{3}-\d{4}$/.test(payload.plate_number)
    if (!ok) return badRequest(res, "plate_number must match 'ABC-1234'")
  }

  if (!isNonEmptyString(payload.engine_number)) return badRequest(res, 'engine_number is required')
  if (!isNonEmptyString(payload.chassis_number)) return badRequest(res, 'chassis_number is required')

  if (!isNonEmptyString(payload.owner_license_number)) return badRequest(res, 'owner_license_number is required')
  if (!/^[A-Z0-9]{11}$/.test(payload.owner_license_number)) {
    return badRequest(res, 'owner_license_number must be 11 alphanumeric characters (dashes optional)')
  }

  const vehicleTypes = new Set(['Private Car', 'Motorcycle', 'Public Utility Vehicle'])
  if (!vehicleTypes.has(payload.vehicle_type)) {
    return badRequest(res, "vehicle_type must be 'Private Car', 'Motorcycle', or 'Public Utility Vehicle'")
  }

  if (!isNonEmptyString(payload.make)) return badRequest(res, 'make is required')
  if (!isNonEmptyString(payload.model)) return badRequest(res, 'model is required')
  if (!Number.isFinite(payload.year)) return badRequest(res, 'year is required')
  if (payload.year < 1900 || payload.year > 2100) return badRequest(res, 'year must be between 1900 and 2100')
  if (!isNonEmptyString(payload.color)) return badRequest(res, 'color is required')

  return null
}

export async function listVehicles(req, res) {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  const type = typeof req.query.type === 'string' ? normalizeVehicleType(req.query.type) : ''

  const where = []
  const params = []

  if (search) {
    const s = search.trim()
    const sPlate = normalizePlateNumber(s)
    const sOwner = normalizeLicenseNumber(s)
    where.push(
      `(v.plate_number LIKE ? OR v.make LIKE ? OR v.model LIKE ? OR CONCAT_WS(' ', d.first_name, d.middle_name, d.last_name) LIKE ? OR d.license_number LIKE ?)`,
    )
    params.push(`%${sPlate}%`, `%${s}%`, `%${s}%`, `%${s}%`, `%${sOwner}%`)
  }

  if (type) {
    where.push('v.vehicle_type = ?')
    params.push(type)
  }

  const sql = `
    SELECT
      v.plate_number,
      v.vehicle_type,
      v.make,
      v.model,
      v.year,
      v.color,
      d.license_number AS owner_license_number,
      CONCAT_WS(' ', d.first_name, d.middle_name, d.last_name) AS owner_name
    FROM vehicles v
    JOIN drivers d ON d.license_number = v.owner_license_number
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY v.plate_number ASC
    LIMIT 200
  `

  const rows = await query(sql, params)
  res.json({ vehicles: rows.map(mapRowToListVehicle) })
}

export async function getVehicle(req, res) {
  const plateNumber = normalizePlateNumber(req.params.plate_number)

  const rows = await query(
    `
      SELECT
        v.plate_number,
        v.engine_number,
        v.chassis_number,
        v.vehicle_type,
        v.make,
        v.model,
        v.year,
        v.color,
        d.license_number AS owner_license_number,
        CONCAT_WS(' ', d.first_name, d.middle_name, d.last_name) AS owner_name
      FROM vehicles v
      JOIN drivers d ON d.license_number = v.owner_license_number
      WHERE v.plate_number = ?
      LIMIT 1
    `,
    [plateNumber],
  )

  if (!rows.length) return res.status(404).json({ error: 'Vehicle not found' })

  const vehicle = mapRowToVehicleDetails(rows[0])

  res.json({ vehicle })
}

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
