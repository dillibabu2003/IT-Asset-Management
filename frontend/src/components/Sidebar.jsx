import React, { useEffect } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import {
  LayoutDashboard,
  Box as BoxIcon,
  Key,
  ClipboardList,
  Receipt,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Link, useLocation } from "react-router";


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
    Dashboard: false
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
      icon: <LayoutDashboard />,
      id: 'dashboard',
      subItems: [
        { text: 'Assets Dashboard', id:"assets", icon: <BoxIcon /> },
        { text: 'Licenses Dashboard', id:"licenses", icon: <Key /> },
        { text: 'Invoices Dashboard', id:"invoices", icon: <Receipt /> },
        { text: 'Configure Dashboard', id:"configure", icon: <Receipt /> }
      ]
    },
    {
      text: 'Assets',
      icon: <BoxIcon />,
      id: 'assets',
    },
    { text: 'Licenses', icon: <Key />, id: 'licenses' },
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
                openItems[item.text] ? <ChevronDown size={18} /> : <ChevronRight size={18} />
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
