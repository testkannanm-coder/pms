import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  Alert,
} from "@mui/material";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showActivation] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="contained" color="error" onClick={handleLogout}>
            Logout
          </Button>

          <Button variant="contained" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Name
        </Typography>
        <Typography variant="h6">{user?.name || "N/A"}</Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Email
        </Typography>
        <Typography variant="h6">{user?.email || "N/A"}</Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Role
        </Typography>
        <Chip label={user?.role || "user"} color="primary" sx={{ mt: 1 }} />
      </Box>
    </Paper>
  );
}
