import Header from "@/components/layout/header";
import Card from "./_components/card";

export default function Page() {
  return (
    <div>
      <Header />
      <div className="py-8 px-6">
        <p className="font-normal text-base mb-4">我的工作流</p>
        <Card />
      </div>
    </div>
  );
}
