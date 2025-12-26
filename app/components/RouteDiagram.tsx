'use client';

import { useMemo, useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Scenario } from '../data/types';

const nodeTypes = {};

interface RouteDiagramProps {
  scenario: Scenario;
  simpleMode?: boolean;
  simplifyLabel?: (label: string) => string;
}

function DiagramInner({ isDark }: { isDark: boolean }) {
  const { fitView } = useReactFlow();

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, maxZoom: 1.2, minZoom: 0.5 });
  }, [fitView]);

  return (
    <>
      <Background 
        color={isDark ? '#1e293b' : '#f9fafb'} 
        gap={24}
        size={1}
      />
      <Controls
        showInteractive={false}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md"
      />
      <MiniMap
        nodeColor={isDark ? '#475569' : '#d1d5db'}
        maskColor={isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)'}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md"
      />
      <button
        onClick={handleFitView}
        className="absolute top-4 right-4 z-10 px-3 py-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 bg-white dark:bg-gray-800 border border-teal-300 dark:border-teal-700 rounded-lg shadow-sm hover:bg-teal-50 dark:hover:bg-teal-950/30 hover:border-teal-400 dark:hover:border-teal-600 transition-all duration-200"
      >
        Fit view
      </button>
    </>
  );
}

export default function RouteDiagram({ scenario, simpleMode = false, simplifyLabel }: RouteDiagramProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(
        window.matchMedia('(prefers-color-scheme: dark)').matches ||
        document.documentElement.classList.contains('dark')
      );
    };
    
    checkDarkMode();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => {
      mediaQuery.removeEventListener('change', checkDarkMode);
      observer.disconnect();
    };
  }, []);

  const nodes: Node[] = useMemo(
    () => {
      const nodeCount = scenario.nodes.length;
      const totalWidth = Math.max(1600, nodeCount * 200);
      const spacing = nodeCount > 1 ? totalWidth / (nodeCount - 1) : 0;
      
      return scenario.nodes.map((node, index) => ({
        id: node.id,
        type: 'default',
        position: { x: index * spacing, y: 200 },
        data: { 
          label: simpleMode && simplifyLabel ? simplifyLabel(node.label) : node.label,
        },
        style: {
          background: isDark ? '#1e293b' : '#ffffff',
          color: isDark ? '#f1f5f9' : '#111827',
          border: `1.5px solid ${isDark ? '#334155' : '#e5e7eb'}`,
          borderRadius: '16px',
          padding: '20px 28px',
          fontSize: '16px',
          fontWeight: 600,
          minWidth: '140px',
          boxShadow: isDark ? '0 2px 4px 0 rgba(0, 0, 0, 0.2)' : '0 2px 4px 0 rgba(0, 0, 0, 0.08)',
        },
      }));
    },
    [scenario.nodes, isDark]
  );

  const edges: Edge[] = useMemo(
    () => {
      const edgeColor = isDark ? '#64748b' : '#6b7280';
      return scenario.edges.map((edge, index) => ({
        id: `${edge.from}-${edge.to}-${index}`,
        source: edge.from,
        target: edge.to,
        type: 'smoothstep',
        animated: true,
        label: edge.label,
        labelStyle: { 
          fill: edgeColor, 
          fontWeight: 500, 
          fontSize: '13px',
        },
        style: { 
          stroke: edgeColor, 
          strokeWidth: 3,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeColor,
        },
      }));
    },
    [scenario.edges, isDark]
  );

  return (
    <div className="w-full h-[560px] rounded-2xl overflow-hidden relative z-0">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          fitView
          fitViewOptions={{
            padding: 0.2,
            maxZoom: 1.2,
            minZoom: 0.5,
          }}
          className="bg-transparent"
        >
          <DiagramInner isDark={isDark} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
