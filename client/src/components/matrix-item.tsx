import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type TodoItem } from "@shared/schema";
import { useTodoDrag } from "@/hooks/use-drag-drop";
import { getColorForNumber } from "@/lib/colors";

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
    <div
      ref={drag}
      style={style}
      onDoubleClick={handleDoubleClick}
      className={`absolute cursor-move hover:scale-110 transition-transform group ${
        isDragging ? "opacity-50 transform rotate-12 scale-110" : ""
      }`}
      title={`${item.number}: ${item.text} (Double-click to remove from matrix)`}
    >
      <div 
        className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg hover:shadow-xl transition-shadow"
        style={{ backgroundColor: itemColor }}
      >
        {item.number}
      </div>
    </div>
  );
}
