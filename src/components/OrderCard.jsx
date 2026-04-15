const sellerStyles = {
  Bruno: 'seller-chip seller-bruno',
  Rodrigo: 'seller-chip seller-rodrigo',
  Raquel: 'seller-chip seller-raquel',
};

function normalizeStatus(status) {
  return String(status ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
}

function getActionLabel(status) {
  const normalizedStatus = normalizeStatus(status);

  if (normalizedStatus === 'aberta') {
    return 'Mover para producao';
  }

  if (normalizedStatus === 'em_producao') {
    return 'Finalizar ordem';
  }

  return 'Atualizar movimentacao';
}

function formatStatus(status) {
  return normalizeStatus(status).replace('_', ' ');
}

function OrderCard({ order, isCritical, onAdvanceStatus }) {
  return (
    <article className={`order-card ${isCritical ? 'order-card-critical' : ''}`}>
      <div className="order-card-top">
        <div>
          <span className="card-label">Ordem</span>
          <h3 className="order-number">{order.orderNumber}</h3>
        </div>
        <span className={sellerStyles[order.seller] ?? 'seller-chip'}>{order.seller}</span>
      </div>

      <div className="order-card-body">
        <p className="client-name">{order.client}</p>
        <div className="meta-grid">
          <span>
            <strong>Status:</strong> {formatStatus(order.status)}
          </span>
          <span>
            <strong>Entrada:</strong> {new Date(order.entryDate).toLocaleDateString('pt-BR')}
          </span>
          <span>
            <strong>Dias em aberto:</strong> {order.openDays}
          </span>
        </div>
      </div>

      <button type="button" className="status-button" onClick={() => onAdvanceStatus(order.id)}>
        {getActionLabel(order.status)}
      </button>
    </article>
  );
}

export default OrderCard;
