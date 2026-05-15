import { query } from '../db/query.js'
import {
  normalizeLicenseNumber,
  normalizeLicenseStatus,
  normalizeLicenseType,
} from '../lib/normalizers.js'

const reportTypes = new Set([
  'drivers-by-license-type',
  'vehicles-by-owner',
  'expired-vehicle-registrations',
  'expired-suspended-licenses',
  'violations-by-driver',
  'violations-by-type',
  'violations-by-location',
])

function asDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ''
}

function buildFullNameSql(alias = 'd') {
  return `CONCAT_WS(' ', ${alias}.first_name, ${alias}.middle_name, ${alias}.last_name)`
}

async function driversByLicenseType(req) {
  const licenseType = normalizeLicenseType(req.query.licenseType)
  const status = normalizeLicenseStatus(req.query.status)
  const sex = String(req.query.sex ?? '').trim().toUpperCase()
  const ageFrom = Number(req.query.ageFrom)
  const ageTo = Number(req.query.ageTo)

  const where = []
  const params = []

  if (licenseType) {
    where.push('d.license_type = ?')
    params.push(licenseType)
  }
  if (status) {
    where.push('d.license_status = ?')
    params.push(status)
  }
  if (sex === 'M' || sex === 'F') {
    where.push('d.sex = ?')
    params.push(sex)
  }
  if (Number.isFinite(ageFrom)) {
    where.push('TIMESTAMPDIFF(YEAR, d.date_of_birth, CURDATE()) >= ?')
    params.push(ageFrom)
  }
  if (Number.isFinite(ageTo)) {
    where.push('TIMESTAMPDIFF(YEAR, d.date_of_birth, CURDATE()) <= ?')
    params.push(ageTo)
  }

  return query(
    `
      SELECT
        ${buildFullNameSql()} AS name,
        d.license_number AS licenseNumber,
        d.license_type AS licenseType,
        d.license_status AS status,
        TIMESTAMPDIFF(YEAR, d.date_of_birth, CURDATE()) AS age,
        CASE d.sex WHEN 'M' THEN 'Male' ELSE 'Female' END AS sex
      FROM drivers d
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY d.last_name ASC, d.first_name ASC
      LIMIT 200
    `,
    params,
  )
}

async function vehiclesByOwner(req) {
  const search = String(req.query.search ?? '').trim()
  const normalizedLicense = normalizeLicenseNumber(search)
  const where = []
  const params = []

  if (search) {
    where.push(`(${buildFullNameSql()} LIKE ? OR d.license_number LIKE ?)`)
    params.push(`%${search}%`, `%${normalizedLicense}%`)
  }

  return query(
    `
      SELECT
        ${buildFullNameSql()} AS name,
        v.plate_number AS plateNumber,
        CONCAT_WS(' ', v.make, v.model, v.year) AS vehicle,
        v.vehicle_type AS type,
        COALESCE(r.registration_status, 'Unregistered') AS registrationStatus
      FROM vehicles v
      JOIN drivers d ON d.license_number = v.owner_license_number
      LEFT JOIN vehicle_registrations r ON r.vehicle_plate_number = v.plate_number
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY v.plate_number ASC
      LIMIT 200
    `,
    params,
  )
}

async function expiredVehicleRegistrations(req) {
  const asOf = asDate(req.query.asOfDate) || new Date().toISOString().slice(0, 10)
  return query(
    `
      SELECT
        v.plate_number AS plateNumber,
        CONCAT_WS(' ', v.make, v.model, v.year) AS vehicle,
        ${buildFullNameSql()} AS owner,
        DATE_FORMAT(r.expiration_date, '%Y-%m-%d') AS expirationDate,
        DATEDIFF(?, r.expiration_date) AS daysExpired
      FROM vehicle_registrations r
      JOIN vehicles v ON v.plate_number = r.vehicle_plate_number
      JOIN drivers d ON d.license_number = v.owner_license_number
      WHERE r.expiration_date < ?
      ORDER BY r.expiration_date ASC
      LIMIT 200
    `,
    [asOf, asOf],
  )
}

