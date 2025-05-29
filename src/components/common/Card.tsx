import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  selectable?: boolean;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  onClick,
  selected = false,
  selectable = false,
  className = ''
}) => {
  const baseClasses = 'bg-white rounded-lg p-4 shadow-sm transition-all duration-200';
  
  const interactiveClasses = selectable 
    ? 'hover:shadow-md cursor-pointer' 
    : onClick ? 'hover:shadow-md cursor-pointer' : '';
  
  const selectedClasses = selected ? 'border-2 border-indigo-500 shadow-md' : 'border border-gray-200';
  
  const classes = `${baseClasses} ${interactiveClasses} ${selectedClasses} ${className}`;
  
  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;