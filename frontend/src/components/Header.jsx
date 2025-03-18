import  { useState } from 'react';
import { AppBar, Avatar, Box, Button, IconButton, Popover, Toolbar, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import Icon from './Icon';
import { useAuth } from '../providers/AuthProvider';
import { Link } from 'react-router';

function Header({toggleSidebar}) {
  const { user, logout } = useAuth();
  const [toggleProfileMenu, setToggleProfileMenu] = useState();
  return (
    <AppBar position="fixed" color="inherit" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <IconButton
              color="inherit"
              onClick={() => toggleSidebar((prev) => !prev)}
              edge="start"
              sx={{ mr: 2 }}
            >
              <Icon name="menu" size={20} />
            </IconButton>
          <Link to="/" style={{ textDecoration: 'none' }}>
          <Typography variant="h6" fontWeight="500" sx={{
            color: "#1976d2",
            fontWeight: 700,
            letterSpacing: ".01em",
            textShadow: ".022em .022em .022em #111",
          }}>IT Asset Management</Typography>
          </Link>

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
                sx={{ cursor: "pointer" }}
                onClick={(e) => { setToggleProfileMenu(e.target) }}
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
                  <Link to="user/profile" state={{ userDetails: user } }>
                  <Button
                    fullWidth
                    startIcon={<Icon name="user" size={20} />}
                    sx={{ mb: 1, justifyContent: 'flex-start', textWrap: 'nowrap', textTransform: 'capitalize', color: 'gray' }}
                  >
                    Profile
                  </Button>
                  </Link>
                  <Button
                    fullWidth
                    startIcon={<Icon name="file-text" size={20} />}
                    sx={{ justifyContent: 'flex-start', textWrap: 'nowrap', textTransform: 'capitalize', color: 'gray' }}
                    onClick={() => { logout(); }}
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
Header.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
};

export default Header;