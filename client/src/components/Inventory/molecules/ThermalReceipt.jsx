import React, { forwardRef } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { useAuth } from '../../../context/AuthContext';

/**
 * Thermal Receipt Component
 * Optimized for 80mm thermal printers (standard POS receipt printers)
 * Typical resolution: 576 pixels (72mm printable width)
 */
const ThermalReceipt = forwardRef(({ issueData, hospitalInfo = {
  name: 'Osethra Hospital',
  address: '123 Hospital Road, Colombo 07',
  phone: '+94 11 234 5678',
} }, ref) => {
  const { user } = useAuth();
  const currentDate = new Date();

  const calculateTotal = () => {
    return issueData.items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const formatCurrency = (amount) => {
    return `LKR ${amount.toFixed(2)}`;
  };

  return (
    <Box 
      ref={ref}
      sx={{ 
        width: '80mm', // Standard thermal printer width
        p: '4mm',
        bgcolor: 'white',
        fontFamily: '"Courier New", monospace',
        fontSize: '12px',
        lineHeight: 1.4,
        '@media print': {
          margin: 0,
          padding: '2mm',
        }
      }}
    >
      {/* Header */}
      <Box textAlign="center" mb={1}>
        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '16px', fontFamily: 'inherit' }}>
          {hospitalInfo.name.toUpperCase()}
        </Typography>
        <Typography sx={{ fontSize: '11px', fontFamily: 'inherit' }}>
          {hospitalInfo.address}
        </Typography>
        <Typography sx={{ fontSize: '11px', fontFamily: 'inherit' }}>
          Tel: {hospitalInfo.phone}
        </Typography>
      </Box>

      <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

      {/* Invoice Info */}
      <Box mb={1}>
        <Typography sx={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center', fontFamily: 'inherit' }}>
          PHARMACY RECEIPT
        </Typography>
        <Typography sx={{ fontSize: '11px', fontFamily: 'inherit' }}>
          Invoice #: {issueData.issueNumber || 'PENDING'}
        </Typography>
        <Typography sx={{ fontSize: '11px', fontFamily: 'inherit' }}>
          Date: {currentDate.toLocaleDateString('en-GB')} {currentDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </Typography>
        <Typography sx={{ fontSize: '11px', fontFamily: 'inherit' }}>
          Type: {issueData.issueType?.toUpperCase()}
        </Typography>
        <Typography sx={{ fontSize: '11px', fontFamily: 'inherit' }}>
          Patient: {issueData.patient?.name || issueData.department?.name || 'N/A'}
        </Typography>
        <Typography sx={{ fontSize: '11px', fontFamily: 'inherit' }}>
          ID: {issueData.patient?.id || issueData.department?.id || 'N/A'}
        </Typography>
        <Typography sx={{ fontSize: '11px', fontFamily: 'inherit' }}>
          Cashier: {user?.name || 'Pharmacist'}
        </Typography>
      </Box>

      <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

      {/* Items */}
      <Box mb={1}>
        {issueData.items.map((item, index) => (
          <Box key={index} mb={1}>
            <Typography sx={{ fontSize: '11px', fontWeight: 'bold', fontFamily: 'inherit' }}>
              {item.productName}
            </Typography>
            <Box display="flex" justifyContent="space-between">
              <Typography sx={{ fontSize: '11px', fontFamily: 'inherit' }}>
                {item.quantity} x {formatCurrency(item.unitPrice)}
              </Typography>
              <Typography sx={{ fontSize: '11px', fontWeight: 'bold', fontFamily: 'inherit' }}>
                {formatCurrency(item.totalPrice)}
              </Typography>
            </Box>
            {item.batchNumber && (
              <Typography sx={{ fontSize: '10px', color: '#666', fontFamily: 'inherit' }}>
                Batch: {item.batchNumber}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Total */}
      <Box mb={1}>
        <Box display="flex" justifyContent="space-between">
          <Typography sx={{ fontSize: '12px', fontFamily: 'inherit' }}>
            Total Items:
          </Typography>
          <Typography sx={{ fontSize: '12px', fontFamily: 'inherit' }}>
            {issueData.items.reduce((sum, item) => sum + item.quantity, 0)}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mt={0.5}>
          <Typography sx={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'inherit' }}>
            TOTAL:
          </Typography>
          <Typography sx={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'inherit' }}>
            {formatCurrency(calculateTotal())}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

      {/* Notes */}
      {issueData.notes && (
        <Box mb={1}>
          <Typography sx={{ fontSize: '10px', fontFamily: 'inherit' }}>
            Note: {issueData.notes}
          </Typography>
        </Box>
      )}

      {/* Footer */}
      <Box textAlign="center" mt={2}>
        <Typography sx={{ fontSize: '10px', fontFamily: 'inherit' }}>
          Thank you for your trust!
        </Typography>
        <Typography sx={{ fontSize: '10px', fontFamily: 'inherit' }}>
          Returns accepted within 7 days
        </Typography>
        <Typography sx={{ fontSize: '10px', mt: 1, fontFamily: 'inherit' }}>
          --------------------------------
        </Typography>
        <Typography sx={{ fontSize: '10px', fontFamily: 'inherit' }}>
          {currentDate.toLocaleString('en-GB')}
        </Typography>
      </Box>
    </Box>
  );
});

ThermalReceipt.displayName = 'ThermalReceipt';

export default ThermalReceipt;
