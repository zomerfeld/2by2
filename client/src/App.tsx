import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MatrixPage from "@/pages/matrix";
import { useEffect, useState } from "react";

function Router() {
  const [newListId, setNewListId] = useState<string | null>(null);
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);

  // Handle root URL access - redirect to last list or create new one
  useEffect(() => {
    const handleRootAccess = async () => {
      if (window.location.pathname === "/") {
        console.log("Root URL accessed, checking for existing list...");
        
        // Check if user has a previous list stored in localStorage
        const lastListId = localStorage.getItem("lastListId");
        console.log("Found lastListId in localStorage:", lastListId);
        
        if (lastListId && lastListId.trim() !== "") {
          // Verify the list still exists on the server
          try {
            console.log("Verifying list exists on server:", lastListId);
            const response = await fetch(`/api/lists/${lastListId}`);
            console.log("Server response status:", response.status);
            
            if (response.ok) {
              console.log("List exists! Redirecting to:", lastListId);
              setNewListId(lastListId);
              setIsCheckingStorage(false);
              return;
            } else {
              console.log("List not found on server, cleaning localStorage");
              localStorage.removeItem("lastListId");
            }
          } catch (error) {
            console.log("Error verifying list existence:", error);
            localStorage.removeItem("lastListId");
          }
        } else {
          console.log("No previous list found in localStorage");
        }
        
        // Create a new list if no valid previous list exists
        try {
          console.log("Creating new list...");
          const response = await fetch("/api/lists", { method: "POST" });
          const { listId } = await response.json();
          console.log("Created new list:", listId);
          localStorage.setItem("lastListId", listId);
          console.log("Stored new listId in localStorage:", listId);
          setNewListId(listId);
        } catch (error) {
          console.error("Failed to create new list:", error);
        }
        
        setIsCheckingStorage(false);
      }
    };
    handleRootAccess();
  }, []);

  if (window.location.pathname === "/" && isCheckingStorage) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-600">Loading your workspace...</div>
    </div>;
  }

  if (window.location.pathname === "/" && newListId) {
    return <Redirect to={`/lists/${newListId}`} />;
  }

  return (
    <Switch>
      <Route path="/lists/:listId" component={MatrixPage} />
      <Route path="/" component={() => <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading your workspace...</div>
      </div>} />
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
