import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Download, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MatrixItem } from "./matrix-item";
import { useQuadrantDrop } from "@/hooks/use-drag-drop";
import { type DragItem, type Position, type QuadrantType } from "@/lib/types";
import { type TodoItem, type MatrixSettings } from "@shared/schema";

interface QuadrantProps {
  type: QuadrantType;
  items: TodoItem[];
  label: string;
  bgColor: string;
  onDrop: (item: DragItem, position: Position, quadrant: QuadrantType) => void;
}

function Quadrant({ type, items, label, bgColor, onDrop }: QuadrantProps) {
  const { isOver, canDrop, drop } = useQuadrantDrop(type, onDrop);

  return (
    <div
      ref={drop}
      className={`relative ${bgColor} ${
        isOver ? "bg-blue-100/50" : ""
      } ${canDrop ? "border-2 border-dashed border-blue-400" : ""} transition-colors`}
    >
      <div className="absolute top-4 left-4 text-xs font-medium text-gray-500 bg-white/80 px-2 py-1 rounded">
        {label}
      </div>
      
      {items.map((item) => (
        <MatrixItem
          key={item.id}
          item={item}
          style={{
            left: `${(item.positionX || 0.5) * 100}%`,
            top: `${(item.positionY || 0.5) * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}

export function PriorityMatrix() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: todoItems = [] } = useQuery<TodoItem[]>({
    queryKey: ["/api/todo-items"],
  });

  const { data: settings } = useQuery<MatrixSettings>({
    queryKey: ["/api/matrix-settings"],
  });

  const [xAxisLabel, setXAxisLabel] = useState(settings?.xAxisLabel || "Impact");
  const [yAxisLabel, setYAxisLabel] = useState(settings?.yAxisLabel || "Urgency");

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<TodoItem> }) => {
      const response = await apiRequest("PATCH", `/api/todo-items/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todo-items"] });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<MatrixSettings>) => {
      const response = await apiRequest("PATCH", "/api/matrix-settings", updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matrix-settings"] });
    },
  });

  const clearMatrixMutation = useMutation({
    mutationFn: async () => {
      const promises = todoItems
        .filter(item => item.quadrant)
        .map(item => 
          apiRequest("PATCH", `/api/todo-items/${item.id}`, {
            positionX: null,
            positionY: null,
            quadrant: null,
          })
        );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todo-items"] });
      toast({
        title: "Success",
        description: "Matrix cleared successfully",
      });
    },
  });

  const handleDrop = (item: DragItem, position: Position, quadrant: QuadrantType) => {
    updateItemMutation.mutate({
      id: item.id,
      updates: {
        positionX: position.x,
        positionY: position.y,
        quadrant,
      },
    });
  };

  const handleAxisLabelChange = (axis: 'x' | 'y', value: string) => {
    if (axis === 'x') {
      setXAxisLabel(value);
      updateSettingsMutation.mutate({ xAxisLabel: value });
    } else {
      setYAxisLabel(value);
      updateSettingsMutation.mutate({ yAxisLabel: value });
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "priority-matrix.json";
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Matrix exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export matrix",
        variant: "destructive",
      });
    }
  };

  const getQuadrantItems = (quadrant: QuadrantType) => {
    return todoItems.filter(item => item.quadrant === quadrant);
  };

  const getQuadrantLabel = (xHigh: boolean, yHigh: boolean) => {
    const yLevel = yHigh ? "High" : "Low";
    const xLevel = xHigh ? "High" : "Low";
    return `${yLevel} ${yAxisLabel} / ${xLevel} ${xAxisLabel}`;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Matrix Controls */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Label htmlFor="y-axis" className="text-sm font-medium text-gray-700">
                  Y-Axis:
                </Label>
                <Input
                  id="y-axis"
                  value={yAxisLabel}
                  onChange={(e) => handleAxisLabelChange('y', e.target.value)}
                  className="w-24 h-8 text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="x-axis" className="text-sm font-medium text-gray-700">
                  X-Axis:
                </Label>
                <Input
                  id="x-axis"
                  value={xAxisLabel}
                  onChange={(e) => handleAxisLabelChange('x', e.target.value)}
                  className="w-24 h-8 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" onClick={() => clearMatrixMutation.mutate()}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear Matrix
              </Button>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="flex-1 relative">
            {/* Y-Axis Label */}
            <div className="absolute -left-8 top-1/2 transform -rotate-90 -translate-y-1/2">
              <span className="text-lg font-semibold text-gray-700">{yAxisLabel}</span>
            </div>

            {/* Matrix Container */}
            <div className="h-full w-full relative bg-white rounded-xl border-2 border-gray-300 shadow-sm">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex">
                <div className="w-1/2 h-full border-r border-gray-300"></div>
                <div className="w-1/2 h-full"></div>
              </div>
              <div className="absolute inset-0 flex flex-col">
                <div className="w-full h-1/2 border-b border-gray-300"></div>
                <div className="w-full h-1/2"></div>
              </div>

              {/* Quadrants */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0">
                {/* Top Left: High Y / Low X */}
                <Quadrant
                  type="high-urgency-low-impact"
                  items={getQuadrantItems("high-urgency-low-impact")}
                  label={getQuadrantLabel(false, true)}
                  bgColor="bg-red-50/30 hover:bg-red-50/50"
                  onDrop={handleDrop}
                />

                {/* Top Right: High Y / High X */}
                <Quadrant
                  type="high-urgency-high-impact"
                  items={getQuadrantItems("high-urgency-high-impact")}
                  label={getQuadrantLabel(true, true)}
                  bgColor="bg-red-100/30 hover:bg-red-100/50"
                  onDrop={handleDrop}
                />

                {/* Bottom Left: Low Y / Low X */}
                <Quadrant
                  type="low-urgency-low-impact"
                  items={getQuadrantItems("low-urgency-low-impact")}
                  label={getQuadrantLabel(false, false)}
                  bgColor="bg-yellow-50/30 hover:bg-yellow-50/50"
                  onDrop={handleDrop}
                />

                {/* Bottom Right: Low Y / High X */}
                <Quadrant
                  type="low-urgency-high-impact"
                  items={getQuadrantItems("low-urgency-high-impact")}
                  label={getQuadrantLabel(true, false)}
                  bgColor="bg-green-50/30 hover:bg-green-50/50"
                  onDrop={handleDrop}
                />
              </div>
            </div>

            {/* X-Axis Label */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <span className="text-lg font-semibold text-gray-700">{xAxisLabel}</span>
            </div>

            {/* Axis Value Labels */}
            <div className="absolute -left-16 top-4 text-sm font-medium text-gray-600">High</div>
            <div className="absolute -left-16 bottom-4 text-sm font-medium text-gray-600">Low</div>
            <div className="absolute left-4 -bottom-16 text-sm font-medium text-gray-600">Low</div>
            <div className="absolute right-4 -bottom-16 text-sm font-medium text-gray-600">High</div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
