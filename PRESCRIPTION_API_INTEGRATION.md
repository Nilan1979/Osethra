# Prescription API Integration Guide

## Overview
This document explains how the Prescription API has been integrated between the backend and frontend.

## Backend Implementation

### 1. **Controller: PrescriptionController.js**
Location: `server/Controllers/PrescriptionController.js`

#### Main Endpoints:
- `getPrescriptions()` - Get all prescriptions with pagination, search, and filtering
- `getPrescription()` - Get single prescription by ID
- `createPrescription()` - Create new prescription
- `dispensePrescription()` - Dispense prescription (creates issue and updates stock)
- `updatePrescriptionStatus()` - Update prescription status
- `deletePrescription()` - Cancel prescription (soft delete)

### 2. **Routes: PrescriptionRoutes.js**
Location: `server/Routes/PrescriptionRoutes.js`

#### Available Routes:
```javascript
GET    /api/prescriptions              // Get all prescriptions
GET    /api/prescriptions/:id          // Get single prescription
POST   /api/prescriptions              // Create prescription
POST   /api/prescriptions/:id/dispense // Dispense prescription
PATCH  /api/prescriptions/:id/status   // Update status
DELETE /api/prescriptions/:id          // Cancel prescription
```

### 3. **Authentication & Authorization**
All routes are protected with:
- `authenticate` - Verifies JWT token
- `authorize` - Role-based access control
- Different roles for different actions:
  - View: pharmacist, admin, doctor, nurse
  - Create: doctor, admin
  - Dispense: pharmacist, admin
  - Cancel: doctor (creator), admin

### 4. **API Response Format**

#### Get All Prescriptions Response:
```json
{
  "success": true,
  "data": {
    "prescriptions": [...],
    "total": 10,
    "pending": 5,
    "completed": 5,
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

#### Prescription Object Structure:
```json
{
  "_id": "ObjectId",
  "prescriptionNumber": "RX-20251003-0001",
  "patient": {
    "id": "ObjectId",
    "name": "Patient Name"
  },
  "doctor": {
    "id": "ObjectId",
    "name": "Doctor Name"
  },
  "medications": [
    {
      "medicationName": "Paracetamol 500mg",
      "dosage": "1 tablet",
      "frequency": "3 times daily",
      "duration": "7 days",
      "quantity": 21,
      "instructions": "Take after meals"
    }
  ],
  "date": "2025-10-03T00:00:00.000Z",
  "time": "09:30 AM",
  "status": "pending",
  "diagnosis": "Fever",
  "notes": "Patient has high fever",
  "followUpDate": "2025-10-10",
  "priority": "normal",
  "dispensedBy": {
    "id": "ObjectId",
    "name": "Pharmacist Name"
  },
  "dispensedAt": "2025-10-03T10:00:00.000Z"
}
```

## Frontend Implementation

### 1. **API Service: inventory.js**
Location: `client/src/api/inventory.js`

#### Prescription API Functions:
```javascript
// Get all prescriptions with filters
prescriptionsAPI.getPrescriptions(params)

// Get single prescription
prescriptionsAPI.getPrescription(id)

// Create new prescription
prescriptionsAPI.createPrescription(prescriptionData)

// Dispense prescription
prescriptionsAPI.dispensePrescription(id, medications)

// Update status
prescriptionsAPI.updatePrescriptionStatus(id, status)

