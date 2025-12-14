export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex w-full flex-col bg-[#f5f5f1]/50 min-h-screen">
      {children}
    </div>
  );
}
