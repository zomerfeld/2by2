import { useRef } from "react";
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
  const dropRef = useRef<HTMLDivElement>(null);
  
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "todo-item",
    drop: (item: DragItem, monitor) => {
      const clientOffset = monitor.getClientOffset();
      
      if (clientOffset && dropRef.current) {
        const targetRect = dropRef.current.getBoundingClientRect();
        const relativeX = Math.max(0.1, Math.min(0.9, (clientOffset.x - targetRect.left) / targetRect.width));
        const relativeY = Math.max(0.1, Math.min(0.9, (clientOffset.y - targetRect.top) / targetRect.height));
        
        onDrop(item, { x: relativeX, y: relativeY }, quadrant);
      }
      return undefined;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  // Combine the drop ref with the drop connector
  drop(dropRef);

  return { isOver, canDrop, drop: dropRef };
};

export const useSidebarReorderDrag = (item: TodoItem) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "sidebar-reorder",
    item: {
      id: item.id,
      type: "sidebar-reorder" as const,
      text: item.text,
      number: item.number,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return { isDragging, drag };
};

export const useSidebarReorderDrop = (
  targetNumber: number,
  onReorder: (draggedId: number, targetNumber: number) => void
) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "sidebar-reorder",
    drop: (item: DragItem) => {
      if (item.number !== targetNumber) {
        onReorder(item.id, targetNumber);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return { isOver, canDrop, drop };
};
