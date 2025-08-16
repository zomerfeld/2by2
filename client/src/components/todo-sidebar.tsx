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
import LogoNew from "./LogoNew";

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

  const showCheckmarkOnly = !isCompleted && !isEditing;

  return (
    <div
      ref={isCompleted ? undefined : drag}
      className={`transition-all relative ${
        isCompleted 
          ? "opacity-75" 
          : "cursor-move"
      } ${isDragging ? "opacity-50 transform rotate-1" : ""} ${
        isSelected ? "highlight-yellow" : ""
      }`}
      style={{
        display: 'flex',
        padding: isCompleted ? '8px 16px 8px 24px' : '12px 16px 12px 24px',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'stretch',
        borderBottom: isCompleted ? 'none' : '1px solid #4B1700',
        background: 'var(--sds-color-background-default-default, #fff)'
      }}
    >
      <div className="flex items-center gap-6 flex-1">
        <div 
          className={
            isCompleted 
              ? "w-5 h-5 text-white rounded-full flex items-center justify-center font-mono text-base font-bold" 
              : `w-6 h-6 text-white rounded-full flex items-center justify-center text-sm font-medium ${
                  isUnplaced ? "ring-2 ring-offset-1" : ""
                }`
          }
          style={{ 
            backgroundColor: isCompleted ? '#C6C4CB' : (isUnplaced ? '#413B51' : itemColor),
            fontSize: isCompleted ? '16px' : undefined,
            ...(isUnplaced && !isCompleted && { '--tw-ring-color': '#413B51' })
          }}
        >
          {isCompleted ? '*' : item.number}
        </div>
        {isEditing ? (
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyPress}
            className="flex-1 h-auto py-1 px-2 font-medium text-[14px] border-none shadow-none bg-transparent focus:ring-0 focus:outline-none"
            style={{ color: '#4B1700' }}
            autoFocus
          />
        ) : (
          <span 
            className={`flex-1 font-medium cursor-text text-[14px] ${
              isCompleted ? "line-through" : ""
            }`}
            onClick={() => !isCompleted && setIsEditing(true)}
            style={{ color: isCompleted ? '#8D8997' : '#4B1700' }}
          >
            {item.text}
          </span>
        )}
      </div>
      {showCheckmarkOnly ? (
        <Button
          variant="ghost"
          onClick={() => onToggleComplete(item.id, true)}
          className="h-8 w-8 p-0 text-brown-700 hover:text-brown-800"
          style={{ color: '#4B1700' }}
        >
          <Check className="h-5 w-5" />
        </Button>
      ) : (
        <div className="flex items-center space-x-2 ml-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleComplete(item.id, !isCompleted)}
            className="h-6 w-6 p-0"
            style={{ 
              color: isCompleted ? '#8D8997' : '#9CA3AF'
            }}
          >
            {isCompleted ? <Undo className="h-3 w-3" /> : <Check className="h-3 w-3" />}
          </Button>
          {isCompleted && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(item.id)}
              className="h-6 w-6 p-0"
              style={{ color: '#8D8997' }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
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
      {/* Logo Header - Desktop only */}
      <div className="hidden custom-810:block">
        <LogoNew 
          onAddClick={() => setShowModal(true)} 
          disabled={todoItems.length >= 100}
        />
      </div>
      {/* Mobile Add Button - centered above todo list */}
      <div className="block custom-810:hidden p-4 flex justify-center">
        <button
          onClick={() => setShowModal(true)}
          disabled={todoItems.length >= 100}
          className="flex px-4 py-3 justify-center items-center gap-2 rounded-lg border-2 hover:bg-[#B03600] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 ease-in-out text-white font-medium cursor-pointer text-sm bg-[#CC3F00]"
          style={{ borderColor: '#4B1700' }}
        >
          <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
            <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.50016 3.33333V12.6667M3.8335 7.99999H13.1668" stroke="#F5F5F5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          Add New Item
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* Active Items */}
        <div className="px-6 pl-[0px] pr-[0px] pt-[0px] pb-[0px]">
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
          <div className="p-6 pl-[0px] pr-[0px]">
              <div className="flex items-center justify-between mb-4 pl-[24px] pr-[24px]">
                <h3 
                  className="font-mono uppercase"
                  style={{
                    color: 'black',
                    fontSize: '12px',
                    fontWeight: 400
                  }}
                >
                  // Completed Tasks
                </h3>
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
