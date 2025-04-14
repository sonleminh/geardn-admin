import { ROUTES } from '@/constants/route';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Button,
  Collapse,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import { NavLink, NavLink as RouterLink } from 'react-router-dom';

interface IMultipleListItemProps {
  mainIcon: ReactNode;
  mainLabel: string;
  closeSidebar?: () => void;
  options: { to: string; icon: ReactNode; label: any }[];
  active: boolean;
}

const MultipleListItem = ({
  mainIcon,
  mainLabel,
  closeSidebar,
  options,
  active,
}: IMultipleListItemProps) => {
  const [activeCollapse, setActiveCollapse] = useState(false);

  useEffect(() => {
    setActiveCollapse(active);
  }, [active]);

  return (
    <>
      <ListItem onClick={() => setActiveCollapse((prev) => !prev)}>
        <ListItemButton component={NavLink} to={ROUTES.CATEGORY}>
          <ListItemIcon>{mainIcon}</ListItemIcon>
          <ListItemText primary={mainLabel} />
        </ListItemButton>
        {/* <Button
          startIcon={mainIcon}
          endIcon={activeCollapse ? <ExpandLess /> : <ExpandMore />}>
          {mainLabel}
        </Button> */}
      </ListItem>
      <Collapse in={activeCollapse} timeout='auto' unmountOnExit>
        {options.map((item, index) => (
          <ListItem key={index} sx={{ ml: 2 }}>
            <ListItemButton component={NavLink} to={item.to}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
            {/* <Button
              disableRipple
              component={RouterLink}
              onClick={closeSidebar}
              to={item.to}
              startIcon={item.icon}>
              {item.label}
            </Button> */}
          </ListItem>
        ))}
      </Collapse>
    </>
  );
};

export default MultipleListItem;
