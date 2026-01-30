import { onAuthStateChanged } from "firebase/auth";
import { auth, db, USER_ROLES } from "@/lib/firebase";
import { doc, setDoc, getDoc, updateDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { useUserStore, UserRole } from "@/store/useUserStore";

export function initAuthListener() {
    const { setUser, clearUser } = useUserStore.getState();
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            clearUser();
            return;
        }
        
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
    });
}