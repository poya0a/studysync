import { create } from "zustand";

export type UserData = {
    uid: string | null;
    name: string | null;
    email: string | null;
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
};

export const useUsertStore = create<UserStore>((set) => ({
    user: initialUser,

    setUser: (data) => set({ user: data }),

    clearUser: () => set({ user: initialUser }),
}));