import React, { useEffect, useState } from 'react';
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
import Icon from './Icon';
import axiosInstance from '../utils/axios';
import toast from 'react-hot-toast';

function ManageUsers({ behavior, ...props }) {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editedUser, setEditedUser] = useState(null)
    const [updateTable,setUpdateTable]=useState(false);

    const fetchUserData = async () => {
        const response = await axiosInstance.get('/user/all');
        return response.data;
    };

    useEffect(() => {
        fetchUserData().then((response) => {
            setUsers(response.data);
            console.log("This is Data: ", response.data);
        });
    }, [updateTable]);

    const fetchUserMatched = async () => {
        console.log(searchTerm)
        const response = await axiosInstance.get(`/user/search/${searchTerm}`);
        return response.data;       
    };
    useEffect(()=>{     
       fetchUserMatched().then((response)=>{
        setUsers(response.data);
       });
       if(searchTerm===""){
              fetchUserData().then((response) => {
                setUsers(response.data);
            });
       }
    },[searchTerm]);

    const handleStatusChange = (userId) => {
        setUsers(users.map(user => user.id === userId ? { ...user, status: !user.status } : user));
    };

    const handleMenuOpen = (event, user) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        // setSelectedUser(null);
    };

    const handleEditClick = () => {
        handleMenuClose();
        setEditedUser(selectedUser);
        setEditDialogOpen(true);
    };

    const handleDeleteClick = () => {
        // console.log(selectedUser);
        
        handleMenuClose();
        setDeleteDialogOpen(true);user_id
    };

    const handleDeleteConfirm = async() => {
        if (selectedUser) {
            console.log(selectedUser)
           const response = await axiosInstance.delete(`/user/delete`, { data: { user_id: selectedUser.user_id } });
           if(response.data.success){
            toast.success(response.data.message);
           }
            setUpdateTable(!updateTable);
        }
        setDeleteDialogOpen(false);
        setSelectedUser(null);
    };

      
    const handleEditSave = async(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const jsonData = {};
        formData.forEach((value, key) => {
            jsonData[key] = value;
        });
        const updatedUser =await axiosInstance.put('/user/update',jsonData);
        if (editedUser) {
            console.log(editedUser)
            setEditDialogOpen(false);
            setEditedUser(null);
        }
        setUpdateTable(!updateTable);
    };

    const handleEditChange = (field, value) => {
        setEditedUser(prevState => ({
            ...prevState,
            [field]: value
        }));
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
            <Typography variant="h5" gutterBottom>{behavior === "edit" ? "Manage" : "View"} Users</Typography>
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
                                    <Icon name="search" size={20} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    {/* <Button
                        variant="outlined"
                        startIcon={<Icon name="filter" size={18} />}
                        sx={{ textTransform: 'none' }}
                    >
                        Filter
                    </Button> */}
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>User Id</TableCell>
                                <TableCell>Role</TableCell>
                                {behavior === "edit" && <TableCell>Status</TableCell>}
                                {behavior === "edit" && <TableCell align="right">Actions</TableCell>}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar src={user.profilePhoto} alt={user.fullname} />
                                            <Typography>{user.fullname}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.user_id}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.role}
                                            size="small"
                                            color={getRoleColor(user.role)}
                                        />
                                    </TableCell>
                                    {behavior === "edit" &&
                                        <TableCell>
                                            <Switch
                                                checked={user.status}
                                                onChange={() => handleStatusChange(user.id)}
                                                size="small"
                                            />
                                        </TableCell>
                                    }
                                    {behavior === "edit" &&
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleMenuOpen(e, user)}
                                            >
                                                <Icon name="more-vertical" size={18} />
                                            </IconButton>
                                        </TableCell>
                                    }
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {behavior === "edit" &&
                <>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={handleEditClick}>
                            <Icon name="pencil" size={18} style={{ marginRight: 8 }} />
                            Edit
                        </MenuItem>
                        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                            <Icon name="trash-2" size={18} style={{ marginRight: 8 }} />
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
                                <Box sx={{ pt: 2 }} component="form" encType='multipart/form-data' onSubmit={(e)=>handleEditSave(e)}>
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
                                                    startIcon={<Icon name="upload" size={18} />}
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
                                                label="First Name"
                                                name="firstname"
                                                value={editedUser.firstname}
                                                onChange={(e) => handleEditChange('firstname', e.target.value)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Last Name"
                                                name="lastname"
                                                value={editedUser.lastname}
                                                onChange={(e) => handleEditChange('lastname', e.target.value)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="User ID"
                                                name="user_id"
                                                value={editedUser.user_id}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Email"
                                                type="email"
                                                name='email'
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
                                                    name='gender'
                                                >
                                                    <MenuItem value="male">Male</MenuItem>
                                                    <MenuItem value="female">Female</MenuItem>
                                                    <MenuItem value="other">Other</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <FormControl fullWidth>
                                                <InputLabel>Role</InputLabel>
                                                <Select
                                                    value={editedUser.role}
                                                    label="Role"
                                                    name='role'
                                                    onChange={(e) => handleEditChange('role', e.target.value)}
                                                >
                                                    <MenuItem value="guest">Guest</MenuItem>
                                                    <MenuItem value="member">Member</MenuItem>
                                                    <MenuItem value="admin">Admin</MenuItem>
                                                </Select>
                                            </FormControl>
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
                                    <DialogActions>
                                        <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                                        <Button type="submit" variant="contained">Save Changes</Button>
                                    </DialogActions>
                                </Box>
                            )}
                        </DialogContent>
                    </Dialog>
                </>
            }
        </Box>
    );
}

export default ManageUsers;
