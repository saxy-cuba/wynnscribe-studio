import {Outlet} from "react-router";
import Login from "~/authentication/login";
import {useAuth} from "~/contexts/AuthContext";
import Loading from "~/Loading";

export default function AuthGuard() {
    const {user, loading, isAdmin} = useAuth()
    if(user) {
        return (
            <Outlet />
        )
    } else if(user === null) {
        window.location.href = "/login"
    }
}