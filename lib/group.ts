import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
    arrayUnion,
    doc,
} from "firebase/firestore";
import { db } from "./firebase";
import { Group } from "@/types/group";

export const getMyGroups = async (uid: string): Promise<Group[]> => {
    const q = query(
        collection(db, "groups"),
        where("members", "array-contains", uid)
    );

    const snap = await getDocs(q);

    return snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Group, "id">),
    }));
};

export const createGroup = async (name: string, uid: string) => {
    const inviteCode = Math.random().toString(36).slice(2, 8);

    await addDoc(collection(db, "groups"), {
        name,
        inviteCode,
        ownerId: uid,
        members: [uid],
        createdAt: new Date(),
    });
};

export const joinGroupByCode = async (code: string, uid: string) => {
    const q = query(collection(db, "groups"), where("inviteCode", "==", code));
    const snap = await getDocs(q);

    if (snap.empty) throw new Error("그룹 없음");

    const groupDoc = snap.docs[0];
    await updateDoc(doc(db, "groups", groupDoc.id), {
        members: arrayUnion(uid),
    });
};