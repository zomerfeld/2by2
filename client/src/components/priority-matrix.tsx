import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MatrixItem } from "./matrix-item";
import { useQuadrantDrop } from "@/hooks/use-drag-drop";
import { type DragItem, type Position, type QuadrantType } from "@/lib/types";
import { type TodoItem, type MatrixSettings } from "@shared/schema";
import { TooltipProvider } from "@/components/ui/tooltip";
import html2canvas from "html2canvas";

export function PriorityMatrixControls({ listId }: { listId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: todoItems = [] } = useQuery<TodoItem[]>({
    queryKey: ["/api/lists", listId, "todo-items"],
    queryFn: async () => {
      const response = await fetch(`/api/lists/${listId}/todo-items`);
      if (!response.ok) throw new Error('Failed to fetch todo items');
      return response.json();
    },
  });

  const { data: settings } = useQuery<MatrixSettings>({
    queryKey: ["/api/lists", listId, "matrix-settings"],
    queryFn: async () => {
      const response = await fetch(`/api/lists/${listId}/matrix-settings`);
      if (!response.ok) throw new Error('Failed to fetch matrix settings');
      return response.json();
    },
  });

  const [xAxisLabel, setXAxisLabel] = useState(settings?.xAxisLabel || "Impact");
  const [yAxisLabel, setYAxisLabel] = useState(settings?.yAxisLabel || "Urgency");

  const clearMatrixMutation = useMutation({
    mutationFn: async () => {
      const promises = todoItems
        .filter(item => item.quadrant)
        .map(item => 
          apiRequest("PATCH", `/api/lists/${listId}/todo-items/${item.id}`, {
            positionX: null,
            positionY: null,
            quadrant: null,
          })
        );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists", listId, "todo-items"] });
    },
  });

  const handleExport = async () => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    try {
      // Export JSON data
      const exportData = {
        todoItems: todoItems,
        matrixSettings: { xAxisLabel, yAxisLabel },
        exportedAt: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const jsonUrl = URL.createObjectURL(dataBlob);
      
      const jsonLink = document.createElement("a");
      jsonLink.href = jsonUrl;
      jsonLink.download = `priority-matrix-${timestamp}.json`;
      document.body.appendChild(jsonLink);
      jsonLink.click();
      document.body.removeChild(jsonLink);
      URL.revokeObjectURL(jsonUrl);

      // Export PNG screenshot - capture entire page
      const canvas = await html2canvas(document.body, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        ignoreElements: (element) => {
          // Skip elements that might cause rendering issues
          return element.tagName === 'INPUT';
        },
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob);
          const pngLink = document.createElement("a");
          pngLink.href = pngUrl;
          pngLink.download = `priority-matrix-${timestamp}.png`;
          document.body.appendChild(pngLink);
          pngLink.click();
          document.body.removeChild(pngLink);
          URL.revokeObjectURL(pngUrl);
        }
      });


    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the matrix",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" onClick={handleExport} title="Export data">
        <Download className="h-4 w-4" />
      </Button>
      <Button variant="outline" onClick={() => clearMatrixMutation.mutate()}>
        <RotateCcw className="mr-2 h-4 w-4" />
        Clear
      </Button>
    </div>
  );
}

interface QuadrantProps {
  type: QuadrantType;
  items: TodoItem[];
  label: string;
  bgColor: string;
  onDrop: (item: DragItem, position: Position, quadrant: QuadrantType) => void;
  onItemClick?: (itemId: number) => void;
  listId: string;
}

