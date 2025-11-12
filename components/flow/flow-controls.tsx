import { useNodesStore } from "@/stores/flow-editor/nodes-store";
import { Button } from "../ui/button";

const FlowControls = () => {
  const { addNode } = useNodesStore();
  return (
    <div>
      <Button onClick={addNode}>add Node</Button>
    </div>
  );
};

export default FlowControls;
