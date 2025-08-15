import { useState, useEffect, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TodoSidebar } from "@/components/todo-sidebar";
import { PriorityMatrix, PriorityMatrixControls } from "@/components/priority-matrix";
import { useParams } from "wouter";

export default function MatrixPage() {
  const { listId } = useParams<{ listId: string }>();
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Store the current list ID in localStorage when accessing a list
  useEffect(() => {
    if (listId) {
      console.log("MatrixPage: Storing listId in localStorage:", listId);
      localStorage.setItem("lastListId", listId);
      // Verify it was stored
      const stored = localStorage.getItem("lastListId");
      console.log("MatrixPage: Verified stored listId:", stored);
    }
  }, [listId]);

  // Return loading state if listId is not available
  if (!listId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading matrix...</div>
      </div>
    );
  }
  
  const clearSelection = () => {
    setSelectedItemId(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };
  
  const handleItemClick = (itemId: number) => {
    setSelectedItemId(itemId);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout for 10 seconds
    timeoutRef.current = setTimeout(() => {
      setSelectedItemId(null);
      timeoutRef.current = null;
    }, 10000);
  };
  
  const handleContainerClick = (e: React.MouseEvent) => {
    // Check if the click was on a matrix item or its children
    const target = e.target as HTMLElement;
    const isMatrixItem = target.closest('.matrix-item-container');
    
    if (!isMatrixItem) {
      clearSelection();
    }
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen flex" onClick={handleContainerClick}>
        {/* Left Sidebar - Fixed width matching Figma design */}
        <div className="w-[499px] bg-white flex-shrink-0 border-r border-[#4B1700] overflow-hidden">
          <TodoSidebar selectedItemId={selectedItemId} listId={listId} />
        </div>

        {/* Right Matrix Area - Remaining space with cream background */}
        <div className="flex-1 bg-[#FFF1EB] relative">
          <PriorityMatrix onItemClick={handleItemClick} listId={listId} />
        </div>
      </div>
    </DndProvider>
  );
}