function Quadrant({ type, items, label, bgColor, onDrop, onItemClick, listId }: QuadrantProps) {
  const { isOver, drop } = useQuadrantDrop(type, onDrop);

  return (
    <div
      ref={drop}
      className={`relative border-gray-300 transition-colors duration-200 ${
        isOver ? "bg-blue-50" : bgColor
      }`}
    >
      {items.map((item) => (
        <MatrixItem
          key={item.id}
          item={item}
          onClick={onItemClick}
          listId={listId}
          style={{
            position: "absolute",
            left: `${item.positionX! * 100}%`,
            top: `${item.positionY! * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}

interface PriorityMatrixProps {
  onItemClick?: (itemId: number) => void;
  listId: string;
}

export function PriorityMatrix({ onItemClick, listId }: PriorityMatrixProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editingXAxis, setEditingXAxis] = useState(false);
  const [editingYAxis, setEditingYAxis] = useState(false);

  const { data: todoItems = [] } = useQuery<TodoItem[]>({
    queryKey: ["/api/lists", listId, "todo-items"],
    queryFn: async () => {
      const response = await fetch(`/api/lists/${listId}/todo-items`);
      if (!response.ok) throw new Error('Failed to fetch todo items');
      return response.json();
    },
  });

  const { data: settings } = useQuery<MatrixSettings>({
    queryKey: ["/api/lists", listId, "matrix-settings"],
    queryFn: async () => {
      const response = await fetch(`/api/lists/${listId}/matrix-settings`);
      if (!response.ok) throw new Error('Failed to fetch matrix settings');
      return response.json();
    },
  });

  const [xAxisLabel, setXAxisLabel] = useState(settings?.xAxisLabel || "Impact");
  const [yAxisLabel, setYAxisLabel] = useState(settings?.yAxisLabel || "Urgency");

  const updateMatrixSettingsMutation = useMutation({
    mutationFn: async (data: { xAxisLabel?: string; yAxisLabel?: string }) => {
      return apiRequest("PATCH", `/api/lists/${listId}/matrix-settings`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists", listId, "matrix-settings"] });
    },
  });

  const updateTodoItemMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<TodoItem>) => {
      return apiRequest("PATCH", `/api/lists/${listId}/todo-items/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists", listId, "todo-items"] });
    },
  });

  const handleAxisLabelChange = (axis: 'x' | 'y', value: string) => {
    if (axis === 'x') {
      setXAxisLabel(value);
      updateMatrixSettingsMutation.mutate({ xAxisLabel: value });
    } else {
      setYAxisLabel(value);
      updateMatrixSettingsMutation.mutate({ yAxisLabel: value });
    }
  };

  const handleDrop = (item: DragItem, position: Position, quadrant: QuadrantType) => {
    const relativeX = Math.max(0.05, Math.min(0.95, position.x));
    const relativeY = Math.max(0.05, Math.min(0.95, position.y));

    updateTodoItemMutation.mutate({
      id: item.id,
      positionX: relativeX,
      positionY: relativeY,
      quadrant: quadrant,
    });
  };

  const getQuadrantItems = (quadrant: QuadrantType) => {
    return todoItems.filter((item) => item.quadrant === quadrant);
  };

  // Label positioning variables
  const labelVerticalDistance = 2; // px from top/bottom edges
  const labelHorizontalDistance = 2; // px from left/right edges

  return (
    <div className="flex-1 p-3 custom-810:p-6 overflow-hidden flex items-center justify-center">
      <div 
        data-matrix-export
        className="w-full h-full max-w-[min(100vh-200px,100vw-48px)] custom-810:max-w-[min(100vh-200px,100vw-400px)] max-h-[min(100vh-200px,100vw-48px)] custom-810:max-h-[min(100vh-200px,100vw-400px)] relative p-4 custom-810:p-8"
      >
        {/* Y-Axis Labels - vertical on left side, aligned to top */}
        <div 
          className="absolute -left-8 custom-810:-left-10 top-4 custom-810:top-6 transform -rotate-90 text-sm custom-810:text-lg font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded pt-[4px] pb-[4px] mt-[16px] mb-[16px]"
          style={{ 
            transformOrigin: 'center center'
          }}
          onDoubleClick={() => setEditingYAxis(true)}
          title="Double-click to edit"
        >
          {editingYAxis ? (
            <Input
              value={xAxisLabel}
              onChange={(e) => handleAxisLabelChange('x', e.target.value)}
              onBlur={() => setEditingYAxis(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingYAxis(false)}
              className="w-24 h-6 text-sm transform rotate-90"
              autoFocus
            />
          ) : (
            xAxisLabel
          )}
        </div>
        
        {/* X-Axis Labels - right aligned with chart */}
        <div 
          className="absolute right-0 -bottom-4 custom-810:-bottom-6 text-sm custom-810:text-lg font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded pl-[16px] custom-810:pl-[32px] pr-[16px] custom-810:pr-[32px]"
          onDoubleClick={() => setEditingXAxis(true)}
          title="Double-click to edit"
        >
          {editingXAxis ? (
            <Input
              value={yAxisLabel}
              onChange={(e) => handleAxisLabelChange('y', e.target.value)}
              onBlur={() => setEditingXAxis(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingXAxis(false)}
              className="w-24 h-6 text-sm"
              autoFocus
            />
          ) : (
            yAxisLabel
          )}
        </div>

        {/* Matrix Container */}
        <div 
          data-matrix-container
          className="h-full w-full aspect-square max-h-full relative bg-white rounded-xl border-2 border-gray-300 shadow-sm"
        >
          {/* Grid Lines with axis markers */}
          <div className="absolute inset-0 flex">
            <div className="w-1/2 h-full border-r-2 border-gray-400"></div>
            <div className="w-1/2 h-full"></div>
          </div>
          <div className="absolute inset-0 flex flex-col">
            <div className="w-full h-1/2 border-b-2 border-gray-400"></div>
            <div className="w-full h-1/2"></div>
          </div>

          {/* Internal Low/High Labels */}
          {/* Horizontal axis labels */}
          <div 
            className="absolute left-0 bottom-1/2 text-xs text-gray-500 font-medium"
            style={{ left: `${labelHorizontalDistance + 2}px`, bottom: `calc(50% - 20px)` }}
          >
            Low
          </div>
          <div 
            className="absolute right-0 bottom-1/2 text-xs text-gray-500 font-medium"
            style={{ right: `${labelHorizontalDistance + 2}px`, bottom: `calc(50% - 20px)` }}
          >
            High
          </div>

          {/* Vertical axis labels */}
          <div 
            className="absolute left-1/2 top-0 text-xs text-gray-500 font-medium transform -translate-x-1/2"
            style={{ top: `${labelVerticalDistance}px`, left: `calc(50% + 20px)` }}
          >
            High
          </div>
          <div 
            className="absolute left-1/2 bottom-0 text-xs text-gray-500 font-medium transform -translate-x-1/2"
            style={{ bottom: `${labelVerticalDistance}px`, left: `calc(50% + 20px)` }}
          >
            Low
          </div>

          <TooltipProvider>
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
              {/* Top-left: High Urgency, Low Impact */}
              <Quadrant
                type="high-urgency-low-impact"
                items={getQuadrantItems("high-urgency-low-impact")}
                label=""
                bgColor=""
                onDrop={handleDrop}
                onItemClick={onItemClick}
                listId={listId}
              />
              
              {/* Top-right: High Urgency, High Impact */}
              <Quadrant
                type="high-urgency-high-impact"
                items={getQuadrantItems("high-urgency-high-impact")}
                label=""
                bgColor=""
                onDrop={handleDrop}
                onItemClick={onItemClick}
                listId={listId}
              />
              
              {/* Bottom-left: Low Urgency, Low Impact */}
              <Quadrant
                type="low-urgency-low-impact"
                items={getQuadrantItems("low-urgency-low-impact")}
                label=""
                bgColor=""
                onDrop={handleDrop}
                onItemClick={onItemClick}
                listId={listId}
              />
              
              {/* Bottom-right: Low Urgency, High Impact */}
              <Quadrant
                type="low-urgency-high-impact"
                items={getQuadrantItems("low-urgency-high-impact")}
                label=""
                bgColor=""
                onDrop={handleDrop}
                onItemClick={onItemClick}
                listId={listId}
              />
            </div>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}