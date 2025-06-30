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
        // Add a small delay to ensure localStorage is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if user has a previous list stored in localStorage
        const lastListId = localStorage.getItem("lastListId");
        console.log("Checking localStorage for lastListId:", lastListId);
        
        if (lastListId && lastListId.trim() !== "") {
          // Verify the list still exists on the server
          try {
            const response = await fetch(`/api/lists/${lastListId}`);
            console.log("Checking if list exists on server:", response.status);
            if (response.ok) {
              console.log("Redirecting to existing list:", lastListId);
              setNewListId(lastListId);
              return;
            } else {
              console.log("List not found on server, removing from localStorage");
              localStorage.removeItem("lastListId");
            }
          } catch (error) {
            console.log("Error checking list existence:", error);
            localStorage.removeItem("lastListId");
          }
        }
        
        // Create a new list if no valid previous list exists
        try {
          console.log("Creating new list because no valid existing list found");
          const response = await fetch("/api/lists", { method: "POST" });
          const { listId } = await response.json();
          console.log("Created new list:", listId);
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
