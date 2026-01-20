"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function StudyCalendar() {
    const [date, setDate] = useState<Date | null>(new Date());

    return (
        <div className="calendar-container">
            <Calendar onChange={(value) => setDate(value as Date)} value={date} />
            <p>선택된 날짜: {date?.toDateString()}</p>
        </div>
    );
}
