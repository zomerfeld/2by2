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
      console.log("Storing listId in localStorage:", listId);
      localStorage.setItem("lastListId", listId);
      // Verify it was stored
      const stored = localStorage.getItem("lastListId");
      console.log("Verified stored listId:", stored);
    }
  }, [listId]);
  
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
      <div className="h-screen flex flex-col" onClick={handleContainerClick}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_338_303)">
                  <g style={{mixBlendMode:"lighten"}}>
                    <rect x="22" y="2" width="7" height="7" rx="3" fill="url(#paint0_linear_338_303)"/>
                  </g>
                  <path d="M12 16C13.6569 16 15 17.3431 15 19V24C15 25.6569 13.6569 27 12 27H7C5.34315 27 4 25.6569 4 24V19C4 17.3431 5.34315 16 7 16H12ZM24 16C25.6569 16 27 17.3431 27 19V24C27 25.6569 25.6569 27 24 27H19C17.3431 27 16 25.6569 16 24V19C16 17.3431 17.3431 16 19 16H24ZM12 4C13.6569 4 15 5.34315 15 7V12C15 13.6569 13.6569 15 12 15H7C5.34315 15 4 13.6569 4 12V7C4 5.34315 5.34315 4 7 4H12ZM24 4C25.6569 4 27 5.34315 27 7V12C27 13.6569 25.6569 15 24 15H19C17.3431 15 16 13.6569 16 12V7C16 5.34315 17.3431 4 19 4H24Z" fill="url(#paint1_linear_338_303)"/>
                  <g style={{mixBlendMode:"multiply"}}>
                    <rect x="22" y="2" width="7" height="7" rx="3" fill="url(#paint2_linear_338_303)"/>
                  </g>
                  <path d="M24 4C25.6569 4 27 5.34315 27 7V8.8252C26.6869 8.93604 26.3511 9 26 9H25C23.3431 9 22 7.65685 22 6V5C22 4.649 22.0631 4.31306 22.1738 4H24Z" fill="url(#paint3_linear_338_303)"/>
                </g>
                <defs>
                  <linearGradient id="paint0_linear_338_303" x1="32" y1="0.5" x2="23.5" y2="9" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#EC4F51"/>
                    <stop offset="1" stopColor="#EBB2D2"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear_338_303" x1="22.5" y1="8" x2="6" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#5C88A4"/>
                    <stop offset="1" stopColor="#343C5C"/>
                  </linearGradient>
                  <linearGradient id="paint2_linear_338_303" x1="29" y1="4" x2="23.5" y2="9" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF585C"/>
                    <stop offset="1" stopColor="#EBB2D2"/>
                  </linearGradient>
                  <linearGradient id="paint3_linear_338_303" x1="26" y1="5" x2="21" y2="9" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFF3F9"/>
                    <stop offset="1" stopColor="#FB6DB0"/>
                  </linearGradient>
                  <clipPath id="clip0_338_303">
                    <rect width="31" height="31" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Priority Matrix</h1>
          </div>
          <PriorityMatrixControls listId={listId} />
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <TodoSidebar selectedItemId={selectedItemId} listId={listId!} />
          <PriorityMatrix onItemClick={handleItemClick} listId={listId!} />
        </div>
      </div>
    </DndProvider>
  );
}
