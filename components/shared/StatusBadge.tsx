import React from 'react';
import { ComplaintStatus } from '../../types';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const getStatusStyles = (status: ComplaintStatus) => {
    const baseStyles = 'font-bold rounded-full text-white text-center';
    
    switch (status) {
      case ComplaintStatus.PENDING:
        return {
          backgroundColor: '#808080',
          color: 'white'
        };
      case ComplaintStatus.UNDER_REVIEW:
        return {
          backgroundColor: '#1e90ff',
          color: 'white'
        };
      case ComplaintStatus.IN_PROGRESS:
        return {
          backgroundColor: '#ffd700',
          color: '#000000'
        };
      case ComplaintStatus.COMPLETED:
        return {
          backgroundColor: '#32cd32',
          color: 'white'
        };
      case ComplaintStatus.CLOSED:
        return {
          backgroundColor: '#000000',
          color: 'white'
        };
      default:
        return {
          backgroundColor: '#808080',
          color: 'white'
        };
    }
  };

  const getSizeStyles = (size: string) => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs min-w-[80px]';
      case 'lg':
        return 'px-4 py-2 text-lg min-w-[120px]';
      default: // md
        return 'px-3 py-1.5 text-sm min-w-[100px]';
    }
  };

  const styles = getStatusStyles(status);
  const sizeStyles = getSizeStyles(size);

  return (
    <span 
      className={`${sizeStyles} ${styles.backgroundColor ? '' : 'bg-gray-500'} inline-block ${className}`}
      style={styles}
    >
      {status}
    </span>
  );
};
