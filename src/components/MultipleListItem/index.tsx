import { ReactNode, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Collapse,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

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
        <ListItemButton>
          <ListItemIcon>{mainIcon}</ListItemIcon>
          <ListItemText primary={mainLabel} />
          {activeCollapse ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
      </ListItem>
      <Collapse in={activeCollapse} timeout='auto' unmountOnExit>
        {options.map((item, index) => (
          <ListItem key={index}>
            <ListItemButton component={NavLink} to={item.to}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </Collapse>
    </>
  );
};

export default MultipleListItem;
