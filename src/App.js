import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./App.css";

const markerIcons = {
  DISPONIBILE: L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  PROGRAMMATO: L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
};

function App() {
  const [cityData, setCityData] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [markers, setMarkers] = useState([]);
  const [map, setMap] = useState(null);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  const featureGroupRef = useRef();

  useEffect(() => {
    document.title = "Cantieri Fibercop - Map";
  }, []);

  useEffect(() => {
    axios
      .get(
        "https://raw.githubusercontent.com/v-graglia/cantieri-fibercop-data/main/data.json"
      )
      .then((response) => {
        console.log("Data fetched successfully:", response.data);
        const data = response.data.data;
        setCityData(data);
        const provinces = [
          ...new Set(data.map((item) => item.PROVINCIA)),
        ].sort();
        console.log("Provinces:", provinces);
        setProvinces(provinces);
        if (provinces.length > 0) {
          setSelectedProvince(provinces[0]);
          console.log("Selected province set to:", provinces[0]);
        }
        setIsButtonEnabled(true); // Enable the button

      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      const filteredCities = [
        ...new Set(
          cityData
            .filter((item) => item.PROVINCIA === selectedProvince)
            .map((item) => item.COMUNE)
        ),
      ].sort();
      console.log(
        "Filtered cities for province",
        selectedProvince,
        ":",
        filteredCities
      );
      setCities(filteredCities);
      if (filteredCities.length > 0) {
        setSelectedCity(filteredCities[0]);
        console.log("Selected city set to:", filteredCities[0]);
      }
    }
  }, [selectedProvince, cityData]);

  // Effect to fit map bounds to markers when markers change
  useEffect(() => {
    if (map && markers.length > 0) {
      const bounds = L.latLngBounds(
        markers.map((marker) => [marker.LATITUDINE, marker.LONGITUDINE])
      );
      map.flyToBounds(bounds, {
        duration: 2, // Animation duration in seconds
        // padding: [30, 30], // Padding in pixels (top, right, bottom, left),
        maxZoom: 15,
      });
    }
  }, [map, markers]);

  const handleButtonClick = () => {
    if (selectedCity) {
      const filteredData = cityData
        .filter((item) => item.COMUNE === selectedCity)
        .sort((a, b) => a.INDIRIZZO.localeCompare(b.INDIRIZZO));
      setMarkers(filteredData);
    }
  };
  
  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  return (
    <div className="relative flex flex-col min-h-screen  justify-center overflow-hidden bg-gray-200 min-h-screen text-gray-700">
      <div className="relative container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
          Cantieri FiberCop
        </h1>
        <div className="relative flex justify-center lg:flex-row flex-col lg:space-x-2" >
            <div class="bg-white px-6 pb-8 pt-10 shadow-xl ring-2 ring-white/5 rounded-lg " id="form-container">
                <div class=" space-y-6 leading-1 flex-col items-center w-full bg-white rounded p-8 md:max-w-sm mx-auto">
                    <div className="mb-4">
                    <label
                        htmlFor="provinceSelect"
                        className="block text-lg font-bold mb-2"
                    >
                        Provincia:
                    </label>
                    <div className="custom-select">
                        <select
                        id="provinceSelect"
                        className="block w-full bg-white text-gray-800 border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow-sm leading-tight focus:border-blue-600 block focus:outline-none focus:shadow-outline"
                        onChange={handleProvinceChange}
                        value={selectedProvince}
                        >
                        {provinces.map((province) => (
                            <option key={province} value={province}>
                            {province}
                            </option>
                        ))}
                        </select>
                    </div>
                    </div>

                    <div className="mb-4">
                    <label
                        htmlFor="citySelect"
                        className="block text-lg font-bold mb-2"
                    >
                        Città:
                    </label>
                    <div className="custom-select">
                        <select
                        id="citySelect"
                        className="block w-full bg-white text-gray-800 border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow-sm leading-tight focus:border-blue-600 block focus:outline-none focus:shadow-outline"
                        onChange={handleCityChange}
                        value={selectedCity}
                        >
                        {cities.map((city) => (
                            <option key={city} value={city}>
                            {city}
                            </option>
                        ))}
                        </select>
                    </div>
                    </div>
                    <div className="">
                        <label className="block text-lg font-bold mb-2">Legenda:</label>
                        <div className="flex flex-row justify-center mx-2">
                            <div className="legend-item flex flex-col items-center px-2">
                                <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png" alt="Marker Icon" />
                                <span className="text-center">DISPONIBILE</span>
                            </div>
                            <div className="legend-item flex flex-col items-center px-2">
                                <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png" alt="Marker Icon" />
                                <span className="text-center">PROGRAMMATO</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-row justify-center">
                        <button 
                        class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded "
                        onClick={handleButtonClick} disabled={!isButtonEnabled}
                        >
                            Visualizza
                        </button>
                    </div>

                </div>
            
            </div>
            <div className="md:w-full relative my-4 lg:my-0 sm:my-4 md:my-4 mx-0 flex-auto shadow-xl">
                <MapContainer
                ref={setMap}
                center={[45.46, 9.2]}
                zoom={12}
                className="h-96 rounded-lg"
                id="map"
                >
                <TileLayer
                    attribution="© OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers.map((marker) => (
                    <Marker
                    key={marker.ID_ELEMENTO}
                    position={[marker.LATITUDINE, marker.LONGITUDINE]}
                    icon={markerIcons[marker.STATO]}
                    eventHandlers={{
                        mouseover: () => {
                        map.getContainer().style.cursor = "pointer"; // Change cursor to pointer on marker hover
                        },
                        mouseout: () => {
                        map.getContainer().style.cursor = ""; // Reset cursor on mouseout
                        },
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
      </div>
    </div>
    
  );
}

export default App;
