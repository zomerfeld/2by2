import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MatrixPage from "@/pages/matrix";
import { useEffect, useState } from "react";

function Router() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      // Only handle root URL redirection
      if (window.location.pathname === "/") {
        console.log("Root URL accessed, checking for session and localStorage...");
        
        // First check if session has an existing list
        try {
          console.log("Checking for session list...");
          const sessionResponse = await fetch("/api/session/list");
          console.log("Session response status:", sessionResponse.status);
          
          if (sessionResponse.ok) {
            const sessionList = await sessionResponse.json();
            console.log("Found session list! Redirecting to:", sessionList.listId);
            localStorage.setItem("lastListId", sessionList.listId);
            window.location.href = `/lists/${sessionList.listId}`;
            return;
          }
        } catch (error) {
          console.log("No session list found:", error);
        }
        
        // Fallback: check localStorage for existing list
        const lastListId = localStorage.getItem("lastListId");
        console.log("Found lastListId in localStorage:", lastListId);
        
        if (lastListId && lastListId.trim() !== "") {
          try {
            console.log("Verifying list exists on server:", lastListId);
            const response = await fetch(`/api/lists/${lastListId}`);
            console.log("Server response status:", response.status);
            
            if (response.ok) {
              console.log("List exists! Redirecting to:", lastListId);
              window.location.href = `/lists/${lastListId}`;
              return;
            } else {
              console.log("List not found on server, cleaning localStorage");
              localStorage.removeItem("lastListId");
            }
          } catch (error) {
            console.log("Error verifying list existence:", error);
            localStorage.removeItem("lastListId");
          }
        }
        
        // Create new list if no valid existing list
        try {
          console.log("Creating new list...");
          const response = await fetch("/api/lists", { method: "POST" });
          const { listId } = await response.json();
          console.log("Created new list:", listId);
          localStorage.setItem("lastListId", listId);
          console.log("Stored new listId in localStorage:", listId);
          window.location.href = `/lists/${listId}`;
          return;
        } catch (error) {
          console.error("Failed to create new list:", error);
        }
      }
      
      setIsInitializing(false);
    };

    initializeApp();
  }, []);

  if (isInitializing && window.location.pathname === "/") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-gray-600 text-lg">Loading your workspace...</div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/lists/:listId" component={MatrixPage} />
      <Route path="/" component={() => (
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-gray-600 text-lg">Loading your workspace...</div>
        </div>
      )} />
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
