import React from 'react';

interface PinIconProps {
  isPinned?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PinIcon: React.FC<PinIconProps> = ({ isPinned = false, size = 'md' }) => {
  const getSizeStyles = (size: string) => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-6 h-6';
      default: // md
        return 'w-4 h-4';
    }
  };

  const sizeStyles = getSizeStyles(size);

  if (!isPinned) {
    return null;
  }

  return (
    <svg 
      className={`${sizeStyles} text-orange-500`} 
      fill="currentColor" 
      viewBox="0 0 20 20"
    >
      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
  );
};
