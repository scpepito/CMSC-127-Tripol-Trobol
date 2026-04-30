import { TowerControl } from 'lucide-react'
import { query } from '../db/query.js'
import { badRequest, isIsoDate, isNonEmptyString, toTrimmed } from '../lib/validators.js'
import { isoToday, normalizeLicenseNumber, normalizePlateNumber, normalizeGenericNumber, normalizeViolationStatus } from '../lib/normalizers.js'

// formats and normalizes reg status strings

// map row to violation list
function mapRowToListViolation(row) {
  return {
    violation_id: row.violation_id,
    driver_name: row.driver_name,
    plate_number: row.driver_plate_number,
    violation_type: row.violation_type,
    violation_date: row.violation_date,
    apprehending_officer: row.apprehending_officer,
    violation_status: row.violation_status,
    violation_fine: row.violation_fine,
  }
}

// map row to full violation details
function mapRowToViolationDetails(row) {
  return {
    violation_id: row.violation_id,
    violation_type: row.violation_type,
    violation_status: row.violation_status,
    violation_date: row.violation_date,
    apprehending_officer: row.apprehending_officer,
    violation_fine: row.violation_fine,
    location: {
      street: row.street,
      city: row.city,
      province: row.province,
      region: row.region
    },
    driver: {
      full_name: row.driver_name,
      license_number: row.driver_license_number
    },
    vehicle: {
      plate_number: row.vehicle_plate_number,
      make: row.vehicle_make,
      model: row.vehicle_model,
      year: row.vehicle_year,
      type: row.vehicle_type
    }
  };
}
// parses and trims all fields of body
function parseViolationPayload(body) {
    return {
        violation_id: toTrimmed(body.violation_id),
        violation_type: toTrimmed(body.violation_type),
        violation_fine: Number(body.violation_fine),
        violation_status: normalizeViolationStatus(body.violation_status),
        violation_date: toTrimmed(body.violation_date),
        apprehending_officer: toTrimmed(body.apprehending_officer),

        street: toTrimmed(body.street),
        city: toTrimmed(body.city),
        region: toTrimmed(body.region),
        province: toTrimmed(body.province),

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
    const ok = /\d{8}-\d$/.test(payload.violation_id)
        console.log(payload.violation_id)
    if (!ok) return badRequest(res, "violation_id must match '12345678-0'")
  }

    if (!isNonEmptyString(payload.violation_type)) return badRequest(res, 'violation_type is required')

    if (!isNonEmptyString(payload.violation_status)) return badRequest(res, 'violation_status is required')
    const violationStatuses = new Set(['Paid', 'Unpaid', 'Contested'])
    if (!violationStatuses.has(payload.violation_status)) {
        return badRequest(res, 'violation_status must be "Paid", "Unpaid", or "Contested"')
    }
    
    if (!isIsoDate(payload.violation_date)) return badRequest(res, 'violation_date must be YYYY-MM-DD')
    const violation_date = new Date(payload.violation_date)
    const today = new Date(isoToday())
    if (Number.isNaN(violation_date.getTime())) {
        return badRequest(res, 'Invalid date values')
    }
    if (violation_date > today) {
        return badRequest(res, 'violation_date must be on/before today')
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

// get and select violations given parameters
export async function listViolations(req, res) {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  const status = typeof req.query.status === 'string' ? normalizeViolationStatus(req.query.status) : ''

  const where = []
  const params = []

  // search by ticket number, driver, violation type, date, location, or fine amount
  if (search) {
    const s = `%${search.trim()}%`;
    
    where.push(
      `(v.violation_id LIKE ? OR 
        v.plate_number LIKE ? OR 
        v.violation_type LIKE ? OR 
        CONCAT_WS(' ', d.first_name, d.middle_name, d.last_name) LIKE ? OR 
        d.license_number LIKE ? OR
        v.apprehending_officer LIKE ?)`
    );

    params.push(s, s, s, s, s, s);
  }
  // search by violation status
  if (status) {
    where.push('v.violation_status = ?')
    params.push(status)
  }

const sql = `
    SELECT
      v.violation_id,
      v.plate_number AS vehicle_plate_number,
      v.violation_type,
      DATE_FORMAT(v.violation_date, '%Y-%m-%d') AS violation_date,
      v.apprehending_officer,
      v.violation_status,
      f.fine_amount AS violation_fine,
      CONCAT_WS(' ', d.first_name, d.middle_name, d.last_name) AS driver_name
    FROM violations v
    JOIN violation_fines f ON v.violation_type = f.violation_type
    JOIN drivers d ON v.license_number = d.license_number
    JOIN vehicles veh ON v.plate_number = veh.plate_number
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY v.violation_id DESC
    LIMIT 200
  ` // Set alias here

  const rows = await query(sql, params)
  if (!rows.length) return res.status(404).json({ error: 'No violation found' })
  res.json({ violations: rows.map(mapRowToListViolation) });
}

// get and select violation given its violation id
export async function getViolation(req, res) {
  const violationId = toTrimmed(req.params.violation_id);

  const rows = await query(
    `
    SELECT
      v.violation_id,
      v.violation_type,
      v.violation_status,
      DATE_FORMAT(v.violation_date, '%Y-%m-%d') AS violation_date,
      v.apprehending_officer,
      -- Location Data (from violation_locations)
      loc.street, loc.city, loc.region, loc.province,
      -- Fine Data (from violation_fines)
      f.fine_amount AS violation_fine,
      -- Driver Data
      d.license_number AS driver_license_number,
      CONCAT_WS(' ', d.first_name, d.middle_name, d.last_name) AS driver_name,
      -- Vehicle Data
      veh.plate_number AS vehicle_plate_number,
      veh.make AS vehicle_make,
      veh.model AS vehicle_model,
      veh.year AS vehicle_year,
      veh.vehicle_type AS vehicle_type
    FROM violations v
    JOIN violation_fines f ON v.violation_type = f.violation_type
    JOIN violation_locations loc ON v.violation_id = loc.violation_id
    JOIN drivers d ON v.license_number = d.license_number
    JOIN vehicles veh ON v.plate_number = veh.plate_number
    WHERE v.violation_id = ?
    LIMIT 1
    `,
    [violationId]
  );

  if (!rows.length) return res.status(404).json({ error: 'Violation not found' });
  res.json(mapRowToViolationDetails(rows[0]));
}

export async function listViolationTypes(req, res) {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

  const params = [];
  let sql = `
    SELECT 
      violation_type, 
      fine_amount 
    FROM violation_fines
  `;

  if (search) {
    sql += ` WHERE violation_type LIKE ?`;
    params.push(`%${search}%`);
  }

  sql += ` ORDER BY violation_type ASC`;

  try {
    const rows = await query(sql, params);
    
    if (!rows.length && search) {
      return res.status(404).json({ error: 'No matching violation types found' });
    }

    res.json({ violation_types: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// creates and inserts a violation
export async function createViolation(req, res) {

  while (1) {      
    const baseNumber = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, '0');
    const checkDigit = Math.floor(Math.random() * 10);
    let random_id = normalizeGenericNumber(`${baseNumber}-${checkDigit}`);

    let violation = await query(
      `
      SELECT violation_id
      FROM violations
      WHERE violation_id LIKE ?
      `, [random_id]
    )

    if (!violation.length) {
      req.body.violation_id = random_id;
      break;
    };
  }

  const payload = parseViolationPayload(req.body)
  const error = validateViolationPayload(res, payload, { requireViolationId: true })
  if (error) return

  try {
    await query(
      `
        INSERT INTO violations (
          violation_id, license_number, plate_number, violation_type, violation_date, apprehending_officer, 
          violation_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, 
      [
        payload.violation_id,
        payload.license_number,
        payload.plate_number,
        payload.violation_type,
        payload.violation_date,
        payload.apprehending_officer,
        payload.violation_status,
      ],
    );

    await query(
      `INSERT INTO violation_locations (
        violation_id, street, city, region, province
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        payload.violation_id, payload.street, payload.city, 
        payload.region, payload.province
      ]
    );

  } catch (e) {
    const code = String(e?.code);
    const msg = String(e?.sqlMessage ?? '').toLowerCase();

    if (code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Violation already exists' });
    }

    // Handle Foreign Key Failures (Missing Driver, Vehicle, or Fine Type)
    if (code === 'ER_NO_REFERENCED_ROW_2') {
      if (msg.includes('plate_number')) {
        return badRequest(res, `Vehicle plate number does not exist: ${payload.plate_number}`);
      }
      if (msg.includes('license_number')) {
        return badRequest(res, `Driver license number does not exist: ${payload.license_number}`);
      }
      if (msg.includes('violation_type')) {
        return badRequest(res, `Violation type '${payload.violation_type}' does not exist in the fines table.`);
      }
      return badRequest(res, 'A referenced record (driver, vehicle, or type) was not found.');
    }

    if (Number(e?.errno) === 1265) {
      return badRequest(
        res,
        'Invalid status or data type for current DB schema',
        'Check your ENUM values or data formats.',
      );
    }
    throw e;
  }  
  res.status(201).json({ ok: true })
}

export async function updateViolation(req, res) {
  const violationId = toTrimmed(req.params.violation_id)
  const payload = parseViolationPayload(req.body)
  
  // Use the correct validator for violations
  const error = validateViolationPayload(res, payload, { requireViolationId: false })
  if (error) return

  try {
    const result = await query(
      `
        UPDATE violations
        SET
          violation_status = ?,
          violation_type = ?,
          license_number = ?,
          plate_number = ?
        WHERE violation_id = ?
      `,
      [
        payload.violation_status,
        payload.violation_type,
        payload.driver_license_number,
        payload.vehicle_plate_number,
        violationId // Use the ID from the params
      ],
    )

    // Check if the row actually existed before trying to return "ok"
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Violation not found' })
    }

  } catch (e) {
    const code = String(e?.code);
    const msg = String(e?.sqlMessage || '').toLowerCase();

    if (code === 'ER_NO_REFERENCED_ROW_2') {
      if (msg.includes('license_number')) return badRequest(res, 'Driver license does not exist');
      if (msg.includes('plate_number')) return badRequest(res, 'Vehicle plate does not exist');
    }
    throw e
  } 

  res.json({ ok: true })
}

export async function deleteViolation(req, res) {
  const violationId = toTrimmed(req.params.violation_id)
  const result = await query('DELETE FROM violations WHERE violation_id = ?', [violationId])
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Violation ID not found' })
  res.status(204).end()
}
