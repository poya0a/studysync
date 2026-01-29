"use client";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { EventBaseMap, getEventCounts, getEvents, addEvent, deleteEvent } from "@/lib/calendar";
import { createGroup, joinGroupByCode } from "@/lib/group";
import { Group, PERSONAL_GROUP } from "@/types/group";
import type { Event } from "@/types/event";
import { useUserStore } from "@/store/useUserStore";
import { randomPastelColor } from "@/utils/random";
import "react-calendar/dist/Calendar.css";
import styles from "@/styles/components/_studyCalendar.module.scss";

type Props = {
    selectedGroup: Group;
    onGroupChange: (group: Group) => void;
};

const TITLE_MAX = 50;

type InputPopupState = {
    open: boolean;
    type: "create" | "join" | "";
};

type ConfirmAlertState = {
    open: boolean;
    message: string;
    onConfirm?: () => void;
};

const toDateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function formatKoreanDate(date: Date): string {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export default function StudyCalendar({ selectedGroup, onGroupChange }: Props) {
    const { user } = useUserStore();
    const [date, setDate] = useState(new Date());
    const [eventCountMap, setEventCountMap] = useState<EventBaseMap>({});
    const [events, setEvents] = useState<Event[]>([]);
    const [title, setTitle] = useState<string>("");
    const [inputValue, setInputValue] = useState<string>("");
    const [inputPopup, setInputPopup] = useState<InputPopupState>({
        open: false,
        type: "",
    });
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [showAlert, setShowAlert] = useState<string>("");
    const [confirmAlert, setConfirmAlert] = useState<ConfirmAlertState>({
        open: false,
        message: "",
    });

    useEffect(() => {
        if (!user.uid) {
            onGroupChange(PERSONAL_GROUP);
            Promise.resolve().then(() => setEventCountMap({}));
            return;
        };

        (async () => {
            try {
                const map = await getEventCounts(
                    user.uid!,
                    selectedGroup.id
                );
                setEventCountMap(map);
            } catch {
                setShowAlert("일정 목록을 가져올 수 없습니다.");
            }
        })();
    }, [user.uid, selectedGroup]);

    useEffect(() => {
        if (!user.uid) {
            Promise.resolve().then(() => setEvents([]));
            return;
        };

        const dateKey = toDateKey(date);
        let ignore = false;

        (async () => {
            try {
                const data = await getEvents(
                    dateKey,
                    user.uid!,
                    selectedGroup.id
                );
                if (!ignore) setEvents(data);
            } catch {
                setShowAlert("일정을 가져올 수 없습니다.");
            }
        })();

        return () => {
            ignore = true;
        };
    }, [user.uid, selectedGroup, date]);

    const handleAdd = async () => {
        if (!user.uid) return setShowAlert("로그인 후 일정 등록이 가능합니다.");
        if (!title.trim()) return setShowAlert("일정 제목을 입력해 주세요.");

        try {
            await addEvent({
                title,
                date: toDateKey(date),
                uid: user.uid,
                groupId: selectedGroup.id,
                color: randomPastelColor(),
            });

            const dateKey = toDateKey(date);

            setEventCountMap(
                await getEventCounts(
                    user.uid, 
                    selectedGroup.id
                )
            );
            setEvents(
                await getEvents(
                    dateKey, 
                    user.uid,
                    selectedGroup.id
                )
            );
        } catch {
            setTitle("");
            return setShowAlert("일정 등록에 실패했습니다.");
        }
        setTitle("");
        setShowAlert("일정이 등록되었습니다.");
    };

    const openInputPopup = (type: "create" | "join") => {
        setInputPopup({ open: true, type });
        setInputValue("");
        setErrorMessage("");
    };

    const closeInputPopup = () => {
        setInputPopup({ open: false, type: "" });
    };

    const handleGroup = async () => {
        if (inputPopup.type === "") return;

        if (!inputValue.trim()) {
            return setErrorMessage(
                inputPopup.type === "create"
                    ? "그룹 이름을 입력해 주세요."
                    : "초대 코드를 입력해 주세요."
            );
        }

        let newGroup: Group;

        try {
            if (inputPopup.type === "create") {
                newGroup = await createGroup(inputValue, user.uid!);
            } else {
                newGroup = await joinGroupByCode(inputValue, user.uid!);
            }
            onGroupChange(newGroup);
            closeInputPopup();
        } catch {
            closeInputPopup();
            return setShowAlert(`그룹 
                ${inputPopup.type === "create"
                    ? "생성에"
                    : "가입에"
                }
                실패하였습니다.`);
        }

        setShowAlert("그룹이 변경되었습니다.");
    };

    const handleCodeCopy = async () => {
        if (!selectedGroup?.inviteCode) return setShowAlert("초대 코드가 존재하지 않습니다.");
        await navigator.clipboard.writeText(selectedGroup?.inviteCode);
        setShowAlert("링크가 복사되었습니다.");
    };

    const confirmDelete = (eventId: string) => {
        if (!user.uid) return;
        setConfirmAlert({
            open: true,
            message: "일정을 삭제하시겠습니까?",
            onConfirm: async () => {
                await deleteEvent(eventId);
                setConfirmAlert({ open: false, message: "" });

                const dateKey = toDateKey(date);
                setEventCountMap(await getEventCounts(user.uid!, selectedGroup?.id ?? "PERSONAL"));
                setEvents(await getEvents(dateKey, user.uid!, selectedGroup?.id ?? "PERSONAL"));
            },
        });
    };

    useEffect(() => {
        if (showAlert && showAlert !== "") {
            const timer = setTimeout(() => setShowAlert(""), 2000);
            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    const closeConfirmAlert = () => {
        setConfirmAlert(prev => ({
            ...prev,
            open: false,
        }));
    };

    return (
        <>
            <div className={styles.buttonContainer}>
                {user.uid &&
                    <> 
                        <button
                            type="button"
                            className={styles.groupCreateButton}
                            onClick={() => openInputPopup("create")}
                        >
                            그룹 생성
                        </button>
                        <button
                            type="button"
                            className={styles.groupJoinButton}
                            onClick={() => openInputPopup("join")}
                        >
                            그룹 참여
                        </button>
                        {selectedGroup.id !== "PERSONAL" &&
                            <button
                                type="button"
                                className={styles.codeCopyButton}
                                onClick={handleCodeCopy}
                            >
                                초대 코드 복사
                            </button>
                        }
                    </>
                }
            </div>
            <div className={styles.calendar}>
                <Calendar
                    locale="ko-KR"
                    value={date}
                    onChange={(v) => setDate(v as Date)}
                    tileContent={({ date: d }) => {
                        const key = toDateKey(d);
                        const items = eventCountMap[key];
                        if (!items) return null;
                        return (
                            <div className={styles.dots}>
                                {items.slice(0, 3).map((e, i) => (
                                    <span
                                        key={`event-dot-${e.date}-${i}`}
                                        className={styles.dot}
                                        style={{ backgroundColor: e.color }}
                                    ></span>
                                ))}
                                {items.length > 3 && (
                                    <span className={styles.more}>+</span>
                                )}
                            </div>
                        );
                    }}
                />
                
                <button
                    type="button"
                    className={styles.todayButton}
                    onClick={() => setDate(new Date())}
                >
                    오늘
                </button>

                <div className={styles.dateContainer}>
                    <p>선택한 날짜</p>
                    <p className={styles.selectedDate}>{formatKoreanDate(date)}</p>
                </div>
                
                <div className={styles.titleContainer}>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        className={styles.scheduleTitle}
                        placeholder="일정 제목"
                        maxLength={TITLE_MAX}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <button 
                        className={styles.registrationButton} 
                        onClick={handleAdd}
                    >
                        등록
                    </button>
                </div>
                {events.length > 0 &&
                    <ul className={styles.eventList}>
                        {events.map((e) => (
                            <li key={e.id} className={styles.eventItem}>
                                <span className={styles.colorDot} style={{ background: e.color }}></span>
                                <span className={styles.title}>{e.title}</span>
                                {e.uid === user.uid && 
                                    <button className={styles.deleteButton}  onClick={() => confirmDelete(e.id)}>삭제</button>
                                }
                            </li>
                        ))}
                    </ul>
                }
            </div>
            {inputPopup.open &&
                <div className={styles.alertOverlay}>
                    <div className={styles.alert}>
                        <div className={styles.alertHeader}>
                            {
                                inputPopup.type === "create" ?
                                "그룹 생성" :
                                "그룹 참여"
                            }
                        </div>
                        <div className={styles.inputText}>
                            <label htmlFor="groupInput">{}</label>
                            <input
                                id="groupInput"
                                name="groupInput"
                                type="text"
                                maxLength={100}
                                placeholder={
                                    inputPopup.type === "create" ?
                                    "그룹 이름" :
                                    "초대 코드"
                                }
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                        </div>
                        {errorMessage !== "" && 
                            <p className={styles.errorMessage}>
                                {errorMessage}
                            </p>
                        }
                        <div className={styles.buttonContainer}>
                            <button className={styles.cancelButton} onClick={closeInputPopup}>닫기</button>
                            <button className={styles.approveButton} onClick={handleGroup}>확인</button>
                        </div>
                    </div>
                </div>
            }
            {confirmAlert.open &&
                <div className={styles.alertOverlay}>
                    <div className={styles.alert}>
                        <div className={styles.alertHeader}>안내</div>
                        <p>{confirmAlert.message}</p>
                        <div className={styles.buttonContainer}>
                            <button className={styles.cancelButton} onClick={closeConfirmAlert}>취소</button>
                            <button className={styles.approveButton} onClick={confirmAlert.onConfirm}>확인</button>
                        </div>
                    </div>
                </div>
            }
            {showAlert && showAlert !== "" &&
                <div className={styles.alert}>
                    <p>{showAlert}</p>
                </div>
            }
        </>
    );
}