import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MatrixPage from "@/pages/matrix";
import { useEffect, useState } from "react";

function Router() {
  const [newListId, setNewListId] = useState<string | null>(null);

  // Handle root URL access - redirect to last list or create new one
  useEffect(() => {
    const handleRootAccess = async () => {
      if (window.location.pathname === "/") {
        // Check if user has a previous list stored in localStorage
        const lastListId = localStorage.getItem("lastListId");
        
        if (lastListId) {
          // Verify the list still exists on the server
          try {
            const response = await fetch(`/api/lists/${lastListId}`);
            if (response.ok) {
              setNewListId(lastListId);
              return;
            }
          } catch (error) {
            console.log("Previous list no longer exists, creating new one");
          }
        }
        
        // Create a new list if no valid previous list exists
        try {
          const response = await fetch("/api/lists", { method: "POST" });
          const { listId } = await response.json();
          localStorage.setItem("lastListId", listId);
          setNewListId(listId);
        } catch (error) {
          console.error("Failed to create new list:", error);
        }
      }
    };
    handleRootAccess();
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
