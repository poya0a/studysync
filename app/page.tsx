"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Login from "@/components/Login";
import StudyCalendar from "@/components/Calendar";
import styles from "@/styles/pages/_studySync.module.scss";

export default function StudySyncPage() {
    const router = useRouter();

    return (
        <>
            <Header />
                <Login />
                <StudyCalendar />
            <Footer />
        </>
    );
}