import React, { useEffect } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { Link, useLocation } from "react-router";
import Icon from './Icon';


const drawerWidth = 250;

function SubItem({item,openItems}) {
  const location = useLocation().pathname;  
  return (
    <Collapse in={openItems[item.text]} timeout="auto" unmountOnExit>
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
    Dashboard: true
  });

  //listen to location change and update the links
  useEffect(()=>{
  },[location.pathname]);


  const handleClick = (text,hasSubItems) => {
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
        [text]: !prev[text]
      }));
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
                  handleClick(item.text,true);
                }
                else{
                  handleClick(item.text,false);
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
              selected={location.pathname.startsWith("/" + item.id)}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
              {item.subItems && (
                openItems[item.text] ? <Icon name="chevron-down" size={18} /> : <Icon name="chevron-right" size={18} />
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
