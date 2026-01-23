"use client";
import { ReactNode, useEffect } from "react";
import { initAuthListener } from "@/lib/authListener";

export default function ClientWrapper({ children }: { children: ReactNode }) {

    useEffect(() => {
        initAuthListener();
    }, []);

    return <>{children}</>;
}
