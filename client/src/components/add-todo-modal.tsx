import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type InsertTodoItem } from "@shared/schema";

interface AddTodoModalProps {
  open: boolean;
  onClose: () => void;
  existingNumbers: number[];
}

export function AddTodoModal({ open, onClose, existingNumbers }: AddTodoModalProps) {
  const [text, setText] = useState("");
  const [number, setNumber] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTodoMutation = useMutation({
    mutationFn: async (data: InsertTodoItem) => {
      const response = await apiRequest("POST", "/api/todo-items", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todo-items"] });
      toast({
        title: "Success",
        description: "Todo item created successfully",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create todo item",
        variant: "destructive",
      });
    },
  });

  const getNextAvailableNumber = () => {
    for (let i = 1; i <= 15; i++) {
      if (!existingNumbers.includes(i)) {
        return i;
      }
    }
    return 1;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task description",
        variant: "destructive",
      });
      return;
    }

    const todoNumber = number ? parseInt(number) : getNextAvailableNumber();
    
    if (existingNumbers.includes(todoNumber)) {
      toast({
        title: "Error",
        description: "This number is already in use",
        variant: "destructive",
      });
      return;
    }

    createTodoMutation.mutate({
      text: text.trim(),
      number: todoNumber,
      positionX: null,
      positionY: null,
      quadrant: null,
      completed: false,
    });
  };

  const handleClose = () => {
    setText("");
    setNumber("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New To-Do Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="text">Task</Label>
            <Input
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter task description..."
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="number">Item Number</Label>
            <Input
              id="number"
              type="number"
              min="1"
              max="15"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder={`Auto-assigned (${getNextAvailableNumber()})`}
              className="mt-1"
            />
          </div>
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTodoMutation.isPending}
              className="flex-1"
            >
              {createTodoMutation.isPending ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
