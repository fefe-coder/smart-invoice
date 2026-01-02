import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Download, X, FileText, User, Tag } from 'lucide-react';
import Settings from './Settings';
import Header from './components/Header'; 
import './App.css';

function App() {
  const [view, setView] = useState('dashboard');
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  
  const [newInv, setNewInv] = useState({ 
    invoice_number: '', 
    client_name: '', 
    client_address: '',
    client_ico: '',
    item_name: '',
    description: '', 
    total_amount: '' 
  });

  const API_URL = "http://localhost:4000/api";

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/invoices?page=${page}&limit=8`);
      setInvoices(res.data);
    } catch (e) { 
      console.error("Chyba načítania dát. Beží backend?"); 
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, [view, page]);

  const handleTogglePaid = async (id) => {
    try {
      const response = await axios.patch(`${API_URL}/invoices/${id}/toggle-paid`, {});
      // Backend vráti nové is_paid (1 alebo 0), frontend to spracuje
      setInvoices(invoices.map(inv => 
        inv.id === id ? { ...inv, is_paid: response.data.is_paid } : inv
      ));
    } catch (e) {
      console.error("Chyba pri zmene stavu platby");
    }
  };

  const handleDownloadPDF = async (id, num) => {
    try {
      const res = await axios.get(`${API_URL}/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Faktura_${num}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) { 
      alert("Chyba: PDF súbor je poškodený alebo backend zlyhal."); 
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Posielame dáta na backend
      await axios.post(`${API_URL}/invoices`, newInv);
      setShowForm(false);
      setNewInv({ 
        invoice_number: '', client_name: '', client_address: '', 
        client_ico: '', item_name: '', description: '', total_amount: '' 
      });
      fetchData();
    } catch (e) { 
      alert("Chyba pri vytváraní faktúry."); 
    }
  };

  return (
    <div className="app-container">
      <Header setView={setView} currentView={view} />

      <main className="main-content">
        {view === 'dashboard' ? (
          <>
            <div className="section-header">
              <h1><FileText size={24} style={{marginRight: '10px'}}/> Nedávne faktúry</h1>
              <button onClick={() => setShowForm(true)} className="smart-button">
                <Plus size={18}/> NOVÁ FAKTÚRA
              </button>
            </div>

            <div className="data-table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ČÍSLO & PDF</th>
                    <th>KLIENT</th>
                    <th style={{textAlign:'right'}}>SUMA</th>
                    <th style={{textAlign:'center'}}>UHRADENÉ</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length > 0 ? (
                    invoices.map(inv => (
                      <tr key={inv.id} className={inv.is_paid ? 'row-paid' : ''}>
                        <td>
                          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                            <span style={{fontWeight:'bold'}}>{inv.invoice_number}</span>
                            <Download 
                              size={16} 
                              className="download-icon" 
                              onClick={() => handleDownloadPDF(inv.id, inv.invoice_number)} 
                              style={{cursor:'pointer'}} 
                            />
                          </div>
                        </td>
                        <td>{inv.client_name}</td>
                        {/* OPRAVENÁ SUMA: Skúša total_amount, potom amount, inak 0 */}
                        <td style={{textAlign:'right', fontWeight: '600'}}>
                          {parseFloat(inv.total_amount || inv.amount || 0).toFixed(2)} €
                        </td>
                        <td style={{textAlign:'center'}}>
                          <div 
                            className={`ios-switch ${inv.is_paid ? 'on' : 'off'}`} 
                            onClick={() => handleTogglePaid(inv.id)}
                          >
                            <div className="handle"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" style={{textAlign:'center', padding: '30px', color: '#888'}}>Zatiaľ žiadne faktúry.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>← Predchádzajúca</button>
              <button disabled={invoices.length < 8} onClick={() => setPage(page + 1)}>Nasledujúca →</button>
            </div>
          </>
        ) : <Settings />}
      </main>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '500px'}}>
            <div className="modal-header">
              <h3>Vytvoriť novú faktúru</h3>
              <X onClick={() => setShowForm(false)} style={{cursor:'pointer'}}/>
            </div>
            
            <form onSubmit={handleCreate} className="compact-form">
              <div className="premium-form-group">
                <label>Číslo faktúry</label>
                <input className="premium-input" type="text" value={newInv.invoice_number} onChange={e => setNewInv({...newInv, invoice_number: e.target.value})} placeholder="napr. 2024001" required />
              </div>

              <div className="form-section-title"><User size={14}/> ODBERATEĽ</div>
              <div className="premium-form-group">
                <input placeholder="Meno alebo firma odberateľa" className="premium-input" type="text" value={newInv.client_name} onChange={e => setNewInv({...newInv, client_name: e.target.value})} required />
              </div>
              <div className="form-row" style={{display: 'flex', gap: '10px'}}>
                <input style={{flex: 2}} placeholder="Adresa" className="premium-input" type="text" value={newInv.client_address} onChange={e => setNewInv({...newInv, client_address: e.target.value})} />
                <input style={{flex: 1}} placeholder="IČO" className="premium-input" type="text" value={newInv.client_ico} onChange={e => setNewInv({...newInv, client_ico: e.target.value})} />
              </div>

              <div className="form-section-title"><Tag size={14}/> DETAILY</div>
              <div className="premium-form-group">
                <input placeholder="Názov položky" className="premium-input" type="text" value={newInv.item_name} onChange={e => setNewInv({...newInv, item_name: e.target.value})} required />
              </div>
              <div className="premium-form-group">
                <label>Celková suma (€)</label>
                <input className="premium-input" type="number" step="0.01" value={newInv.total_amount} onChange={e => setNewInv({...newInv, total_amount: e.target.value})} required />
              </div>

              <button type="submit" className="save-btn" style={{width:'100%', marginTop:'20px'}}>
                VYGENEROVAŤ FAKTÚRU
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;