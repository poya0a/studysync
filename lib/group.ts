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
    arrayUnion,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Group, GroupType } from "@/types/group";

export async function createGroup(
    name: string,
    uid: string
): Promise<Group> {
    const inviteCode = Math.random()
        .toString(36)
        .slice(2, 12)
        .toUpperCase();

    const groupRef = await addDoc(collection(db, "groups"), {
        name,
        inviteCode,
        ownerId: uid,
        members: [uid],
        createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, "groupInvites", inviteCode), {
        groupId: groupRef.id,
        createdAt: serverTimestamp(),
        expiresAt: null,
    });

    return {
        id: groupRef.id,
        name,
        type: "group",
        inviteCode,
    };
}

export async function getMyGroups(uid: string): Promise<Group[]> {
    const q = query(
        collection(db, "groups"),
        where("members", "array-contains", uid)
    );

    const snap = await getDocs(q);

    return snap.docs.map((d) => {
        const data = d.data();
        const groupType: GroupType = "group";
        return {
            id: d.id,
            name: data.name,
            type: groupType,
            inviteCode: data.inviteCode,
        };
    }).reverse();
}

export async function joinGroupByCode(
    code: string,
    uid: string
): Promise<Group> {
    const inviteRef = doc(db, "groupInvites", code);
    const inviteSnap = await getDoc(inviteRef);

    if (!inviteSnap.exists()) {
        throw new Error("존재하지 않는 초대 코드입니다.");
    }

    const { groupId, expiresAt } = inviteSnap.data();

    if (expiresAt && expiresAt.toDate() < new Date()) {
        throw new Error("만료된 초대 코드입니다.");
    }

    const groupRef = doc(db, "groups", groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
        throw new Error("그룹이 존재하지 않습니다.");
    }

    const group = groupSnap.data();

    if (group.members.includes(uid)) {
        throw new Error("이미 참여한 그룹입니다.");
    }

    await updateDoc(groupRef, {
        members: arrayUnion(uid),
    });

    return {
        id: groupRef.id,
        name: group.name,
        type: "group",
        inviteCode: group.inviteCode,
    };
}

export async function deleteGroup(groupId: string) {
    const groupRef = doc(db, "groups", groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) return;

    const { inviteCode } = groupSnap.data();

    if (inviteCode) {
        await deleteDoc(doc(db, "groupInvites", inviteCode));
    }

    await deleteDoc(groupRef);
}