import type { Event } from "@/types/event";

export const getMonthlyStats = (
    events: Event[],
    year: number,
    month: number
) => {
    return events.filter((e) => {
        const d = new Date(e.date);
        return (
            d.getFullYear() === year &&
            d.getMonth() === month
        );
    }).length;
};
