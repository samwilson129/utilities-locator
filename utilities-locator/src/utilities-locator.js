'use client'

import React, { useState, useEffect } from 'react';
import { Settings, User, LogOut, UserPlus } from 'react-feather';
import './App.css';

const AppPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/facilities');
      if (!response.ok) {
        throw new Error('Failed to fetch facilities');
      }
      const data = await response.json();
      setFacilities(data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFacilities = facilities.filter(facility => 
    (activeTab === 'all' || facility.type === activeTab) &&
    facility.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-content">
          <h1 className="site-title">FIND-IT</h1>
          <div className="settings-container">
            <button className="settings-button" onClick={() => setShowSettings(!showSettings)}>
              <Settings size={24} />
            </button>
            {showSettings && (
              <div className="settings-dropdown">
                <button className="dropdown-item">
                  <User size={16} />
                  User Settings
                </button>
                <button className="dropdown-item">
                  <UserPlus size={16} />
                  Create Account
                </button>
                <button className="dropdown-item">
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search for facilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="map-container">
          <h2>Interactive Map</h2>
          <div className="map-placeholder">
            <span>Map placeholder</span>
          </div>
        </div>

        <div className="tabs-container">
          <button 
            onClick={() => setActiveTab('all')} 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveTab('metro')} 
            className={`tab ${activeTab === 'metro' ? 'active' : ''}`}
          >
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-lGst28Vi9Ucza9G2gYLjcUiURYyppi.png" 
                 alt="" 
                 className="tab-icon" />
            Metro
          </button>
          <button 
            onClick={() => setActiveTab('bus')} 
            className={`tab ${activeTab === 'bus' ? 'active' : ''}`}
          >
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-VnQJti3ojsEnyaSG7g7unjrbax1ndH.png" 
                 alt="" 
                 className="tab-icon" />
            Bus Stands
          </button>
          <button 
            onClick={() => setActiveTab('mall')} 
            className={`tab ${activeTab === 'mall' ? 'active' : ''}`}
          >
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PuscUR0utvKGQ1QsN6gTkzqz4o1esR.png" 
                 alt="" 
                 className="tab-icon" />
            Malls
          </button>
          <button 
            onClick={() => setActiveTab('restaurant')} 
            className={`tab ${activeTab === 'restaurant' ? 'active' : ''}`}
          >
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-4WYQw1dBvkjKqwMs6c3FEa0juv51yh.png" 
                 alt="" 
                 className="tab-icon" />
            Restaurants
          </button>
        </div>

        <section className="facilities-section">
          <h2>Nearby Facilities</h2>
          {isLoading ? (
            <p className="loading">Loading facilities...</p>
          ) : (
            <div className="facilities-grid">
              {filteredFacilities.map(facility => (
                <div key={facility.id} className="facility-card">
                  <h3>{facility.name}</h3>
                  <p>Type: {facility.type}</p>
                  <p>Distance: {facility.distance}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <button className="locate-button">Locate Me</button>
      </main>
    </div>
  );
};

export default AppPage;