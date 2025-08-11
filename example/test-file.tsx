// 🚀 Go to Import Extension Demo - TypeScript/TSX Edition
// Try these methods to navigate to imported files:
//
// Method 1: Cmd+Click (Mac) / Ctrl+Click (Windows/Linux) on any import path
// Method 2: Press Cmd+Shift+G (Mac) / Ctrl+Shift+G (Windows/Linux)
// Method 3: Right-click on import path → "Jump to Import File"
// Method 4: Click the "🔗 Go to Import" button in the status bar
// Method 5: Command Palette → "Jump to Import File"
//
// 💡 Tip: If Cmd+Click creates multiple cursors, change "editor.multiCursorModifier" to "altKey" in settings

import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import './styles.css'
import './base.css'
import { processData, formatDate } from './utils/helpers'
import config from './config.json'

// TypeScript imports
import {
    User,
    validateUser,
    formatUserDisplay,
    MODAL_TYPES,
    ModalType,
    DataProcessor,
    createApiResponse
} from './utils/typescript-helpers';

// Component imports - demonstrating different import patterns
import { Button } from './components/Button';
import Modal, { ModalHeader } from './components/Modal';

import '../example/stores/api.js';
import '@root/example/stores/api.js';
import '@/stores/api.js';

// Type definitions
interface AppState {
    count: number;
    showModal: boolean;
    users: User[];
    currentModalType: ModalType;
}

interface ComponentProps {
    title?: string;
    className?: string;
}

// Dynamic import (for code splitting demonstration)
const loadDynamicModule = () => import('./utils/helpers');

// Default export function component
export default function TSXDemo({ title = "TSX Import Demo", className }: ComponentProps): JSX.Element {
    const [state, setState] = useState<AppState>({
        count: 0,
        showModal: false,
        users: [
            { id: 1, name: 'Alice Johnson', email: 'alice@example.com', isActive: true },
            { id: 2, name: 'Bob Smith', email: 'bob@example.com', isActive: false },
            { id: 3, name: 'Carol Davis', email: 'carol@example.com', isActive: true }
        ],
        currentModalType: MODAL_TYPES.INFO
    });

    const [dynamicModuleLoaded, setDynamicModuleLoaded] = useState<boolean>(false);

    useEffect(() => {
        // Demonstrating dynamic import usage
        loadDynamicModule()
            .then(() => setDynamicModuleLoaded(true))
            .catch(console.error);
    }, []);

    const handleIncrement = (): void => {
        setState(prev => ({ ...prev, count: prev.count + 1 }));
    };

    const toggleModal = (): void => {
        setState(prev => ({ ...prev, showModal: !prev.showModal }));
    };

    const changeModalType = (type: ModalType): void => {
        setState(prev => ({ ...prev, currentModalType: type }));
    };

    // Using imported utility functions
    const processedUsers = DataProcessor.processItems(state.users);
    const activeUsers = DataProcessor.filterActiveUsers(state.users);
    const currentDate = formatDate(new Date());
    const sampleData = processData([
        { id: 1, name: 'Sample A' },
        { id: 2, name: 'Sample B' }
    ]);

    // Create API response using imported helper
    const apiResponse = createApiResponse(activeUsers, 200, 'Users fetched successfully');

    return (
        <div className={`tsx-demo ${className || ''}`}>
            <header>
                <h1>{title}</h1>
                <p className="subtitle">Click on any import path above to jump to that file!</p>
            </header>

            <main>
                <section className="counter-section">
                    <h2>Counter Demo</h2>
                    <p>Current count: <strong>{state.count}</strong></p>
                    <Button onClick={handleIncrement}>
                        Increment Count
                    </Button>
                </section>

                <section className="users-section">
                    <h2>User Management Demo</h2>
                    <p>Date: {currentDate}</p>
                    <p>Dynamic module loaded: {dynamicModuleLoaded ? '✅' : '⏳'}</p>

                    <h3>All Users:</h3>
                    <ul>
                        {state.users.map((user) => (
                            <li key={user.id}>
                                {formatUserDisplay(user)}
                                {validateUser(user) ? ' ✅' : ' ❌'}
                            </li>
                        ))}
                    </ul>

                    <h3>Active Users Only:</h3>
                    <ul>
                        {activeUsers.map((user) => (
                            <li key={user.id}>{user.name}</li>
                        ))}
                    </ul>

                    <h3>Processed Sample Data:</h3>
                    <ul>
                        {sampleData.map((item) => (
                            <li key={item.id}>
                                {item.name} {item.processed ? '✅' : ''}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="modal-section">
                    <h2>Modal Demo</h2>
                    <p>Config loaded: {config ? '✅' : '❌'}</p>

                    <div className="modal-controls">
                        <Button onClick={toggleModal}>
                            {state.showModal ? 'Hide Modal' : 'Show Modal'}
                        </Button>

                        <div className="modal-type-buttons">
                            {Object.values(MODAL_TYPES).map((type) => (
                                <Button
                                    key={type}
                                    onClick={() => changeModalType(type)}
                                    className={state.currentModalType === type ? 'active' : ''}
                                >
                                    {type}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {state.showModal && (
                        <Modal
                            title="TypeScript Modal Demo"
                            modalType={state.currentModalType}
                            onClose={toggleModal}
                        >
                            <div>
                                <p>This modal was imported from <code>./Modal.tsx</code></p>
                                <p>API Response Status: {apiResponse.status}</p>
                                <p>API Response Message: {apiResponse.message}</p>
                                <p>Active Users Count: {apiResponse.data.length}</p>
                            </div>
                        </Modal>
                    )}
                </section>

                <section className="import-examples">
                    <h2>Import Examples Demonstrated</h2>
                    <ul>
                        <li>✅ React imports (useState, useEffect)</li>
                        <li>✅ CSS imports (./styles.css, ../base.css)</li>
                        <li>✅ JSON imports (../config.json)</li>
                        <li>✅ JavaScript module imports (../utils/helpers)</li>
                        <li>✅ TypeScript module imports (../utils/typescript-helpers)</li>
                        <li>✅ Named component imports (Button)</li>
                        <li>✅ Default + named imports (Modal, ModalHeader)</li>
                        <li>✅ Dynamic imports (loadDynamicModule)</li>
                        <li>✅ Type-only imports (User, ModalType)</li>
                    </ul>
                </section>
            </main>
        </div>
    );
}

// Named export for alternative component
export function SimpleTSXDemo(): JSX.Element {
    return (
        <div>
            <h2>Simple TSX Component</h2>
            <p>This demonstrates a named export from a TSX file.</p>
            <ModalHeader title="Simple Demo" />
        </div>
    );
}

// Re-export from imported module for demonstration
export { MODAL_TYPES } from './utils/typescript-helpers';
export type { User, ModalType } from './utils/typescript-helpers';
