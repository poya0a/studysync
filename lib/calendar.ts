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
import { Event, EventInput } from "@/types/event";

const assertGroupOwner = async (groupId: string, uid: string) => {
    const snap = await getDoc(doc(db, "groups", groupId));

    if (!snap.exists()) {
        throw new Error("그룹이 존재하지 않습니다.");
    }

    const group = snap.data();

    if (group.ownerId !== uid) {
        throw new Error("그룹 생성자만 수행할 수 있습니다.");
    }
};

export const getEvents = async (
    id: string,
    type: "personal" | "group",
): Promise<Event[]> => {
    let setQuery;
    const events: Event[] = [];

    if (type === "personal") {
        setQuery = query(
            collection(db, "events"),
            where("uid", "==", id),
            where("groupId", "==", null)
        );
    } else {
        setQuery = query(
            collection(db, "events"),
            where("groupId", "==", id)
        );
    }

    const snap = await getDocs(setQuery);
    snap.docs.forEach((d) => {
        events.push(mapEvent(d));
    });

    return events;
};

export const addEvent = async (data: EventInput) => {
    if (data.groupId !== null) {
        await assertGroupOwner(data.groupId, data.uid);
    }

    await addDoc(collection(db, "events"), {
        ...data,
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
            throw new Error("본인 일정만 삭제할 수 있습니다.");
        }
    }

    if (event.groupId !== null) {
        await assertGroupOwner(event.groupId, requesterUid);
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