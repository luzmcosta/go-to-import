// Sample JavaScript file to test the Go to Import extension
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

    return (
        <div>
            <h1>Testing Go to Import Extension</h1>
            <p>Click on any import path above to jump to that file!</p>
        </div>
    );
}
