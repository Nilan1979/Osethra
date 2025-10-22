import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Inventory as InventoryIcon,
  EventAvailable as ExpiryIcon,
  LocalShipping as IssuesIcon,
  AttachMoney as SalesIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import StockStatusReport from './reports/StockStatusReport';
import BatchExpiryReport from './reports/BatchExpiryReport';
import IssuesReport from './reports/IssuesReport';
import SalesRevenueReport from './reports/SalesRevenueReport';

const Reports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const reportTypes = [
    {
      id: 'stock-status',
      title: 'Stock Status Report',
      description: 'Current inventory levels and stock alerts',
      icon: <InventoryIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      component: StockStatusReport,
      color: '#1976d2'
    },
    {
      id: 'batch-expiry',
      title: 'Batch & Expiry Report',
      description: 'Track batches and expiring medications',
      icon: <ExpiryIcon sx={{ fontSize: 40, color: '#f57c00' }} />,
      component: BatchExpiryReport,
      color: '#f57c00'
    },
    {
      id: 'issues',
      title: 'Issues/Dispensing Report',
      description: 'Medication dispensing transactions',
      icon: <IssuesIcon sx={{ fontSize: 40, color: '#388e3c' }} />,
      component: IssuesReport,
      color: '#388e3c'
    },
    {
      id: 'sales-revenue',
      title: 'Sales & Revenue Report',
      description: 'Financial performance and revenue analysis',
      icon: <SalesIcon sx={{ fontSize: 40, color: '#d32f2f' }} />,
      component: SalesRevenueReport,
      color: '#d32f2f'
    }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const ActiveReportComponent = reportTypes[activeTab].component;

  return (
    <Layout showContactInfo={false}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box mb={3}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <IconButton
              onClick={() => navigate('/pharmacist/dashboard')}
              sx={{
                bgcolor: 'white',
                border: '1px solid #e0e0e0',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary">
                📊 Reports & Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generate comprehensive inventory and financial reports
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            {reportTypes.map((report) => (
              <Tab
                key={report.id}
                label={report.title}
                icon={report.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>

        {/* Active Report Component */}
        <Box>
          <ActiveReportComponent />
        </Box>
      </Container>
    </Layout>
  );
};

export default Reports;
