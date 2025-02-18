import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { 
  LayoutDashboard, 
  Box as BoxIcon, 
  Key, 
  Plug2, 
  Package, 
  ClipboardList, 
  Receipt,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const drawerWidth = 240;

function Sidebar({ onNavigate, currentSection }) {
  const [openItems, setOpenItems] = React.useState({
    Dashboard: true
  });

  const handleClick = (text) => {
    setOpenItems(prev => ({
      ...prev,
      [text]: !prev[text]
    }));
  };

  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <LayoutDashboard />,
      id: 'dashboard',
      subItems: [
        { text: 'Asset Overview', icon: <BoxIcon /> },
        { text: 'License Status', icon: <Key /> },
        { text: 'Financial Reports', icon: <Receipt /> }
      ]
    },
    { 
      text: 'Assets', 
      icon: <BoxIcon />,
      id: 'assets',
    },
    { text: 'Licenses', icon: <Key />, id: 'licenses' },
    { text: 'Accessories', icon: <Plug2 />, id: 'accessories' },
    { text: 'Consumables', icon: <Package />, id: 'consumables' },
    { text: 'Checkouts', icon: <ClipboardList />, id: 'checkouts' },
    { text: 'Invoices', icon: <Receipt />, id: 'invoices' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          mt: '64px',
        },
      }}
    >
      <List>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem 
              button 
              onClick={() => {
                if (item.subItems) {
                  handleClick(item.text);
                }
                onNavigate(item.id);
              }}
              sx={{ 
                '&.Mui-selected': {
                  backgroundColor: '#f0f7ff',
                  color: '#1976d2',
                  '& .MuiListItemIcon-root': {
                    color: '#1976d2',
                  },
                },
              }} 
              selected={currentSection === item.id}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
              {item.subItems && (
                openItems[item.text] ? <ChevronDown size={18} /> : <ChevronRight size={18} />
              )}
            </ListItem>
            {item.subItems && (
              <Collapse in={openItems[item.text]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems.map((subItem) => (
                    <ListItem 
                      key={subItem.text} 
                      button 
                      sx={{ pl: 4 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {subItem.icon}
                      </ListItemIcon>
                      <ListItemText primary={subItem.text} />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;
