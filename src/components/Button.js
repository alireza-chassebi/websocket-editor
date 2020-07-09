import React from 'react';

export const Button = ({ className, active, ...props }) => {
  const style = {
    cursor: 'pointer',
    color: active ? 'black' : '#ccc',
    margin: '0 10px',
  };
  return <span {...props} className={className} style={style} />;
};
