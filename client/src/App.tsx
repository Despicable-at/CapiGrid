import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/header";
import Home from "@/pages/home";
import Discover from "@/pages/discover";
import CampaignDetails from "@/pages/campaign-details";
import CreateCampaign from "@/pages/create-campaign";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import type { User } from "@shared/schema";

function Router() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <div className="min-h-screen bg-background">
    <div style={{ color: "red", fontSize: 32 }}>I am rendering!</div>
      <Header 
        currentUser={currentUser} 
        onAuthSuccess={handleAuthSuccess}
        onLogout={handleLogout}
      />
      <Switch>
        <Route path="/" component={() => <Home currentUser={currentUser} />} />
        <Route path="/discover" component={() => <Discover currentUser={currentUser} />} />
        <Route path="/campaigns/:id">
          {(params) => <CampaignDetails campaignId={parseInt(params.id)} currentUser={currentUser} />}
        </Route>
        <Route path="/create-campaign" component={() => <CreateCampaign currentUser={currentUser} />} />
        <Route path="/dashboard" component={() => <Dashboard currentUser={currentUser} />} />
        <Route path="/profile" component={() => <Profile currentUser={currentUser} />} />
        <Route path="/categories" component={() => <Discover currentUser={currentUser} />} />
        <Route path="/how-it-works" component={() => <Home currentUser={currentUser} />} />
        <Route path="/success-stories" component={() => <Home currentUser={currentUser} />} />
        <Route component={NotFound} />
      </Switch>
    </div>
    </div>
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
