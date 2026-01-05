"use client";
import {
  ArrowLeftIcon,
  BugIcon,
  Clock3Icon,
  MoreHorizontalIcon,
  PlayIcon,
  PlusIcon,
  SaveIcon,
  SendIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  createScheduleSlot,
  type ExecutionFrequency,
  type ScheduleSlot,
  useExecutionScheduleStore,
} from "@/stores/execution-schedule-store";
import { UserInfo } from "@/components/layout/user-info";

const frequencyOptions: { value: ExecutionFrequency; label: string }[] = [
  { value: "daily", label: "每天" },
  { value: "weekly", label: "每週" },
  { value: "monthly", label: "每月" },
  { value: "yearly", label: "每年" },
];

function InlineEditableText() {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("文章自動分類與標記");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div>
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        className={`transition-all w-36 body-1 px-2 py-1 ${isEditing
          ? "border-gray-600 w-[200px]"
          : "shadow-none border-none hover:bg-gray-300 cursor-pointer"
          }`}
      />
    </div>
  );
}

function ScheduleDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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
    slots.length > 0 ? slots : [createScheduleSlot()],
  );

  useEffect(() => {
    if (open) {
      setDraftFrequency(frequency);
      setDraftSlots(slots.length > 0 ? slots : [createScheduleSlot()]);
    }
  }, [open, frequency, slots]);

  const handleTimeChange = (id: string, value: string) => {
    setDraftSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, time: value } : slot)),
    );
  };

  const handleAddTime = () => {
    setDraftSlots((prev) => [...prev, createScheduleSlot()]);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleConfirm = () => {
    const sanitizedSlots = draftSlots.filter((slot) => Boolean(slot.time));
    if (sanitizedSlots.length === 0) {
      resetSchedule();
      onOpenChange(false);
      return;
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
                    onChange={() => setDraftFrequency(option.value)}
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
              <p className="title-6 text-gray-900">執行時間（24 小時制）</p>
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
            <div className="flex flex-col gap-3">
              {draftSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-400 bg-white px-3 py-2"
                >
                  <div className="flex size-8 items-center justify-center rounded-md bg-gray-300 text-gray-700">
                    <Clock3Icon className="size-4" />
                  </div>
                  <Input
                    type="time"
                    step={60}
                    value={slot.time}
                    onChange={(event) => handleTimeChange(slot.id, event.target.value)}
                    className="body-2 border-none bg-transparent p-0 text-gray-900 shadow-none focus-visible:border-none focus-visible:ring-0"
                  />
                </div>
              ))}
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
}

export default function Header() {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  return (
    <header>
      <div className="w-full bg-white/80 px-6 font-normal text-base flex items-center border-b-[#e8e7e2/80] border-b justify-between h-16">
        <div className="flex items-center gap-x-4">
          <Button className="has-[>svg]:px-2 border-none hover:bg-gray-300">
            <ArrowLeftIcon />
          </Button>
          <InlineEditableText />
          <Badge variant="draft">草稿</Badge>
        </div>

        <div className="flex items-center gap-x-3">
          <p className="text-gray-700 body-3">未儲存變更</p>
          <Button className="border-gray-100 text-gray-600">
            <BugIcon />
            測試節點
          </Button>
          <Button className="hover:bg-gray-300">
            <SaveIcon />
            儲存
          </Button>
          <Button className="hover:bg-gray-300">
            <UploadIcon />
            匯出
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="has-[>svg]:px-2 hover:bg-gray-300">
                <MoreHorizontalIcon size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl border border-gray-400 bg-white p-1 shadow-2">
              <DropdownMenuItem
                className="body-2 flex items-center gap-2 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-300 focus:bg-gray-300"
                onSelect={() => {
                  setIsScheduleDialogOpen(true);
                }}
              >
                <div className="flex size-6 items-center justify-center rounded-full bg-gray-300 text-gray-700">
                  <Clock3Icon className="size-4" />
                </div>
                設定執行時間
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="bg-green-500 text-white border-green-500 hover:bg-green-700">
            <SendIcon />
            發布
          </Button>
          <Button className="border-green-500 text-green-700 hover:bg-green-100">
            <PlayIcon />
            執行
          </Button>
          <UserInfo />
        </div>
      </div>
      <ScheduleDialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
      />
    </header>
  );
}
