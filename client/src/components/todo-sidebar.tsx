import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AddTodoModal } from "./add-todo-modal";
import { type TodoItem } from "@shared/schema";
import { useTodoDrag } from "@/hooks/use-drag-drop";

interface TodoItemComponentProps {
  item: TodoItem;
  onEdit: (id: number, text: string) => void;
  onDelete: (id: number) => void;
}

function TodoItemComponent({ item, onEdit, onDelete }: TodoItemComponentProps) {
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

  return (
    <div
      ref={drag}
      className={`mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-move hover:shadow-md transition-shadow ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
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
              className="flex-1 text-gray-900 font-medium cursor-text"
              onClick={() => setIsEditing(true)}
            >
              {item.text}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(item.id)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <div className="text-gray-400 cursor-move">
            <GripVertical className="h-4 w-4" />
          </div>
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
      toast({
        title: "Success",
        description: "Todo item updated successfully",
      });
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
      toast({
        title: "Success",
        description: "Todo item deleted successfully",
      });
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

  const unpositionedItems = todoItems.filter(item => !item.quadrant);
  const existingNumbers = todoItems.map(item => item.number);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Todo Items</h2>
        <Button
          onClick={() => setShowModal(true)}
          className="w-full"
          disabled={todoItems.length >= 15}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : unpositionedItems.length === 0 ? (
          <div className="text-center text-gray-500">
            {todoItems.length === 0 ? "No todo items yet" : "All items are positioned in the matrix"}
          </div>
        ) : (
          unpositionedItems.map((item) => (
            <TodoItemComponent
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <div className="p-6 border-t border-gray-200">
        <div className="text-sm text-gray-500 text-center">
          {todoItems.length} of 15 items created
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
