'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, X } from 'react-feather';
import './App.css';
import { API_URL } from './config';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const translations = {
  english: {
    siteTitle: "FIND-IT",
    searchPlaceholder: "Search for facilities...",
    searchRadius: "Search Radius",
    interactiveMap: "Interactive Map",
    nearbyFacilities: "Nearby Facilities (within {radius} km)",
    loading: "Loading facilities...",
    settings: "Website Settings",
    theme: "Theme",
    language: "Language",
    metro: "Metro",
    busStands: "Bus Stands",
    malls: "Malls",
    restaurants: "Restaurants",
    atms: "ATMs",
    report: "Report Issue",
    reportUtility: "Report Utility",
    action: "Action",
    reason: "Reason",
    submit: "Submit",
    cancel: "Cancel",
    update: "Update",
    delete: "Delete",
    reportSuccess: "Report submitted successfully",
    reportError: "Failed to submit report",
  },
  hindi: {
    siteTitle: "खोजें",
    searchPlaceholder: "सुविधाओं की खोज करें...",
    searchRadius: "खोज त्रिज्या",
    interactiveMap: "इंटरैक्टिव मानचित्र",
    nearbyFacilities: "निकटवर्ती सुविधाएँ ({radius} किमी के भीतर)",
    loading: "सुविधाएँ लोड हो रही हैं...",
    settings: "वेबसाइट सेटिंग्स",
    theme: "थीम",
    language: "भाषा",
    metro: "मेट्रो",
    busStands: "बस स्टैंड",
    malls: "मॉल",
    restaurants: "रेस्तरां",
    atms: "एटीएम",
    report: "रिपोर्ट",
    reportUtility: "उपयोगिता की रिपोर्ट करें",
    action: "कार्रवाई",
    reason: "कारण",
    submit: "जमा करें",
    cancel: "रद्द करें",
    update: "अपडेट",
    delete: "हटाएं",
    reportSuccess: "रिपोर्ट सफलतापूर्वक जमा की गई",
    reportError: "रिपोर्ट जमा करने में विफल",
  },
  kannada: {
    siteTitle: "ಹುಡುಕಿ",
    searchPlaceholder: "ಸೌಲಭ್ಯಗಳನ್ನು ಹುಡುಕಿ...",
    searchRadius: "ಹುಡುಕಾಟ ವ್ಯಾಪ್ತಿ",
    interactiveMap: "ಸಂವಾದಾತ್ಮಕ ನಕ್ಷೆ",
    nearbyFacilities: "ಹತ್ತಿರದ ಸೌಲಭ್ಯಗಳು ({radius} ಕಿ.ಮೀ ಒಳಗೆ)",
    loading: "ಸೌಲಭ್ಯಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    settings: "ವೆಬ್‌ಸೈಟ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    theme: "ಥೀಮ್",
    language: "ಭಾಷೆ",
    metro: "ಮೆಟ್ರೋ",
    busStands: "ಬಸ್ ನಿಲ್ದಾಣಗಳು",
    malls: "ಮಾಲ್‌ಗಳು",
    restaurants: "ರೆಸ್ಟೋರೆಂಟ್‌ಗಳು",
    atms: "ಎಟಿಎಂಗಳು",
    report: "ವರದಿ",
    reportUtility: "ಉಪಯುಕ್ತತೆಯನ್ನು ವರದಿ ಮಾಡಿ",
    action: "ಕ್ರಿಯೆ",
    reason: "ಕಾರಣ",
    submit: "ಸಲ್ಲಿಸು",
    cancel: "ರದ್ದುಮಾಡು",
    update: "ನವೀಕರಿಸು",
    delete: "ಅಳಿಸು",
    reportSuccess: "ವರದಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ",
    reportError: "ವರದಿ ಸಲ್ಲಿಸಲು ವಿಫಲವಾಗಿದೆ",
  },
};

