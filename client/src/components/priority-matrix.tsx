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
    <div 
      data-testid="MatrixArea"
      className="h-screen p-3 custom-810:p-6 overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: 'rgba(255, 220, 204, 0.4)' }}
    >
      <div 
        data-matrix-export
        className="w-full h-full max-w-[min(100vh-200px,100vw-48px)] custom-810:max-w-[min(100vh-200px,100vw-400px)] max-h-[min(100vh-200px,100vw-48px)] custom-810:max-h-[min(100vh-200px,100vw-400px)] relative p-4 custom-810:p-8"
      >


        {/* Matrix Container */}
        <div 
          data-matrix-container
          className="h-full w-full aspect-square max-h-full relative border-2 shadow-sm"
          style={{ 
            borderColor: 'rgba(127, 39, 0, 0.3)'
          }}
        >
          {/* Grid Lines with axis markers */}
          <div className="absolute inset-0 flex">
            <div 
              className="w-1/2 h-full border-r-2"
              style={{ borderColor: 'rgba(127, 39, 0, 0.3)' }}
            ></div>
            <div className="w-1/2 h-full"></div>
          </div>
          <div className="absolute inset-0 flex flex-col">
            <div 
              className="w-full h-1/2 border-b-2"
              style={{ borderColor: 'rgba(127, 39, 0, 0.3)' }}
            ></div>
            <div className="w-full h-1/2"></div>
          </div>

          {/* Quadrant Labels above matrix */}
          <div className="absolute -top-8 custom-810:-top-10 left-0 right-0 flex text-sm custom-810:text-base font-normal" style={{ color: '#7F2700' }}>
            <div className="w-1/2 text-center">Less Urgent</div>
            <div className="w-1/2 text-center">Urgent</div>
          </div>
          
          {/* Impact Labels on left side */}
          <div className="absolute -left-16 custom-810:-left-20 top-0 bottom-0 flex flex-col text-sm custom-810:text-base font-normal" style={{ color: '#7F2700' }}>
            <div className="h-1/2 flex items-center">
              <div className="transform -rotate-90 whitespace-nowrap">Low Impact</div>
            </div>
            <div className="h-1/2 flex items-center">
              <div className="transform -rotate-90 whitespace-nowrap">High Impact</div>
            </div>
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