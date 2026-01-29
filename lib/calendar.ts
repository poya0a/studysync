import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    query,
    where,
    QueryDocumentSnapshot,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Event, EventBase } from "@/types/event";

export type EventCountItem = Pick<
    EventBase,
    "uid" | "groupId" | "title" | "date" | "color"
>;

export type EventBaseMap = Record<string, EventCountItem[]>;

export const getEventCounts = async (
    ownerId: string,
    groupId: string | "PERSONAL"
): Promise<EventBaseMap> => {
    const q =
        groupId === "PERSONAL"
            ? query(
                collection(db, "events"),
                where("uid", "==", ownerId),
                where("groupId", "==", "PERSONAL")
            )
            : query(
                collection(db, "events"),
                where("groupId", "==", groupId)
            );

    const snap = await getDocs(q);
    const map: EventBaseMap = {};

    snap.forEach((d) => {
        const data = d.data();
        const dateKey = data.dateKey as string | undefined;
        if (!dateKey) return;

        (map[dateKey] ??= []).push({
            uid: data.uid,
            groupId: data.groupId,
            title: data.title,
            date: data.date,
            color: data.color,
        });
    });

    return map;
};

export const getEvents = async (
    dateKey: string,
    ownerId: string,
    groupId: string | "PERSONAL"
): Promise<Event[]> => {
    const q =
        groupId === "PERSONAL"
            ? query(
                collection(db, "events"),
                where("uid", "==", ownerId),
                where("groupId", "==", "PERSONAL"),
                where("dateKey", "==", dateKey)
            )
            : query(
                collection(db, "events"),
                where("groupId", "==", groupId),
                where("dateKey", "==", dateKey)
            );
    const snap = await getDocs(q);

    return snap.docs.map(mapEvent);
};

export const addEvent = async (data: EventBase) => {
    const dateKey = data.date.slice(0, 10);

    await addDoc(collection(db, "events"), {
        ...data,
        dateKey,
        createdAt: serverTimestamp(),
    });
};

export const deleteEvent = async (eventId: string) => {
    await deleteDoc(doc(db, "events", eventId));
};

function mapEvent(
    d: QueryDocumentSnapshot
): Event {
    const data = d.data() as EventBase;

    return {
        id: d.id,
        ...data,
    };
}