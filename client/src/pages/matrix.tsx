import { Grid } from "lucide-react";
import { TodoSidebar } from "@/components/todo-sidebar";
import { PriorityMatrix } from "@/components/priority-matrix";

export default function MatrixPage() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Grid className="text-white text-sm" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Priority Matrix</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <TodoSidebar />
        <PriorityMatrix />
      </div>
    </div>
  );
}
