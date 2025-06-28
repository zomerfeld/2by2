import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type TodoItem } from "@shared/schema";
import { useTodoDrag } from "@/hooks/use-drag-drop";

interface MatrixItemProps {
  item: TodoItem;
  style?: React.CSSProperties;
}

export function MatrixItem({ item, style }: MatrixItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isDragging, drag } = useTodoDrag(item);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/todo-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todo-items"] });
      toast({
        title: "Success",
        description: "Todo item deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete todo item",
        variant: "destructive",
      });
    },
  });

  const removeFromMatrix = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/todo-items/${item.id}`, {
        positionX: null,
        positionY: null,
        quadrant: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todo-items"] });
    },
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(item.id);
  };

  const handleRemoveFromMatrix = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromMatrix.mutate();
  };

  return (
    <div
      ref={drag}
      style={style}
      className={`absolute p-2 bg-white rounded-lg shadow-md border border-gray-200 cursor-move hover:shadow-lg transition-shadow group ${
        isDragging ? "opacity-50 transform rotate-1" : ""
      }`}
    >
      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
          {item.number}
        </div>
        <span className="text-sm font-medium text-gray-900 max-w-48 truncate">
          {item.text}
        </span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemoveFromMatrix}
            className="h-6 w-6 p-0 hover:bg-yellow-100"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="h-6 w-6 p-0 hover:bg-red-100"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
