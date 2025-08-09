// TypeScript utility functions for TSX demo
export interface User {
    id: number;
    name: string;
    email: string;
    isActive?: boolean;
}

export interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

export function validateUser(user: User): boolean {
    return !!(user.id && user.name && user.email);
}

export function formatUserDisplay(user: User): string {
    const status = user.isActive ? 'Active' : 'Inactive';
    return `${user.name} (${user.email}) - ${status}`;
}

export function createApiResponse<T>(data: T, status: number = 200, message: string = 'Success'): ApiResponse<T> {
    return {
        data,
        status,
        message
    };
}

export const MODAL_TYPES = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    SUCCESS: 'success'
} as const;

export type ModalType = typeof MODAL_TYPES[keyof typeof MODAL_TYPES];

export class DataProcessor {
    static processItems<T extends { id: number }>(items: T[]): T[] {
        return items.map(item => ({
            ...item,
            processed: true
        } as T));
    }

    static filterActiveUsers(users: User[]): User[] {
        return users.filter(user => user.isActive !== false);
    }
}
