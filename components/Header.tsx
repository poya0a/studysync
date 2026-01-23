"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { auth, provider } from "@/lib/firebase";
import { signInWithRedirect, signOut, setPersistence, browserLocalPersistence } from "firebase/auth";
import { useUserStore } from "@/store/useUserStore"
import styles from "@/styles/components/_header.module.scss";

export default function Header() {
    const { user, clearUser } = useUserStore();
    const persistenceSet = useRef(false);

    useEffect(() => {
        if (persistenceSet.current) return;

        persistenceSet.current = true;
        setPersistence(auth, browserLocalPersistence).catch(console.error);
    }, []);
    
    const handleLogin = async () => {
        try {
            await signInWithRedirect(auth, provider);
        } catch (error) {
            console.error("로그인 실패", error);
        }
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
        <header className={styles.header}>
            <div className={styles.container}>
                <Link className={styles.logo} href="https://poya.vercel.app">
                    <Image
                        src="/images/logo_blue.png"
                        width={80}
                        height={80}
                        alt="LOGO"
                    />
                </Link>
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
        </header>
    );
}