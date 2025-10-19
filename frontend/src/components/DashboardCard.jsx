import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const DashboardCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'primary',
  gradient = 'primary',
  onClick,
  className = '',
  children 
}) => {
  const { currentTheme, animations } = useTheme();

  const getColorClasses = () => {
    const theme = currentTheme;
    switch (color) {
      case 'primary':
        return {
          bg: `bg-${theme.colors.primary[50]}`,
          text: `text-${theme.colors.primary[700]}`,
          iconBg: `bg-${theme.colors.primary[100]}`,
          iconColor: `text-${theme.colors.primary[600]}`,
        };
      case 'secondary':
        return {
          bg: `bg-${theme.colors.secondary[50]}`,
          text: `text-${theme.colors.secondary[700]}`,
          iconBg: `bg-${theme.colors.secondary[100]}`,
          iconColor: `text-${theme.colors.secondary[600]}`,
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
        };
    }
  };

  const colors = getColorClasses();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    hover: animations ? { 
      scale: 1.02, 
      y: -2,
      transition: { duration: 0.2 }
    } : {}
  };

  return (
    <motion.div
      className={`card p-6 cursor-pointer ${className} ${colors.bg}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={onClick ? "hover" : {}}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-bold ${colors.text}`}>
              {value}
            </span>
            {subtitle && (
              <span className="text-sm text-gray-500">{subtitle}</span>
            )}
          </div>
        </div>
        
        {Icon && (
          <div className={`p-3 rounded-xl ${colors.iconBg}`}>
            <Icon className={`h-6 w-6 ${colors.iconColor}`} />
          </div>
        )}
      </div>

      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}

      {/* Gradient overlay for visual appeal */}
      <div className={`absolute inset-0 rounded-xl opacity-5 pointer-events-none bg-gradient-to-r ${currentTheme.gradients[gradient]}`} />
    </motion.div>
  );
};

export default DashboardCard;
