import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env from the current working directory
config({ path: resolve(process.cwd(), '.env') })

export default defineConfig({
  datasource: {
    db: {
      url: process.env.DATABASE_URL || '',
    },
    url: process.env.DATABASE_URL || '',
  },
})