function FiltersBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  statusOptions,
  lastUpdatedLabel,
  currentUser,
  onLogout,
}) {
  return (
    <section className="filters-bar">
      <div className="filters-copy">
        <span className="eyebrow">Controle de producao</span>
        <h1>Painel Kanban de ordens abertas</h1>
        <p>
          As ordens sao reposicionadas automaticamente conforme os dias corridos desde a entrada
          inicial.
        </p>
      </div>

      <div className="filters-controls">
        <label className="field">
          <span>Buscar ordem ou cliente</span>
          <input
            type="search"
            placeholder="Ex.: OP-24054 ou nome do cliente"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <label className="field field-select">
          <span>Filtrar por status</span>
          <select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === 'todos' ? 'Todos os status' : status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>

        <div className="refresh-card">
          <span className="refresh-label">Atualizacao automatica</span>
          <strong>{lastUpdatedLabel}</strong>
          <small>
            Usuario: {currentUser?.username ?? 'sem login'} |{' '}
            <button type="button" className="logout-button" onClick={onLogout}>
              sair
            </button>
          </small>
        </div>
      </div>
    </section>
  );
}

export default FiltersBar;
