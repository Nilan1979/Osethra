// NurseDashboard.jsx
import React from 'react';
import Layout from '../Layout/Layout';
import NurseD from '../NurseComponent/NurseD'; // Import your NurseD component

const NurseDashboard = () => {

  return (
    <Layout showContactInfo={false}>
            <NurseD />
    </Layout>
  );
};

export default NurseDashboard;
