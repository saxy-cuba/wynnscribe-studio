import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "~/components/ui/card";
import {Button} from "~/components/ui/button";
import {FaGoogle} from "react-icons/fa";
import {auth} from "~/lib/firebase.client";
import {GoogleAuthProvider, signInWithPopup} from "@firebase/auth";
import {useNavigate, useSearchParams} from "react-router";

export default function Login() {

    const provider = new GoogleAuthProvider()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const handleLogin = async() => {
        try {
            const result = await signInWithPopup(auth, provider)
            navigate(searchParams.get("redirect")??"/")
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="h-screen w-screen flex flex-col gap-4 items-center justify-center">
            <h1 className="text-2xl">Wynnscribe Studio</h1>
            <Card className="w-80">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>Login with Google Account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="w-full flex items-center justify-end">
                        <Button onClick={handleLogin}><FaGoogle/>Login with Google</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}