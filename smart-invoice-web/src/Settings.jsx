import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Building, CreditCard, Mail, Globe } from 'lucide-react';
import './Settings.css';

function Settings() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    ico: '',
    dic: '',
    ic_dph: '',
    bank_account: '',
    email: ''
  });

  const API_URL = "http://localhost:4000/api/profile";

  // Načítanie profilu pri starte
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(API_URL);
        if (res.data) {
          setFormData(res.data);
        }
      } catch (e) {
        console.error("Nepodarilo sa načítať profil z lokálnej DB.");
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(API_URL, formData);
      alert("✅ Vaše firemné údaje boli úspešne uložené!");
    } catch (e) {
      console.error(e);
      alert("❌ Chyba pri ukladaní údajov. Skontrolujte backend.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <h1 className="settings-title">
          <Building size={28} /> Nastavenia firmy
        </h1>

        <form onSubmit={handleSubmit} className="settings-grid">
          
          {/* SEKCIA: ZÁKLADNÉ ÚDAJE */}
          <div className="input-group full-width">
            <label className="input-label">Obchodné meno / Meno</label>
            <input 
              className="settings-input" 
              name="name" 
              value={formData.name || ''} 
              onChange={handleChange} 
              placeholder="Názov vašej spoločnosti" 
              required 
            />
          </div>

          <div className="input-group full-width">
            <label className="input-label">Adresa sídla</label>
            <input 
              className="settings-input" 
              name="address" 
              value={formData.address || ''} 
              onChange={handleChange} 
              placeholder="Ulica, PSČ, Mesto" 
            />
          </div>

          <div className="input-group">
            <label className="input-label">IČO</label>
            <input 
              className="settings-input" 
              name="ico" 
              value={formData.ico || ''} 
              onChange={handleChange} 
              placeholder="12345678"
            />
          </div>

          <div className="input-group">
            <label className="input-label">DIČ / IČ DPH</label>
            <input 
              className="settings-input" 
              name="dic" 
              value={formData.dic || ''} 
              onChange={handleChange} 
              placeholder="SK202..."
            />
          </div>

          <div className="form-divider" />

          {/* SEKCIA: PLATBA */}
          <div className="input-group full-width">
            <label className="input-label">
              <CreditCard size={14} style={{marginRight: '5px'}}/> Bankové spojenie (IBAN)
            </label>
            <input 
              className="settings-input" 
              name="bank_account" 
              value={formData.bank_account || ''} 
              onChange={handleChange} 
              placeholder="SK00 0000 0000 0000 0000 0000" 
            />
          </div>

          <div className="form-divider" />

          {/* SEKCIA: KONTAKT */}
          <div className="input-group full-width">
            <label className="input-label">
              <Mail size={14} style={{marginRight: '5px'}}/> Kontakt na faktúry (E-mail)
            </label>
            <input 
              className="settings-input" 
              type="email" 
              name="email" 
              value={formData.email || ''} 
              onChange={handleChange} 
              placeholder="vas@email.sk" 
            />
          </div>

          <button type="submit" className="save-btn">
            <Save size={20} /> ULOŽIŤ MOJE ÚDAJE
          </button>
        </form>
      </div>
    </div>
  );
}

export default Settings;