// 🚀 Go to Import Extension Demo
// Try these methods to navigate to imported files:
//
// Method 1: Cmd+Click (Mac) / Ctrl+Click (Windows/Linux) on any import path
// Method 2: Press Cmd+Shift+G (Mac) / Ctrl+Shift+G (Windows/Linux)
// Method 3: Right-click on import path → "Jump to Import File"
// Method 4: Click the "🔗 Go to Import" button in the status bar
// Method 5: Command Palette → "Jump to Import File"
//
// 💡 Tip: If Cmd+Click creates multiple cursors, change "editor.multiCursorModifier" to "altKey" in settings

import React from 'react';
import { useState } from 'react';
import './styles.css';
import utils from '../utils/helpers';
import config from './config.json';

// Relative imports
import { Button } from './components/Button';
import Modal from './components/Modal.tsx';

// Dynamic imports
const dynamicModule = import('./dynamic-module');

// CommonJS requires
const fs = require('fs');
const path = require('path');

export default function App() {
    const [count, setCount] = useState(0);

    // Using imports to avoid lint warnings
    console.log('Config:', config);
    console.log('Utils available:', typeof utils);
    console.log('FS module:', typeof fs);
    console.log('Path module:', typeof path);
    console.log('Dynamic module promise:', dynamicModule);

    return (
        <div>
            <h1>Testing Go to Import Extension</h1>
            <p>Click on any import path above to jump to that file!</p>
            <p>Current count: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                Increment ({Button ? 'Button component available' : 'No Button'})
            </button>
            {Modal && <Modal title="Demo" />}
        </div>
    );
}
