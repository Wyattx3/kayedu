"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Sparkles, BookOpen, Lightbulb, Target, Layers, Zap, Star, Brain } from "lucide-react";

interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
  color?: string;
  icon?: string;
}

interface MindMapProps {
  content: string;
  topic: string;
  className?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  purple: <Brain className="w-4 h-4" />,
  green: <Target className="w-4 h-4" />,
  orange: <Lightbulb className="w-4 h-4" />,
  pink: <Star className="w-4 h-4" />,
  cyan: <Zap className="w-4 h-4" />,
  indigo: <Layers className="w-4 h-4" />,
  rose: <BookOpen className="w-4 h-4" />,
  teal: <Sparkles className="w-4 h-4" />,
};

const colorConfigs = [
  { bg: "bg-gradient-to-br from-purple-500 to-purple-600", border: "border-purple-300", light: "bg-purple-50", text: "text-purple-700", line: "#a855f7", icon: "purple" },
  { bg: "bg-gradient-to-br from-emerald-500 to-emerald-600", border: "border-emerald-300", light: "bg-emerald-50", text: "text-emerald-700", line: "#10b981", icon: "green" },
  { bg: "bg-gradient-to-br from-orange-500 to-orange-600", border: "border-orange-300", light: "bg-orange-50", text: "text-orange-700", line: "#f97316", icon: "orange" },
  { bg: "bg-gradient-to-br from-pink-500 to-pink-600", border: "border-pink-300", light: "bg-pink-50", text: "text-pink-700", line: "#ec4899", icon: "pink" },
  { bg: "bg-gradient-to-br from-cyan-500 to-cyan-600", border: "border-cyan-300", light: "bg-cyan-50", text: "text-cyan-700", line: "#06b6d4", icon: "cyan" },
  { bg: "bg-gradient-to-br from-indigo-500 to-indigo-600", border: "border-indigo-300", light: "bg-indigo-50", text: "text-indigo-700", line: "#6366f1", icon: "indigo" },
];

function parseContentToMindMap(content: string, topic: string): MindMapNode {
  const lines = content.split("\n");
  const root: MindMapNode = {
    id: "root",
    label: topic || "Study Guide",
    color: "blue",
    children: [],
  };

  let currentH2: MindMapNode | null = null;
  let currentH3: MindMapNode | null = null;
  let colorIndex = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith("## ")) {
      const label = trimmed.replace(/^##\s+/, "").replace(/\*+/g, "").replace(/[#*]/g, "").trim();
      if (label && label.length > 2) {
        currentH2 = {
          id: `h2-${colorIndex}`,
          label: label.slice(0, 45) + (label.length > 45 ? "..." : ""),
          color: colorConfigs[colorIndex % colorConfigs.length].icon,
          children: [],
        };
        root.children?.push(currentH2);
        colorIndex++;
        currentH3 = null;
      }
    }
    else if (trimmed.startsWith("### ") && currentH2) {
      const label = trimmed.replace(/^###\s+/, "").replace(/\*+/g, "").replace(/[#*]/g, "").trim();
      if (label && label.length > 2) {
        currentH3 = {
          id: `h3-${currentH2.id}-${currentH2.children?.length || 0}`,
          label: label.slice(0, 40) + (label.length > 40 ? "..." : ""),
          color: currentH2.color,
          children: [],
        };
        currentH2.children?.push(currentH3);
      }
    }
    else if ((trimmed.startsWith("- ") || trimmed.startsWith("* ") || /^\d+\./.test(trimmed)) && (currentH3 || currentH2)) {
      const label = trimmed.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").replace(/\*+/g, "").trim();
      if (label && label.length > 3) {
        const parent = currentH3 || currentH2;
        if (parent && parent.children && parent.children.length < 5) {
          parent.children.push({
            id: `bullet-${parent.id}-${parent.children.length}`,
            label: label.slice(0, 35) + (label.length > 35 ? "..." : ""),
            color: parent.color,
          });
        }
      }
    }
  }

  if (root.children && root.children.length > 8) {
    root.children = root.children.slice(0, 8);
  }

  return root;
}

