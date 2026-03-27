import type {Route} from "./+types/_index";
import {authService} from "~/services/auth-service";
import {redirect, useNavigate} from "react-router";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "New React Router App"},
        {name: "description", content: "Welcome to React Router!"},
    ];
}

export async function clientLoader() {
    const user = await authService.getMe();
    if (user == null) throw redirect("/login");
    throw redirect("/dashboard");
    return {user};
}

export default function AuthLayout() {
    const navigate = useNavigate();
    navigate("/dashboard");
    return null;
}