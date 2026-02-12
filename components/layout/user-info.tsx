import Image from "next/image";
import IconAvatar from "@/public/avatar.svg";

export function UserInfo({ name = "王小明" }: { name?: string }) {
  return (
    <div className="flex items-center gap-x-3 px-3 border-l border-gray-400 rounded-lg py-2">
      <Image width={32} height={32} src={IconAvatar} alt="avatar" />
      <p className="text-gray-900 body-2 whitespace-nowrap">{name}</p>
    </div>
  );
}
