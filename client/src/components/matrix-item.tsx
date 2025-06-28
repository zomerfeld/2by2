import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type TodoItem } from "@shared/schema";
import { useTodoDrag } from "@/hooks/use-drag-drop";
import { getColorForNumber } from "@/lib/colors";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MatrixItemProps {
  item: TodoItem;
  style?: React.CSSProperties;
}

export function MatrixItem({ item, style }: MatrixItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isDragging, drag } = useTodoDrag(item);

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
      toast({
        title: "Success",
        description: "Item moved back to sidebar",
      });
    },
  });

  const handleDoubleClick = () => {
    removeFromMatrix.mutate();
  };

  const itemColor = getColorForNumber(item.number);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          ref={drag}
          style={style}
          onDoubleClick={handleDoubleClick}
          className={`absolute cursor-move hover:scale-110 transition-transform group ${
            isDragging ? "opacity-50 transform rotate-12 scale-110" : ""
          }`}
        >
          <div 
            className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg hover:shadow-xl transition-shadow"
            style={{ backgroundColor: itemColor }}
          >
            {item.number}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{item.text}</p>
        <p className="text-xs text-gray-400">Double-click to remove from matrix</p>
      </TooltipContent>
    </Tooltip>
  );
}
