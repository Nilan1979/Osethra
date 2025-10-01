import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import UserDashboard from '../components/Dashboard/UserDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <>
      {user?.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
    </>
  );
};

export default Dashboard;
