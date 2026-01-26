import {
    collection,
    addDoc,
    setDoc,
    getDoc,
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

export async function createGroup(
    name: string,
    uid: string
): Promise<{ id: string; inviteCode: string }> {
    const inviteCode = Math.random().toString(36).slice(2, 12).toUpperCase();

    const docRef = await addDoc(collection(db, "groups"), {
        name,
        inviteCode,
        ownerId: uid,
        members: { [uid]: true },
        createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, "groupInvites", inviteCode), {
        groupId: docRef.id,
        createdAt: serverTimestamp(),
        expiresAt: null,
    });
    
    return {
        id: docRef.id,
        inviteCode,
    };
}

export async function getMyGroups(uid: string): Promise<Group[]> {
    const q = query(
        collection(db, "groups"),
        where(`members.${uid}`, "==", true)
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

export async function joinGroupByCode(
    code: string,
    uid: string
): Promise<{ id: string; inviteCode: string }> {
    const inviteSnap = await getDoc(doc(db, "groupInvites", code));

    if (!inviteSnap.exists()) {
        throw new Error("존재하지 않는 초대 코드");
    }

    const { groupId } = inviteSnap.data();

    try {
        await updateDoc(doc(db, "groups", groupId), {
            [`members.${uid}`]: true,
        });
    } catch (error) {
        console.log(error)
    }

    return {
        id: groupId,
        inviteCode: code,
    };
}

export async function deleteGroup(groupId: string) {
    const groupRef = doc(db, "groups", groupId);
    const snap = await getDoc(groupRef);

    if (!snap.exists()) return;

    const { inviteCode } = snap.data();

    await deleteDoc(groupRef);

    if (inviteCode) {
        await deleteDoc(doc(db, "groupInvites", inviteCode));
  }
}