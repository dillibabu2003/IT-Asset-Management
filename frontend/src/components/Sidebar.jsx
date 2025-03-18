import React, { useEffect } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { Link, useLocation, useParams } from "react-router";
import Icon from './Icon';
import ProtectedComponent from '../protectors/ProtectedComponent';

const drawerWidth = 250;

function SubItem({item,openItems,toggleSideBar}) {
  const location = useLocation().pathname;  
  return (
    <Collapse in={openItems[item.id]} timeout="auto" unmountOnExit>
      <List component="div"   
      key={item.id}            
      >
        {item.subItems.map((subItem) => (
          <ProtectedComponent requiredPermission={subItem.requiredPermission}>
          <Link
            to={'/'+item.id+"/"+subItem.id}
            key={item.id+subItem.id}
            onClick={()=>{toggleSideBar(false)}}
          >
          <ListItem
            key={subItem.text}
            button
            sx={{
              pl: 3,
              '&.Mui-selected': {
                  backgroundColor: '#f0f7ff',
                  color: '#1976d2',
                  '& .MuiListItemIcon-root': {
                    color: '#1976d2',
                  },
                },
            }}
            selected={location==`/${item.id}/${subItem.id}`}
            >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {subItem.icon}
            </ListItemIcon>
            <ListItemText primary={subItem.text} />
          </ListItem>
            </Link>
            </ProtectedComponent>
        ))}
      </List>
    </Collapse>
  )
}
function Sidebar({isSideBarOpen,toggleSideBar,...props}) {
  const location = useLocation();
  const [openItems, setOpenItems] = React.useState({
    dashboard: location.pathname.startsWith("/dashboard"),
    users: location.pathname.startsWith("/users"),
    assets: location.pathname.startsWith("/assets"),
    licenses: location.pathname.startsWith("/licenses"),
    invoices: location.pathname.startsWith("/invoices"),
    checkouts: location.pathname.startsWith("/checkouts"),
  });  

  //listen to location change and update the links
  useEffect(()=>{
  },[location.pathname]);


  const handleClick = (id,hasSubItems) => {    
      //close all opened subitem categories
      setOpenItems((prev) => {
        const closedItems={};
        for (const key in prev) {
            closedItems[key]=false;
        }
        return closedItems;
      });
    if(hasSubItems){
      //open the subitem category of current clicked navlink if subitems exist 
      setOpenItems(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    }
    else{
      setOpenItems(prev => ({...prev,[id]:true}))
    }
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Icon name="layout-dashboard" />,
      id: 'dashboard',
      requiredPermission: "view:dashboard",
      subItems: [
        { text: 'Assets Dashboard', id:"assets", icon: <Icon name="box" />, requiredPermission:"view:assets:dashboard"},
        { text: 'Licenses Dashboard', id:"licenses", icon: <Icon name="key" />, requiredPermission:"view:licenses:dashboard"},
        { text: 'Invoices Dashboard', id:"invoices", icon: <Icon name="receipt" />, requiredPermission:"view:invoices:dashboard"},
        { text: 'Configure Dashboard', id:"configure", icon: <Icon name="settings" />, requiredPermission:"edit:dashboard"}
      ]
    },
    {
      text: 'Assets',
      icon: <Icon name="box" />,
      id: 'assets',
      requiredPermission:"view:assets"
    },
    { text: 'Licenses', icon: <Icon name="key" />, id: 'licenses',requiredPermission:"view:licenses" },
    // { text: 'Checkouts', icon: <Icon name="clipboard-list" />, id: 'checkouts',requiredPermission:"view:checkouts" },
    { text: 'Invoices', icon: <Icon name="receipt" />, id: 'invoices',requiredPermission:"view:invoices" },
    { 
      text: 'Users',
      icon: <Icon name="users"/>,
      id: 'users',
      requiredPermission:"view:users",
      subItems: [
        { text: 'Create User', icon: <Icon name="user-plus"/>, id: 'create',requiredPermission:"create:users" },
        { text: 'View Users', icon: <Icon name="user"/>, id: 'view',requiredPermission:"view:users" },
        { text: 'Manage User', icon: <Icon name="user"/>, id: 'manage',requiredPermission:"edit:users" },
      ]
     },
  ];

  return (
    <Drawer
      // variant="permanent"
      open={isSideBarOpen}
      // onClose={toggleSideBar(false)}
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
          <ProtectedComponent requiredPermission={item.requiredPermission} key={item.id}>
            {item.subItems ? (
              <ListItem
                button
                onClick={() => handleClick(item.id, true)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: '#f0f7ff',
                    color: '#1976d2',
                    '& .MuiListItemIcon-root': {
                      color: '#1976d2',
                    },
                  },
                }}
                selected={openItems[item.id]}

              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
                {openItems[item.id] ? <Icon name="chevron-down" size={18} /> : <Icon name="chevron-right" size={18} />}
              </ListItem>
            ) : (
              <Link to={"/" + item.id} onClick={()=>{toggleSideBar(false)}}>
                <ListItem
                  button
                  onClick={() => handleClick(item.id, false)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: '#f0f7ff',
                      color: '#1976d2',
                      '& .MuiListItemIcon-root': {
                        color: '#1976d2',
                      },
                    },
                  }}
                  selected={openItems[item.id]}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              </Link>
            )}
            {item.subItems && (
              <SubItem key={item.id} item={item} openItems={openItems} toggleSideBar={toggleSideBar}/>
            )}
          </ProtectedComponent>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;
