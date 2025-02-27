import React, { useState } from 'react';
import { AppBar, Avatar, Box, Button, IconButton, InputBase, Popover, Toolbar, Typography, alpha } from '@mui/material';
import Icon from './Icon';
import { useAuth } from '../providers/AuthProvider';

function Header() {
  const {user,logout} = useAuth();
  
  const [toggleProfileMenu,setToggleProfileMenu] = useState();
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
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{user.fullname}</Typography>
                <Typography variant="caption" color="text.secondary">{String(user.role).charAt(0).toUpperCase() + String(user.role).slice(1)}</Typography>
              </Box>
              <Avatar 
                src={user.profile_pic} 
                alt={user.fullname}
                sx={{cursor: "pointer"}}
                onClick={(e)=>{setToggleProfileMenu(e.target)}}
              />
              <Popover
                  open={Boolean(toggleProfileMenu)}
                  anchorEl={toggleProfileMenu}
                  onClose={() => setToggleProfileMenu(null)}
                  anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                  }}
                  transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                  }}
                
              >
                  <Box sx={{ p: 1, width: "fit-content", display: 'flex', flexDirection: "column" }}>
                      <Button
                          fullWidth
                          startIcon={<Icon name="user" size={20} />}
                          sx={{ mb: 1, justifyContent: 'flex-start', textWrap: 'nowrap', textTransform: 'capitalize',color: 'gray'  }}
                      >
                          Profile
                      </Button>
                      <Button
                          fullWidth
                          startIcon={<Icon name="file-text" size={20} />}
                          sx={{ justifyContent: 'flex-start', textWrap: 'nowrap',textTransform: 'capitalize', color: 'gray' }}
                          onClick={()=>{logout();}}
                      >
                          Logout
                      </Button>
                  </Box>
              </Popover>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;