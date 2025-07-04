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
    <div
      ref={isCompleted ? undefined : drag}
      className={`py-2 px-2 transition-all relative border-b border-gray-100 last:border-b-0 ${
        isCompleted 
          ? "opacity-75" 
          : "cursor-move"
      } ${isDragging ? "opacity-50 transform rotate-1" : ""} ${
        isSelected ? "highlight-yellow" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div 
            className={`w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-medium ${
              isUnplaced && !isCompleted ? "ring-2 ring-red-500 ring-offset-1" : ""
            }`}
            style={{ backgroundColor: itemColor }}
          >
            {item.number}
          </div>
          {isEditing ? (
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyPress}
              className="flex-1 h-auto p-1 text-sm"
              autoFocus
            />
          ) : (
            <span 
              className={`flex-1 font-medium cursor-text text-sm ${
                isCompleted ? "text-gray-500 line-through" : "text-gray-900"
              }`}
              onClick={() => !isCompleted && setIsEditing(true)}
            >
              {item.text}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleComplete(item.id, !isCompleted)}
            className={`h-6 w-6 p-0 ${
              isCompleted 
                ? "text-green-600 hover:text-green-700" 
                : "text-gray-400 hover:text-green-600"
            }`}
          >
            {isCompleted ? <Undo className="h-3 w-3" /> : <Check className="h-3 w-3" />}
          </Button>
          {!isCompleted && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(item.id)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-3 w-3" />
          </Button>

        </div>
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
    <div className="w-full custom-810:w-80 bg-white border-b custom-810:border-b-0 custom-810:border-r border-gray-200 flex flex-col custom-810:h-full">
      <div className="px-6 pt-6 pb-1">
        <Button
          onClick={() => setShowModal(true)}
          className="w-full"
          disabled={todoItems.length >= 100}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* Active Items */}
        <div className="px-6 pt-2 pb-6">
          {isLoading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : activeItems.length === 0 ? (
            <div className="text-center text-gray-500">No active items</div>
          ) : (
            activeItems.map((item) => (
              <TodoItemComponent
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
                isCompleted={false}
                isSelected={selectedItemId === item.id}
              />
            ))
          )}
        </div>

        {/* Completed Items Section */}
        {completedItems.length > 0 && (
          <>
            <Separator className="mx-6" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Completed ({completedItems.length})</h3>
                <button
                  onClick={() => {
                    completedItems.forEach(item => {
                      deleteMutation.mutate(item.id);
                    });
                  }}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  title="Clear all completed tasks"
                >
                  Clear All
                </button>
              </div>
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
            </div>
          </>
        )}
      </div>
      <div className="p-6 border-t border-gray-200 pl-[8px] pr-[8px] pt-[8px] pb-[8px]">
        <div className="text-gray-500 text-center text-[12px]">
          {activeItems.length} active, {completedItems.length} completed
        </div>
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
