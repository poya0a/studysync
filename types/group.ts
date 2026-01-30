export type GroupType = "personal" | "group";

export type Group = {
    id: string;
    name: string;
    type: GroupType;
    inviteCode?: string;
};

export const PERSONAL_GROUP: Group = {
    id: "PERSONAL",
    name: "개인 일정",
    type: "personal",
};