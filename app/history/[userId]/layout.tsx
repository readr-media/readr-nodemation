import Header from "../_components/header";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex w-full flex-col bg-gray-300/50 min-h-screen">
      <Header />
      {children}
    </div>
  );
}
