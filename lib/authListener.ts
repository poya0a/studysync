import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUserStore } from "@/store/useUserStore";

export function initAuthListener() {
    const { setUser, clearUser } = useUserStore.getState();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            setUser({
                uid: user.uid,
                name: user.displayName ?? "",
                email: user.email ?? "",
            });
        } else {
            clearUser();
        }
    });
}