import Link from "next/link";
import { Button } from "../ui/button";

export default function Header() {
  return (
    <header>
      <div className="bg-white/80 font-normal text-base flex items-center border-[#e8e7e2/80] border pt-5 pb-[21px]">
        <div>
          <Link href="/">
            <span>AI 新聞工作台</span>
          </Link>
        </div>

        <div>
          <Button>查看紀錄</Button>
          <Button>查看模組</Button>
          <Button>設計系統</Button>
          <Button>匯入工作流</Button>
        </div>
      </div>
    </header>
  );
}
