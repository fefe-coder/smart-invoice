import React, { useState } from 'react';
import axios from 'axios';

const InvoiceForm = ({ clients, onInvoiceCreated }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    invoice_number: '',
    description: '',
    total_amount: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // TOTO OPRAVUJE CHYBU 400: Prevod na správne typy
    const payload = {
      client_id: parseInt(formData.client_id),      // Musí byť celé číslo
      invoice_number: formData.invoice_number.toString(), // Musí byť text
      description: formData.description || '',
      total_amount: parseFloat(formData.total_amount) // Musí byť desatinné číslo
    };

    // Validácia
    if (!payload.client_id || !payload.invoice_number || isNaN(payload.total_amount)) {
      alert("Vyberte odberateľa, zadajte číslo faktúry a platnú sumu!");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:4000/api/invoices', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Faktúra úspešne vytvorená!");
      
      // Vyčistiť formulár
      setFormData({ client_id: '', invoice_number: '', description: '', total_amount: '' });
      
      // Obnoviť zoznam faktúr na hlavnej stránke
      if (onInvoiceCreated) onInvoiceCreated();
    } catch (err) {
      console.error("Chyba pri vytváraní:", err.response?.data);
      alert("Chyba: " + (err.response?.data?.error || "Skontrolujte konzolu"));
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
      <h3>Nová faktúra</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Odberateľ:</label><br/>
          <select 
            required
            style={{ width: '100%', padding: '8px' }}
            value={formData.client_id}
            onChange={(e) => setFormData({...formData, client_id: e.target.value})}
          >
            <option value="">-- Vyberte zo zoznamu --</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Číslo faktúry:</label><br/>
          <input 
            required
            type="text" 
            style={{ width: '100%', padding: '8px' }}
            value={formData.invoice_number}
            onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Popis:</label><br/>
          <input 
            type="text" 
            style={{ width: '100%', padding: '8px' }}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Suma (EUR):</label><br/>
          <input 
            required
            type="number" 
            step="0.01"
            style={{ width: '100%', padding: '8px' }}
            value={formData.total_amount}
            onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
          />
        </div>

        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Vytvoriť faktúru
        </button>
      </form>
    </div>
  );
};

export default InvoiceForm;