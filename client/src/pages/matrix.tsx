import { useState } from "react";
import { Grid, ChevronLeft, ChevronRight } from "lucide-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@/components/ui/button";
import { TodoSidebar } from "@/components/todo-sidebar";
import { PriorityMatrix } from "@/components/priority-matrix";

export default function MatrixPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Grid className="text-white text-sm" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Priority Matrix</h1>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {!sidebarCollapsed && <TodoSidebar />}
          <PriorityMatrix isFullWidth={sidebarCollapsed} />
        </div>
      </div>
    </DndProvider>
  );
}
