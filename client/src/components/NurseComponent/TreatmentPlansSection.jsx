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
      item.patientId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'All' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Patient ID</th>
                <th>Treatment</th>
                <th>Admit Ward</th>
                <th>Admitted Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item._id}>
                  <td>{item.patientName}</td>
                  <td>{item.patientId}</td>
                  <td>{item.treatment || '-'}</td>
                  <td>{item.admitWard || '-'}</td>
                  <td>{item.admittedDate ? item.admittedDate.split('T')[0] : '-'}</td>
                  <td>
                    <span
                      className={`status-badge status-${(item.status || 'pending').toLowerCase()}`}
                    >
                      {item.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="action-btn delete-btn"
                      title="Delete"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TreatmentPlansSection;
