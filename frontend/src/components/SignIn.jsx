import React, { useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    Container,
    FormControlLabel,
    Link,
    Paper,
    TextField,
    Typography,
    IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router';
import Icon from './Icon';
function SignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const navigate=useNavigate();
    const onBack=()=>{
        navigate('/');
    }

    const handleSubmit = (e) => {
        e.preventDefault();
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
                        <Typography variant="body1" color="text.secondary"></Typography>
                            Sign in to continue to AssetManager
                
                    </Box>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <TextField
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Remember me"
                            />
                            <Link to='/' underline="hover" sx={{ typography: 'body2' }}>
                                Forgot password?
                            </Link>
                        </Box>

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
                            Sign In
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>

    );
}

export default SignIn;
