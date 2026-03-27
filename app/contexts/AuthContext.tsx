import {createContext, type ReactNode, useContext, useEffect, useState} from "react";
import {authService} from "~/services/auth-service";
import type {LoginCredentials, RegisterCredentials, User} from "~/types/auth";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // 应用启动时恢复登录状态
    useEffect(() => {
        authService.getMe()
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = async (credentials: LoginCredentials) => {
        const user = await authService.login(credentials);
        setUser(user);
    };

    const register = async (credentials: RegisterCredentials) => {
        const user = await authService.register(credentials);
        setUser(user);
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{user, loading, login, register, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};