async function expiredSuspendedLicenses(req) {
  const status = normalizeLicenseStatus(req.query.status)
  const where = status ? ['d.license_status = ?'] : ["d.license_status IN ('Expired', 'Suspended')"]
  const params = status ? [status] : []

  return query(
    `
      SELECT
        ${buildFullNameSql()} AS name,
        d.license_number AS licenseNumber,
        d.license_type AS type,
        d.license_status AS status,
        DATE_FORMAT(d.expiration_date, '%Y-%m-%d') AS expirationDate
      FROM drivers d
      WHERE ${where.join(' AND ')}
      ORDER BY d.expiration_date ASC, d.last_name ASC
      LIMIT 200
    `,
    params,
  )
}

async function violationsByDriver(req) {
  const search = String(req.query.search ?? '').trim()
  const from = asDate(req.query.dateFrom)
  const to = asDate(req.query.dateTo)
  const normalizedLicense = normalizeLicenseNumber(search)
  const where = []
  const params = []

  if (search) {
    where.push(`(${buildFullNameSql()} LIKE ? OR d.license_number LIKE ?)`)
    params.push(`%${search}%`, `%${normalizedLicense}%`)
  }
  if (from) {
    where.push('v.violation_date >= ?')
    params.push(from)
  }
  if (to) {
    where.push('v.violation_date <= ?')
    params.push(to)
  }

  return query(
    `
      SELECT
        ${buildFullNameSql()} AS name,
        v.violation_id AS ticketNumber,
        v.violation_type AS violationType,
        DATE_FORMAT(v.violation_date, '%Y-%m-%d') AS date,
        CONCAT_WS(', ', loc.street, loc.city) AS location,
        f.fine_amount AS fine,
        v.violation_status AS status
      FROM violations v
      JOIN drivers d ON d.license_number = v.license_number
      JOIN violation_fines f ON f.violation_type = v.violation_type
      LEFT JOIN violation_locations loc ON loc.violation_id = v.violation_id
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY v.violation_date DESC
      LIMIT 200
    `,
    params,
  )
}

async function violationsByType(req) {
  const year = Number(req.query.year) || new Date().getFullYear()
  return query(
    `
      SELECT
        f.violation_type AS violationType,
        COUNT(v.violation_id) AS totalCount
      FROM violation_fines f
      LEFT JOIN violations v
        ON v.violation_type = f.violation_type
        AND YEAR(v.violation_date) = ?
      GROUP BY f.violation_type
      ORDER BY totalCount DESC, f.violation_type ASC
      LIMIT 200
    `,
    [year],
  )
}

async function violationsByLocation(req) {
  const city = String(req.query.city ?? '').trim()
  const region = String(req.query.region ?? '').trim()
  const where = []
  const params = []

  if (city) {
    where.push('loc.city LIKE ?')
    params.push(`%${city}%`)
  }
  if (region) {
    where.push('loc.region LIKE ?')
    params.push(`%${region}%`)
  }

  return query(
    `
      SELECT
        veh.plate_number AS plateNumber,
        CONCAT_WS(' ', veh.make, veh.model, veh.year) AS vehicle,
        ${buildFullNameSql()} AS driver,
        v.violation_type AS violationType,
        DATE_FORMAT(v.violation_date, '%Y-%m-%d') AS date
      FROM violations v
      JOIN vehicles veh ON veh.plate_number = v.plate_number
      JOIN drivers d ON d.license_number = v.license_number
      LEFT JOIN violation_locations loc ON loc.violation_id = v.violation_id
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY v.violation_date DESC
      LIMIT 200
    `,
    params,
  )
}

const handlers = {
  'drivers-by-license-type': driversByLicenseType,
  'vehicles-by-owner': vehiclesByOwner,
  'expired-vehicle-registrations': expiredVehicleRegistrations,
  'expired-suspended-licenses': expiredSuspendedLicenses,
  'violations-by-driver': violationsByDriver,
  'violations-by-type': violationsByType,
  'violations-by-location': violationsByLocation,
}

function toJsonSafeRow(row) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      typeof value === 'bigint' ? Number(value) : value,
    ]),
  )
}

export async function getReport(req, res) {
  const type = String(req.params.type ?? '').trim()
  if (!reportTypes.has(type)) {
    return res.status(404).json({ error: 'Report type not found' })
  }

  const rows = await handlers[type](req)
  res.json({ report: { type, rows: rows.map(toJsonSafeRow) } })
}
