import React, { useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ cursor: "pointer", fontWeight: 600 }}
          onClick={() => navigate("/dashboard")}
        >
          PMS
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button color="inherit" onClick={() => navigate("/dashboard")}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={() => navigate("/patients")}>
            Patients
          </Button>
          <Button color="inherit" onClick={() => navigate("/appointments")}>
            Appointments
          </Button>
          <Button color="inherit" onClick={() => navigate("/users")}>
            Users
          </Button>
          <Button color="inherit" onClick={() => navigate("/activity-logs")}>
            Activity Logs
          </Button>
          <Button color="inherit" onClick={() => navigate("/profile")}>
            Profile
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
