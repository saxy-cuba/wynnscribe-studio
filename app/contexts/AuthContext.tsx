import {onAuthStateChanged, type User} from "@firebase/auth";
import React, {createContext, type ReactNode, useContext, useEffect} from "react";
import {auth} from "~/lib/firebase.client";

type AuthContextProps = {
    user: User | null | undefined,
    isAdmin: boolean,
    loading: boolean,
}

const AuthContext = createContext<AuthContextProps>({user: undefined, isAdmin: false, loading: true})

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [user, setUser] = React.useState<User | null | undefined>(undefined)
    const [isAdmin, setIsAdmin] = React.useState(false)
    const [loading, setLoading] = React.useState(true)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user)
            if(user === null) {
                setLoading(false)
            }
            user?.getIdTokenResult().then((result) => {
                setIsAdmin(result.claims.admin == true)
                setLoading(false)
            })
        })
        return () => unsubscribe()
    }, []);
    return <AuthContext.Provider value={{user: user, isAdmin: isAdmin, loading: loading}}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)