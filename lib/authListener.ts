import { onAuthStateChanged } from "firebase/auth";
import { auth, db, USER_ROLES } from "@/lib/firebase";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useUserStore, UserRole } from "@/store/useUserStore";

export function initAuthListener() {
    const { setUser, clearUser } = useUserStore.getState();

    onAuthStateChanged(auth, (user) => {
        if (user) {

            const handleUser = async () => {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                let role: UserRole = "USER";
                let createdAt: Date = new Date();

                if (!userSnap.exists()) {
                    if (USER_ROLES[user.uid]) {
                        role = USER_ROLES[user.uid];
                    }

                    await setDoc(userRef, {
                        email: user.email,
                        name: user.displayName,
                        role,
                        createdAt: serverTimestamp,
                        lastLogin: serverTimestamp
                    });
                    createdAt = new Date();
                } else {
                    const data = userSnap.data();
                    role = data.role;
                    createdAt = data.createdAt?.toDate?.() ?? new Date();

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
                    lastLogin: new Date(),
                });
            }
            handleUser();
        } else {
            clearUser();
        }
    });
}