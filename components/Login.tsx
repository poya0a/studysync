"use client";

import { auth, provider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";

export default function Login() {
    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("로그인 성공", result.user);
        } catch (error) {
            console.error("로그인 실패", error);
        }
    };

    return (
        <button onClick={handleLogin} className="btn-login">
            Google 로그인
        </button>
    );
}
