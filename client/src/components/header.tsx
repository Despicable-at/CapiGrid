import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Menu, User, Plus, BarChart3, LogOut } from "lucide-react";
import { AuthModal } from "./auth-modal";

interface HeaderProps {
  currentUser?: any;
  onAuthSuccess?: (user: any) => void;
  onLogout?: () => void;
}

export function Header({ currentUser, onAuthSuccess, onLogout }: HeaderProps) {
  const [location, navigate] = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignIn = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  const handleStartCampaign = () => {
    if (!currentUser) {
      setAuthMode("register");
      setShowAuthModal(true);
    } else {
      navigate("/create-campaign");
    }
  };

  const navItems = [
    { href: "/discover", label: "Discover" },
    { href: "/categories", label: "Categories" },
    { href: "/how-it-works", label: "How it works" },
    { href: "/success-stories", label: "Success Stories" },
  ];

  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold text-primary cursor-pointer">
                  Capigrid
                </h1>
              </Link>
              <nav className="hidden md:ml-10 md:flex md:space-x-8">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <a className={`px-3 py-2 text-sm font-medium transition-colors ${
                      location === item.href
                        ? "text-primary"
                        : "text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                    }`}>
                      {item.label}
                    </a>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search campaigns, creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full px-3"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>

            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  <Button
                    onClick={handleStartCampaign}
                    className="hidden md:flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Start a Campaign</span>
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={currentUser.avatar} alt={currentUser.fullName} />
                          <AvatarFallback>
                            {currentUser.fullName?.charAt(0) || currentUser.username?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleSignIn}
                    className="hidden md:block"
                  >
                    Sign In
                  </Button>
                  <Button onClick={handleStartCampaign}>
                    Start a Campaign
                  </Button>
                </>
              )}

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="flex flex-col space-y-4 mt-6">
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="relative">
                      <Input
                        type="text"
                        placeholder="Search campaigns..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        variant="ghost"
                        className="absolute right-0 top-0 h-full px-3"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </form>

                    {/* Mobile Navigation */}
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <a className="block px-3 py-2 text-base font-medium text-gray-900 dark:text-white">
                          {item.label}
                        </a>
                      </Link>
                    ))}

                    {!currentUser && (
                      <Button onClick={handleSignIn} className="mt-4">
                        Sign In
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        onSuccess={(user) => {
          onAuthSuccess?.(user);
          setShowAuthModal(false);
        }}
      />
    </>
  );
}