// Delete/Cancel prescription
prescriptionsAPI.deletePrescription(id)
```

### 2. **Component: PrescriptionsManagement.jsx**
Location: `client/src/pages/inventory/PrescriptionsManagement.jsx`

#### Features Implemented:
✅ **Real-time Data Fetching**
- Fetches prescriptions from API on component mount
- Auto-refetch when filters change (search, status tabs)
- Loading states with CircularProgress
- Error handling with Alert messages

✅ **Search & Filtering**
- Search by: patient name, patient ID, prescription number, doctor name
- Filter by status: All, Pending, Completed
- Tab-based navigation

✅ **Statistics Display**
- Total Prescriptions count
- Pending Prescriptions count
- Completed Prescriptions count
- Real-time updates from API

✅ **Data Transformation**
The component transforms API data to UI format:
```javascript
{
  id: prescription.prescriptionNumber,      // Display ID
  _id: prescription._id,                    // MongoDB ID
  patientName: prescription.patient.name,
  patientId: prescription.patient.id,
  doctorName: prescription.doctor.name,
  date: "03/10/2025",                       // Formatted date
  time: "09:30 AM",
  status: "pending",
  medications: [...]
}
```

### 3. **Usage Example**

#### Fetching Prescriptions:
```javascript
const fetchPrescriptions = async () => {
  const params = {
    page: 1,
    limit: 1000,
    search: searchTerm,
    status: activeTab === 1 ? 'pending' : activeTab === 2 ? 'completed' : ''
  };

  const response = await inventoryAPI.prescriptions.getPrescriptions(params);
  
  if (response.success) {
    setPrescriptions(response.data.prescriptions);
    setTotalCount(response.data.total);
    setPendingCount(response.data.pending);
    setCompletedCount(response.data.completed);
  }
};
```

## Query Parameters

### GET /api/prescriptions
```
?page=1                          // Page number (default: 1)
&limit=10                        // Items per page (default: 10)
&status=pending                  // Filter by status (pending/completed/cancelled)
&search=Amal                     // Search term
&date=2025-10-03                 // Filter by date
```

## Error Handling

### Backend Errors:
```json
{
  "success": false,
  "message": "Error fetching prescriptions",
  "error": "Detailed error message"
}
```

### Frontend Error Display:
- Shows Alert component with error message
- User can dismiss the alert
- Loading state cleared on error

## Testing the Integration

### 1. **Ensure Server is Running**
```bash
cd server
npm start
```

### 2. **Ensure MongoDB is Connected**
Check server logs for: "Connected to MongoDB"

### 3. **Seed Sample Data** (Optional)
```bash
cd server
node seed-inventory.js
```
This creates 3 sample prescriptions.

### 4. **Test Frontend**
```bash
cd client
npm run dev
```

Navigate to: `http://localhost:5173/pharmacist/prescriptions`

### 5. **Expected Behavior**
- Page loads with loading spinner
- Fetches prescriptions from API
- Displays total, pending, and completed counts
- Shows prescription cards in list format
- Search filters prescriptions in real-time
- Tab filters work correctly
- Click on prescription opens details modal

## API Integration Checklist

✅ Backend endpoint created (`getPrescriptions`)
✅ Route configured (`GET /api/prescriptions`)
✅ Authentication middleware added
✅ Frontend API service configured
✅ Component connected to API
✅ Loading states implemented
✅ Error handling implemented
✅ Data transformation implemented
✅ Real-time search/filtering
✅ Statistics display from API

## Next Steps (Optional Enhancements)

- [ ] Add pagination controls (currently loads all prescriptions)
- [ ] Add date range filtering
- [ ] Add export to PDF/Excel functionality
- [ ] Add prescription dispensing inline (currently redirects to issues page)
- [ ] Add prescription editing functionality
- [ ] Add real-time notifications for new prescriptions
- [ ] Add prescription printing functionality

## Troubleshooting

### Issue: No prescriptions showing
**Solution:** 
1. Check if server is running
2. Check MongoDB connection
3. Run seed script to add sample data
4. Check browser console for API errors
5. Verify authentication token is valid

### Issue: Search not working
**Solution:**
1. Search is applied on backend
2. Check if search term is being sent in API call
3. Clear search and try filtering by status first

### Issue: Authorization errors
**Solution:**
1. Ensure user is logged in
2. Check user role (must be pharmacist, admin, doctor, or nurse)
3. Verify JWT token is not expired
4. Check browser localStorage for token

## Summary

The prescription management system is now fully integrated:
- **Backend**: Complete CRUD operations with validation and authentication
- **Frontend**: Real-time data fetching with search, filtering, and statistics
- **API**: RESTful endpoints with proper error handling
- **Security**: JWT authentication and role-based authorization

All prescriptions are fetched from the MongoDB database and displayed in the UI with full search and filtering capabilities.
