import { query } from '../db/query.js'
import { badRequest, isIsoDate, isNonEmptyString, toTrimmed } from '../lib/validators.js'

function normalizeLicenseType(value) {
  if (typeof value !== 'string') return value
  const v = value.trim().toLowerCase()
  if (v === 'professional') return 'Professional'
  if (v === 'non-professional' || v === 'non professional') return 'Non-Professional'
  if (v === 'student permit' || v === 'student-permit') return 'Student Permit'
  return value.trim()
}

function normalizeLicenseStatus(value) {
  if (typeof value !== 'string') return value
  const v = value.trim().toLowerCase()
  if (v === 'valid') return 'Valid'
  if (v === 'expired') return 'Expired'
  if (v === 'suspended') return 'Suspended'
  if (v === 'revoked') return 'Revoked'
  return value.trim()
}

function normalizeLicenseNumber(value) {
  if (typeof value !== 'string') return value
  return value.replace(/-/g, '').trim().toUpperCase()
}

function mapRowToListDriver(row) {
  return {
    license_number: row.license_number,
    full_name: row.full_name,
    license_type: row.license_type,
    license_status: row.license_status,
    expiration_date: row.expiration_date,
  }
}

function mapRowToDriverDetails(row) {
  return {
    license_number: row.license_number,
    first_name: row.first_name,
    middle_name: row.middle_name,
    last_name: row.last_name,
    full_name: row.full_name,
    date_of_birth: row.date_of_birth,
    sex: row.sex,
    address: {
      street: row.street,
      city: row.city,
      region: row.region,
      province: row.province,
      postal_code: row.postal_code,
    },
    license_type: row.license_type,
    license_status: row.license_status,
    issuance_date: row.issuance_date,
    expiration_date: row.expiration_date,
    vehicles: [],
    violations: [],
  }
}

function parseDriverPayload(body) {
  const payload = {
    license_number: normalizeLicenseNumber(toTrimmed(body.license_number)),
    first_name: toTrimmed(body.first_name),
    middle_name: toTrimmed(body.middle_name ?? null),
    last_name: toTrimmed(body.last_name),
    date_of_birth: toTrimmed(body.date_of_birth),
    sex: toTrimmed(body.sex),
    street: toTrimmed(body.street),
    city: toTrimmed(body.city),
    region: toTrimmed(body.region),
    province: toTrimmed(body.province),
    postal_code: toTrimmed(body.postal_code ?? null),
    license_type: normalizeLicenseType(body.license_type),
    license_status: normalizeLicenseStatus(body.license_status),
    issuance_date: toTrimmed(body.issuance_date),
    expiration_date: toTrimmed(body.expiration_date),
  }

  return payload
}

function validateDriverPayload(res, payload, { requireLicenseNumber }) {
  if (requireLicenseNumber && !isNonEmptyString(payload.license_number)) {
    return badRequest(res, 'license_number is required')
  }
  if (payload.license_number) {
    const ok = /^[A-Z0-9]{11}$/.test(payload.license_number)
    if (!ok) return badRequest(res, 'license_number must be 11 alphanumeric characters (dashes optional)')
  }
  if (!isNonEmptyString(payload.first_name)) return badRequest(res, 'first_name is required')
  if (!isNonEmptyString(payload.last_name)) return badRequest(res, 'last_name is required')
  if (!isIsoDate(payload.date_of_birth)) return badRequest(res, 'date_of_birth must be YYYY-MM-DD')
  if (payload.sex !== 'M' && payload.sex !== 'F') return badRequest(res, "sex must be 'M' or 'F'")
  if (!isNonEmptyString(payload.street)) return badRequest(res, 'street is required')
  if (!isNonEmptyString(payload.city)) return badRequest(res, 'city is required')
  if (!isNonEmptyString(payload.region)) return badRequest(res, 'region is required')
  if (!isNonEmptyString(payload.province)) return badRequest(res, 'province is required')

  const licenseTypes = new Set(['Student Permit', 'Non-Professional', 'Professional'])
  const licenseStatuses = new Set(['Valid', 'Expired', 'Suspended', 'Revoked'])
  if (!licenseTypes.has(payload.license_type)) {
    return badRequest(
      res,
      "license_type must be 'Student Permit', 'Non-Professional', or 'Professional'",
    )
  }
  if (!licenseStatuses.has(payload.license_status)) {
    return badRequest(
      res,
      "license_status must be 'Valid', 'Expired', 'Suspended', or 'Revoked'",
    )
  }
  if (!isIsoDate(payload.issuance_date)) return badRequest(res, 'issuance_date must be YYYY-MM-DD')
  if (!isIsoDate(payload.expiration_date)) return badRequest(res, 'expiration_date must be YYYY-MM-DD')

  const issuance = new Date(payload.issuance_date)
  const expiration = new Date(payload.expiration_date)
  if (Number.isNaN(issuance.getTime()) || Number.isNaN(expiration.getTime())) {
    return badRequest(res, 'Invalid date values')
  }
  if (issuance > expiration) {
    return badRequest(res, 'issuance_date must be on/before expiration_date')
  }

  return null
}

