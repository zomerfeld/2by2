import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MatrixPage from "@/pages/matrix";
import { useEffect, useState } from "react";

function Router() {
  const [newListId, setNewListId] = useState<string | null>(null);

  // Create a new list when accessing root URL
  useEffect(() => {
    const createNewList = async () => {
      if (window.location.pathname === "/") {
        try {
          const response = await fetch("/api/lists", { method: "POST" });
          const { listId } = await response.json();
          setNewListId(listId);
        } catch (error) {
          console.error("Failed to create new list:", error);
        }
      }
    };
    createNewList();
  }, []);

  if (window.location.pathname === "/" && newListId) {
    return <Redirect to={`/lists/${newListId}`} />;
  }

  return (
    <Switch>
      <Route path="/lists/:listId" component={MatrixPage} />
      <Route path="/" component={() => <div>Creating new list...</div>} />
      <Route path="*" component={() => <Redirect to="/" />} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
