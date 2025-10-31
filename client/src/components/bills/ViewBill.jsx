import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBillById, updatePaymentStatus } from '../../api/billApi';
import { AuthContext } from '../../context/AuthContext';
import {
    Paper,
    Box,
    Typography,
    Button,
    Grid,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    Divider,
} from '@mui/material';

const ViewBill = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getToken } = useContext(AuthContext);
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Cash');

    useEffect(() => {
        fetchBill();
    }, [id]);

    const fetchBill = async () => {
        try {
            setLoading(true);
            setError('');
            const token = getToken();
            const response = await getBillById(id, token);
            if (response.success) {
                setBill(response.data);
            }
        } catch (err) {
            setError('Failed to load bill');
            console.error('Error fetching bill:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentConfirm = async () => {
        try {
            const token = getToken();
            const response = await updatePaymentStatus(
                id,
                {
                    payment_status: 'paid',
                    payment_method: paymentMethod,
                },
                token
            );

            if (response.success) {
                setBill(response.data);
                setPaymentDialogOpen(false);
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

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !bill) {
        return (
            <Paper sx={{ p: 3 }}>
                <Alert severity="error">{error || 'Bill not found'}</Alert>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/bills')}>
                    Back to Bills
                </Button>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Bill Details</Typography>
                <Box>
                    {bill.payment_status === 'pending' && (
                        <Button
                            variant="contained"
                            color="success"
                            sx={{ mr: 1 }}
                            onClick={() => setPaymentDialogOpen(true)}
                        >
                            Mark as Paid
                        </Button>
                    )}
                    <Button variant="outlined" onClick={() => navigate('/bills')}>
                        Back
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Bill Information in Two Columns */}
            <Grid container spacing={20}>
                <Grid item xs={12} sm={6}>
                    <InfoItem label="Bill Number" value={bill.bill_number} />
                    <InfoItem label="Bill Date" value={new Date(bill.created_at).toLocaleDateString()} />
                    <InfoItem label="Patient Name" value={bill.patient_name} />
                    <InfoItem label="Patient ID" value={bill.patientid} />
                    <InfoItem label="Phone" value={bill.patient_phone || "N/A"} />
                    <InfoItem label="Email" value={bill.patient_email || "N/A"} />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <InfoItem label="Appointment Date" value={new Date(bill.appointment_date).toLocaleDateString()} />
                    <InfoItem label="Appointment Time" value={bill.appointment_time} />
                    <InfoItem label="Doctor" value={bill.doctor_name || "N/A"} />
                    <InfoItem label="Appointment Status" value={bill.appointment_status} />
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Payment Status
                        </Typography>
                        <Chip
                            label={bill.payment_status.toUpperCase()}
                            color={getPaymentStatusColor(bill.payment_status)}
                            size="small"
                            sx={{ mt: 0.5 }}
                        />
                    </Box>
                    {bill.payment_method && (
                        <InfoItem label="Payment Method" value={bill.payment_method} />
                    )}
                </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Charges Section */}
            <Typography variant="h6" sx={{ mb: 3 }}>
                Charges Breakdown
            </Typography>

            <Grid container spacing={20}>
                <Grid item xs={12} sm={6}>
                    <InfoItem label="Consultation Fee" value={`₹${parseFloat(bill.consultation_fee).toFixed(2)}`} />
                    {parseFloat(bill.additional_charges) > 0 && (
                        <InfoItem label="Additional Charges" value={`₹${parseFloat(bill.additional_charges).toFixed(2)}`} />
                    )}
                    {parseFloat(bill.discount) > 0 && (
                        <InfoItem label="Discount" value={`-₹${parseFloat(bill.discount).toFixed(2)}`} />
                    )}
                </Grid>

                <Grid item xs={12} sm={6}>
                    {/* Empty space for alignment */}
                </Grid>
            </Grid>
            {/* Payment Dialog */}
            <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
                <DialogTitle>Mark Bill as Paid</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Bill Number: <strong>{bill.bill_number}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Amount: <strong>₹{bill.total_amount}</strong>
                    </Typography>
                    <TextField
                        fullWidth
                        label="Payment Method"
                        select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        sx={{ mt: 2 }}
                        SelectProps={{
                            native: true,
                        }}
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

// Helper component for displaying info items
const InfoItem = ({ label, value }) => (
    <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
            {label}
        </Typography>
        <Typography variant="body1">{value || 'N/A'}</Typography>
    </Box>
);

export default ViewBill;
