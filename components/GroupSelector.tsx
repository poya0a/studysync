"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { Group, PERSONAL_GROUP } from "@/types/group";
import { getMyGroups } from "@/lib/group";
import { useUserStore } from "@/store/useUserStore";
import styles from "@/styles/components/_groupSelector.module.scss";

type Props = {
    value: Group;
    onChange: (group: Group) => void;
};

export default function GroupSelector({ value, onChange }: Props) {
    const { user } = useUserStore();
    const [groups, setGroups] = useState<Group[]>([]);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user.uid) return;

        getMyGroups(user.uid).then(setGroups);
    }, [user.uid]);

    useEffect(() => {
        if (groups.some((g) => g.id === value.id) || value.id === "PERSONAL") return;

        Promise.resolve().then(() => {
            setGroups((prev) => [...prev, value]);
        });
    }, [value]);

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
        if (value.id === "PERSONAL") return "개인 일정";
        return value.name;
    }, [value]);

    return (
        <div className={styles.container} ref={ref}>
            <button
                type="button"
                className={styles.trigger}
                onClick={() => setOpen((v) => !v)}
            >
                {selectedLabel}
                <span className={styles.arrow}></span>
            </button>

            {open && (
                <ul className={styles.dropdown}>
                    <li
                        key="personal"
                        className={value.id === "PERSONAL" ? styles.active : ""}
                        onClick={() => {
                            onChange(PERSONAL_GROUP);
                            setOpen(false);
                        }}
                    >
                        개인 일정
                    </li>

                    {groups.map((g, i) => (
                        <li
                            key={`group-item-${i}`}
                            className={value.id === g.id ? styles.active : ""}
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