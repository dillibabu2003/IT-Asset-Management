import React from 'react';
import { AppBar, Avatar, Box, IconButton, InputBase, Toolbar, Typography, alpha } from '@mui/material';
import Icon from './Icon';

function Header() {
  return (
    <AppBar position="fixed" color="inherit" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Box sx={{ 
            position: 'relative',
            borderRadius: 1,
            backgroundColor: (theme) => alpha(theme.palette.common.black, 0.04),
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.common.black, 0.06),
            },
            marginRight: 2,
            marginLeft: 0,
            width: '100%',
            maxWidth: 400,
          }}>
            <Box sx={{ 
              padding: '0 12px',
              height: '100%',
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
            }}>
              <Icon name="search" size={20} color="#666" />
            </Box>
            <InputBase
              placeholder="Search..."
              sx={{
                color: 'inherit',
                padding: '8px 8px 8px 48px',
                width: '100%',
              }}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton size="large" color="inherit">
              <Icon name="bell" size={20} />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>John Doe</Typography>
                <Typography variant="caption" color="text.secondary">Administrator</Typography>
              </Box>
              <Avatar 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="John Doe"
              />
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;