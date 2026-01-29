import { create } from "zustand";
import { Timestamp } from "firebase/firestore";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export type UserData = {
    uid: string | null;
    name: string | null;
    email: string | null;
    role: UserRole;
    createdAt: Timestamp;
    lastLogin: Timestamp;
};

type UserStore = {
    user: UserData;
    setUser: (data: UserData) => void;
    clearUser: () => void;
};

const initialUser: UserData = {
    uid: null,
    name: null,
    email: null,
    role: "USER",
    createdAt: Timestamp.now(),
    lastLogin: Timestamp.now()
};

export const useUserStore = create<UserStore>((set) => ({
    user: initialUser,

    setUser: (data) => set({ user: data }),

    clearUser: () => set({ user: initialUser }),
}));