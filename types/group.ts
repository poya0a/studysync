export interface Group {
    id: string;
    name: string;
    inviteCode: string;
    ownerId: string;
    members: string[];
    createdAt: Date;
}