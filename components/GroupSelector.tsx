"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { Group } from "@/types/group";
import { getMyGroups } from "@/lib/group";
import { useUserStore } from "@/store/useUserStore";
import styles from "@/styles/components/_groupSelector.module.scss";

type Props = {
    value: {
        id: string,
        inviteCode: string
    } | null;
    onChange: (
        groupId: {
            id: string,
            inviteCode: string
        } | null
    ) => void;
};

export default function GroupSelector({ value, onChange }: Props) {
    const { user } = useUserStore();
    const [groups, setGroups] = useState<Group[]>([]);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user.uid) return;

        let ignore = false;

        (async () => {
            const data = await getMyGroups(user.uid!);
            if (!ignore) setGroups(data);
        })();

        return () => {
            ignore = true;
        };
    }, [user.uid, value]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const selectedLabel = useMemo(() => {
        if (value === null) return "개인 일정";
        return groups.find((g) => g.id === value.id)?.name ?? "그룹 선택";
    }, [value, groups]);

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
                        className={value === null ? styles.active : ""}
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
                            className={value?.id === g.id ? styles.active : ""}
                            onClick={() => {
                                onChange(g);
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