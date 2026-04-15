export const BOARD_CONFIG = [
  {
    id: 'green',
    title: '1º ao 2º dia',
    minDays: 1,
    maxDays: 2,
    tone: 'green',
    description: 'Ordens recém-entradas no fluxo.',
  },
  {
    id: 'yellow',
    title: '3º ao 4º dia',
    minDays: 3,
    maxDays: 4,
    tone: 'yellow',
    description: 'Ordens em ponto de atenção intermediária.',
  },
  {
    id: 'red',
    title: '5º ao 6º dia',
    minDays: 5,
    maxDays: 6,
    tone: 'red',
    description: 'Ordens urgentes que exigem acompanhamento.',
  },
];

const CLOSED_STATUSES = ['finalizada', 'encerrada', 'concluida'];

export function calculateOpenDays(entryDate, currentDate = new Date()) {
  const start = new Date(entryDate);
  const diffInMs = currentDate.getTime() - start.getTime();
  return Math.max(1, Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1);
}

export function isOrderOpen(status) {
  return !CLOSED_STATUSES.includes(String(status).toLowerCase());
}

export function getColumnForOrder(openDays, columns = BOARD_CONFIG) {
  const matchingColumn = columns.find(
    (column) => openDays >= column.minDays && openDays <= column.maxDays,
  );

  if (matchingColumn) {
    return matchingColumn.id;
  }

  const lastColumn = columns.at(-1);

  if (openDays > lastColumn.maxDays) {
    return lastColumn.id;
  }

  return null;
}

export function distributeOrders(orders, currentDate = new Date(), columns = BOARD_CONFIG) {
  const initialState = columns.reduce((accumulator, column) => {
    accumulator[column.id] = [];
    return accumulator;
  }, {});

  return orders.reduce((accumulator, order) => {
    if (!isOrderOpen(order.status)) {
      return accumulator;
    }

    const openDays = calculateOpenDays(order.entryDate, currentDate);
    const columnId = getColumnForOrder(openDays, columns);

    if (!columnId) {
      return accumulator;
    }

    accumulator[columnId].push({
      ...order,
      openDays,
    });

    return accumulator;
  }, initialState);
}

export function filterOrders(orders, searchTerm, statusFilter) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return orders.filter((order) => {
    const matchesSearch =
      !normalizedSearch ||
      order.orderNumber.toLowerCase().includes(normalizedSearch) ||
      order.client.toLowerCase().includes(normalizedSearch);

    const matchesStatus = statusFilter === 'todos' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
}

export function getStatusOptions(orders) {
  return ['todos', ...new Set(orders.map((order) => order.status))];
}
