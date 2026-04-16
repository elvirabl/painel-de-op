import 'dotenv/config';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL nao configurada.');
}

const isSslDisabled = process.env.DATABASE_SSL === 'false';
const databaseUrl = new URL(connectionString);
const targetDatabase = databaseUrl.pathname.replace(/^\//, '');

if (!targetDatabase) {
  throw new Error('Nome do banco ausente em DATABASE_URL.');
}

databaseUrl.pathname = '/postgres';

const adminPool = new Pool({
  connectionString: databaseUrl.toString(),
  ssl: isSslDisabled ? false : { rejectUnauthorized: false },
});

async function ensureDatabase() {
  const existsResult = await adminPool.query(
    'SELECT 1 FROM pg_database WHERE datname = $1 LIMIT 1',
    [targetDatabase],
  );

  if (existsResult.rowCount > 0) {
    console.log(`Banco ${targetDatabase} ja existe.`);
    return;
  }

  await adminPool.query(`CREATE DATABASE "${targetDatabase}"`);
  console.log(`Banco ${targetDatabase} criado com sucesso.`);
}

try {
  await ensureDatabase();
} finally {
  await adminPool.end();
}
