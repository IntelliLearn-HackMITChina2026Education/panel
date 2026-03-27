import {authService} from "~/services/auth-service";
import {useNavigate} from "react-router";

export default function Logout() {
    const navigate = useNavigate();
    authService.logout();
    navigate("/login", {replace: true});
    window.location.reload();
    return null;
}