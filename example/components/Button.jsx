import React from 'react';

export function Button({ children, onClick, ...props }) {
    return (
        <button onClick={onClick} {...props}>
            {children}
        </button>
    );
}
