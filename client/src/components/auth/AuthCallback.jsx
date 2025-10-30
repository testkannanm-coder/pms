import { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Container, Box, Typography, CircularProgress } from "@mui/material";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const name = searchParams.get("name");
    const error = searchParams.get("error");

    if (error) {
      alert("Authentication failed. Please try again.");
      navigate("/login");
      return;
    }

    if (token && email) {
      login({ token, email, name });
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [navigate]); // ✅ FIXED

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Box textAlign="center">
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Signing you in...
        </Typography>
      </Box>
    </Container>
  );
}
