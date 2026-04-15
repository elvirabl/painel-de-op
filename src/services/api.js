async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error ?? 'Falha ao processar a requisicao.');
  }

  return data;
}

export async function fetchOrders() {
  const response = await fetch('/api/orders');
  const data = await parseResponse(response);
  return data.orders ?? [];
}

export async function createOrderRequest(order) {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(order),
  });
  const data = await parseResponse(response);
  return data.order;
}

export async function advanceOrderRequest(orderId) {
  const response = await fetch(`/api/orders/${orderId}/advance`, {
    method: 'PATCH',
  });
  const data = await parseResponse(response);
  return data.order;
}
