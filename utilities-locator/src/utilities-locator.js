'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Settings, X, ChevronDown, ChevronUp } from 'react-feather';
import './App.css';

const AppPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showRadiusPanel, setShowRadiusPanel] = useState(false);
  const [appSettings, setAppSettings] = useState({
    mapStyle: 'street',
    theme: 'light',
    searchRadius: 5,
  });

  const radiusOptions = [1, 2, 5, 10, 20, 30, 40, 60];

  const fetchFacilities = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/facilities?type=${activeTab}&radius=${appSettings.searchRadius}`);
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
  }, [activeTab, appSettings.searchRadius]);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  const filteredFacilities = facilities.filter(facility => 
    (activeTab === 'all' || facility.type === activeTab) &&
    facility.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSettingChange = (setting, value) => {
    setAppSettings(prev => ({ ...prev, [setting]: value }));
  };

  const SettingsPanel = () => (
    <div className="settings-panel">
      <div className="settings-header">
        <h2>Website Settings</h2>
        <button onClick={() => setShowSettings(false)}><X size={24} /></button>
      </div>
      <div className="settings-content">
        <div className="setting-item">
          <label htmlFor="mapStyle">Map Style:</label>
          <select
            id="mapStyle"
            value={appSettings.mapStyle}
            onChange={(e) => handleSettingChange('mapStyle', e.target.value)}
          >
            <option value="street">Street</option>
            <option value="satellite">Satellite</option>
            <option value="terrain">Terrain</option>
          </select>
        </div>
        <div className="setting-item">
          <label htmlFor="theme">Theme:</label>
          <select
            id="theme"
            value={appSettings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`app-container ${appSettings.theme}`}>
      <nav className="navbar">
        <div className="nav-content">
          <h1 className="site-title">FIND-IT</h1>
          <div className="settings-container">
            <button className="settings-button" onClick={() => setShowSettings(!showSettings)}>
              <Settings size={24} />
            </button>
          </div>
        </div>
      </nav>

      {showSettings && <SettingsPanel />}

      <main className="main-content">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search for facilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="radius-panel">
          <button 
            className="radius-toggle" 
            onClick={() => setShowRadiusPanel(!showRadiusPanel)}
          >
            Search Radius: {appSettings.searchRadius} km
            {showRadiusPanel ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {showRadiusPanel && (
            <div className="radius-options">
              {radiusOptions.map(radius => (
                <button
                  key={radius}
                  className={`radius-option ${appSettings.searchRadius === radius ? 'active' : ''}`}
                  onClick={() => {
                    handleSettingChange('searchRadius', radius);
                    setShowRadiusPanel(false);
                  }}
                >
                  {radius} km
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="map-container">
          <h2>Interactive Map</h2>
          <div className="map-placeholder">
            <span>Map placeholder ({appSettings.mapStyle} view)</span>
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
          <button 
            onClick={() => setActiveTab('atm')} 
            className={`tab ${activeTab === 'atm' ? 'active' : ''}`}
          >
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-050JVKjJZ4EsX5xO5hC8a6K2I1MUhc.png" 
                 alt="" 
                 className="tab-icon" />
            ATMs
          </button>
        </div>

        <section className="facilities-section">
          <h2>Nearby Facilities (within {appSettings.searchRadius} km)</h2>
          {isLoading ? (
            <p className="loading">Loading facilities...</p>
          ) : (
            <div className="facilities-grid">
              {filteredFacilities.map(facility => (
                <div key={facility.id} className="facility-card">
                  <h3>{facility.name}</h3>
                  <p>Type: {facility.type}</p>
                  <p>Distance: {facility.distance} km</p>
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