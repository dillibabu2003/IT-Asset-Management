import React, { useLayoutEffect, useState } from 'react';
import {
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
    IconButton,
} from '@mui/material';
import { useNavigate, Link } from 'react-router';
import Icon from '../components/Icon';
import { useAuth } from '../providers/AuthProvider';
import { toast } from 'react-hot-toast';
import axiosInstance from '../utils/axios';

function SignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false);
    const navigate = useNavigate();
    const { user, login } = useAuth();

    useLayoutEffect(() => {
        if (user) {
            navigate('/assets', { replace: true });
        }
    }, [user]);

    const onBack = () => {
        navigate('/');
    };

    const sendPasswordResetLink = async (email) => {
        try {
            const response = await axiosInstance.post(
                "/auth/forgot-password",
                 {
                    email
                 }
            );
            if(response.data.success){
                toast.success(response.data.message);
            }else{
                console.log("here is the error")
                toast.error(response.data.message)
            }
            return {success: response.data.success, message: response.data.message};
        } catch (error) {
            return { success: false, message: error?.response?.data?.message || 'Failed to send reset link'  };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        if (forgotPassword) {
            const response = await sendPasswordResetLink(formData.get("email"));
            if (response.success) {
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } else {
            const response = await login(formData.get("email"), formData.get("password"));
            if (response.success) {
                toast.success(response.message);
                navigate('/assets', { replace: true });
            } else {
                toast.error(response.errors.error);
            }
        }
    };

    return (
        <Container maxWidth={false} disableGutters sx={{ height: '100vh', overflow: 'hidden' }}>
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)',
                    opacity: 0.1,
                    zIndex: -1,
                }}
            />
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                }}
            >
                <Button
                    startIcon={<Icon name="arrow-left" size={18} />}
                    onClick={onBack}
                    sx={{ position: 'absolute', top: 24, left: 24 }}
                >
                    Back to Home
                </Button>

                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        width: '100%',
                        maxWidth: 440,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography variant="h4" fontWeight="700" gutterBottom>
                            Welcome Back
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Sign in to continue to AssetManager
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <TextField
                            label="Email Address"
                            name="email"
                            type="email"
                            required
                            fullWidth
                        />
                        {!forgotPassword && (
                            <TextField
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                required
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            size="small"
                                        >
                                            {showPassword ? <Icon name="eye-off" size={18} /> : <Icon name="eye" size={18} />}
                                        </IconButton>
                                    ),
                                }}
                            />
                        )}

                        {!forgotPassword && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Link to="#" onClick={() => setForgotPassword(true)} style={{ color: "#1976d2" }}>
                                    Forgot password?
                                </Link>
                            </Box>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            sx={{
                                py: 1.5,
                                textTransform: 'none',
                                fontSize: '1rem',
                            }}
                        >
                            {forgotPassword ? 'Send Reset Link' : 'Sign In'}
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
}

export default SignIn;
