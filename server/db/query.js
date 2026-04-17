import { pool } from './pool.js'

export async function query(sql, params = []) {
  let conn
  try {
    conn = await pool.getConnection()
    const rows = await conn.query(sql, params)
    return rows
  } finally {
    if (conn) conn.release()
  }
}

