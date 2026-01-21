import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    query,
    where,
} from "firebase/firestore";
import { db } from "./firebase";
import { Event, EventInput } from "@/types/event";

export const getEvents = async (
    uid: string,
    groupId: string | null
): Promise<Event[]> => {
    const q = query(
        collection(db, "events"),
        where("uid", "==", uid),
        where("groupId", "==", groupId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Event, "id">),
    }));
};

export const addEvent = async (data: EventInput) => {
    await addDoc(collection(db, "events"), {
        ...data,
        createdAt: new Date(),
    });
};

export const deleteEvent = async (id: string) => {
    await deleteDoc(doc(db, "events", id));
};