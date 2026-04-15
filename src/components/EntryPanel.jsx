import { useState } from 'react';

const INITIAL_FORM = {
  orderNumber: '',
  client: '',
  seller: 'Bruno',
  status: 'aberta',
  entryDate: '',
};

function getDefaultDateTimeLocal() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function EntryPanel({ orders, onCreateOrder }) {
  const [formData, setFormData] = useState({
    ...INITIAL_FORM,
    entryDate: getDefaultDateTimeLocal(),
  });
  const [errorMessage, setErrorMessage] = useState('');

  function handleChange(field, value) {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const normalizedOrderNumber = formData.orderNumber.trim();
    const normalizedClient = formData.client.trim();

    if (!normalizedOrderNumber || !normalizedClient || !formData.entryDate) {
      setErrorMessage('Preencha numero da ordem, cliente e data de entrada.');
      return;
    }

    const alreadyExists = orders.some(
      (order) => order.orderNumber.toLowerCase() === normalizedOrderNumber.toLowerCase(),
    );

    if (alreadyExists) {
      setErrorMessage('Ja existe uma ordem com esse numero no painel.');
      return;
    }

    try {
      await onCreateOrder({
        orderNumber: normalizedOrderNumber,
        client: normalizedClient,
        seller: formData.seller,
        status: formData.status,
        entryDate: new Date(formData.entryDate).toISOString(),
      });

      setFormData({
        ...INITIAL_FORM,
        entryDate: getDefaultDateTimeLocal(),
      });
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <section className="entry-panel">
      <div className="entry-panel-copy">
        <span className="eyebrow">Novo lancamento</span>
        <h2>Painel de cadastro de ordens</h2>
        <p>
          Cadastre novas entradas sem mexer no quadro Kanban. A ordem ja entra no fluxo e muda de
          coluna automaticamente conforme os dias passam.
        </p>
      </div>

      <form className="entry-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Numero da ordem</span>
          <input
            type="text"
            placeholder="Ex.: OP-24059"
            value={formData.orderNumber}
            onChange={(event) => handleChange('orderNumber', event.target.value)}
          />
        </label>

        <label className="field">
          <span>Cliente</span>
          <input
            type="text"
            placeholder="Nome do cliente"
            value={formData.client}
            onChange={(event) => handleChange('client', event.target.value)}
          />
        </label>

        <label className="field">
          <span>Vendedor</span>
          <select value={formData.seller} onChange={(event) => handleChange('seller', event.target.value)}>
            <option value="Bruno">Bruno</option>
            <option value="Rodrigo">Rodrigo</option>
            <option value="Raquel">Raquel</option>
          </select>
        </label>

        <label className="field">
          <span>Status inicial</span>
          <select value={formData.status} onChange={(event) => handleChange('status', event.target.value)}>
            <option value="aberta">aberta</option>
            <option value="em_producao">em_producao</option>
          </select>
        </label>

        <label className="field">
          <span>Data e hora de entrada</span>
          <input
            type="datetime-local"
            value={formData.entryDate}
            onChange={(event) => handleChange('entryDate', event.target.value)}
          />
        </label>

        <div className="entry-actions">
          <button type="submit" className="entry-submit">
            Cadastrar ordem
          </button>
          {errorMessage ? <p className="entry-error">{errorMessage}</p> : null}
        </div>
      </form>
    </section>
  );
}

export default EntryPanel;
