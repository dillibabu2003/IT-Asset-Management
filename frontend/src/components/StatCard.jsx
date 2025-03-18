import { Paper, Box, Typography } from '@mui/material';
import Icon from './Icon';
import PropTypes from 'prop-types';

function StatCard({ title, value, icon, color }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ 
          backgroundColor: `${color}15`,
          borderRadius: '50%',
          p: 1,
          display: 'flex',
          '& > svg': { 
            color: color || "#1976d2",
            width: 24,
            height: 24
          }
        }}>
          <Icon name={icon}/>
        </Box>
        <Box>
          <Typography color="text.secondary" variant="body2">
            {title}
          </Typography>
          <Typography variant="h5" component="div">
            {value}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.string
};

export default StatCard;
