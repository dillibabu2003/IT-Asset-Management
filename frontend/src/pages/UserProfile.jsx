import React, { useState } from 'react';
import { useLocation } from 'react-router';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Chip,
} from '@mui/material';


function UserProfile() {
  const location = useLocation();
  const [userData,setUserData] = useState(location.state.userDetails);
  // Format date of birth to a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status color for the chip
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get role color for the chip
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'member':
        return 'primary';
      case 'guest':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>User Profile</Typography>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Profile Header with Avatar */}
          <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            <Avatar
              src={userData.profile_pic}
              sx={{ width: 100, height: 100 }}
            />
            <Box>
              <Typography variant="h4">{userData.firstname} {userData.lastname}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip 
                  label={userData.role}
                  color={getRoleColor(userData.role)}
                  size="small"
                />
                <Chip 
                  label={userData.status}
                  color={getStatusColor(userData.status)}
                  size="small"
                />
              </Box>
            </Box>
          </Grid>

          {/* User Information */}
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3
            }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">User ID</Typography>
                <Typography variant="body1">{userData.user_id}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{userData.email}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">First Name</Typography>
                <Typography variant="body1">{userData.firstname}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Last Name</Typography>
                <Typography variant="body1">{userData.lastname}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Date of Birth</Typography>
                <Typography variant="body1">{formatDate(userData.date_of_birth)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Gender</Typography>
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{userData.gender}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Role</Typography>
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{userData.role}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{userData.status}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default UserProfile;
