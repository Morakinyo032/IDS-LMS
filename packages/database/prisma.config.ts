import { defineConfig } from 'prisma/config'
import dotenv from 'dotenv'
import path from 'path'

// Load .env file
dotenv.config({ path: path.join(__dirname, '.env') })

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || '',
    },
  },
})