import React from 'react';
import {
    Box,
    Button,
    Container,
    Grid,
    Typography,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { Link } from 'react-router';
import Icon from './Icon';

function FeatureCard({ icon, title, description }) {
    return (
        <Box
            sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 2,
                borderRadius: 2,
                bgcolor: 'background.paper',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[4],
                },
            }}
        >
            <Box
                sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: (theme) => theme.palette.primary.main + '10',
                    color: 'primary.main',
                }}
            >
                {icon}
            </Box>
            <Typography variant="h6" fontWeight="600">
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {description}
            </Typography>
        </Box>
    );
}

function LandingPage({ onGetStarted }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const features = [
        {
            icon: <Icon name="bar-chart-3" size={24} />,
            title: 'Real-time Analytics',
            description: 'Get instant insights into your asset utilization and performance metrics.',
        },
        {
            icon: <Icon name="shield" size={24} />,
            title: 'Secure Management',
            description: 'Enterprise-grade security to protect your valuable asset information.',
        },
        {
            icon: <Icon name="zap" size={24} />,
            title: 'Quick Actions',
            description: 'Streamlined workflows for efficient asset tracking and management.',
        },
        {
            icon: <Icon name="box" size={24} />,
            title: 'Asset Tracking',
            description: 'Keep track of all your assets with detailed history and status updates.',
        },
        {
            icon: <Icon name="key" size={24} />,
            title: 'License Management',
            description: 'Manage software licenses and compliance in one central location.',
        },
        {
            icon: <Icon name="clipboard-list" size={24} />,
            title: 'Maintenance Logs',
            description: 'Comprehensive maintenance tracking and scheduling system.',
        },
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Hero Section */}
            <Box
                sx={{
                    pt: { xs: 8, md: 12 },
                    pb: { xs: 8, md: 12 },
                    background: 'linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)',
                    color: 'white',
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    fontWeight: 800,
                                    mb: 2,
                                    background: 'linear-gradient(45deg, #fff 30%, #f0f0f0 90%)',
                                    backgroundClip: 'text',
                                    textFillColor: 'transparent',
                                }}
                            >
                                Manage Assets with Confidence
                            </Typography>
                            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                                Streamline your asset management workflow with our powerful and intuitive platform.
                            </Typography>
                            <Link to="/login">
                            <Button
                                variant="contained"
                                size="large"
                                onClick={onGetStarted}
                                sx={{
                                    bgcolor: 'white',
                                    color: 'primary.main',
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    textTransform: 'none',
                                    '&:hover': {
                                        bgcolor: 'grey.100',
                                    },
                                }}
                               
                                
                            >
                                Get Started
                            </Button>
                            </Link>
                        </Grid>
                        {!isMobile && (
                            <Grid item md={6}>
                                <Box
                                    component="img"
                                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
                                    alt="Asset Management"
                                    sx={{
                                        width: '100%',
                                        borderRadius: 4,
                                        boxShadow: (theme) => theme.shadows[20],
                                    }}
                                />
                            </Grid>
                        )}
                    </Grid>
                </Container>
            </Box>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
                <Typography
                    variant="h2"
                    align="center"
                    sx={{ mb: 2, fontSize: { xs: '2rem', md: '2.5rem' } }}
                >
                    Powerful Features
                </Typography>
                <Typography
                    variant="h5"
                    align="center"
                    color="text.secondary"
                    sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}
                >
                    Everything you need to manage your assets effectively in one place
                </Typography>
                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <FeatureCard {...feature} />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}

export default LandingPage;
