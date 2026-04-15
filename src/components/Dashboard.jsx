import { useEffect, useMemo, useState } from 'react';
import FiltersBar from './FiltersBar';
import BoardColumn from './BoardColumn';
import EntryPanel from './EntryPanel';
import { BOARD_CONFIG, distributeOrders, filterOrders, getStatusOptions } from '../utils/orderBoard';
import { advanceOrderRequest, createOrderRequest, fetchOrders } from '../services/api';

function formatLastUpdated(date) {
  return `Ultima leitura em ${date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function Dashboard({ currentUser, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [now, setNow] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    async function loadOrders() {
      try {
        setErrorMessage('');
        const loadedOrders = await fetchOrders();
        setOrders(loadedOrders);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, []);

  const statusOptions = useMemo(() => getStatusOptions(orders), [orders]);

  const filteredOrders = useMemo(
    () => filterOrders(orders, searchTerm, statusFilter),
    [orders, searchTerm, statusFilter],
  );

  const distributedOrders = useMemo(
    () => distributeOrders(filteredOrders, now, BOARD_CONFIG),
    [filteredOrders, now],
  );

  const columns = useMemo(
    () =>
      BOARD_CONFIG.map((column) => ({
        ...column,
        orders: [...distributedOrders[column.id]].sort(
          (firstOrder, secondOrder) => secondOrder.openDays - firstOrder.openDays,
        ),
      })),
    [distributedOrders],
  );

  async function handleAdvanceStatus(orderId) {
    try {
      setErrorMessage('');
      const updatedOrder = await advanceOrderRequest(orderId);
      setOrders((currentOrders) =>
        currentOrders.map((order) => (order.id === orderId ? updatedOrder : order)),
      );
      setNow(new Date());
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleCreateOrder(newOrder) {
    const createdOrder = await createOrderRequest(newOrder);
    setOrders((currentOrders) => [createdOrder, ...currentOrders]);
    setNow(new Date());
  }

  return (
    <main className="dashboard-shell">
      <div className="dashboard-backdrop" />

      <div className="dashboard-content">
        <FiltersBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={statusOptions}
          lastUpdatedLabel={formatLastUpdated(now)}
          currentUser={currentUser}
          onLogout={onLogout}
        />

        {errorMessage ? <div className="feedback-banner">{errorMessage}</div> : null}

        <EntryPanel orders={orders} onCreateOrder={handleCreateOrder} />

        <section className="board-grid">
          {isLoading ? (
            <section className="loading-panel">
              <strong>Carregando ordens...</strong>
              <span>Buscando dados salvos no banco local.</span>
            </section>
          ) : (
            columns.map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                orders={column.orders}
                onAdvanceStatus={handleAdvanceStatus}
              />
            ))
          )}
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
