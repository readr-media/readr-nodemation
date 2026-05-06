"use client";

import { ChevronDownIcon, LogOutIcon } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/providers/user-provider";
import IconAvatar from "@/public/avatar.svg";

export function UserInfo() {
  const {
    users,
    activeUserId,
    activeUser,
    isLoading,
    isSwitching,
    isLoggingOut,
    switchUser,
    logout,
  } = useUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-x-2 rounded-lg border-l border-gray-400 px-3 py-2 hover:bg-gray-300 focus-visible:outline-none"
        aria-label="切換使用者"
      >
        <Image width={32} height={32} src={IconAvatar} alt="avatar" />
        <p className="text-gray-900 body-2 whitespace-nowrap">
          {isLoading ? "載入中..." : (activeUser?.name ?? "尚未選擇帳號")}
        </p>
        <ChevronDownIcon size={16} className="text-gray-700" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[260px] p-3">
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {users.length === 0 ? (
            <p className="body-2 px-3 py-2 text-gray-600">尚無使用者資料</p>
          ) : (
            users.map((user) => {
              const isActive = user.id === activeUserId;

              return (
                <DropdownMenuItem
                  key={user.id}
                  className="rounded-lg px-0 py-0 focus:bg-gray-300"
                  onSelect={(event) => {
                    event.preventDefault();
                    void switchUser(user.id);
                  }}
                  disabled={isSwitching}
                >
                  <div
                    className={`w-full rounded-md px-2 py-2 ${
                      isActive ? "bg-gray-300" : "bg-white"
                    }`}
                  >
                    <p className="title-5 text-gray-900">{user.name}</p>
                    <p className="body-2 text-gray-700">{user.email}</p>
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </div>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem
          disabled={isLoggingOut || !activeUser}
          className="px-3 py-2 text-gray-700"
          onSelect={(event) => {
            event.preventDefault();
            void logout();
          }}
        >
          <LogOutIcon size={16} />
          登出所有帳號
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
