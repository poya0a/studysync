import { onAuthStateChanged, getRedirectResult, User } from "firebase/auth";
import { auth, db, USER_ROLES } from "@/lib/firebase";
import { doc, setDoc, getDoc, updateDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { useUserStore, UserRole, UserData } from "@/store/useUserStore";

export async function initAuthListener() {
    const { setUser, clearUser } = useUserStore.getState();

    try {
        const result = await getRedirectResult(auth);
        const redirectUser: User | null = result?.user ?? null;

        if (redirectUser) {
            await handleUserDocument(redirectUser, setUser);
        }
    } catch (error) {
        console.error("리다이렉트 로그인 에러:", error);
    }

    onAuthStateChanged(auth, async (user: User | null) => {
        if (!user) {
            clearUser();
            return;
        }
        await handleUserDocument(user, setUser);
    });
}

async function handleUserDocument(user: User, setUser: (user: UserData) => void) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    let role: UserRole = "USER";
    let createdAt: Timestamp;

    if (!userSnap.exists()) {
        if (USER_ROLES[user.uid]) {
            role = USER_ROLES[user.uid];
        }
        await setDoc(userRef, {
            email: user.email,
            name: user.displayName,
            role,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
        });
        createdAt = Timestamp.now();
    } else {
        const data = userSnap.data();
        role = data.role;
        createdAt = data.createdAt ?? Timestamp.now();
        await updateDoc(userRef, {
            lastLogin: serverTimestamp(),
        });
    }

    setUser({
        uid: user.uid,
        name: user.displayName ?? "",
        email: user.email ?? "",
        role,
        createdAt: createdAt,
        lastLogin: Timestamp.now(),
    });
}