export async function listDrivers(req, res) {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  const searchNoDashes = normalizeLicenseNumber(search)
  const status =
    typeof req.query.status === 'string' ? normalizeLicenseStatus(req.query.status) : ''
  const type = typeof req.query.type === 'string' ? normalizeLicenseType(req.query.type) : ''

  const where = []
  const params = []

  if (search) {
    where.push("(d.license_number LIKE ? OR CONCAT_WS(' ', d.first_name, d.middle_name, d.last_name) LIKE ?)")
    params.push(`%${searchNoDashes}%`, `%${search}%`)
  }
  if (status) {
    where.push('d.license_status = ?')
    params.push(status)
  }
  if (type) {
    where.push('d.license_type = ?')
    params.push(type)
  }

  const sql = `
    SELECT
      d.license_number,
      CONCAT_WS(' ', d.first_name, d.middle_name, d.last_name) AS full_name,
      d.license_type,
      d.license_status,
      DATE_FORMAT(d.expiration_date, '%Y-%m-%d') AS expiration_date
    FROM drivers d
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY d.last_name ASC, d.first_name ASC
    LIMIT 200
  `

  const rows = await query(sql, params)
  res.json({ drivers: rows.map(mapRowToListDriver) })
}

export async function getDriver(req, res) {
  const licenseNumber = normalizeLicenseNumber(req.params.license_number)
  const rows = await query(
    `
      SELECT
        d.license_number,
        d.first_name,
        d.middle_name,
        d.last_name,
        CONCAT_WS(' ', d.first_name, d.middle_name, d.last_name) AS full_name,
        DATE_FORMAT(d.date_of_birth, '%Y-%m-%d') AS date_of_birth,
        d.sex,
        a.street,
        a.city,
        a.region,
        a.province,
        a.postal_code,
        d.license_type,
        d.license_status,
        DATE_FORMAT(d.issuance_date, '%Y-%m-%d') AS issuance_date,
        DATE_FORMAT(d.expiration_date, '%Y-%m-%d') AS expiration_date
      FROM drivers d
      LEFT JOIN driver_addresses a ON a.license_number = d.license_number
      WHERE d.license_number = ?
      LIMIT 1
    `,
    [licenseNumber],
  )

  if (!rows.length) return res.status(404).json({ error: 'Driver not found' })
  res.json({ driver: mapRowToDriverDetails(rows[0]) })
}

