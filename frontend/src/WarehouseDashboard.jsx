import React, { useState, useEffect } from 'react';

export default function WarehouseDashboard() {
  const [capacities, setCapacities] = useState([]);
  const [packages, setPackages] = useState([]); 
  const [error, setError] = useState('');

  // Fetch both capacities and the package list
  const fetchData = async () => {
    try {
      const [capRes, packRes] = await Promise.all([
        fetch('https://warehouse-package-system.onrender.com/api/capacity'),
        fetch('https://warehouse-package-system.onrender.com/api/packages')
      ]);
      
      setCapacities(await capRes.json());
      setPackages(await packRes.json());
    } catch (err) {
      setError("Failed to fetch data from server.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add Package
  const addPackage = async (size_type) => {
    setError('');
    const response = await fetch('https://warehouse-package-system.onrender.com/api/packages', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ size_type })
    });

    if (!response.ok) {
      const errData = await response.json();
      setError(errData.message);
    } else {
      fetchData(); 
    }
  };

  // Remove Package
  const removePackage = async (id) => {
    setError('');
    const response = await fetch(`https://warehouse-package-system.onrender.com/api/packages/${id}`, { 
      method: 'DELETE'
    });

    if (!response.ok) {
      const errData = await response.json();
      setError(errData.message);
    } else {
      fetchData(); 
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px' }}>
      <h1>📦 Warehouse Package System</h1>
      
      {error && <div style={{ color: 'red', marginBottom: '10px', padding: '10px', background: '#ffe6e6', borderRadius: '5px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        {capacities.map((item) => (
          <div key={item.size_type} style={{ flex: 1, border: '1px solid #ccc', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <h2>{item.size_type}</h2>
            <p>Available: <strong style={{ color: item.available_space === 0 ? 'red' : 'green' }}>{item.available_space}</strong> / {item.max_capacity}</p>
            <button 
              onClick={() => addPackage(item.size_type)}
              disabled={item.available_space <= 0}
              style={{ padding: '8px 16px', cursor: item.available_space <= 0 ? 'not-allowed' : 'pointer' }}
            >
              Add {item.size_type} Package
            </button>
          </div>
        ))}
      </div>

      <h2>📝 Current Packages in Warehouse</h2>
      {packages.length === 0 ? (
        <p>The warehouse is currently empty.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {packages.map((pkg) => (
            <li key={pkg.package_id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '10px 0' }}>
              <span>
                <strong>ID:</strong> {pkg.package_id} | <strong>Size:</strong> {pkg.size_type} | <strong>Stored:</strong> {new Date(pkg.stored_at).toLocaleTimeString()}
              </span>
              <button 
                onClick={() => removePackage(pkg.package_id)}
                style={{ background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px' }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
