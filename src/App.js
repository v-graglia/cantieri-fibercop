import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

const markerIcons = {
  DISPONIBILE: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  PROGRAMMATO: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
};

function App() {
  const [cityData, setCityData] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [markers, setMarkers] = useState([]);
  const [map, setMap] = useState(null);

  const featureGroupRef = useRef();

  useEffect(() => {
    axios.get('https://raw.githubusercontent.com/v-graglia/cantieri-fibercop-data/main/data.json')
      .then(response => {
        console.log('Data fetched successfully:', response.data);
        const data = response.data.data;
        setCityData(data);
        const provinces = [...new Set(data.map(item => item.PROVINCIA))].sort();
        console.log('Provinces:', provinces);
        setProvinces(provinces);
        if (provinces.length > 0) {
          setSelectedProvince(provinces[0]);
          console.log('Selected province set to:', provinces[0]);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      const filteredCities = [...new Set(cityData.filter(item => item.PROVINCIA === selectedProvince).map(item => item.COMUNE))].sort();
      console.log('Filtered cities for province', selectedProvince, ':', filteredCities);
      setCities(filteredCities);
      if (filteredCities.length > 0) {
        setSelectedCity(filteredCities[0]);
        console.log('Selected city set to:', filteredCities[0]);
      }
    }
  }, [selectedProvince, cityData]);

  useEffect(() => {
    if (selectedCity) {
      const filteredData = cityData.filter(item => item.COMUNE === selectedCity).sort((a, b) => a.INDIRIZZO.localeCompare(b.INDIRIZZO));
      setMarkers(filteredData);
    }
  }, [selectedCity, cityData]);

  // Effect to fit map bounds to markers when markers change
  useEffect(() => {
    if (map && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(marker => [marker.LATITUDINE, marker.LONGITUDINE]));
      map.flyToBounds(bounds, {
        duration: 2, // Animation duration in seconds
        // padding: [30, 30], // Padding in pixels (top, right, bottom, left),
        maxZoom: 15

      });

    }
  }, [map, markers]);

  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-5">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">Cantieri FiberCop</h1>

        <div className="mb-4">
          <label htmlFor="provinceSelect" className="block text-gray-700 font-bold mb-2">Provincia:</label>
          <div className="custom-select">
            <select id="provinceSelect" className="block w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow-sm leading-tight focus:outline-none focus:shadow-outline" onChange={handleProvinceChange} value={selectedProvince}>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="citySelect" className="block text-gray-700 font-bold mb-2">Città:</label>
          <div className="custom-select">
            <select id="citySelect" className="block w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow-sm leading-tight focus:outline-none focus:shadow-outline" onChange={handleCityChange} value={selectedCity}>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        <MapContainer 
            ref={setMap} 
            center={[45.0, 10]} 
            zoom={13} 
            className="rounded shadow h-64" 
            id="map"
        >
          <TileLayer
            attribution='© OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map(marker => (
            <Marker 
                key={marker.ID_ELEMENTO} 
                position={[marker.LATITUDINE, marker.LONGITUDINE]} 
                icon={markerIcons[marker.STATO]}
                eventHandlers={{
                mouseover: () => {
                    map.getContainer().style.cursor = 'pointer'; // Change cursor to pointer on marker hover
                },
                mouseout: () => {
                    map.getContainer().style.cursor = ''; // Reset cursor on mouseout
                }
                }}
            >
              <Popup>
                <p><strong>Indirizzo:</strong> {marker.INDIRIZZO || '-'}</p>
                <p><strong>Provincia:</strong> {marker.PROVINCIA || '-'}</p>
                <p><strong>Comune:</strong> {marker.COMUNE || '-'}</p>
                <p><strong>Stato:</strong> {marker.STATO || '-'}</p>
                <p><strong>Codice ACL:</strong> {marker.CODICE_ACL || '-'}</p>
                <p><strong>Centrale TX di Rif:</strong> {marker.CENTRALE_TX_DI_RIF || '-'}</p>
                <p><strong>ID Elemento:</strong> {marker.ID_ELEMENTO || '-'}</p>
                <p><strong>Tipo:</strong> {marker.TIPO || '-'}</p>
                <p><strong>Tipologia CRO:</strong> {marker.TIPOLOGIA_CRO || '-'}</p>
                <p><strong>Data Disponibilità:</strong> {marker.DATA_DISPONIBILITA || '-'}</p>
                <p><strong>Data Pubblicazione:</strong> {marker.DATA_PUBBLICAZIONE || '-'}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
