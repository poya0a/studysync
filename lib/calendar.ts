import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    query,
    where,
    getDoc,
    QueryDocumentSnapshot,
    DocumentData
} from "firebase/firestore";
import { db } from "./firebase";
import { Event, EventInput, EventBase } from "@/types/event";

export type EventBaseMap = Record<string, EventBase[]>;

export const getEventCounts = async (
    id: string,
    type: "personal" | "group"
): Promise<EventBaseMap> => {
    let q;

    if (type === "personal") {
        q = query(
            collection(db, "events"),
            where("uid", "==", id),
            where("groupId", "==", null)
        );
    } else {
        q = query(
            collection(db, "events"),
            where("groupId", "==", id)
        );
    }

    const snap = await getDocs(q);

    const map: EventBaseMap = {};

    snap.docs.forEach((doc) => {
        const data = doc.data();
        const dateKey = data.dateKey;

        if (!dateKey) return;

        if (!map[dateKey]) {
            map[dateKey] = [];
        }

        map[dateKey].push({
            title: data.title,
            date: data.date,
            color: data.color,
        });
    });

    return map;
};

export const getEvents = async (
    dateKey: string,
    id: string,
    type: "personal" | "group"
): Promise<Event[]> => {
    let q;

    if (type === "personal") {
        q = query(
            collection(db, "events"),
            where("uid", "==", id),
            where("groupId", "==", null),
            where("dateKey", "==", dateKey)
        );
    } else {
        q = query(
            collection(db, "events"),
            where("groupId", "==", id),
            where("dateKey", "==", dateKey)
        );
    }

    const snap = await getDocs(q);
    return snap.docs.map(mapEvent);
};

export const addEvent = async (data: EventInput) => {
    if (data.groupId !== null) {
        const snap = await getDoc(doc(db, "groups", data.groupId));

        if (!snap.exists()) {
            throw new Error("그룹이 존재하지 않습니다.");
        }

        const group = snap.data();

        if (!group.members?.[data.uid]) {
            throw new Error("그룹 멤버만 생성할 수 있습니다.");
        }
    }

    const dateKey = data.date.slice(0, 10);

    await addDoc(collection(db, "events"), {
        ...data,
        dateKey,
        createdAt: new Date(),
    });
};

export const deleteEvent = async (
    eventId: string,
    requesterUid: string
) => {
    const ref = doc(db, "events", eventId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        throw new Error("일정이 존재하지 않습니다.");
    }

    const event = snap.data();

    if (event.groupId === null) {
        if (event.uid !== requesterUid) {
            throw new Error("본인이 작성한 일정만 삭제할 수 있습니다.");
        }
    }

    if (event.groupId !== null) {
        const snap = await getDoc(doc(db, "groups", event.groupId));

        if (!snap.exists()) {
            throw new Error("그룹이 존재하지 않습니다.");
        }

        const group = snap.data();

        if (!group.members?.[requesterUid]) {
            throw new Error("본인이 작성한 일정만 삭제할 수 있습니다.");
        }
    }

    await deleteDoc(ref);
};

function mapEvent(d: QueryDocumentSnapshot<DocumentData>): Event {
    const data = d.data();

    return {
        id: d.id,
        title: data.title,
        date: data.date,
        uid: data.uid,
        groupId: data.groupId,
        color: data.color,
    };
}