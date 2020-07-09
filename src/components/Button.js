import React from 'react';

export const Button = ({ className, active, reversed, ...props }) => {
  const style = {
    cursor: 'pointer',
    color: reversed ? (active ? 'white' : '#aaa') : active ? 'black' : '#ccc',
    margin: '0 10px',
  };
  return <span {...props} className={className} style={style} />;
};
