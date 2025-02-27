import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Grid,
    FormControlLabel,
    Switch,
    Avatar,
} from '@mui/material';
import { Upload } from 'lucide-react';

const initialFormData = {
    fullName: '',
    email: '',
    gender: '',
    phoneNumber: '',
    status: true,
    password: '',
    role: '',
    department: '',
    jobTitle: '',
    location: '',
    profilePhoto: '',
};

function CreateUser() {
    const [formData, setFormData] = useState(initialFormData);

    const handleChange = (field) => (event) => {
        const value = event.target.type === 'checkbox' 
            ? event.target.checked 
            : event.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Form submitted:', formData);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Create User</Typography>
            <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {/* Profile Photo */}
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Avatar
                                src={formData.profilePhoto || undefined}
                                sx={{ width: 100, height: 100, mb: 2, mx: 'auto' }}
                            />
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<Upload size={18} />}
                                sx={{ textTransform: 'none' }}
                            >
                                Upload Photo
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    profilePhoto: reader.result,
                                                }));
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </Button>
                        </Box>
                    </Grid>

                    {/* Basic Information */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            value={formData.fullName}
                            onChange={handleChange('fullName')}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange('email')}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Gender</InputLabel>
                            <Select
                                value={formData.gender}
                                label="Gender"
                                onChange={handleChange('gender')}
                                required
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
                            value={formData.phoneNumber}
                            onChange={handleChange('phoneNumber')}
                        />
                    </Grid>

                    {/* Role and Access */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={formData.role}
                                label="Role"
                                onChange={handleChange('role')}
                                required
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
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange('password')}
                            required
                        />
                    </Grid>

                    {/* Additional Information */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Department"
                            value={formData.department}
                            onChange={handleChange('department')}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Job Title"
                            value={formData.jobTitle}
                            onChange={handleChange('jobTitle')}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Location"
                            value={formData.location}
                            onChange={handleChange('location')}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.status}
                                    onChange={handleChange('status')}
                                    color="primary"
                                />
                            }
                            label="Active Status"
                        />
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button variant="outlined">Cancel</Button>
                            <Button type="submit" variant="contained">Create User</Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}

export default CreateUser;
