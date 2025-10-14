import React, { forwardRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Divider,
  Grid,
  Paper,
} from '@mui/material';
import { useAuth } from '../../../context/AuthContext';

const InvoiceBill = forwardRef(({ issueData, hospitalInfo = {
  name: 'Osethra Hospital',
  address: '123 Hospital Road, Colombo 07',
  phone: '+94 11 234 5678',
  email: 'pharmacy@osethra.lk',
  website: 'www.osethra.lk'
} }, ref) => {
  const { user } = useAuth();
  const currentDate = new Date();

  const calculateSubtotal = () => {
    return issueData.items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateTax = () => {
    return 0; // No tax for now, can be configured
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const formatCurrency = (amount) => {
    return `LKR ${amount.toFixed(2)}`;
  };

  return (
    <Box 
      ref={ref}
      sx={{ 
        p: 4, 
        bgcolor: 'white',
        minHeight: '297mm', // A4 height
        width: '210mm', // A4 width
        margin: '0 auto',
        fontFamily: 'monospace',
        '@media print': {
          p: 3,
          boxShadow: 'none',
          margin: 0,
        }
      }}
    >
      {/* Header */}
      <Box textAlign="center" mb={3}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#2e7d32', mb: 1 }}>
          {hospitalInfo.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {hospitalInfo.address}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Phone: {hospitalInfo.phone} | Email: {hospitalInfo.email}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {hospitalInfo.website}
        </Typography>
      </Box>

      <Divider sx={{ my: 2, borderWidth: 2, borderColor: '#2e7d32' }} />

      {/* Invoice Title */}
      <Box textAlign="center" my={3}>
        <Typography variant="h5" fontWeight="bold">
          PHARMACY INVOICE
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          PRODUCT ISSUE
        </Typography>
      </Box>

      {/* Invoice Details */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6}>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">BILL TO:</Typography>
            {issueData.patient ? (
              <>
                <Typography variant="body2">
                  {issueData.patient.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Contact: {issueData.patient.contactNumber}
                </Typography>
              </>
            ) : (
              <Typography variant="body2">
                General Issue
              </Typography>
            )}
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box textAlign="right">
            <Typography variant="body2">
              <strong>Invoice #:</strong> {issueData.issueNumber || 'PENDING'}
            </Typography>
            <Typography variant="body2">
              <strong>Date:</strong> {currentDate.toLocaleDateString('en-GB')}
            </Typography>
            <Typography variant="body2">
              <strong>Time:</strong> {currentDate.toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Typography>
            <Typography variant="body2">
              <strong>Issued By:</strong> {user?.name || 'Pharmacist'}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Items Table */}
      <Table size="small" sx={{ mb: 3 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 'bold', width: '5%' }}>#</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>PRODUCT NAME</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>BATCH</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '10%' }} align="center">QTY</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '15%' }} align="right">UNIT PRICE</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '15%' }} align="right">TOTAL</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {issueData.items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="500">
                  {item.productName}
                </Typography>
                {item.expiryDate && (
                  <Typography variant="caption" color="text.secondary">
                    Exp: {new Date(item.expiryDate).toLocaleDateString('en-GB')}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {item.batchNumber || 'N/A'}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2" fontWeight="500">
                  {item.quantity}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {formatCurrency(item.unitPrice)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight="500">
                  {formatCurrency(item.totalPrice)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Divider sx={{ my: 2 }} />

      {/* Summary */}
      <Box sx={{ ml: 'auto', width: '300px' }}>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2">Subtotal:</Typography>
          <Typography variant="body2" fontWeight="500">
            {formatCurrency(calculateSubtotal())}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2">Tax (0%):</Typography>
          <Typography variant="body2" fontWeight="500">
            {formatCurrency(calculateTax())}
          </Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">TOTAL:</Typography>
          <Typography variant="h6" fontWeight="bold" color="primary">
            {formatCurrency(calculateTotal())}
          </Typography>
        </Box>
      </Box>

      {/* Notes */}
      {issueData.notes && (
        <Box mt={3}>
          <Typography variant="subtitle2" fontWeight="bold">Notes:</Typography>
          <Typography variant="body2" color="text.secondary">
            {issueData.notes}
          </Typography>
        </Box>
      )}

      {/* Footer */}
      <Box mt={6} pt={3} borderTop="1px dashed #ccc">
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Payment Terms: Cash/Credit
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                All sales are final. Returns accepted within 7 days with receipt.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box textAlign="right">
              <Box mt={4} pt={1} borderTop="1px solid #000" display="inline-block" px={2}>
                <Typography variant="caption">Authorized Signature</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box textAlign="center" mt={3}>
          <Typography variant="caption" color="text.secondary">
            Thank you for your trust in {hospitalInfo.name}
          </Typography>
          <br />
          <Typography variant="caption" color="text.secondary">
            This is a computer-generated invoice and does not require a physical signature.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
});

InvoiceBill.displayName = 'InvoiceBill';

export default InvoiceBill;
