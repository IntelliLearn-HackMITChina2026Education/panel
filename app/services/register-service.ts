import type {UserRegistration} from "~/types/register";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const registerService = {
    async isEnabled(): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/register/enabled`, {
                credentials: "include"
            });

            if (response.status === 418) return false;

            return response.ok;
        } catch (error) {
            return false;
        }
    },

    async register(data: UserRegistration): Promise<string> {
        // 先检查注册是否开启
        const enabled = await this.isEnabled();
        if (!enabled) {
            return "注册服务未开启";
        }

        const response = await fetch(`${API_BASE_URL}/register`, {
            method: "POST",
            credentials: "include",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({error: "注册失败"}));
            return error.error || "注册失败";
        }

        return "";
    }
};