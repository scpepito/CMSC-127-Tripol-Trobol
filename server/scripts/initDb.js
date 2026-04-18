import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import * as mariadb from 'mariadb'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sqlFile = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.resolve(__dirname, '..', 'db', 'schema.sql')

function splitSqlStatements(sql) {
  return sql
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
}

async function main() {
  const host = process.env.DB_HOST ?? 'localhost'
  const port = Number(process.env.DB_PORT ?? 3306)
  const user = process.env.DB_USER ?? 'root'
  const password = process.env.DB_PASSWORD ?? ''

  const sql = await fs.readFile(sqlFile, 'utf8')
  const statements = splitSqlStatements(sql)

  const conn = await mariadb.createConnection({ host, port, user, password })
  try {
    // Allow dropping tables regardless of FK order during local init.
    // (Example: older schema versions may have extra child tables.)
    await conn.query('SET FOREIGN_KEY_CHECKS = 0')
    for (const stmt of statements) {
      await conn.query(stmt)
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1')
  } finally {
    await conn.end()
  }

  console.log(`Initialized DB using ${path.relative(process.cwd(), sqlFile)}`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})

// use this script like this:
//   npm run db:init