export function MindMap({ content, topic, className }: MindMapProps) {
  const mindMapData = useMemo(() => parseContentToMindMap(content, topic), [content, topic]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  if (!mindMapData.children || mindMapData.children.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Brain className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-400 text-sm">Generate a study guide to see the mind map</p>
        </div>
      </div>
    );
  }

  const nodeCount = mindMapData.children.length;
  const centerX = 450;
  const centerY = 320;
  const radius = 240;

  // Calculate positions for each branch
  const nodePositions = mindMapData.children.map((_, idx) => {
    const angle = (idx / nodeCount) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      angle: (angle * 180) / Math.PI,
    };
  });

  return (
    <div className={cn("relative w-full h-full overflow-auto bg-gradient-to-br from-gray-50 to-white", className)}>
      <div className="relative" style={{ width: "900px", height: "640px" }}>
        {/* SVG Connection Lines */}
        <svg 
          className="absolute inset-0 pointer-events-none"
          width="900"
          height="640"
          viewBox="0 0 900 640"
        >
          <defs>
            {colorConfigs.map((config, idx) => (
              <linearGradient key={idx} id={`gradient-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                <stop offset="100%" stopColor={config.line} stopOpacity="1" />
              </linearGradient>
            ))}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Connection lines from center to branches */}
          {nodePositions.map((pos, idx) => {
            const colorIdx = idx % colorConfigs.length;
            return (
              <g key={idx}>
                <path
                  d={`M ${centerX} ${centerY} Q ${(centerX + pos.x) / 2} ${centerY} ${pos.x} ${pos.y}`}
                  fill="none"
                  stroke={`url(#gradient-${colorIdx})`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="animate-[draw_1s_ease-out_forwards]"
                  style={{ 
                    strokeDasharray: 300,
                    strokeDashoffset: 300,
                    animationDelay: `${idx * 100}ms`,
                  }}
                />
                {/* Animated dot on the line */}
                <circle
                  r="4"
                  fill={colorConfigs[colorIdx].line}
                  filter="url(#glow)"
                  className="animate-pulse"
                >
                  <animateMotion
                    dur="2s"
                    repeatCount="indefinite"
                    path={`M ${centerX} ${centerY} Q ${(centerX + pos.x) / 2} ${centerY} ${pos.x} ${pos.y}`}
                  />
                </circle>
              </g>
            );
          })}

          {/* Center glow effect */}
          <circle cx={centerX} cy={centerY} r="60" fill="url(#centerGlow)" opacity="0.3" />
          <defs>
            <radialGradient id="centerGlow">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        {/* Center Root Node */}
        <div 
          className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: centerX, top: centerY }}
        >
          <div className={cn(
            "relative px-6 py-4 rounded-2xl text-white font-bold text-center",
            "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700",
            "shadow-2xl shadow-blue-500/40",
            "min-w-[160px] max-w-[200px]",
            "animate-[scale-in_0.6s_cubic-bezier(0.34,1.56,0.64,1)]",
            "ring-4 ring-blue-400/30"
          )}>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-yellow-800" />
            </div>
            <div className="text-base leading-tight font-semibold">{mindMapData.label}</div>
            <div className="text-[10px] opacity-70 mt-1.5 font-medium tracking-wide uppercase">Main Topic</div>
          </div>
        </div>

        {/* Branch Nodes */}
        {mindMapData.children.map((node, idx) => {
          const pos = nodePositions[idx];
          const colorConfig = colorConfigs[idx % colorConfigs.length];
          const isExpanded = expandedNodes.has(node.id);
          const hasChildren = node.children && node.children.length > 0;
          
          return (
            <div
              key={node.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ 
                left: pos.x, 
                top: pos.y,
                zIndex: isExpanded ? 30 : 10,
              }}
            >
              <div
                className={cn(
                  "relative animate-[fade-up_0.5s_ease-out_forwards] opacity-0"
                )}
                style={{ animationDelay: `${idx * 100 + 200}ms` }}
              >
                {/* Main Branch Card */}
                <div
                  onClick={() => hasChildren && toggleNode(node.id)}
                  className={cn(
                    "relative px-4 py-3 rounded-xl text-white font-semibold text-sm text-center",
                    colorConfig.bg,
                    "shadow-lg cursor-pointer",
                    "min-w-[130px] max-w-[160px]",
                    "transition-all duration-300",
                    "hover:scale-105 hover:shadow-xl",
                    hasChildren && "pr-7",
                    isExpanded && "ring-2 ring-white/50"
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="opacity-80">{iconMap[colorConfig.icon]}</span>
                    <span className="leading-tight">{node.label}</span>
                  </div>
                  
                  {hasChildren && (
                    <ChevronRight 
                      className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 transition-transform duration-300",
                        isExpanded && "rotate-90"
                      )} 
                    />
                  )}
                </div>

                {/* Sub-branches */}
                {hasChildren && isExpanded && (
                  <div className={cn(
                    "absolute left-0 top-full mt-2 space-y-1.5 animate-[fade-up_0.3s_ease-out] bg-white/95 backdrop-blur-sm p-2 rounded-xl shadow-xl border border-gray-100"
                  )}
                  style={{ zIndex: 40, minWidth: "180px" }}
                  >
                    {node.children!.slice(0, 5).map((child, childIdx) => (
                      <div
                        key={child.id}
                        className={cn(
                          "px-3 py-2 rounded-lg text-xs font-medium",
                          colorConfig.light,
                          colorConfig.text,
                          "border",
                          colorConfig.border,
                          "transition-all duration-200",
                          "hover:shadow-md hover:scale-[1.02]",
                          "animate-[slide-up_0.2s_ease-out_forwards] opacity-0"
                        )}
                        style={{ animationDelay: `${childIdx * 50}ms` }}
                      >
                        <div className="flex items-start gap-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full mt-1 shrink-0", colorConfig.bg.replace("gradient-to-br", "").split(" ")[1])} />
                          <span className="leading-snug">{child.label}</span>
                        </div>
                      </div>
                    ))}
                    {node.children!.length > 5 && (
                      <div className={cn("text-xs pl-3", colorConfig.text, "opacity-60")}>
                        +{node.children!.length - 5} more items
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-4 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm" style={{ zIndex: 50 }}>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
            <span>Main Topic</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-3 h-3 rounded bg-gradient-to-br from-purple-500 to-purple-600" />
            <span>Sections</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="text-xs text-gray-400">Click to expand</div>
        </div>

        {/* Stats */}
        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm" style={{ zIndex: 50 }}>
          <Brain className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-medium text-gray-600">{mindMapData.children.length} sections</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
