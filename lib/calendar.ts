import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
} from "firebase/firestore";
import { db } from "./firebase";

export interface EventData {
    id?: string;
    title: string;
    date: string;
}

const eventsCollection = collection(db, "events");

export const getEvents = async (): Promise<EventData[]> => {
    const q = query(eventsCollection);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as EventData[];
};

export const addEvent = async (event: EventData) => {
    await addDoc(eventsCollection, event);
};

export const deleteEvent = async (id: string) => {
    const docRef = doc(db, "events", id);
    await deleteDoc(docRef);
};