"use client";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { getEvents, addEvent, deleteEvent } from "@/lib/calendar";
import "react-calendar/dist/Calendar.css";
import styles from "@/styles/components/_calendar.module.scss";

interface Event {
    id: string;
    title: string;
    date: string;
}

export default function StudyCalendar() {
    const [date, setDate] = useState<Date | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [newTitle, setNewTitle] = useState("");
    const [mounted, setMounted] = useState(false);

    const fetchEvents = async () => {
        const data = await getEvents();
        setEvents(data as Event[]);
    };

    useEffect(() => {
        const init = async() => {
            setMounted(true);
            setDate(new Date());
            fetchEvents();
        }
        init();
    }, []);

    const handleAddEvent = async () => {
        if (!date || !newTitle) return;
        await addEvent({ title: newTitle, date: date.toISOString() });
        setNewTitle("");
        fetchEvents();
    };

    const handleDeleteEvent = async (id: string) => {
        await deleteEvent(id);
        fetchEvents();
    };

    if (!mounted || !date) return null;

    return (
        <div className={styles.calendar}>
            <Calendar
                onChange={(value) => setDate(value as Date)}
                value={date}
            />
            
            <p>선택된 날짜: {date.toDateString()}</p>

            <input
                type="text"
                placeholder="일정 제목"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
            />
            <button onClick={handleAddEvent}>추가</button>

            <ul>
                {events
                    .filter((e) => e.date.slice(0, 10) === date.toISOString().slice(0, 10))
                    .map((e) => (
                        <li key={e.id}>
                        {e.title}
                        <button onClick={() => handleDeleteEvent(e.id!)}>삭제</button>
                        </li>
                ))}
            </ul>
        </div>
    );
}