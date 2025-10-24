import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables from server/.env file
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

// Clean up quotation marks from environment variables
const cleanEnvValue = (value) => {
  if (typeof value === 'string') {
    return value.replace(/^["'](.+)["']$/, '$1')
  }
  return value
}

const config = {
    user: cleanEnvValue(process.env.PGUSER),
    password: cleanEnvValue(process.env.PGPASSWORD),
    host: cleanEnvValue(process.env.PGHOST),
    port: process.env.PGPORT,
    database: cleanEnvValue(process.env.PGDATABASE),
    ssl: {
      rejectUnauthorized: false
    }
}

export const pool = new pg.Pool(config)