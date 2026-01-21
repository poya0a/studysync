import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Group } from "@/types/group";

export async function createGroup(name: string, uid: string) {
    const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();

    await addDoc(collection(db, "groups"), {
        name,
        inviteCode,
        ownerId: uid,
        members: [uid],
        createdAt: serverTimestamp(),
    });
}

export async function getMyGroups(uid: string): Promise<Group[]> {
    const q = query(
        collection(db, "groups"),
        where("members", "array-contains", uid)
    );

    const snap = await getDocs(q);

    return snap.docs.map((d) => {
        const data = d.data();

        return {
            id: d.id,
            name: data.name,
            inviteCode: data.inviteCode,
            ownerId: data.ownerId,
            members: data.members,
            createdAt: data.createdAt,
        } as Group;
    });
}

export async function joinGroupByCode(code: string, uid: string) {
    const q = query(
        collection(db, "groups"),
        where("inviteCode", "==", code)
    );
    const snap = await getDocs(q);

    if (snap.empty) throw new Error("존재하지 않는 초대 코드");

    const groupDoc = snap.docs[0];
    const data = groupDoc.data();

    if (data.members.includes(uid)) return;

    await updateDoc(doc(db, "groups", groupDoc.id), {
        members: [...data.members, uid],
    });
}

export async function deleteGroup(groupId: string) {
    await deleteDoc(doc(db, "groups", groupId));
}