"use client";

import { createContext, useContext, useEffect, useState } from "react";
import jwt from "jsonwebtoken";

interface UserContextType {
    googleId: string;
    isLoggedIn: boolean;
    login: (token: string) => void;
    logout: () => void;
}

interface UserPayload extends jwt.JwtPayload {
    exp: number;
    googleId: string;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [googleId, setGoogleId] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        const expire = localStorage.getItem("authExpire");
        setGoogleId(localStorage.getItem("googleId") ?? "");

        if (token && expire) {
            const expireTime = parseInt(expire, 10); // seconds
            const nowInSeconds = Math.floor(Date.now() / 1000); // Convert milliseconds to seconds

            if (nowInSeconds >= expireTime) {
                logout(); // Token hết hạn → Logout
            } else {
                setIsLoggedIn(true); // Token còn hạn → Giữ đăng nhập
            }
        }
    }, []);

    const getExpirationTime = (decoded: UserPayload) => {
        if (typeof decoded === "object" && decoded !== null && "exp" in decoded) {
            return decoded.exp as number; // Seconds
        }
        return 0;
    };

    const login = (token: string) => {

        const decoded = jwt.decode(token) as UserPayload | null;
        if (decoded === null) return;

        const expirationTimeInSec = getExpirationTime(decoded); // Seconds
        localStorage.setItem("authToken", token);
        localStorage.setItem("authExpire", expirationTimeInSec.toString());
        localStorage.setItem("googleId", decoded.googleId);

        setGoogleId(decoded.googleId);
        setIsLoggedIn(true);
    };

    const logout = () => {

        console.log('userlogout')

        localStorage.removeItem("authToken");
        localStorage.removeItem("authExpire");
        setIsLoggedIn(false);
    };

    return (
        <UserContext.Provider value={{ googleId, isLoggedIn, login, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
