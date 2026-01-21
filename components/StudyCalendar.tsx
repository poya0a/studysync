"use client";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { getEvents, addEvent, deleteEvent } from "@/lib/calendar";
import { Event } from "@/types/event";
import { useUserStore } from "@/store/useUserStore";
import { randomPastelColor } from "@/utils/random";
import "react-calendar/dist/Calendar.css";
import styles from "@/styles/components/_studyCalendar.module.scss";

const TITLE_MAX = 50;

type ConfirmAlertState = {
    open: boolean;
    message: string;
    onConfirm?: () => void;
};

function formatKoreanDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}년 ${month}월 ${day}일`;
}

export default function StudyCalendar({ groupId }: { groupId: string | null }) {
    const { user } = useUserStore();
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [title, setTitle] = useState<string>("");
    const [showAlert, setShowAlert] = useState<string>("");
    const [confirmAlert, setConfirmAlert] = useState<ConfirmAlertState>({
        open: false,
        message: "",
    });

    useEffect(() => {
        if (!user.uid) return;

        let ignore = false;

        (async () => {
            const data = await getEvents(user.uid!, groupId);
            if (!ignore) {
                setEvents(data as Event[]);
            }
        })();

        return () => {
            ignore = true;
        };
    }, [user.uid, groupId]);

    const handleAdd = async () => {
        if (!user.uid) return setShowAlert("로그인 후 일정 등록이 가능합니다.");
        if (!title.trim()) return setShowAlert("일정 제목을 입력해 주세요.");

        await addEvent({
            title,
            date: date.toISOString(),
            uid: user.uid!,
            groupId,
            color: randomPastelColor()
        });
        setTitle("");
        setShowAlert("일정이 등록되었습니다.");
    };

    const eventsByDate = events.reduce<Record<string, Event[]>>((acc, e) => {
        const key = e.date.slice(0, 10);
        if (!acc[key]) acc[key] = [];
        acc[key].push(e);
        return acc;
    }, {});

    useEffect(() => {
        if (showAlert && showAlert !== "") {
            const timer = setTimeout(() => setShowAlert(""), 2000);
            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    const openConfirmAlert = (
        message: string,
        onConfirm: () => void
    ) => {
        setConfirmAlert({
            open: true,
            message,
            onConfirm,
        });
    };

    const closeConfirmAlert = () => {
        setConfirmAlert(prev => ({
            ...prev,
            open: false,
        }));
    };

    return (
        <>
            <button
                type="button"
                className={styles.todayButton}
                onClick={() => setDate(new Date())}
            >
                오늘
            </button>
            <div className={styles.calendar}>
                <Calendar
                    locale="ko-KR"
                    value={date}
                    onChange={(v) => setDate(v as Date)}
                    tileContent={({ date }) => {
                        const day = date.toISOString().slice(0, 10);
                        const dayEvents = eventsByDate[day];
                        if (!dayEvents || dayEvents.length === 0) return null;
                        const visible = dayEvents.slice(0, 3);
                        const overflow = dayEvents.length - 3;
                        return (
                            <div className={styles.dots}>
                                {visible.map((e) => (
                                    <span
                                        key={e.id}
                                        className={styles.dot}
                                        style={{ backgroundColor: e.color }}
                                    />
                                ))}
                                {overflow > 0 && (
                                    <span className={styles.more}>+</span>
                                )}
                            </div>
                        );
                    }}
                />
                
                <div className={styles.dateContainer}>
                    <p>선택한 날짜</p>
                    <p className={styles.selectedDate}>{formatKoreanDate(date)}</p>
                </div>
                
                <div className={styles.titleContainer}>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        className={styles.scheduleTitle}
                        placeholder="일정 제목"
                        maxLength={TITLE_MAX}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <button 
                        className={styles.registrationButton} 
                        onClick={handleAdd}
                    >
                        등록
                    </button>
                </div>
                {events.length > 0 &&
                    <ul className={styles.eventList}>
                        {events
                            .filter((e) => e.date.slice(0, 10) === date.toISOString().slice(0, 10))
                            .map((e) => (
                                <li key={e.id} className={styles.eventItem}>
                                    <span
                                        className={styles.colorDot}
                                        style={{ backgroundColor: e.color }}
                                    />
                                    <span className={styles.title}>{e.title}</span>
                                    <button 
                                        className={styles.deleteButton} 
                                        onClick={() => openConfirmAlert("일정을 삭제하시겠습니까?", () => deleteEvent(e.id))}
                                    >
                                        삭제
                                    </button>
                                </li>
                        ))}
                    </ul>
                }
            </div>
            {confirmAlert.open &&
                <div className={styles.alertOverlay}>
                    <div className={styles.alert}>
                        <div className={styles.alertHeader}>안내</div>
                        <p>{confirmAlert.message}</p>
                        <div className={styles.buttonContainer}>
                            <button className={styles.cancelButton} onClick={closeConfirmAlert}>취소</button>
                            <button className={styles.approveButton} onClick={confirmAlert.onConfirm}>확인</button>
                        </div>
                    </div>
                </div>
            }
            {showAlert && showAlert !== "" &&
                <div className={styles.alert}>
                    <p>{showAlert}</p>
                </div>
            }
        </>
    );
}