"use client";

import { useEffect, useState } from "react";
import { PlusIcon, Clock3Icon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getLocalNowParts,
  getNextYearForYearlySlot,
  isLeapYear,
  type YearlySlotLike,
} from "@/lib/time-utils";
import {
  createScheduleSlot,
  type ExecutionFrequency,
  type ScheduleSlot,
  type Weekday,
  useExecutionScheduleStore,
} from "@/stores/execution-schedule-store";

const frequencyOptions: { value: ExecutionFrequency; label: string }[] = [
  { value: "daily", label: "每天" },
  { value: "weekly", label: "每週" },
  { value: "monthly", label: "每月" },
  { value: "yearly", label: "每年" },
];

const weekdayOptions: { value: Weekday; label: string }[] = [
  { value: "mon", label: "週一" },
  { value: "tue", label: "週二" },
  { value: "wed", label: "週三" },
  { value: "thu", label: "週四" },
  { value: "fri", label: "週五" },
  { value: "sat", label: "週六" },
  { value: "sun", label: "週日" },
];

const dayOptions = Array.from({ length: 31 }, (_, index) => index + 1);
const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);

const cloneSlot = (slot: ScheduleSlot): ScheduleSlot => {
  switch (slot.frequency) {
    case "weekly":
      return { ...slot, daysOfWeek: [...slot.daysOfWeek] };
    case "monthly":
    case "yearly":
    case "daily":
    default:
      return { ...slot };
  }
};

const canEditSlotTime = (slot: ScheduleSlot): boolean => {
  switch (slot.frequency) {
    case "daily":
      return true;
    case "weekly":
      return slot.daysOfWeek.length > 0;
    case "monthly":
      return typeof slot.dayOfMonth === "number";
    case "yearly":
      return typeof slot.month === "number" && typeof slot.dayOfMonth === "number";
    default:
      return false;
  }
};

const getSlotValidationMessage = (slot: ScheduleSlot): string => {
  switch (slot.frequency) {
    case "weekly":
      return "請先選擇至少一個星期後再設定時間。";
    case "monthly":
      return "請先選擇日期後再設定時間。";
    case "yearly":
      return "請先選擇月份與日期後再設定時間。";
    default:
      return "";
  }
};

const isSlotComplete = (slot: ScheduleSlot): boolean =>
  canEditSlotTime(slot) && Boolean(slot.time);

const getFrequencyHint = (frequency: ExecutionFrequency) => {
  switch (frequency) {
    case "weekly":
      return "先選擇星期（可複選），再設定時間。";
    case "monthly":
      return "選擇每月日期後才可設定時間。";
    case "yearly":
      return "請選擇月份與日期，再設定時間。";
    default:
      return "直接輸入或新增需要執行的時間。";
  }
};

type ScheduleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ScheduleDialog = ({ open, onOpenChange }: ScheduleDialogProps) => {
  const frequency = useExecutionScheduleStore((state) => state.frequency);
  const slots = useExecutionScheduleStore((state) => state.slots);
  const setFrequencyState = useExecutionScheduleStore(
    (state) => state.setFrequency,
  );
  const setSlotsState = useExecutionScheduleStore((state) => state.setSlots);
  const setEnabled = useExecutionScheduleStore((state) => state.setEnabled);
  const resetSchedule = useExecutionScheduleStore((state) => state.reset);

  const [draftFrequency, setDraftFrequency] =
    useState<ExecutionFrequency>(frequency);
  const [draftSlots, setDraftSlots] = useState<ScheduleSlot[]>(() =>
    slots.length > 0 ? slots.map(cloneSlot) : [createScheduleSlot(frequency)],
  );

  useEffect(() => {
    if (open) {
      setDraftFrequency(frequency);
      setDraftSlots(
        slots.length > 0 ? slots.map(cloneSlot) : [createScheduleSlot(frequency)],
      );
    }
  }, [open, frequency, slots]);

  const handleFrequencyChange = (nextFrequency: ExecutionFrequency) => {
    if (nextFrequency === draftFrequency) return;
    const confirmed = window.confirm("切換頻率會重設目前的排程設定，確定要繼續嗎？");
    if (!confirmed) {
      return;
    }
    setDraftFrequency(nextFrequency);
    setDraftSlots([createScheduleSlot(nextFrequency)]);
  };

  const handleTimeChange = (id: string, value: string) => {
    setDraftSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, time: value } : slot)),
    );
  };

  const handleToggleWeekday = (id: string, day: Weekday) => {
    setDraftSlots((prev) =>
      prev.map((slot) => {
        if (slot.id !== id || slot.frequency !== "weekly") {
          return slot;
        }
        const exists = slot.daysOfWeek.includes(day);
        return {
          ...slot,
          daysOfWeek: exists
            ? slot.daysOfWeek.filter((value) => value !== day)
            : [...slot.daysOfWeek, day],
        };
      }),
    );
  };

  const handleDayOfMonthChange = (id: string, value: number | null) => {
    setDraftSlots((prev) =>
      prev.map((slot) =>
        slot.id === id && slot.frequency === "monthly"
          ? { ...slot, dayOfMonth: value }
          : slot,
      ),
    );
  };

  const handleYearMonthChange = (id: string, value: number | null) => {
    setDraftSlots((prev) =>
      prev.map((slot) =>
        slot.id === id && slot.frequency === "yearly"
          ? { ...slot, month: value, dayOfMonth: value ? slot.dayOfMonth : null }
          : slot,
      ),
    );
  };

  const handleYearDayChange = (id: string, value: number | null) => {
    setDraftSlots((prev) =>
      prev.map((slot) =>
        slot.id === id && slot.frequency === "yearly"
          ? { ...slot, dayOfMonth: value }
          : slot,
      ),
    );
  };

  const handleAddTime = () => {
    setDraftSlots((prev) => [...prev, createScheduleSlot(draftFrequency)]);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleConfirm = () => {
    const sanitizedSlots = draftSlots.filter((slot) => isSlotComplete(slot));
    if (sanitizedSlots.length === 0) {
      resetSchedule();
      onOpenChange(false);
      return;
    }

    const nowParts = getLocalNowParts();
    const needsLeapDayWarning = sanitizedSlots.some((slot) => {
      if (
        slot.frequency !== "yearly" ||
        slot.month !== 2 ||
        slot.dayOfMonth !== 29
      ) {
        return false;
      }
      const nextYear = getNextYearForYearlySlot(
        slot as YearlySlotLike,
        nowParts,
      );
      return !isLeapYear(nextYear);
    });

    if (needsLeapDayWarning) {
      const confirmed = window.confirm(
        "你選擇了 2 月 29 日。非閏年會改為 2 月 28 日執行，是否繼續？",
      );
      if (!confirmed) {
        return;
      }
    }

    setFrequencyState(draftFrequency);
    setSlotsState(sanitizedSlots);
    setEnabled(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#fafaf8] text-gray-900">
        <DialogHeader className="gap-2">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="title-4 text-gray-900">
              設定執行時間
            </DialogTitle>
            <DialogClose className="rounded-lg p-1 text-gray-800 transition-colors hover:bg-gray-300">
              <XIcon className="size-4" />
              <span className="sr-only">關閉</span>
            </DialogClose>
          </div>
          <DialogDescription className="body-2 text-gray-700">
            請選擇執行頻率、日期和時間。
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="title-6 text-gray-900">選擇執行頻率</p>
            <div className="flex flex-col gap-2">
              {frequencyOptions.map((option) => (
                <label
                  key={option.value}
                  className="body-2 flex cursor-pointer items-center gap-2 text-gray-900"
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={draftFrequency === option.value}
                    onChange={() => handleFrequencyChange(option.value)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full border",
                      draftFrequency === option.value
                        ? "border-green-500"
                        : "border-gray-400 bg-white",
                    )}
                  >
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        draftFrequency === option.value
                          ? "bg-green-500"
                          : "bg-transparent",
                      )}
                    />
                  </span>
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="title-6 text-gray-900">執行條件與時間</p>
                <p className="body-3 text-gray-600">
                  {getFrequencyHint(draftFrequency)}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                className="border border-gray-400 bg-white text-gray-900 hover:bg-gray-300"
                onClick={handleAddTime}
              >
                <PlusIcon className="size-4" />
                新增
              </Button>
            </div>
            <div className="flex flex-col gap-4">
              {draftSlots.map((slot) => {
                const timeReady = canEditSlotTime(slot);
                const needsFieldsMessage = getSlotValidationMessage(slot);
                const currentYear = new Date().getFullYear();
                const daysInSelectedMonth =
                  slot.frequency === "yearly" && slot.month
                    ? new Date(currentYear, slot.month, 0).getDate()
                    : 31;

                return (
                  <div
                    key={slot.id}
                    className="space-y-3 rounded-lg border border-gray-400 bg-white px-3 py-3"
                  >
                    {slot.frequency === "weekly" && (
                      <div className="space-y-2">
                        <p className="title-6 text-gray-900">選擇星期</p>
                        <div className="flex flex-wrap gap-2">
                          {weekdayOptions.map((weekday) => {
                            const active = slot.daysOfWeek.includes(weekday.value);
                            return (
                              <button
                                key={weekday.value}
                                type="button"
                                className={cn(
                                  "rounded-full px-3 py-1 text-sm transition-colors",
                                  active
                                    ? "bg-green-500 text-white"
                                    : "border border-gray-300 text-gray-800 hover:bg-gray-200",
                                )}
                                onClick={() =>
                                  handleToggleWeekday(slot.id, weekday.value)
                                }
                              >
                                {weekday.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {slot.frequency === "monthly" && (
                      <div className="space-y-2">
                        <p className="title-6 text-gray-900">選擇日期</p>
                        <select
                          value={slot.dayOfMonth ?? ""}
                          onChange={(event) =>
                            handleDayOfMonthChange(
                              slot.id,
                              event.target.value ? Number(event.target.value) : null,
                            )
                          }
                          className="body-2 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-900"
                        >
                          <option value="">請選擇日期</option>
                          {dayOptions.map((day) => (
                            <option key={day} value={day}>
                              每月 {day} 日
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {slot.frequency === "yearly" && (
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2">
                          <p className="title-6 text-gray-900">選擇月份</p>
                          <select
                            value={slot.month ?? ""}
                            onChange={(event) =>
                              handleYearMonthChange(
                                slot.id,
                                event.target.value ? Number(event.target.value) : null,
                              )
                            }
                            className="body-2 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-900"
                          >
                            <option value="">請選擇月份</option>
                            {monthOptions.map((month) => (
                              <option key={month} value={month}>
                                {month} 月
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="title-6 text-gray-900">選擇日期</p>
                          <select
                            value={slot.dayOfMonth ?? ""}
                            onChange={(event) =>
                              handleYearDayChange(
                                slot.id,
                                event.target.value ? Number(event.target.value) : null,
                              )
                            }
                            className="body-2 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-900"
                            disabled={!slot.month}
                          >
                            <option value="">
                              {slot.month ? "請選擇日期" : "請先選擇月份"}
                            </option>
                            {dayOptions
                              .filter((day) => !slot.month || day <= daysInSelectedMonth)
                              .map((day) => (
                                <option key={day} value={day}>
                                  {day} 日
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 px-3 py-2">
                      <div className="flex size-8 items-center justify-center rounded-md bg-gray-200 text-gray-700">
                        <Clock3Icon className="size-4" />
                      </div>
                      <Input
                        type="time"
                        step={60}
                        value={slot.time}
                        onChange={(event) =>
                          handleTimeChange(slot.id, event.target.value)
                        }
                        disabled={!timeReady}
                        className={cn(
                          "body-2 border-none bg-transparent p-0 text-gray-900 shadow-none focus-visible:border-none focus-visible:ring-0",
                          !timeReady && "text-gray-500",
                        )}
                      />
                    </div>
                    {!timeReady && (
                      <p className="body-3 text-amber-700">{needsFieldsMessage}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            className="border border-gray-400 bg-white text-gray-900 hover:bg-gray-300"
            onClick={handleClose}
          >
            取消
          </Button>
          <Button
            type="button"
            className="bg-green-500 text-white border border-green-500 hover:bg-green-700"
            onClick={handleConfirm}
          >
            確認
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleDialog;
