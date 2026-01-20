"use client";
import { auth, provider } from "@/lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { useUsertStore } from "@/store/useUserStore"
import styles from "@/styles/components/_login.module.scss";

export default function Login() {
    const { user, setUser, clearUser } = useUsertStore();

    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);

            if (!result) throw new Error (result);

            const userData = {
                uid: result.user.uid,
                name: result.user.displayName || "",
                email: result.user.email || ""
            };

            setUser(userData);
        } catch (error) {
            console.error("로그인 실패", error);
        };
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            clearUser();
        } catch (error) {
            console.error("로그아웃 실패", error);
        };
    };

    return (
        <div>
            {!user.uid ? 
                <button onClick={handleLogin} className={styles.loginButon}>
                    Google 로그인
                </button>
                :
                <button onClick={handleLogout} className={styles.loginButon}>
                    로그아웃
                </button>
            }
        </div>
    );
}
