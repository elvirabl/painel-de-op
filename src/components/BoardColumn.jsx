import OrderCard from './OrderCard';

function BoardColumn({ column, orders, onAdvanceStatus }) {
  return (
    <section className={`board-column board-column-${column.tone}`}>
      <header className="column-header">
        <div>
          <span className="column-kicker">Faixa automática</span>
          <h2>{column.title}</h2>
          <p>{column.description}</p>
        </div>
        <div className="column-counter">{orders.length}</div>
      </header>

      <div className="column-list">
        {orders.length === 0 ? (
          <div className="empty-state">
            <strong>Sem ordens nesta faixa</strong>
            <span>Assim que uma ordem atingir essa janela de dias, ela aparece aqui.</span>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isCritical={column.id === 'red' && order.openDays >= 6}
              onAdvanceStatus={onAdvanceStatus}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default BoardColumn;
