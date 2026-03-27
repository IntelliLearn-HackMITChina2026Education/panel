import type {LoginCredentials, RegisterCredentials, User} from "~/types/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const authService = {
    async login(credentials: LoginCredentials): Promise<User> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            credentials: "include",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: new URLSearchParams({
                username: credentials.username,
                password: credentials.password,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({error: "登录失败"}));
            if (response.status == 401) {
                throw new Error("用户名或密码错误");
            }
            // throw new Error(error || '登录失败');
        }

        return response.json();
    },

    async register(credentials: RegisterCredentials): Promise<User> {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            credentials: "include",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(credentials),
        });

        if (!response.ok) throw new Error("注册失败");
        return response.json();
    },

    async logout(): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
        });

        if (!response.ok) throw new Error("登出失败");
    },

    async getMe(): Promise<User | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                credentials: "include",
            });

            if (!response.ok) return null;

            return await response.json();
        } catch (error) {
            return null;
        }
    }
};