// ============================================
// Bill List Component
// Display all bills with payment status
// ============================================

import { useState, useEffect, useContext } from 'react';
import { getAllBills, updatePaymentStatus } from '../../api/billApi';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Box,
    Typography,
    Chip,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';

const BillList = () => {
    const { getToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Cash');

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            setLoading(true);
            setError('');
            const token = getToken();
            const response = await getAllBills(token);
            if (response.success) {
                setBills(response.data);
            }
        } catch (err) {
            setError('Failed to load bills');
            console.error('Error fetching bills:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentClick = (bill) => {
        setSelectedBill(bill);
        setPaymentDialogOpen(true);
    };

    const handlePaymentConfirm = async () => {
        try {
            const token = getToken();
            const response = await updatePaymentStatus(
                selectedBill.id,
                {
                    payment_status: 'paid',
                    payment_method: paymentMethod,
                },
                token
            );

            if (response.success) {
                setBills(bills.map((bill) => (bill.id === selectedBill.id ? response.data : bill)));
                setPaymentDialogOpen(false);
                setSelectedBill(null);
                setPaymentMethod('Cash');
            } else {
                setError(response.message || 'Failed to update payment status');
            }
        } catch (err) {
            setError('Failed to update payment status');
            console.error(err);
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'success';
            case 'pending':
                return 'warning';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    if (loading && bills.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Bills Management</Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Bills Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Bill Number</TableCell>
                            <TableCell>Patient</TableCell>
                            <TableCell>Appointment Date</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Payment Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bills.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No bills found
                                </TableCell>
                            </TableRow>
                        ) : (
                            bills.map((bill, index) => (
                                <TableRow key={bill.id} hover>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            {bill.bill_number}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{bill.patient_name}</Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {bill.patientid}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(bill.appointment_date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            ₹{parseFloat(bill.total_amount).toFixed(2)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={bill.payment_status.toUpperCase()}
                                            size="small"
                                            color={getPaymentStatusColor(bill.payment_status)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => navigate(`/bills/${bill.id}`)}
                                            sx={{ mr: 1 }}
                                        >
                                            View
                                        </Button>
                                        {bill.payment_status === 'pending' && (
                                            <Button
                                                variant="contained"
                                                color="success"
                                                size="small"
                                                onClick={() => handlePaymentClick(bill)}
                                            >
                                                Mark Paid
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Payment Dialog */}
            <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
                <DialogTitle>Mark Bill as Paid</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Bill Number: <strong>{selectedBill?.bill_number}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Amount: <strong>₹{selectedBill?.total_amount}</strong>
                    </Typography>
                    <TextField
                        fullWidth
                        label="Payment Method"
                        select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        sx={{ mt: 2 }}
                    >
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handlePaymentConfirm} color="success" variant="contained">
                        Confirm Payment
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default BillList;
