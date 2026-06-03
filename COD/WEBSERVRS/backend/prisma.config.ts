import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from this backend folder
dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectionString = process.env.DATABASE_URL!;

export default defineConfig({
  schema: path.resolve(__dirname, '../../DATABASES/prisma/schema.prisma'),
  migrations: {
    path: path.resolve(__dirname, '../../DATABASES/prisma/migrations'),
  },
  datasource: {
    url: connectionString,
  },
});
