import { useNodesStore } from "@/stores/flow-editor/nodes-store";
import { generateId } from "@/utils/generate-id";
import { Button } from "../ui/button";

const FlowControls = () => {
  const { addNode } = useNodesStore();
  return (
    <div>
      <Button
        onClick={() =>
          addNode({
            id: generateId(),
            position: { x: 50, y: 50 },
            data: { label: Date.now() },
            type: "default",
          })
        }
      >
        add Node
      </Button>
    </div>
  );
};

export default FlowControls;
