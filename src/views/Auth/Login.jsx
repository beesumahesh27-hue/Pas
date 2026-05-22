import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';

import { authStart, authSuccess, authFailure } from '../../store/slices/authSlice';
import { login as loginApi } from '../../services/authApi';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((s) => s.auth);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    dispatch(authStart());
    try {
      const data = await loginApi({ email, password });
      dispatch(authSuccess({ token: data.access_token, user: data.user }));
      navigate(redirectTo, { replace: true });
    } catch (err) {
      dispatch(authFailure(err.response?.data?.detail || err.message || 'Login failed'));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a1929 0%, #1e3a5f 100%)',
        px: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 2, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: '50%',
              bgcolor: '#0a1929', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CloudOutlinedIcon sx={{ color: '#42a5f5', fontSize: 30 }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 22, color: '#0a1929' }}>
              Place2place
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              Sign in to continue to your dashboard
            </Typography>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                autoFocus
                required
                size="small"
              />
              <TextField
                label="Password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPwd((v) => !v)} edge="end">
                        {showPwd ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{ textTransform: 'none', py: 1.1, fontWeight: 600, boxShadow: 'none' }}
              >
                {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Sign In'}
              </Button>
            </Stack>
          </Box>

          <Typography sx={{ mt: 3, fontSize: 13, color: 'text.secondary', textAlign: 'center' }}>
            Don&apos;t have an account?{' '}
            <Link component={RouterLink} to="/signup" underline="hover" sx={{ fontWeight: 600 }}>
              Sign Up
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
