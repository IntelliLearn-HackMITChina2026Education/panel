import {Outlet, redirect} from "react-router";
import {authService} from "~/services/auth-service";

export async function clientLoader() {
    const user = await authService.getMe();
    if (user == null) throw redirect("/login");
    return {user};
}

export default function AuthLayout() {
    return <Outlet/>;
}