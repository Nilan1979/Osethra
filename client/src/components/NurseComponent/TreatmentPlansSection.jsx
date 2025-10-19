import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TreatmentPlansSection = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);

  // Fetch all treatment plan data from backend
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/patients');
      setData(res.data);
    } catch (error) {
      console.error('Error fetching treatment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this treatment plan?')) {
      try {
        await axios.delete(`http://localhost:5000/api/patients/delete/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  };

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.admitWard?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'All' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Function to format prescription for display
  const formatPrescription = (prescription) => {
    if (!prescription) return '-';
    if (prescription.length > 100) {
      return prescription.substring(0, 100) + '...';
    }
    return prescription;
  };

  return (
    <div className="section-container">
      <h2>Treatment Plans</h2>

      {/* Controls Section */}
      <div className="controls-row">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>

        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Discharged">Discharged</option>
          </select>

          <button onClick={fetchData} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-container">
        {loading ? (
          <p>Loading treatment plans...</p>
        ) : filteredData.length === 0 ? (
          <p>No treatment plans found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '80px' }}>Patient ID</th>
                  <th style={{ minWidth: '10x0px' }}>Patient Name</th>
                  <th style={{ minWidth: '150px' }}>Treatment</th>
                  <th style={{ minWidth: '100px' }}>Admit Ward</th>
                  <th style={{ minWidth: '100px' }}>Admit Date</th>
                  <th style={{ minWidth: '100px' }}>Doctor</th>
                  <th style={{ minWidth: '200px' }}>Prescriptions</th>
                  <th style={{ minWidth: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.patientId || '-'}</strong>
                    </td>
                    <td>
                      <div>
                        <strong>{item.patientName || '-'}</strong>
                        {item.age && (
                          <div>
                            <small>Age: {item.age} | {item.gender || '-'}</small>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                        {item.treatment || '-'}
                      </div>
                    </td>
                    <td>
                      {item.admitWard ? (
                        <span className="ward-badge">
                          {item.admitWard}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {item.admittedDate ? 
                        new Date(item.admittedDate).toLocaleDateString() : '-'
                      }
                    </td>
                    <td>
                      {item.doctor || '-'}
                    </td>
                    <td>
                      <div 
                        style={{ 
                          maxWidth: '250px', 
                          wordWrap: 'break-word',
                          maxHeight: '80px',
                          overflow: 'hidden'
                        }}
                        title={item.prescription}
                      >
                        {formatPrescription(item.prescription)}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="action-btn delete-btn"
                          title="Delete Treatment Plan"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

     
    </div>
  );
};

export default TreatmentPlansSection;