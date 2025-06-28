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
}

function TodoItemComponent({ item, onEdit, onDelete, onToggleComplete, isCompleted = false }: TodoItemComponentProps) {
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

  return (
    <div
      ref={isCompleted ? undefined : drag}
      className={`mb-3 p-3 rounded-lg border transition-all ${
        isCompleted 
          ? "bg-gray-100 border-gray-300 opacity-75" 
          : isOnMatrix
            ? "bg-gray-50 border-gray-200 cursor-move hover:shadow-md"
            : "bg-red-50 border-red-200 border-2 cursor-move hover:shadow-md"
      } ${isDragging ? "opacity-50 transform rotate-1" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div 
            className="w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-medium"
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
              className={`flex-1 font-medium cursor-text ${
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

export function TodoSidebar() {
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: todoItems = [], isLoading } = useQuery<TodoItem[]>({
    queryKey: ["/api/todo-items"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<TodoItem> }) => {
      const response = await apiRequest("PATCH", `/api/todo-items/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todo-items"] });
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
      await apiRequest("DELETE", `/api/todo-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todo-items"] });
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

  const activeItems = todoItems.filter(item => !item.completed);
  const completedItems = todoItems.filter(item => item.completed);
  const existingNumbers = todoItems.map(item => item.number);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">To-Do Items</h2>
        <Button
          onClick={() => setShowModal(true)}
          className="w-full"
          disabled={todoItems.length >= 15}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Active Items */}
        <div className="p-6">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    completedItems.forEach(item => {
                      deleteMutation.mutate(item.id);
                    });
                  }}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  title="Clear all completed tasks"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              {completedItems.map((item) => (
                <TodoItemComponent
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleComplete={handleToggleComplete}
                  isCompleted={true}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-6 border-t border-gray-200">
        <div className="text-sm text-gray-500 text-center">
          {activeItems.length} active, {completedItems.length} completed
        </div>
      </div>

      <AddTodoModal
        open={showModal}
        onClose={() => setShowModal(false)}
        existingNumbers={existingNumbers}
      />
    </div>
  );
}
