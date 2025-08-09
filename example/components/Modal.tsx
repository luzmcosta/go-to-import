import React from 'react';
import { Button } from './Button';
import '../base.css';
import { processData } from '../utils/helpers';
import {
    User,
    validateUser,
    formatUserDisplay,
    MODAL_TYPES,
    ModalType,
    DataProcessor
} from '../utils/typescript-helpers';

interface ModalProps {
    title: string;
    isOpen?: boolean;
    onClose?: () => void;
    children?: React.ReactNode;
    modalType?: ModalType;
}

interface DataItem {
    id: number;
    name: string;
    processed?: boolean;
}

export default function Modal({ title, isOpen = true, onClose, children, modalType = MODAL_TYPES.INFO }: ModalProps) {
    // Using the imported helper function from JavaScript
    const sampleData: DataItem[] = processData([
        { id: 1, name: 'Sample Item 1' },
        { id: 2, name: 'Sample Item 2' }
    ]);

    // Using TypeScript helper functions
    const sampleUsers: User[] = [
        { id: 1, name: 'John Doe', email: 'john@example.com', isActive: true },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', isActive: false }
    ];

    const activeUsers = DataProcessor.filterActiveUsers(sampleUsers);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{title} ({modalType})</h2>
                    {onClose && (
                        <Button onClick={onClose} className="modal-close-btn">
                            ×
                        </Button>
                    )}
                </div>
                <div className="modal-body">
                    {children || (
                        <div>
                            <p>This is a sample modal component demonstrating TSX imports!</p>

                            <h3>JavaScript Helper Data (processed):</h3>
                            <ul>
                                {sampleData.map((item) => (
                                    <li key={item.id}>
                                        {item.name} {item.processed ? '✓' : ''}
                                    </li>
                                ))}
                            </ul>

                            <h3>TypeScript Helper Data (users):</h3>
                            <ul>
                                {sampleUsers.map((user) => (
                                    <li key={user.id}>
                                        {formatUserDisplay(user)}
                                        {validateUser(user) ? ' ✓' : ' ⚠️'}
                                    </li>
                                ))}
                            </ul>

                            <h3>Active Users Only:</h3>
                            <ul>
                                {activeUsers.map((user) => (
                                    <li key={user.id}>{user.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Named export for additional functionality
export function ModalHeader({ title, onClose }: { title: string; onClose?: () => void }) {
    return (
        <div className="modal-header">
            <h2>{title}</h2>
            {onClose && <Button onClick={onClose}>Close</Button>}
        </div>
    );
}
