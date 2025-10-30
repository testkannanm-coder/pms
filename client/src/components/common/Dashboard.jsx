import { useContext } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { AuthContext } from "../../context/AuthContext";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 5, textAlign: "center" }}>
        <Typography variant="h3" gutterBottom>
          Welcome to PMS Dashboard
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mt: 2 }}>
          Hello, {user?.name || user?.email}!
        </Typography>
      </Paper>
    </Box>
  );
}
