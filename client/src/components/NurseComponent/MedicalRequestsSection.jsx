import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MedicalRequestsSection = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newRequest, setNewRequest] = useState({
    wardname: '',
    medication: '',
    quantity: '',
    priority: 'Medium',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    axios
      .get('http://localhost:5000/api/medical-requests')
      .then((res) => setData(res.data))
      .catch((err) => console.error('Error fetching medical requests:', err));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRequest((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const request = {
      ...newRequest,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    };

    axios
      .post('http://localhost:5000/api/medical-requests/add', request)
      .then((res) => {
        setData((prev) => [...prev, res.data]);
        setNewRequest({
          wardname: '',
          medication: '',
          quantity: '',
          priority: 'Medium',
        });
      })
      .catch((err) => console.error('Error adding request:', err));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      axios
        .delete(`http://localhost:5000/api/medical-requests/delete/${id}`)
        .then(() => {
          setData((prev) => prev.filter((item) => item._id !== id));
        })
        .catch((err) => console.error('Error deleting request:', err));
    }
  };

  const filteredData = data.filter((item) =>
    (item.wardname || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="section-container">
      <div className="controls-row">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search medical requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>
      </div>

      <div className="form-section">
        <h3>Send New Medical Request</h3>
        <form onSubmit={handleSubmit} className="medical-request-form">
          <div className="form-row">
            <div className="form-group">
              <label>Ward Name:</label>
              <select
                name="wardname"
                value={newRequest.wardname}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Ward</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Emergency">Emergency</option>
                <option value="ICU">ICU</option>
                <option value="General">General</option>
                <option value="Surgery">Surgery</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Medication:</label>
              <input
                type="text"
                name="medication"
                value={newRequest.medication}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Quantity:</label>
              <input
                type="number"
                name="quantity"
                value={newRequest.quantity}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Priority:</label>
              <select
                name="priority"
                value={newRequest.priority}
                onChange={handleInputChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Send Request to Pharmacy
          </button>
        </form>
      </div>

      <div className="table-container">
        <h3>Recent Medical Requests</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ward Name</th>
              <th>Medication</th>
              <th>Quantity</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item._id}>
                <td>{item.wardname || ''}</td>
                <td>{item.medication}</td>
                <td>{item.quantity}</td>
                <td>
                  <span
                    className={`priority-badge priority-${item.priority.toLowerCase()}`}
                  >
                    {item.priority}
                  </span>
                </td>
                <td>
                  <span
                    className={`status-badge status-${item.status.toLowerCase()}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="actions-cell">
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(item._id)}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicalRequestsSection;
