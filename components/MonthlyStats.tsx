"use client";
import { Event } from "@/types/event";

export default function MonthlyStats({ events }: { events: Event[] }) {
    const now = new Date();

    const count = events.filter((e) => {
        const d = new Date(e.date);
        return (
            d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth()
        );
    }).length;

    return <p>이번 달 스터디 참여: {count}회</p>;
}