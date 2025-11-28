import React from 'react';
import { Importance } from '../../types';

interface ImportanceBadgeProps {
  importance: Importance;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ImportanceBadge: React.FC<ImportanceBadgeProps> = ({ importance, size = 'md', className = '' }) => {
  const getImportanceStyles = (importance: Importance) => {
    const baseStyles = 'font-bold rounded-full text-white text-center';
    
    switch (importance) {
      case Importance.HIGH:
        return {
          backgroundColor: '#ff4d4d',
          color: 'white'
        };
      case Importance.MEDIUM:
        return {
          backgroundColor: '#ff9933',
          color: 'white'
        };
      case Importance.LOW:
        return {
          backgroundColor: '#32cd32',
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

  const styles = getImportanceStyles(importance);
  const sizeStyles = getSizeStyles(size);

  return (
    <span 
      className={`${sizeStyles} ${styles.backgroundColor ? '' : 'bg-gray-500'} inline-block ${className}`}
      style={styles}
    >
      {importance}
    </span>
  );
};
