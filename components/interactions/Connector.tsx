'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  color?: string;
}

interface Connection {
  from: string;
  to: string;
}

interface ConnectorProps {
  nodes: Node[];
  correctConnections: Connection[];
  onConnect: (connections: Connection[]) => void;
  snapThreshold?: number;
}

export default function Connector({
  nodes,
  correctConnections,
  onConnect,
  snapThreshold = 50
}: ConnectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [draggingFrom, setDraggingFrom] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleNodeClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!draggingFrom) {
      setDraggingFrom(nodeId);
      updateMousePos(e);
    } else if (draggingFrom !== nodeId) {
      const newConnection: Connection = { from: draggingFrom, to: nodeId };
      
      const exists = connections.some(
        c => (c.from === newConnection.from && c.to === newConnection.to) ||
             (c.from === newConnection.to && c.to === newConnection.from)
      );

      if (!exists) {
        const newConnections = [...connections, newConnection];
        setConnections(newConnections);
        onConnect(newConnections);
      }
      
      setDraggingFrom(null);
    } else {
      setDraggingFrom(null);
    }
  };

  const updateMousePos = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({
        x: Math.max(0, Math.min(100, xPercent)),
        y: Math.max(0, Math.min(100, yPercent))
      });
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingFrom) {
      updateMousePos(e);
    }
  }, [draggingFrom, updateMousePos]);

  const removeConnection = (index: number) => {
    const newConnections = connections.filter((_, i) => i !== index);
    setConnections(newConnections);
    onConnect(newConnections);
  };

  const getNodePos = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden"
        style={{ minHeight: 400 }}
        onMouseMove={handleMouseMove}
        onClick={() => setDraggingFrom(null)}
      >
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <AnimatePresence>
            {connections.map((conn, index) => {
              const fromPos = getNodePos(conn.from);
              const toPos = getNodePos(conn.to);
              const isCorrect = correctConnections.some(
                c => (c.from === conn.from && c.to === conn.to) ||
                     (c.from === conn.to && c.to === conn.from)
              );

              return (
                <ConnectionLine
                  key={`${conn.from}-${conn.to}`}
                  from={fromPos}
                  to={toPos}
                  isCorrect={isCorrect}
                  onRemove={() => removeConnection(index)}
                />
              );
            })}
          </AnimatePresence>

          {draggingFrom && (
            <ElasticLine
              from={getNodePos(draggingFrom)}
              to={mousePos}
              isPreview
            />
          )}
        </svg>

        {nodes.map((node) => (
          <ConnectionNode
            key={node.id}
            node={node}
            isActive={draggingFrom === node.id}
            isConnected={connections.some(
              c => c.from === node.id || c.to === node.id
            )}
            onClick={(e) => handleNodeClick(node.id, e)}
          />
        ))}
      </div>

      <p className="mt-4 text-sm text-gray-400 text-center">
        点击节点开始连线，再次点击目标节点完成连接
      </p>
    </div>
  );
}

function ConnectionNode({
  node,
  isActive,
  isConnected,
  onClick
}: {
  node: Node;
  isActive: boolean;
  isConnected: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const scale = useSpring(1, { stiffness: 500, damping: 30 });

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        x: '-50%',
        y: '-50%'
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <motion.div
        className={`
          w-20 h-20 rounded-2xl flex items-center justify-center
          cursor-pointer shadow-lg transition-colors
          ${isActive 
            ? 'bg-indigo-500 text-white ring-4 ring-indigo-200' 
            : isConnected
              ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300'
          }
        `}
        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1 }}
      >
        <span className="text-sm font-semibold text-center px-2">
          {node.label}
        </span>
      </motion.div>

      <motion.div
        className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
        style={{
          backgroundColor: isActive ? '#6366f1' : isConnected ? '#10b981' : '#d1d5db'
        }}
        animate={isActive ? { scale: [1, 1.3, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.8 }}
      />
    </motion.div>
  );
}

function ConnectionLine({
  from,
  to,
  isCorrect,
  onRemove
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isCorrect: boolean;
  onRemove: () => void;
}) {
  const x1 = from.x;
  const y1 = from.y;
  const x2 = to.x;
  const y2 = to.y;

  const midX = (x1 + x2) / 2;
  const cp1x = midX;
  const cp1y = y1;
  const cp2x = midX;
  const cp2y = y2;

  const path = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;

  return (
    <motion.g
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      exit={{ pathLength: 0, opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <motion.path
        d={path}
        fill="none"
        stroke={isCorrect ? '#10b981' : '#6366f1'}
        strokeWidth="3"
        strokeLinecap="round"
        className="pointer-events-auto cursor-pointer"
        whileHover={{ strokeWidth: 5 }}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      />
      
      {isCorrect && (
        <motion.circle
          cx={(x1 + x2) / 2}
          cy={(y1 + y2) / 2}
          r="8"
          fill="#10b981"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 500 }}
        />
      )}
    </motion.g>
  );
}

function ElasticLine({
  from,
  to,
  isPreview
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isPreview: boolean;
}) {
  const x1 = from.x;
  const y1 = from.y;
  const x2 = to.x;
  const y2 = to.y;

  const midX = (x1 + x2) / 2;
  const cp1x = midX;
  const cp1y = y1;
  const cp2x = midX;
  const cp2y = y2;

  const path = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;

  return (
    <motion.path
      d={path}
      fill="none"
      stroke={isPreview ? '#94a3b8' : '#6366f1'}
      strokeWidth="2"
      strokeDasharray={isPreview ? '8,4' : undefined}
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    />
  );
}
