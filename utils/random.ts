export function randomPastelColor(): string {
    const r = Math.floor(Math.random() * 128 + 127);
    const g = Math.floor(Math.random() * 128 + 127);
    const b = Math.floor(Math.random() * 128 + 127);
    return `rgb(${r}, ${g}, ${b})`;
}

export function randomUid(existing: string[] = []): string {
    let uid: string;
    do {
        uid = crypto.randomUUID();
    } while (existing.includes(uid));
    return uid;
}
