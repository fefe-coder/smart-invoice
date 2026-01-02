import React from 'react';
import { FileText } from 'lucide-react';

const Header = ({ setView, currentView, onLogout }) => {
  return (
    <nav className="floating-nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <FileText color="#F3E3E2" size={24} />
        <h2 className="logo-text">SmartInvoice</h2>
        
        <button 
          onClick={() => setView('dashboard')} 
          className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
        >
          Dashboard
        </button>
        
        <button 
          onClick={() => setView('settings')} 
          className={`nav-btn ${currentView === 'settings' ? 'active' : ''}`}
        >
          Nastavenia
        </button>
      </div>
      
      <button onClick={onLogout} className="logout-btn">
        Odhlásiť
      </button>
    </nav>
  );
};

export default Header;