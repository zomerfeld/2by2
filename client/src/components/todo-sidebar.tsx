import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Check, Undo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AddTodoModal } from "./add-todo-modal";
import { type TodoItem } from "@shared/schema";
import { useTodoDrag } from "@/hooks/use-drag-drop";
import { getColorForNumber } from "@/lib/colors";

interface TodoItemComponentProps {
  item: TodoItem;
  onEdit: (id: number, text: string) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (id: number, completed: boolean) => void;
  isCompleted?: boolean;
  isSelected?: boolean;
}

function TodoItemComponent({ item, onEdit, onDelete, onToggleComplete, isCompleted = false, isSelected = false }: TodoItemComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const { isDragging, drag } = useTodoDrag(item);

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== item.text) {
      onEdit(item.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setEditText(item.text);
      setIsEditing(false);
    }
  };

  const itemColor = getColorForNumber(item.number);
  const isOnMatrix = item.quadrant !== null;
  const isUnplaced = item.positionX === null || item.positionY === null;

  return (
    <div className="h-[73px] border-b border-[#4B1700] bg-white flex items-center px-8">
      <div className="flex items-center w-full">
        {/* Red circle with number */}
        <div 
          ref={isCompleted ? undefined : drag}
          className={`w-10 h-10 bg-[#CC3F00] text-white rounded-full flex items-center justify-center text-sm font-bold mr-6 flex-shrink-0 ${
            !isCompleted ? "cursor-move" : ""
          } ${isDragging ? "opacity-50" : ""}`}
        >
          {item.number}
        </div>
        
        {/* Task text */}
        <div className="flex-1 mr-4">
          {isEditing ? (
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyPress}
              className="text-sm font-medium border-0 p-0 h-auto focus-visible:ring-0"
              autoFocus
            />
          ) : (
            <div 
              className={`text-sm font-medium ${
                isCompleted 
                  ? "line-through text-gray-400" 
                  : "text-gray-900"
              } ${isSelected ? "font-semibold" : ""}`}
              onClick={() => !isCompleted && setIsEditing(true)}
            >
              {item.text}
            </div>
          )}
        </div>

        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(item.id, !item.completed)}
          className="w-6 h-6 flex items-center justify-center"
        >
          {isCompleted ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7F2700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 12 2 2 4-4"/>
              <path d="M21.801 4.056a51.7 51.7 0 0 0-3.257 8.337 52.01 52.01 0 0 1-4.153 8.4l-1.1-.55a50.847 50.847 0 0 0 4.7-9.45 49.05 49.05 0 0 1 3.321-8.287l.489 1.55Z"/>
              <path d="M9 12a9 9 0 1 1 9-9"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7F2700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

interface TodoSidebarProps {
  selectedItemId?: number | null;
  listId: string;
}

export function TodoSidebar({ selectedItemId, listId }: TodoSidebarProps) {
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: todoItems = [], isLoading } = useQuery<TodoItem[]>({
    queryKey: ["/api/lists", listId, "todo-items"],
    queryFn: async () => {
      const response = await fetch(`/api/lists/${listId}/todo-items`);
      if (!response.ok) throw new Error('Failed to fetch todo items');
      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<TodoItem> }) => {
      const response = await apiRequest("PATCH", `/api/lists/${listId}/todo-items/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists", listId, "todo-items"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update todo item",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/lists/${listId}/todo-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists", listId, "todo-items"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete todo item",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (id: number, text: string) => {
    updateMutation.mutate({ id, updates: { text } });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleToggleComplete = (id: number, completed: boolean) => {
    const item = todoItems.find(item => item.id === id);
    if (!item) return;
    
    const updates: Partial<TodoItem> = { completed };
    
    if (completed && item?.quadrant) {
      // Item is being completed and is on matrix - store position in memory fields
      updates.positionX = null;
      updates.positionY = null;
      updates.quadrant = null;
      updates.lastPositionX = item.positionX;
      updates.lastPositionY = item.positionY;
      updates.lastQuadrant = item.quadrant;
    } else if (!completed && item.lastPositionX !== null && item.lastPositionY !== null && item.lastQuadrant) {
      // Item is being uncompleted and has stored position - restore it
      updates.positionX = item.lastPositionX;
      updates.positionY = item.lastPositionY;
      updates.quadrant = item.lastQuadrant;
      updates.lastPositionX = null;
      updates.lastPositionY = null;
      updates.lastQuadrant = null;
    }
    
    updateMutation.mutate({ id, updates });
  };

  // Simple sorting: just by item number (creation order)
  const activeItems = todoItems
    .filter(item => !item.completed)
    .sort((a, b) => a.number - b.number);
  
  const completedItems = todoItems.filter(item => item.completed);
  const existingNumbers = todoItems.map(item => item.number);

  return (
    <div className="h-full bg-white flex flex-col">
      {/* All Items - Both Active and Completed */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-gray-500">Loading...</div>
        ) : todoItems.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">No items</div>
        ) : (
          <>
            {/* Active Items */}
            {activeItems.map((item) => (
              <TodoItemComponent
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
                isCompleted={false}
                isSelected={selectedItemId === item.id}
              />
            ))}
            
            {/* Completed Items */}
            {completedItems.map((item) => (
              <TodoItemComponent
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
                isCompleted={true}
                isSelected={selectedItemId === item.id}
              />
            ))}
          </>
        )}
      </div>
      
      <AddTodoModal
        open={showModal}
        onClose={() => setShowModal(false)}
        existingNumbers={existingNumbers}
        listId={listId}
      />
    </div>
  );
}
