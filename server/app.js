import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createOrder,
  getOrderById,
  initDatabase,
  listOrders,
  normalizeOrderPayload,
  orderNumberExists,
  updateOrderStatus,
} from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT || 3001);
const DIST_DIR = path.join(__dirname, '..', 'dist');
const LOGIN_USER = process.env.APP_LOGIN_USER || 'TESTE';
const LOGIN_PASSWORD = process.env.APP_LOGIN_PASSWORD || '123';

const STATUS_FLOW = {
  aberta: 'em_producao',
  em_producao: 'finalizada',
  finalizada: 'finalizada',
};

app.use(cors());
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ ok: true });
});

app.post('/api/auth/login', (request, response) => {
  const username = String(request.body.username ?? '').trim();
  const password = String(request.body.password ?? '').trim();

  if (username === LOGIN_USER && password === LOGIN_PASSWORD) {
    response.json({
      authenticated: true,
      user: {
        username: LOGIN_USER,
      },
    });
    return;
  }

  response.status(401).json({ error: 'Login ou senha invalidos.' });
});

app.get('/api/orders', async (_request, response) => {
  try {
    const orders = await listOrders();
    response.json({ orders });
  } catch (error) {
    response.status(500).json({ error: 'Nao foi possivel carregar as ordens.' });
  }
});

app.post('/api/orders', async (request, response) => {
  try {
    const payload = normalizeOrderPayload(request.body);

    if (!payload.orderNumber || !payload.client || !payload.seller || !payload.entryDate) {
      response.status(400).json({ error: 'Preencha numero da ordem, cliente, vendedor e data.' });
      return;
    }

    if (Number.isNaN(Date.parse(payload.entryDate))) {
      response.status(400).json({ error: 'Data de entrada invalida.' });
      return;
    }

    payload.entryDate = new Date(payload.entryDate).toISOString();

    if (await orderNumberExists(payload.orderNumber)) {
      response.status(409).json({ error: 'Ja existe uma ordem com esse numero.' });
      return;
    }

    const order = await createOrder(payload);
    response.status(201).json({ order });
  } catch (error) {
    response.status(500).json({ error: 'Nao foi possivel cadastrar a ordem.' });
  }
});

app.patch('/api/orders/:id/advance', async (request, response) => {
  const id = Number(request.params.id);

  if (!Number.isInteger(id)) {
    response.status(400).json({ error: 'Id invalido.' });
    return;
  }

  const currentOrder = await getOrderById(id);

  if (!currentOrder) {
    response.status(404).json({ error: 'Ordem nao encontrada.' });
    return;
  }

  const nextStatus = STATUS_FLOW[currentOrder.status] ?? currentOrder.status;
  const order = await updateOrderStatus(id, nextStatus);
  response.json({ order });
});

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));

  app.get('*', (request, response, next) => {
    if (request.path.startsWith('/api')) {
      next();
      return;
    }

    response.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

await initDatabase();

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
