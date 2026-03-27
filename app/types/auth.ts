export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    classes: string[];
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterCredentials {
    username: string;
    password: string;
    // 按需扩展，例如 email?: string;
}