export async function createDriver(req, res) {
  const payload = parseDriverPayload(req.body)
  const error = validateDriverPayload(res, payload, { requireLicenseNumber: true })
  if (error) return

  try {
    await query(
      `
        INSERT INTO drivers (
          license_number, first_name, middle_name, last_name,
          date_of_birth, sex, license_type, license_status,
          issuance_date, expiration_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payload.license_number,
        payload.first_name,
        payload.middle_name,
        payload.last_name,
        payload.date_of_birth,
        payload.sex,
        payload.license_type,
        payload.license_status,
        payload.issuance_date,
        payload.expiration_date,
      ],
    )

    await query(
      `
        INSERT INTO driver_addresses (
          license_number, street, city, region, province, postal_code
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        payload.license_number,
        payload.street,
        payload.city,
        payload.region,
        payload.province,
        payload.postal_code,
      ],
    )
  } catch (e) {
    if (String(e?.code) === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Driver already exists' })
    }
    if (Number(e?.errno) === 1265) {
      return badRequest(
        res,
        'Invalid license_type or license_status for current DB schema',
        'Run server/db/schema.sql or `npm run db:upgrade-enums`.',
      )
    }
    throw e
  }

  const rows = await query(
    `
      SELECT
        d.license_number,
        d.first_name,
        d.middle_name,
        d.last_name,
        CONCAT_WS(' ', d.first_name, d.middle_name, d.last_name) AS full_name,
        DATE_FORMAT(d.date_of_birth, '%Y-%m-%d') AS date_of_birth,
        d.sex,
        a.street,
        a.city,
        a.region,
        a.province,
        a.postal_code,
        d.license_type,
        d.license_status,
        DATE_FORMAT(d.issuance_date, '%Y-%m-%d') AS issuance_date,
        DATE_FORMAT(d.expiration_date, '%Y-%m-%d') AS expiration_date
      FROM drivers d
      LEFT JOIN driver_addresses a ON a.license_number = d.license_number
      WHERE d.license_number = ?
      LIMIT 1
    `,
    [payload.license_number],
  )

  res.status(201).json({ driver: mapRowToDriverDetails(rows[0]) })
}

export async function updateDriver(req, res) {
  const licenseNumber = normalizeLicenseNumber(req.params.license_number)
  const payload = parseDriverPayload({ ...req.body, license_number: licenseNumber })
  const error = validateDriverPayload(res, payload, { requireLicenseNumber: false })
  if (error) return

  const existing = await query('SELECT license_number FROM drivers WHERE license_number = ? LIMIT 1', [
    licenseNumber,
  ])
  if (!existing.length) return res.status(404).json({ error: 'Driver not found' })

  try {
    await query(
      `
        UPDATE drivers
        SET
          first_name = ?,
          middle_name = ?,
          last_name = ?,
          date_of_birth = ?,
          sex = ?,
          license_type = ?,
          license_status = ?,
          issuance_date = ?,
          expiration_date = ?
        WHERE license_number = ?
      `,
      [
        payload.first_name,
        payload.middle_name,
        payload.last_name,
        payload.date_of_birth,
        payload.sex,
        payload.license_type,
        payload.license_status,
        payload.issuance_date,
        payload.expiration_date,
        licenseNumber,
      ],
    )
  } catch (e) {
    if (Number(e?.errno) === 1265) {
      return badRequest(
        res,
        'Invalid license_type or license_status for current DB schema',
        'Run server/db/schema.sql or `npm run db:upgrade-enums`.',
      )
    }
    throw e
  }

  await query(
    `
      INSERT INTO driver_addresses (license_number, street, city, region, province, postal_code)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        street = VALUES(street),
        city = VALUES(city),
        region = VALUES(region),
        province = VALUES(province),
        postal_code = VALUES(postal_code)
    `,
    [licenseNumber, payload.street, payload.city, payload.region, payload.province, payload.postal_code],
  )

  const rows = await query(
    `
      SELECT
        d.license_number,
        d.first_name,
        d.middle_name,
        d.last_name,
        CONCAT_WS(' ', d.first_name, d.middle_name, d.last_name) AS full_name,
        DATE_FORMAT(d.date_of_birth, '%Y-%m-%d') AS date_of_birth,
        d.sex,
        a.street,
        a.city,
        a.region,
        a.province,
        a.postal_code,
        d.license_type,
        d.license_status,
        DATE_FORMAT(d.issuance_date, '%Y-%m-%d') AS issuance_date,
        DATE_FORMAT(d.expiration_date, '%Y-%m-%d') AS expiration_date
      FROM drivers d
      LEFT JOIN driver_addresses a ON a.license_number = d.license_number
      WHERE d.license_number = ?
      LIMIT 1
    `,
    [licenseNumber],
  )

  res.json({ driver: mapRowToDriverDetails(rows[0]) })
}

export async function deleteDriver(req, res) {
  const licenseNumber = normalizeLicenseNumber(req.params.license_number)
  const result = await query('DELETE FROM drivers WHERE license_number = ?', [licenseNumber])
  if (!result.affectedRows) return res.status(404).json({ error: 'Driver not found' })
  res.status(204).end()
}
