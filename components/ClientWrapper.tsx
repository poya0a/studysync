"use client";
import { ReactNode, useEffect } from "react";
import { initAuthListener } from "@/lib/authListener";

export default function ClientWrapper({ children }: { children: ReactNode }) {
    useEffect(() => {
        const setHeight = () => {
            const scrollPos = window.scrollY;
            document.documentElement.style.setProperty('--height', `${window.innerHeight}px`);
            window.scrollTo({ top: scrollPos });
        };

        setHeight();
        window.addEventListener('resize', setHeight);
        return () => window.removeEventListener('resize', setHeight);
    }, []);

    useEffect(() => {
        initAuthListener();
    }, []);

    return <>{children}</>;
}
