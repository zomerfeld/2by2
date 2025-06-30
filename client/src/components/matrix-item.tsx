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
  onClick?: (itemId: number) => void;
  listId: string;
}

export function MatrixItem({ item, style, onClick, listId }: MatrixItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isDragging, drag } = useTodoDrag(item);

  const removeFromMatrix = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/lists/${listId}/todo-items/${item.id}`, {
        positionX: null,
        positionY: null,
        quadrant: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists", listId, "todo-items"] });
      toast({
        title: "Success",
        description: "Item moved back to sidebar",
      });
    },
  });

  const handleClick = () => {
    onClick?.(item.id);
  };

  const handleDoubleClick = () => {
    removeFromMatrix.mutate();
  };

  const itemColor = getColorForNumber(item.number);
  const isUnplaced = item.positionX === null || item.positionY === null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          ref={drag}
          style={style}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          className={`matrix-item-container absolute cursor-move hover:scale-110 transition-transform group ${
            isDragging ? "opacity-50 transform rotate-12 scale-110" : ""
          }`}
        >
          <div 
            className={`w-10 h-10 md:w-8 md:h-8 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg hover:shadow-xl transition-shadow ${
              isUnplaced ? "ring-2 ring-red-500 ring-offset-1" : ""
            }`}
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
