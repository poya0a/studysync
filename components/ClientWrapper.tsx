"use client";
import { ReactNode, useEffect } from "react";
import {
    setPersistence,
    browserLocalPersistence,
    getRedirectResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { initAuthListener } from "@/lib/authListener";

export default function ClientWrapper({ children }: { children: ReactNode }) {

    useEffect(() => {
        setPersistence(auth, browserLocalPersistence).catch(console.error);
        getRedirectResult(auth).catch(() => {});
        initAuthListener();
    }, []);

    return <>{children}</>;
}
