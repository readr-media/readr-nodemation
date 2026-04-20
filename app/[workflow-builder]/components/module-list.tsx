"use client";

import { useNodesStore } from "@/stores/flow-editor/nodes-store";
import { ModuleCard } from "./module-card";
import { moduleGroups } from "./module-list-config";

const ModuleList = () => {
  const {
    addAiNode,
    addAiClassifierTaggerNode,
    addCodeNode,
    addCmsNode,
    addCmsOutputAudioNode,
    addCmsOutputNode,
    addExportNode,
    addPodcastGenerationNode,
  } = useNodesStore();

  return (
    <div className="flex flex-col gap-6 px-4 pb-4 pt-4">
      {moduleGroups.map((group) => (
        <div key={group.title} className="space-y-3">
          <p className="text-sm font-normal leading-5 tracking-[-0.01em] text-module-muted">
            {group.title}
          </p>
          <div className="flex flex-col gap-2">
            {group.modules.map(({ nodeType, ...cardProps }) => (
              <ModuleCard
                key={cardProps.title}
                {...cardProps}
                onClick={() => {
                  if (nodeType === "aiCall") {
                    addAiNode();
                  }
                  if (nodeType === "aiClassifierTagger") {
                    addAiClassifierTaggerNode();
                  }
                  if (nodeType === "codeBlock") {
                    addCodeNode();
                  }
                  if (nodeType === "cmsInput") {
                    addCmsNode();
                  }
                  if (nodeType === "cmsOutput") {
                    addCmsOutputNode();
                  }
                  if (nodeType === "cmsOutputAudio") {
                    addCmsOutputAudioNode();
                  }
                  if (nodeType === "exportResult") {
                    addExportNode();
                  }
                  if (nodeType === "podcastGeneration") {
                    addPodcastGenerationNode();
                  }
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModuleList;
