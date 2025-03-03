import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Avatar,
    Button,
    TextField,
    Divider,
    Tab,
    Tabs,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Switch,
    FormControlLabel,
    Chip,
    IconButton,
    Alert,
    Snackbar,
    CircularProgress,
} from '@mui/material';
import Icon from '../components/Icon';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            aria-labelledby={`profile-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

function UserProfile() {
    const [tabValue, setTabValue] = useState(0);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info',
    });

    // User data state
    const [userData, setUserData] = useState({
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: '+1 (555) 123-4567',
        jobTitle: 'Senior Developer',
        department: 'IT Department',
        location: 'New York, USA',
        bio: 'Experienced software developer with a passion for creating efficient and user-friendly applications.',
        profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        notifications: {
            email: true,
            push: true,
            sms: false,
            activitySummary: true,
            securityAlerts: true,
        },
        twoFactorEnabled: true,
    });

    // Activity history
    const activityHistory = [
        { id: 1, action: 'Logged in', device: 'MacBook Pro', location: 'New York, USA', time: '2 hours ago' },
        { id: 2, action: 'Updated profile', device: 'Chrome on Windows', location: 'New York, USA', time: 'Yesterday' },
        { id: 3, action: 'Changed password', device: 'iPhone 14', location: 'Boston, USA', time: '3 days ago' },
        { id: 4, action: 'Enabled two-factor authentication', device: 'Firefox on MacOS', location: 'New York, USA', time: '1 week ago' },
    ];

    // Asset history
    const assetHistory = [
        { id: 1, name: 'MacBook Pro M2', status: 'Currently assigned', assignedDate: 'Jan 15, 2025', returnDate: null },
        { id: 2, name: 'iPhone 14 Pro', status: 'Currently assigned', assignedDate: 'Jan 15, 2025', returnDate: null },
        { id: 3, name: 'Dell XPS 15', status: 'Returned', assignedDate: 'Jun 10, 2024', returnDate: 'Dec 15, 2024' },
        { id: 4, name: 'iPad Pro 12.9"', status: 'Returned', assignedDate: 'Mar 5, 2024', returnDate: 'Sep 20, 2024' },
    ];

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleInputChange = (field, value) => {
        setUserData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleNotificationChange = (field) => {
        setUserData(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [field]: !prev.notifications[field],
            },
        }));
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setNotification({
                open: true,
                message: 'Profile updated successfully!',
                severity: 'success',
            });
            setEditMode(false);
        } catch (error) {
            setNotification({
                open: true,
                message: 'Failed to update profile. Please try again.',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    const handleProfilePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                handleInputChange('profilePhoto', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>User Profile</Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3}>
                    {/* Profile Header */}
                    <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar
                            src={userData.profilePhoto}
                            sx={{ width: 150, height: 150, mb: 2 }}
                        />
                        {editMode && (
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<Icon name="upload" size={18} />}
                                sx={{ textTransform: 'none', mb: 2 }}
                            >
                                Change Photo
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleProfilePhotoChange}
                                />
                            </Button>
                        )}
                        <Typography variant="h6" gutterBottom>{userData.fullName}</Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>{userData.jobTitle}</Typography>
                        <Chip
                            label="Administrator"
                            color="error"
                            size="small"
                            sx={{ mb: 2 }}
                        />
                        {!editMode ? (
                            <Button
                                variant="outlined"
                                startIcon={<Icon name="edit-2" size={18} />}
                                onClick={() => setEditMode(true)}
                                sx={{ textTransform: 'none' }}
                            >
                                Edit Profile
                            </Button>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Icon name="x" size={18} />}
                                    onClick={() => setEditMode(false)}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Icon name="save" size={18} />}
                                    onClick={handleSaveProfile}
                                    disabled={loading}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Save
                                </Button>
                            </Box>
                        )}
                    </Grid>
                    <Grid item xs={12} md={9}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                                <Tab label="Personal Info" />
                                <Tab label="Account Settings" />
                                <Tab label="Activity" />
                                <Tab label="Assets" />
                            </Tabs>
                        </Box>

                        {/* Personal Info Tab */}
                        <TabPanel value={tabValue} index={0}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Full Name"
                                        value={userData.fullName}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        disabled={!editMode}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        value={userData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        disabled={!editMode}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        value={userData.phoneNumber}
                                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                        disabled={!editMode}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Job Title"
                                        value={userData.jobTitle}
                                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                                        disabled={!editMode}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Department"
                                        value={userData.department}
                                        onChange={(e) => handleInputChange('department', e.target.value)}
                                        disabled={!editMode}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Location"
                                        value={userData.location}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        disabled={!editMode}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Bio"
                                        multiline
                                        rows={4}
                                        value={userData.bio}
                                        onChange={(e) => handleInputChange('bio', e.target.value)}
                                        disabled={!editMode}
                                        margin="normal"
                                    />
                                </Grid>
                            </Grid>
                        </TabPanel>

                        {/* Account Settings Tab */}
                        <TabPanel value={tabValue} index={1}>
                            <Typography variant="h6" gutterBottom>Notifications</Typography>
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <Icon name="mail" size={20} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Email Notifications"
                                        secondary="Receive notifications via email"
                                    />
                                    <Switch
                                        edge="end"
                                        checked={userData.notifications.email}
                                        onChange={() => handleNotificationChange('email')}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <Icon name="bell" size={20} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Push Notifications"
                                        secondary="Receive notifications in browser"
                                    />
                                    <Switch
                                        edge="end"
                                        checked={userData.notifications.push}
                                        onChange={() => handleNotificationChange('push')}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <Icon name="phone" size={20} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="SMS Notifications"
                                        secondary="Receive text messages for important alerts"
                                    />
                                    <Switch
                                        edge="end"
                                        checked={userData.notifications.sms}
                                        onChange={() => handleNotificationChange('sms')}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <Icon name="calendar" size={20} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Weekly Activity Summary"
                                        secondary="Receive a summary of your weekly activity"
                                    />
                                    <Switch
                                        edge="end"
                                        checked={userData.notifications.activitySummary}
                                        onChange={() => handleNotificationChange('activitySummary')}
                                    />
                                </ListItem>
                            </List>

                            <Divider sx={{ my: 3 }} />
                            <Typography variant="h6" gutterBottom>Security</Typography>
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <Icon name="shield" size={20} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Two-Factor Authentication"
                                        secondary="Add an extra layer of security to your account"
                                    />
                                    <Switch
                                        edge="end"
                                        checked={userData.twoFactorEnabled}
                                        onChange={() => handleInputChange('twoFactorEnabled', !userData.twoFactorEnabled)}
                                    />
                                </ListItem>
                                <ListItem button>
                                    <ListItemIcon>
                                        <Icon name="key" size={20} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Change Password"
                                        secondary="Update your password regularly for better security"
                                    />
                                </ListItem>
                                <ListItem button sx={{ color: 'error.main' }}>
                                    <ListItemIcon>
                                        <Icon name="log-out" size={20} color="#d32f2f" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Sign Out from All Devices"
                                        secondary="Log out from all sessions except this one"
                                    />
                                </ListItem>
                            </List>
                        </TabPanel>

                        {/* Activity Tab */}
                        <TabPanel value={tabValue} index={2}>
                            <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                            <List>
                                {activityHistory.map((activity) => (
                                    <ListItem key={activity.id} divider>
                                        <ListItemIcon>
                                            <Icon name="clock" size={20} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={activity.action}
                                            secondary={
                                                <React.Fragment>
                                                    <Typography component="span" variant="body2" color="text.primary">
                                                        {activity.device}
                                                    </Typography>
                                                    {` — ${activity.location} • ${activity.time}`}
                                                </React.Fragment>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                <Button variant="text" sx={{ textTransform: 'none' }}>
                                    View All Activity
                                </Button>
                            </Box>
                        </TabPanel>

                        {/* Assets Tab */}
                        <TabPanel value={tabValue} index={3}>
                            <Typography variant="h6" gutterBottom>Assigned Assets</Typography>
                            <Grid container spacing={2}>
                                {assetHistory.map((asset) => (
                                    <Grid item xs={12} key={asset.id}>
                                        <Paper
                                            sx={{
                                                p: 2,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                bgcolor: asset.status === 'Currently assigned' ? 'primary.light' : 'background.paper',
                                                color: asset.status === 'Currently assigned' ? 'white' : 'inherit',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Icon name="monitor" size={24} />
                                                <Box>
                                                    <Typography variant="subtitle1">{asset.name}</Typography>
                                                    <Typography variant="body2">
                                                        {asset.status === 'Currently assigned'
                                                            ? `Assigned on ${asset.assignedDate}`
                                                            : `${asset.assignedDate} - ${asset.returnDate}`}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Chip
                                                label={asset.status}
                                                color={asset.status === 'Currently assigned' ? 'warning' : 'default'}
                                                sx={{
                                                    bgcolor: asset.status === 'Currently assigned' ? 'white' : undefined,
                                                    color: asset.status === 'Currently assigned' ? 'warning.main' : undefined,
                                                }}
                                            />
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </TabPanel>
                    </Grid>
                </Grid>
            </Paper>
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default UserProfile;
