export type EventBase = {
    uid: string;
    groupId: string | "PERSONAL";
    title: string;
    date: string;
    color: string;
};

export type Event = EventBase & {
    id: string;
    authorName?: string;
};