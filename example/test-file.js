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
import './base.css';
import utils from './utils/helpers';
import config from './config.json';

// Relative imports - mixing JSX and TSX files
import { Button } from './components/Button';
import Modal from './components/Modal';

import '@/test-store.js'; // Using alias to test path resolution

// Try importing the TypeScript demo file
// import TSXDemo from './test-file.tsx';

// Dynamic imports
const dynamicModule = import('./utils/helpers');

// CommonJS requires (for demonstration)
const fs = require('fs');
const path = require('path');

export default function App() {
    const [count, setCount] = useState(0);
    const [showModal, setShowModal] = useState(false);

    // Using imports to avoid lint warnings
    console.log('Config:', config);
    console.log('Utils available:', typeof utils);
    console.log('FS module:', typeof fs);
    console.log('Path module:', typeof path);
    console.log('Dynamic module promise:', dynamicModule);

    const toggleModal = () => setShowModal(!showModal);

    return (
        <div className="app-container">
            <header>
                <h1>Testing Go to Import Extension</h1>
                <p className="subtitle">Click on any import path above to jump to that file!</p>
            </header>

            <main>
                <section className="counter-section">
                    <p>Current count: <strong>{count}</strong></p>
                    <Button onClick={() => setCount(count + 1)}>
                        Increment ({Button ? 'Button component available' : 'No Button'})
                    </Button>
                </section>

                <section className="modal-section">
                    <h2>Modal Demo (TSX Component)</h2>
                    <Button onClick={toggleModal}>
                        {showModal ? 'Hide TSX Modal' : 'Show TSX Modal'}
                    </Button>

                    {showModal && (
                        <Modal
                            title="Demo Modal from TSX"
                            modalType="info"
                            onClose={toggleModal}
                        >
                            <div>
                                <p>🎉 This modal is imported from <code>Modal.tsx</code>!</p>
                                <p>It demonstrates importing and using TypeScript React components in JavaScript files.</p>
                                <p>The modal includes TypeScript interfaces, type checking, and imported utilities.</p>
                            </div>
                        </Modal>
                    )}
                </section>

                <section className="import-examples">
                    <h2>Import Types Demonstrated</h2>
                    <ul>
                        <li>✅ React imports (default and named)</li>
                        <li>✅ CSS imports (./styles.css, ./base.css)</li>
                        <li>✅ JSON imports (./config.json)</li>
                        <li>✅ JavaScript modules (./utils/helpers)</li>
                        <li>✅ JSX components (./components/Button)</li>
                        <li>✅ TSX components (./components/Modal.tsx)</li>
                        <li>✅ Dynamic imports (import('./utils/helpers'))</li>
                        <li>✅ CommonJS requires (fs, path)</li>
                        <li>🔗 Try clicking on any import path to navigate!</li>
                    </ul>
                </section>
            </main>
        </div>
    );
}
