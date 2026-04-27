import Header from "./_components/header";
import { Suspense } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Suspense
        fallback={
          <div className="h-16 w-full bg-white border-b border-gray-400" />
        }
      >
        <Header />
      </Suspense>
      {children}
    </div>
  );
}
