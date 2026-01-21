export type EventInput = {
    title: string;
    date: string;
    uid: string;
    groupId: string | null;
    color: string;
};

export type Event = EventInput & {
    id: string;
};