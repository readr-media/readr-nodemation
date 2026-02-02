import Header from "./_components/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      {children}
    </div>
  );
}
