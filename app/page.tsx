"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Login from "@/components/Login";
import StudyCalendar from "@/components/Calendar";
import styles from "@/styles/pages/_studySync.module.scss";

export default function StudySyncPage() {
    return (
        <>
            <Header />
                <div className={styles.container}>
                    <div className={styles.stydySyncHeader}>
                        <h1>Study Sync</h1>
                        <p className={styles.subtitle}>스터디 일정 관리 캘린더</p>
                    </div>
                    <Login />
                    <StudyCalendar />
                </div>
            <Footer />
        </>
    );
}