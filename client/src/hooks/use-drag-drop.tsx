import { useDrag, useDrop } from "react-dnd";
import { type DragItem, type QuadrantType, type Position } from "@/lib/types";
import { type TodoItem } from "@shared/schema";

export const useTodoDrag = (item: TodoItem) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "todo-item",
    item: {
      id: item.id,
      type: "todo-item" as const,
      text: item.text,
      number: item.number,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return { isDragging, drag };
};

export const useQuadrantDrop = (
  quadrant: QuadrantType,
  onDrop: (item: DragItem, position: Position, quadrant: QuadrantType) => void
) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "todo-item",
    drop: (item: DragItem, monitor) => {
      const clientOffset = monitor.getClientOffset();
      const targetElement = monitor.getDropResult() as any;
      
      if (clientOffset && targetElement) {
        const targetRect = targetElement.getBoundingClientRect();
        const relativeX = (clientOffset.x - targetRect.left) / targetRect.width;
        const relativeY = (clientOffset.y - targetRect.top) / targetRect.height;
        
        onDrop(item, { x: relativeX, y: relativeY }, quadrant);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return { isOver, canDrop, drop };
};
