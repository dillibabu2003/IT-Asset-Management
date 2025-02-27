import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Switch,
    IconButton,
    Chip,
    TextField,
    InputAdornment,
    Button,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    FormControl,
    InputLabel,
    Select,
    FormControlLabel,
} from '@mui/material';
import { Search, MoreVertical, Edit2, Trash2, Filter, Upload } from 'lucide-react';

const mockUsers = [
    {
        id: '1',
        fullName: 'John Doe',
        email: 'john@example.com',
        gender: 'male',
        phoneNumber: '+1234567890',
        role: 'admin',
        status: true,
        department: 'IT',
        jobTitle: 'Senior Developer',
        location: 'New York',
        profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
        id: '2',
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        gender: 'female',
        phoneNumber: '+1234567891',
        role: 'member',
        status: true,
        department: 'HR',
        jobTitle: 'HR Manager',
        location: 'Los Angeles',
        profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
        id: '3',
        fullName: 'Mike Johnson',
        email: 'mike@example.com',
        gender: 'male',
        phoneNumber: '+1234567892',
        role: 'guest',
        status: false,
        department: 'Sales',
        jobTitle: 'Sales Representative',
        location: 'Chicago',
        profilePhoto: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
];

function ManageUsers() {
    const [users, setUsers] = useState(mockUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editedUser, setEditedUser] = useState(null);

    const handleStatusChange = (userId) => {
        setUsers(users.map(user => user.id === userId ? { ...user, status: !user.status } : user));
    };

    const handleMenuOpen = (event, user) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };

    const handleEditClick = () => {
        handleMenuClose();
        setEditedUser(selectedUser);
        setEditDialogOpen(true);
    };

    const handleDeleteClick = () => {
        handleMenuClose();
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedUser) {
            setUsers(users.filter(user => user.id !== selectedUser.id));
        }
        setDeleteDialogOpen(false);
        setSelectedUser(null);
    };

    const handleEditSave = () => {
        if (editedUser) {
            setUsers(users.map(user => user.id === editedUser.id ? editedUser : user));
            setEditDialogOpen(false);
            setEditedUser(null);
        }
    };

    const handleEditChange = (field, value) => {
        if (editedUser) {
            setEditedUser({
                ...editedUser,
                [field]: value,
            });
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return 'error';
            case 'member':
                return 'primary';
            default:
                return 'default';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Manage Users</Typography>
            <Paper sx={{ p: 3 }}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: 300 }}
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={20} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<Filter size={18} />}
                        sx={{ textTransform: 'none' }}
                    >
                        Filter
                    </Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Department</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar src={user.profilePhoto} alt={user.fullName} />
                                            <Typography>{user.fullName}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.department}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.role}
                                            size="small"
                                            color={getRoleColor(user.role)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={user.status}
                                            onChange={() => handleStatusChange(user.id)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, user)}
                                        >
                                            <MoreVertical size={18} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEditClick}>
                    <Edit2 size={18} style={{ marginRight: 8 }} />
                    Edit
                </MenuItem>
                <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                    <Trash2 size={18} style={{ marginRight: 8 }} />
                    Delete
                </MenuItem>
            </Menu>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this user? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    {editedUser && (
                        <Box sx={{ pt: 2 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Avatar
                                            src={editedUser.profilePhoto}
                                            sx={{ width: 100, height: 100, mb: 2, mx: 'auto' }}
                                        />
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            startIcon={<Upload size={18} />}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Change Photo
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = () => {
                                                            handleEditChange('profilePhoto', reader.result);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </Button>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Full Name"
                                        value={editedUser.fullName}
                                        onChange={(e) => handleEditChange('fullName', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        value={editedUser.email}
                                        onChange={(e) => handleEditChange('email', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Gender</InputLabel>
                                        <Select
                                            value={editedUser.gender}
                                            label="Gender"
                                            onChange={(e) => handleEditChange('gender', e.target.value)}
                                        >
                                            <MenuItem value="male">Male</MenuItem>
                                            <MenuItem value="female">Female</MenuItem>
                                            <MenuItem value="other">Other</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        value={editedUser.phoneNumber}
                                        onChange={(e) => handleEditChange('phoneNumber', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Role</InputLabel>
                                        <Select
                                            value={editedUser.role}
                                            label="Role"
                                            onChange={(e) => handleEditChange('role', e.target.value)}
                                        >
                                            <MenuItem value="guest">Guest</MenuItem>
                                            <MenuItem value="member">Member</MenuItem>
                                            <MenuItem value="admin">Admin</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Department"
                                        value={editedUser.department}
                                        onChange={(e) => handleEditChange('department', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Job Title"
                                        value={editedUser.jobTitle}
                                        onChange={(e) => handleEditChange('jobTitle', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Location"
                                        value={editedUser.location}
                                        onChange={(e) => handleEditChange('location', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={editedUser.status}
                                                onChange={(e) => handleEditChange('status', e.target.checked)}
                                            />
                                        }
                                        label="Active Status"
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleEditSave} variant="contained">Save Changes</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
export default ManageUsers;
