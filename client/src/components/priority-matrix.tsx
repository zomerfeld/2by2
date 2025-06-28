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
import jsPDF from "jspdf";

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
      } ${canDrop ? "border-2 border-dashed border-blue-400" : ""} transition-colors h-full w-full`}
    >
      <div className="absolute top-4 left-4 text-xs font-medium text-gray-500 bg-white/80 px-2 py-1 rounded z-10">
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
            zIndex: 20,
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
  const [editingXAxis, setEditingXAxis] = useState(false);
  const [editingYAxis, setEditingYAxis] = useState(false);

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

      // Export PNG screenshot
      const element = document.body;
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 1,
        useCORS: true,
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

      // Export PDF
      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 297; // A4 landscape width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`priority-matrix-${timestamp}.pdf`);

      toast({
        title: "Export successful",
        description: "Matrix exported as JSON, PNG, and PDF files",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the matrix",
        variant: "destructive",
      });
    }
  };

  const getQuadrantItems = (quadrant: QuadrantType) => {
    return todoItems.filter(item => item.quadrant === quadrant && !item.completed);
  };

  const getQuadrantLabel = (xHigh: boolean, yHigh: boolean) => {
    const yLevel = yHigh ? "High" : "Low";
    const xLevel = xHigh ? "High" : "Low";
    return `${yLevel} ${yAxisLabel} / ${xLevel} ${xAxisLabel}`;
  };

  return (
    <div className="flex-1 p-6 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Export Controls */}
        <div className="mb-6 flex items-center justify-end">
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleExport} title="Export data">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => clearMatrixMutation.mutate()}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Clear Matrix
            </Button>
          </div>
        </div>

        {/* Matrix Grid with Axis Labels */}
        <div className="flex-1 relative p-16 mt-4">
          {/* Y-Axis Labels - centered vertically on left side */}
          <div 
            className="absolute -left-6 top-1/2 transform -translate-y-1/2 -rotate-90 text-lg font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
            onDoubleClick={() => setEditingYAxis(true)}
            title="Double-click to edit"
          >
            {editingYAxis ? (
              <Input
                value={yAxisLabel}
                onChange={(e) => handleAxisLabelChange('y', e.target.value)}
                onBlur={() => setEditingYAxis(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingYAxis(false)}
                className="w-24 h-6 text-sm transform rotate-90"
                autoFocus
              />
            ) : (
              yAxisLabel
            )}
          </div>
          
          {/* Y-Axis Value Labels */}
          <div className="absolute -left-12 top-4 text-sm font-medium text-gray-600 transform -rotate-90 origin-center">
            High
          </div>
          <div className="absolute -left-12 bottom-4 text-sm font-medium text-gray-600 transform -rotate-90 origin-center">
            Low
          </div>
          
          {/* X-Axis Labels - centered horizontally on bottom */}
          <div 
            className="absolute left-1/2 -bottom-6 transform -translate-x-1/2 text-lg font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
            onDoubleClick={() => setEditingXAxis(true)}
            title="Double-click to edit"
          >
            {editingXAxis ? (
              <Input
                value={xAxisLabel}
                onChange={(e) => handleAxisLabelChange('x', e.target.value)}
                onBlur={() => setEditingXAxis(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingXAxis(false)}
                className="w-24 h-6 text-sm"
                autoFocus
              />
            ) : (
              xAxisLabel
            )}
          </div>
          
          {/* X-Axis Value Labels */}
          <div className="absolute left-4 -bottom-12 text-sm font-medium text-gray-600">
            Low
          </div>
          <div className="absolute right-4 -bottom-12 text-sm font-medium text-gray-600">
            High
          </div>

          {/* Matrix Container */}
          <div className="h-full w-full relative bg-white rounded-xl border-2 border-gray-300 shadow-sm">
            {/* Grid Lines with axis markers */}
            <div className="absolute inset-0 flex">
              <div className="w-1/2 h-full border-r-2 border-gray-400"></div>
              <div className="w-1/2 h-full"></div>
            </div>
            <div className="absolute inset-0 flex flex-col">
              <div className="w-full h-1/2 border-b-2 border-gray-400"></div>
              <div className="w-full h-1/2"></div>
            </div>

            {/* Quadrants */}
            <TooltipProvider>
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
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
