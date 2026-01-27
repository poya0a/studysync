import { onAuthStateChanged } from "firebase/auth";
import { auth, db, USER_ROLES } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useUserStore, UserRole } from "@/store/useUserStore";

export function initAuthListener() {
    const { setUser, clearUser } = useUserStore.getState();

    onAuthStateChanged(auth, (user) => {
        if (user) {

            const handleUser = async () => {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                let role: UserRole = "USER";
                if (USER_ROLES[user.uid]) role = USER_ROLES[user.uid];

                if (!userSnap.exists()) {
                    await setDoc(userRef, {
                        email: user.email,
                        name: user.displayName,
                        role,
                    });
                } else {
                    if (role === "SUPER_ADMIN" && userSnap.data().role !== "SUPER_ADMIN") {
                        await setDoc(userRef, { ...userSnap.data(), role }, { merge: true });
                    }
                    role = userSnap.data().role;
                }
                setUser({
                    uid: user.uid,
                    name: user.displayName ?? "",
                    email: user.email ?? "",
                    role
                });
            }
            handleUser();
        } else {
            clearUser();
        }
    });
}