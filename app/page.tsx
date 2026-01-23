"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GroupSelector from "@/components/GroupSelector";
import StudyCalendar from "@/components/StudyCalendar";
import { useUserStore } from "@/store/useUserStore";
import styles from "@/styles/pages/_studySync.module.scss";

export default function StudySyncPage() {
    const { user } = useUserStore();
    const [selectedGroup, setSelectedGroup] = useState<{
        id: string,
        inviteCode: string
    } | null>(null);

    return (
        <>
            <Header />
                <div className={styles.container}>
                    <div className={styles.stydySyncHeader}>
                        <h1>Study Sync</h1>
                        <p className={styles.subtitle}>스터디 일정 관리 캘린더</p>
                    </div>
                    {user.uid && 
                        <GroupSelector
                            value={selectedGroup}
                            onChange={setSelectedGroup}
                        />
                    }
                    <StudyCalendar 
                        selectedGroup={selectedGroup}
                        onGroupChange={(data) => setSelectedGroup(data)}
                    />
                </div>
            <Footer />
        </>
    );
}