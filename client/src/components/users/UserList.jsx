import { useEffect, useState, useContext } from "react";
import { getUsers, deleteUser } from "../../api/userApi";
import { AuthContext } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
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
    TextField,
    MenuItem,
    Chip,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";

export default function UserList() {
    const { getToken } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");
            const token = getToken();
            const data = await getUsers(token, { role: roleFilter });
            setUsers(data || []);
        } catch (err) {
            setError("Failed to load users");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const token = getToken();
            const result = await deleteUser(selectedUser.id, token);
            if (result.success) {
                setSuccess("User deleted successfully");
                fetchUsers();
                setDeleteDialogOpen(false);
                setSelectedUser(null);
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError(result.message || "Failed to delete user");
            }
        } catch (err) {
            setError("Failed to delete user");
            console.error(err);
        }
    };

    const getRoleColor = (role) => {
        const colors = {
            admin: "error",
            doctor: "primary",
            nurse: "success",
            staff: "default",
        };
        return colors[role] || "default";
    };

    if (loading && users.length === 0) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h5">Users Management</Typography>
                <Button variant="contained" component={Link} to="/users/add">
                    Add User
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
                    {success}
                </Alert>
            )}

            {/* Filters */}
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <TextField
                    select
                    label="Role"
                    size="small"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="">All Roles</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="doctor">Doctor</MenuItem>
                    <MenuItem value="nurse">Nurse</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                </TextField>
            </Box>

            <TableContainer component={Paper} variant="outlined">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Provider</TableCell>
                            <TableCell>Joined</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user, index) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Chip label={user.role} size="small" color={getRoleColor(user.role)} />
                                    </TableCell>
                                    <TableCell>{user.provider || "local"}</TableCell>
                                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Button
                                            component={Link}
                                            to={`/users/${user.id}/edit`}
                                            variant="outlined"
                                            size="small"
                                            sx={{ mr: 1 }}
                                        >
                                            Edit
                                        </Button>
                                        <Button onClick={() => handleDeleteClick(user)} variant="outlined" color="error" size="small">
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete user <strong>{selectedUser?.name}</strong>? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
