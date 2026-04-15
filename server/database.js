import 'dotenv/config';
import { Pool } from 'pg';
import { mockOrders } from '../src/data/mockOrders.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL nao configurada.');
}

const isSslDisabled = process.env.DATABASE_SSL === 'false';

const pool = new Pool({
  connectionString,
  ssl: isSslDisabled ? false : { rejectUnauthorized: false },
});

function normalizeStatus(status) {
  return String(status ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
}

function rowToOrder(row) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    client: row.client,
    seller: row.seller,
    status: row.status,
    entryDate: row.entry_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function createSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id BIGSERIAL PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      client TEXT NOT NULL,
      seller TEXT NOT NULL,
      status TEXT NOT NULL,
      entry_date TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function seedIfEmpty() {
  const result = await pool.query('SELECT COUNT(*)::int AS total FROM orders');

  if (result.rows[0]?.total > 0) {
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const order of mockOrders) {
      await client.query(
        `
          INSERT INTO orders (
            order_number,
            client,
            seller,
            status,
            entry_date
          ) VALUES ($1, $2, $3, $4, $5)
        `,
        [
          order.orderNumber,
          order.client,
          order.seller,
          normalizeStatus(order.status),
          order.entryDate,
        ],
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function initDatabase() {
  await createSchema();
  await seedIfEmpty();
}

export async function listOrders() {
  const result = await pool.query(`
    SELECT id, order_number, client, seller, status, entry_date, created_at, updated_at
    FROM orders
    ORDER BY entry_date DESC, id DESC
  `);

  return result.rows.map(rowToOrder);
}

export async function createOrder(order) {
  const result = await pool.query(
    `
      INSERT INTO orders (
        order_number,
        client,
        seller,
        status,
        entry_date
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, order_number, client, seller, status, entry_date, created_at, updated_at
    `,
    [
      order.orderNumber,
      order.client,
      order.seller,
      normalizeStatus(order.status),
      order.entryDate,
    ],
  );

  return rowToOrder(result.rows[0]);
}

export async function getOrderById(id) {
  const result = await pool.query(
    `
      SELECT id, order_number, client, seller, status, entry_date, created_at, updated_at
      FROM orders
      WHERE id = $1
    `,
    [id],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return rowToOrder(result.rows[0]);
}

export async function updateOrderStatus(id, status) {
  const result = await pool.query(
    `
      UPDATE orders
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, order_number, client, seller, status, entry_date, created_at, updated_at
    `,
    [normalizeStatus(status), id],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return rowToOrder(result.rows[0]);
}

export async function orderNumberExists(orderNumber) {
  const result = await pool.query(
    'SELECT 1 FROM orders WHERE lower(order_number) = lower($1) LIMIT 1',
    [orderNumber],
  );

  return result.rowCount > 0;
}

export function normalizeOrderPayload(payload) {
  return {
    orderNumber: String(payload.orderNumber ?? '').trim(),
    client: String(payload.client ?? '').trim(),
    seller: String(payload.seller ?? '').trim(),
    status: normalizeStatus(payload.status),
    entryDate: String(payload.entryDate ?? '').trim(),
  };
}