export default function Component() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5);
  const [radiusError, setRadiusError] = useState('');
  const [appSettings, setAppSettings] = useState({
    theme: 'light',
    language: 'english',
  });
  const [userLocation, setUserLocation] = useState({ lat: 12.9716, lon: 77.5946 });
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({
    type: '',
    name: '',
    action: 'update',
    reason: '',
  });

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const radiusCircleRef = useRef(null);
  const userMarkerRef = useRef(null);

  const t = translations[appSettings.language];

  const updateMapMarkers = useCallback((facilities, shouldRecenter = false) => {
    if (!mapInstanceRef.current) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
    }

    radiusCircleRef.current = L.circle([userLocation.lat, userLocation.lon], {
      radius: searchRadius * 1000,
      color: 'blue',
      fillColor: '#30f',
      fillOpacity: 0.1
    }).addTo(mapInstanceRef.current);

    const facilitiesToShow = facilities.filter(facility => 
      facility.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    facilitiesToShow.forEach(facility => {
      const marker = L.marker([facility.latitude, facility.longitude])
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b>${facility.name}</b><br>${facility.address || ''}<br>Distance: ${facility.distance.toFixed(2)} km`);
      markersRef.current.push(marker);
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lon]);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lon], {
        draggable: true,
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(mapInstanceRef.current);

      userMarkerRef.current.on('dragend', function(event) {
        const marker = event.target;
        const position = marker.getLatLng();
        setUserLocation({ lat: position.lat, lon: position.lng });
      });
    }

    if (shouldRecenter) {
      const bounds = radiusCircleRef.current.getBounds();
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [searchRadius, userLocation.lat, userLocation.lon, searchQuery]);

  const fetchFacilities = useCallback(async (shouldRecenter = false) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/get_utilities?type=${activeTab}&distance=${searchRadius}&lat=${userLocation.lat}&lon=${userLocation.lon}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch facilities');
      }
      const data = await response.json();
      
      const filteredData = data.filter(facility => {
        const facilityLatLng = L.latLng(facility.latitude, facility.longitude);
        const userLatLng = L.latLng(userLocation.lat, userLocation.lon);
        const distance = userLatLng.distanceTo(facilityLatLng) / 1000;
        facility.distance = distance;
        return distance <= searchRadius;
      });

      setFacilities(filteredData);
      updateMapMarkers(filteredData, shouldRecenter);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchRadius, userLocation, updateMapMarkers]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        function(position) {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        function(error) {
          console.error("Error getting user location:", error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.log("Geolocation is not available in your browser.");
    }
  }, []);

  useEffect(() => {
    if (userLocation.lat !== 0 && userLocation.lon !== 0) {
      fetchFacilities();
    }
  }, [fetchFacilities, userLocation]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapRef.current).setView([userLocation.lat, userLocation.lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstanceRef.current);

    radiusCircleRef.current = L.circle([userLocation.lat, userLocation.lon], {
      radius: searchRadius * 1000,
      color: 'blue',
      fillColor: '#30f',
      fillOpacity: 0.1
    }).addTo(mapInstanceRef.current);

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lon], {
      draggable: true,
      icon: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }).addTo(mapInstanceRef.current);

    userMarkerRef.current.on('dragend', function(event) {
      const marker = event.target;
      const position = marker.getLatLng();
      setUserLocation({ lat: position.lat, lon: position.lng });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && userLocation.lat !== 0 && userLocation.lon !== 0) {
      map.setView([userLocation.lat, userLocation.lon], 13);
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lon]);
      }
    }
  }, [userLocation]);

  const filteredFacilities = facilities.filter(facility => 
    facility.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSettingChange = (setting, value) => {
    setAppSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleRadiusChange = (e) => {
    const value = parseInt(e.target.value);
    if (isNaN(value)) {
      setRadiusError('Please enter a valid number');
    } else if (value <= 0) {
      setRadiusError('Radius must be greater than 0');
    } else if (value > 60) {
      setRadiusError('Radius cannot exceed 60km');
    } else {
      setRadiusError('');
      setSearchRadius(value);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchFacilities(true);
  };

  useEffect(() => {
    fetchFacilities(false);
  }, [activeTab, searchRadius, fetchFacilities]);

  const handleReportClick = (facility) => {
    setReportData({
      type: activeTab,
      name: facility.name,
      action: 'update',
      reason: '',
    });
    setShowReportModal(true);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/report_utility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });
      if (!response.ok) {
        throw new Error('Failed to submit report');
      }
      setShowReportModal(false);
      alert(t.reportSuccess);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert(t.reportError);
    }
  };

  const SettingsPanel = () => (
    <div className="settings-panel">
      <div className="settings-header">
        <h2>{t.settings}</h2>
        <button onClick={() => setShowSettings(false)}><X size={24} /></button>
      </div>
      <div className="settings-content">
        <div className="setting-item">
          <label htmlFor="theme">{t.theme}:</label>
          <select
            id="theme"
            value={appSettings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div className="setting-item">
          <label htmlFor="language">{t.language}:</label>
          <select
            id="language"
            value={appSettings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
          >
            <option value="english">English</option>
            <option value="hindi">हिंदी</option>
            <option value="kannada">ಕನ್ನಡ</option>
          </select>
        </div>
      </div>
    </div>
  );

  const ReportModal = () => (
    <div className="report-modal-overlay">
      <div className="report-modal">
        <h2 className="report-modal-title">{t.reportUtility}</h2>
        <form onSubmit={handleReportSubmit}>
          <div className="form-group">
            <label htmlFor="action" className="form-label">{t.action}</label>
            <select
              id="action"
              value={reportData.action}
              onChange={(e) => setReportData({ ...reportData, action: e.target.value })}
              className="form-select"
            >
              <option value="update">{t.update}</option>
              <option value="delete">{t.delete}</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="reason" className="form-label">{t.reason}</label>
            <textarea
              id="reason"
              value={reportData.reason}
              onChange={(e) => setReportData({ ...reportData, reason: e.target.value })}
              className="form-textarea"
              rows="3"
            ></textarea>
          </div>
          <div className="form-actions">
            <button
              type="button"
              onClick={() => setShowReportModal(false)}
              className="btn btn-secondary"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {t.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className={`app-container ${appSettings.theme}`}>
      <nav className="navbar">
        <div className="nav-content">
          <h1 className="site-title">{t.siteTitle}</h1>
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
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="radius-panel">
          <div className="radius-input-container">
            <label htmlFor="searchRadius">{t.searchRadius}</label>
            <div className="input-wrapper">
              <input
                type="number"
                id="searchRadius"
                value={searchRadius}
                onChange={handleRadiusChange}
                min="1"
                max="60"
                className="radius-input"
              />
              <span className="unit">km</span>
            </div>
            {radiusError && <p className="error">{radiusError}</p>}
          </div>
        </div>

        <div className="map-container">
          <h2>{t.interactiveMap}</h2>
          <div id="map" ref={mapRef} style={{ height: '400px', width: '100%' }}></div>
        </div>

        <div className="tabs-container">
          <button 
            onClick={() => handleTabChange('metro_station')} 
            className={`tab ${activeTab === 'metro_station' ? 'active' : ''}`}
          >
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-lGst28Vi9Ucza9G2gYLjcUiURYyppi.png" 
                 alt="" 
                 className="tab-icon" />
            {t.metro}
          </button>
          <button 
            onClick={() => handleTabChange('bus_stop')} 
            className={`tab ${activeTab === 'bus_stop' ? 'active' : ''}`}
          >
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-VnQJti3ojsEnyaSG7g7unjrbax1ndH.png" 
                 alt="" 
                 className="tab-icon" />
            {t.busStands}
          </button>
          <button 
            onClick={() => handleTabChange('mall')} 
            className={`tab ${activeTab === 'mall' ? 'active' : ''}`}
          >
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PuscUR0utvKGQ1QsN6gTkzqz4o1esR.png" 
                 alt="" 
                 className="tab-icon" />
            {t.malls}
          </button>
          <button 
            onClick={() => handleTabChange('restaurant')} 
            className={`tab ${activeTab === 'restaurant' ? 'active' : ''}`}
          >
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-4WYQw1dBvkjKqwMs6c3FEa0juv51yh.png" 
                 alt="" 
                 className="tab-icon" />
            {t.restaurants}
          </button>
          <button 
            onClick={() => handleTabChange('atm')} 
            className={`tab ${activeTab === 'atm' ? 'active' : ''}`}
          >
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-050JVKjJZ4EsX5xO5hC8a6K2I1MUhc.png" 
                 alt="" 
                 className="tab-icon" />
            {t.atms}
          </button>
        </div>

        <section className="facilities-section">
          <h2>{t.nearbyFacilities.replace('{radius}', searchRadius)}</h2>
          {isLoading ? (
            <p className="loading">{t.loading}</p>
          ) : (
            <div className="facilities-grid">
              {filteredFacilities.map((facility, index) => (
                <div key={index} className="facility-card">
                  <h3>{facility.name}</h3>
                  <p>Type: {activeTab}</p>
                  <p>Distance: {facility.distance.toFixed(2)} km</p>
                  {facility.address && <p>Address: {facility.address}</p>}
                  {facility.phone && <p>Phone: {facility.phone}</p>}
                  {facility.email && <p>Email: {facility.email}</p>}
                  {facility.line && <p>Line: {facility.line}</p>}
                  {facility.layout && <p>Layout: {facility.layout}</p>}
                  {facility.short_form && <p>Short Form: {facility.short_form}</p>}
                  {facility.num_trips_in_stop && <p>Number of Trips: {facility.num_trips_in_stop}</p>}
                  {facility.boothcode && <p>Booth Code: {facility.boothcode}</p>}
                  {facility.buses && <p>Buses: {facility.buses.join(', ')}</p>}
                  {facility.rate && <p>Rating: {facility.rate}</p>}
                  {facility.cuisines && <p>Cuisines: {facility.cuisines}</p>}
                  {facility.approx_cost && <p>Approximate Cost: {facility.approx_cost}</p>}
                  <button
                    onClick={() => handleReportClick(facility)}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    {t.report}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {showReportModal && <ReportModal />}
    </div>
  );
}

