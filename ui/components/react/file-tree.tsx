import { useState, useEffect } from "react";

import { Classes, Icon, Intent, ITreeNode, Position, Tooltip, Tree, IconName, MaybeElement } from "@blueprintjs/core";

import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";

export interface IFileTreeNode extends ITreeNode {
  fileUrl?: string;
  nodeType?: string;
  onSelectFile?: () => void;
}

export class FileNode implements IFileTreeNode {
  id: number;
  label: JSX.Element | string;
  icon:IconName = "document";
  nodeType: string = "file";
  onSelectFile: () => void;

  constructor(id: number, label: JSX.Element | string, onSelectFile: () => void) {
    this.id = id;
    this.label = label;
    this.onSelectFile = onSelectFile;
  }
}

export class DirectoryNode implements IFileTreeNode {
  id: number;
  label: JSX.Element | string;
  icon:IconName = "folder-close";
  nodeType: string = "directory";
  hasCaret: boolean = true;
  isExpanded: boolean = false;
  childNodes: IFileTreeNode[];

  constructor(id: number, label: JSX.Element | string, childNodes: IFileTreeNode[]) {
    this.id = id;
    this.label = label;
    this.childNodes = childNodes;
  }
}

interface IFileTreeProps {
  nodes: IFileTreeNode[];
}

export const FileTree = (props: IFileTreeProps) => {
  const [fileTreeData, setFileTreeData] = useState<IFileTreeNode[]>([]);
  
  useEffect(() => {
    setFileTreeData(props.nodes);
  }, [props.nodes]);

  const handleNodeExpand = (nodeData: IFileTreeNode) => {
    nodeData.isExpanded = true;
    setFileTreeData([...fileTreeData]);
  };

  const handleNodeCollapse = (nodeData: IFileTreeNode) => {
    nodeData.isExpanded = false;
    setFileTreeData([...fileTreeData]);
  };

  const handleNodeClick = (nodeData: IFileTreeNode) => {
    _forEachNode(fileTreeData, (n) => (n.isSelected = false));
    nodeData.isSelected = true;
    setFileTreeData([...fileTreeData]);

    if (nodeData.nodeType === "file") {
      nodeData.onSelectFile();
    }
  };

  const _forEachNode = (nodes: ITreeNode[], callback: (node: ITreeNode) => void) => {
    if (nodes == null) {
      return;
    }

    for (const node of nodes) {
      callback(node);
      _forEachNode(node.childNodes, callback);
    }
  };

  return (
    <Tree
      contents={fileTreeData}
      onNodeExpand={handleNodeExpand}
      onNodeClick={handleNodeClick}
      onNodeCollapse={handleNodeCollapse}
      className={Classes.ELEVATION_0}
    />
  );
};
