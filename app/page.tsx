"use client";
import FlowControls from "@/components/flow/flow-controls";
import FlowEditor from "@/components/flow/flow-editor";

export default function Home() {
  return (
    <div className="w-[800px] h-[600px] shadow-md">
      <FlowEditor />
      <FlowControls />
    </div>
  );
}
