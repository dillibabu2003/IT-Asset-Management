import React, { useEffect } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { Link, useLocation, useParams } from "react-router";
import Icon from './Icon';


const drawerWidth = 250;

function SubItem({item,openItems}) {
  const location = useLocation().pathname;  
  return (
    <Collapse in={openItems[item.id]} timeout="auto" unmountOnExit>
      <List component="div"               
      >
        {item.subItems.map((subItem) => (
          <Link
            to={'/'+item.id+"/"+subItem.id}
            key={item.id+subItem.id}
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
        ))}
      </List>
    </Collapse>
  )
}
function Sidebar(component) {
  const location = useLocation();
  const [openItems, setOpenItems] = React.useState({
    dashboard: location.pathname.startsWith("/dashboard"),
    users: location.pathname.startsWith("/users"),
    assets: location.pathname.startsWith("/assets"),
    licenses: location.pathname.startsWith("/licenses"),
    invoices: location.pathname.startsWith("/invoices"),
    checkouts: location.pathname.startsWith("/checkouts"),
  });
  console.log(openItems);
  

  //listen to location change and update the links
  useEffect(()=>{
  },[location.pathname]);


  const handleClick = (id,hasSubItems) => {
    console.log(id);
    
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
      subItems: [
        { text: 'Assets Dashboard', id:"assets", icon: <Icon name="box" /> },
        { text: 'Licenses Dashboard', id:"licenses", icon: <Icon name="key" /> },
        { text: 'Invoices Dashboard', id:"invoices", icon: <Icon name="receipt" /> },
        { text: 'Configure Dashboard', id:"configure", icon: <Icon name="receipt" /> }
      ]
    },
    {
      text: 'Assets',
      icon: <Icon name="box" />,
      id: 'assets',
    },
    { text: 'Licenses', icon: <Icon name="key" />, id: 'licenses' },
    { text: 'Checkouts', icon: <Icon name="clipboard-list" />, id: 'checkouts' },
    { text: 'Invoices', icon: <Icon name="receipt" />, id: 'invoices' },
    { 
      text: 'Users',
      icon: <Icon name="users"/>,
      id: 'users',
      subItems: [
        { text: 'Create User', icon: <Icon name="user-plus"/>, id: 'create' },
      ]
     },
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
          <React.Fragment key={item.id}>
            <Link to={"/"+item.id} >
            <ListItem
              button
              onClick={() => {
                if (item.subItems) {
                  handleClick(item.id,true);
                }
                else{
                  handleClick(item.id,false);
                }
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
              selected={openItems[item.id]}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
              {item.subItems && (
                openItems[item.id] ? <Icon name="chevron-down" size={18} /> : <Icon name="chevron-right" size={18} />
              )}
            </ListItem>
            </Link>

            {item.subItems && (
                <SubItem key={item.id} item={item} openItems={openItems} />
            )}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;
