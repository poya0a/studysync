import { db } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

const eventsCol = collection(db, "events");

export const addEvent = async (event: { title: string; date: string }) => {
    await addDoc(eventsCol, event);
};

export const getEvents = async () => {
    const snapshot = await getDocs(eventsCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteEvent = async (id: string) => {
    await deleteDoc(doc(db, "events", id));
};
