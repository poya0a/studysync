"use client";
import { useEffect, useState, useRef } from "react";
import { Group } from "@/types/group";
import { getMyGroups } from "@/lib/group";
import { useUserStore } from "@/store/useUserStore";
import styles from "@/styles/components/_groupSelector.module.scss";

type Props = {
    value: string | null;
    onChange: (groupId: string | null) => void;
};

export default function GroupSelector({ value, onChange }: Props) {
    const { user } = useUserStore();
    const [groups, setGroups] = useState<Group[]>([]);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user.uid) return;

        let cancelled = false;

        (async () => {
            const data = await getMyGroups(user.uid!);
            if (!cancelled) {
                setGroups(data);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [user.uid]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const selectedLabel =
        value === null
            ? "개인 일정"
            : groups.find((g) => g.id === value)?.name ?? "그룹 선택";

    return (
        <div className={styles.container} ref={ref}>
            <button
                type="button"
                className={styles.trigger}
                onClick={() => setOpen((v) => !v)}
            >
                {selectedLabel}
                <span className={styles.arrow} />
            </button>

            {open && (
                <ul className={styles.dropdown}>
                    <li
                        className={!value ? styles.active : ""}
                        onClick={() => {
                            onChange(null);
                            setOpen(false);
                        }}
                    >
                        개인 일정
                    </li>

                    {groups.map((g) => (
                        <li
                            key={g.id}
                            className={value === g.id ? styles.active : ""}
                            onClick={() => {
                                onChange(g.id);
                                setOpen(false);
                            }}
                        >
                            {g.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}