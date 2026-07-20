import React from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export interface TreeNode {
  node_id: number;
  samples: number;
  value: number[];
  impurity: number;
  is_leaf: boolean;
  feature?: string;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
}

interface DecisionTreeGraphProps {
  tree: TreeNode | null;
  criterion: string;
}

const TreeNodeComponent: React.FC<{ node: TreeNode; criterion: string }> = ({
  node,
  criterion,
}) => {
  if (!node) return null;

  return (
    <div className="flex flex-col items-center">
      {/* Node Box */}
      <div className="clay-pressed p-3 rounded-lg border-2 border-surface-border min-w-[120px] text-center text-xs font-semibold space-y-1 relative z-10 mx-2 bg-surface">
        {!node.is_leaf && (
          <div className="text-text-primary font-bold text-sm whitespace-nowrap">
            {node.feature} ≤ {node.threshold}
          </div>
        )}
        <div className="text-text-secondary whitespace-nowrap">
          {criterion} = {node.impurity}
        </div>
        <div className="text-text-secondary whitespace-nowrap">samples = {node.samples}</div>
        <div className="text-primary font-mono text-xs whitespace-nowrap">
          value = [{node.value.join(", ")}]
        </div>
      </div>

      {/* Children branches */}
      {!node.is_leaf && (node.left || node.right) && (
        <div className="flex relative pt-8 mt-1">
          {/* Vertical line dropping from parent */}
          <div className="absolute top-0 left-1/2 w-[1px] h-8 bg-surface-border -translate-x-1/2"></div>

          {node.left && (
            <div className="flex flex-col items-center relative pt-8 px-2">
              {/* Horizontal line for Left Child: 50% to 100% */}
              <div className="absolute top-0 right-0 w-1/2 h-[1px] bg-surface-border" />
              {/* Vertical line dropping to this node */}
              <div className="absolute top-0 left-1/2 w-[1px] h-8 bg-surface-border -translate-x-1/2" />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] bg-surface px-1 text-text-muted z-10">
                True
              </div>
              <TreeNodeComponent node={node.left} criterion={criterion} />
            </div>
          )}

          {node.right && (
            <div className="flex flex-col items-center relative pt-8 px-2">
              {/* Horizontal line for Right Child: 0% to 50% */}
              <div className="absolute top-0 left-0 w-1/2 h-[1px] bg-surface-border" />
              {/* Vertical line dropping to this node */}
              <div className="absolute top-0 left-1/2 w-[1px] h-8 bg-surface-border -translate-x-1/2" />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] bg-surface px-1 text-text-muted z-10">
                False
              </div>
              <TreeNodeComponent node={node.right} criterion={criterion} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function DecisionTreeGraph({
  tree,
  criterion,
}: DecisionTreeGraphProps) {
  if (!tree) return null;

  return (
    <div className="relative w-full h-[600px] border border-surface-border rounded-lg overflow-hidden bg-[rgba(20,20,25,0.5)] cursor-grab active:cursor-grabbing">
      <TransformWrapper
        initialScale={1}
        minScale={0.1}
        maxScale={4}
        centerOnInit={true}
        wheel={{ step: 0.015, smoothStep: 0.005 }}
      >
        <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
          <div className="py-12 px-12 min-w-max min-h-max">
            <TreeNodeComponent node={tree} criterion={criterion} />
          </div>
        </TransformComponent>
      </TransformWrapper>
      <div className="absolute bottom-4 right-4 text-xs text-text-muted bg-surface/80 px-2 py-1 rounded border border-surface-border backdrop-blur-sm">
        Scroll to Zoom • Click & Drag to Pan
      </div>
    </div>
  );
}
