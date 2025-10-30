import { useState, useEffect, useContext } from "react";
import { getActivityLogs } from "../../api/activityLogApi";
import { AuthContext } from "../../context/AuthContext";
import {
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    TextField,
    MenuItem,
    Stack,
    Chip,
    TablePagination,
    Button,
} from "@mui/material";
import {
    History as HistoryIcon,
    Refresh as RefreshIcon,
} from "@mui/icons-material";

export default function ActivityLogsList() {
    const { getToken, user } = useContext(AuthContext);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    const [filters, setFilters] = useState({
        action: "",
        entity_type: "",
        startDate: "",
        endDate: "",
    });

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchLogs();
    }, [filters]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError("");
            const token = getToken();
            const data = await getActivityLogs(token, filters);
            setLogs(data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load activity logs");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
        setPage(0); // Reset to first page when filtering
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRefresh = () => {
        fetchLogs();
    };

    const handleClearFilters = () => {
        setFilters({
            action: "",
            entity_type: "",
            startDate: "",
            endDate: "",
        });
    };

    const getActionColor = (action) => {
        switch (action.toLowerCase()) {
            case "create":
                return "success";
            case "update":
                return "info";
            case "delete":
                return "error";
            case "login":
                return "primary";
            case "logout":
                return "default";
            default:
                return "default";
        }
    };

    const getEntityTypeColor = (entityType) => {
        switch (entityType.toLowerCase()) {
            case "patient":
                return "primary";
            case "appointment":
                return "secondary";
            case "medical_record":
                return "success";
            case "user":
                return "warning";
            default:
                return "default";
        }
    };

    // Paginate logs
    const paginatedLogs = logs.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Paper sx={{ p: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <HistoryIcon fontSize="large" color="primary" />
                    <Box>
                        <Typography variant="h4">Activity Logs</Typography>
                        {isAdmin ? (
                            <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                                Viewing all system activities (Admin view)
                            </Typography>
                        ) : (
                            <Typography variant="caption" color="textSecondary">
                                Viewing your activities only
                            </Typography>
                        )}
                    </Box>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {/* Filters */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Filters
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                        select
                        label="Type"
                        name="entity_type"
                        value={filters.entity_type}
                        onChange={handleFilterChange}
                        size="small"
                        sx={{ minWidth: 180 }}
                    >
                        <MenuItem value="">All Entities</MenuItem>
                        <MenuItem value="patient">Patient</MenuItem>
                        <MenuItem value="appointment">Appointment</MenuItem>
                        <MenuItem value="medical_record">Medical Record</MenuItem>
                        <MenuItem value="user">User</MenuItem>
                    </TextField>

                    <Button
                        variant="outlined"
                        onClick={handleClearFilters}
                        size="small"
                    >
                        Clear Filters
                    </Button>
                </Stack>
            </Paper>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : logs.length === 0 ? (
                <Alert severity="info">No activity logs found</Alert>
            ) : (
                <>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>S.No</strong></TableCell>
                                    <TableCell><strong>Date & Time</strong></TableCell>
                                    <TableCell><strong>User</strong></TableCell>
                                    <TableCell><strong>Action</strong></TableCell>
                                    <TableCell><strong>Type</strong></TableCell>
                                    <TableCell><strong>Description</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedLogs.map((log, index) => (
                                    <TableRow key={log.id} hover>

                                        <TableCell>
                                            {index+1}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(log.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {log.user_name || "System"}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {log.user_email || ""}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={log.action.toUpperCase()}
                                                color={getActionColor(log.action)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={log.entity_type}
                                                color={getEntityTypeColor(log.entity_type)}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ maxWidth: 300 }}>
                                                {log.description || "-"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={logs.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[10, 25, 50, 100]}
                    />
                </>
            )}
        </Paper>
    );
}
