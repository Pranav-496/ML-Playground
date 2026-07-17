import React from "react";

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
          <div className="text-text-primary font-bold text-sm">
            {node.feature} ≤ {node.threshold}
          </div>
        )}
        <div className="text-text-secondary">
          {criterion} = {node.impurity}
        </div>
        <div className="text-text-secondary">samples = {node.samples}</div>
        <div className="text-primary font-mono text-xs">
          value = [{node.value.join(", ")}]
        </div>
      </div>

      {/* Children branches */}
      {!node.is_leaf && (node.left || node.right) && (
        <div className="flex relative pt-6 mt-1">
          {/* Connecting lines drawn via CSS borders */}
          <div className="absolute top-0 left-1/2 w-[1px] h-6 bg-surface-border"></div>
          <div className="absolute top-6 left-1/4 right-1/4 h-[1px] bg-surface-border"></div>

          <div className="flex-1 flex justify-center relative pt-4 min-w-[140px]">
            <div className="absolute top-0 left-1/2 w-[1px] h-4 bg-surface-border"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 text-[10px] text-text-muted bg-surface px-1">
              True
            </div>
            {node.left && (
              <TreeNodeComponent node={node.left} criterion={criterion} />
            )}
          </div>
          <div className="flex-1 flex justify-center relative pt-4 min-w-[140px]">
            <div className="absolute top-0 left-1/2 w-[1px] h-4 bg-surface-border"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 text-[10px] text-text-muted bg-surface px-1">
              False
            </div>
            {node.right && (
              <TreeNodeComponent node={node.right} criterion={criterion} />
            )}
          </div>
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
    <div className="w-full overflow-x-auto py-8">
      <div className="min-w-fit mx-auto flex justify-center">
        <TreeNodeComponent node={tree} criterion={criterion} />
      </div>
    </div>
  );
}
