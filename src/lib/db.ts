import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.SUPABASE_HOST || 'aws-0-us-west-1.pooler.supabase.com',
      port: parseInt(process.env.SUPABASE_PORT || '6543'),
      database: process.env.SUPABASE_DB || 'postgres',
      user: process.env.SUPABASE_USER || '',
      password: process.env.SUPABASE_PASSWORD || '',
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 8000,
    });
  }
  return pool;
}
