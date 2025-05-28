import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CampaignCard } from "@/components/campaign-card";
import { PaymentModal } from "@/components/payment-modal";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import type { Campaign, Category, User } from "@shared/schema";
import type { CampaignWithDetails } from "@/lib/types";

interface DiscoverProps {
  currentUser?: User;
}

export default function Discover({ currentUser }: DiscoverProps) {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignWithDetails | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const categoryParam = urlParams.get('category');
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [location]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: allCampaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: () => fetch("/api/users").then(res => res.json()).catch(() => []),
  });

  // Filter and sort campaigns
  const filteredCampaigns = allCampaigns.filter(campaign => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = campaign.title.toLowerCase().includes(query);
      const matchesDescription = campaign.description.toLowerCase().includes(query);
      const creator = users.find(u => u.id === campaign.creatorId);
      const matchesCreator = creator?.fullName.toLowerCase().includes(query) || 
                           creator?.username.toLowerCase().includes(query);
      
      if (!matchesTitle && !matchesDescription && !matchesCreator) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== "all") {
      const category = categories.find(c => c.slug === selectedCategory);
      if (category && campaign.categoryId !== category.id) {
        return false;
      }
    }

    // Type filter
    if (selectedType !== "all" && campaign.type !== selectedType) {
      return false;
    }

    return true;
  });

  // Sort campaigns
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
      case "oldest":
        return new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime();
      case "mostFunded":
        return parseFloat(b.currentAmount) - parseFloat(a.currentAmount);
      case "leastFunded":
        return parseFloat(a.currentAmount) - parseFloat(b.currentAmount);
      case "endingSoon":
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      default:
        return 0;
    }
  });

  const campaignsWithDetails: CampaignWithDetails[] = sortedCampaigns.map(campaign => {
    const creator = users.find(u => u.id === campaign.creatorId);
    const category = categories.find(c => c.id === campaign.categoryId);
    const progress = (parseFloat(campaign.currentAmount) / parseFloat(campaign.goalAmount)) * 100;
    const daysLeft = Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    return {
      ...campaign,
      creator,
      category,
      progress,
      daysLeft,
    };
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL without navigation
    const url = new URL(window.location.href);
    if (searchQuery) {
      url.searchParams.set('search', searchQuery);
    } else {
      url.searchParams.delete('search');
    }
    window.history.replaceState({}, '', url.toString());
  };

  const handleBackCampaign = (campaignId: number) => {
    const campaign = campaignsWithDetails.find(c => c.id === campaignId);
    if (campaign) {
      setSelectedCampaign(campaign);
      setShowPaymentModal(true);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedType("all");
    setSortBy("newest");
    window.history.replaceState({}, '', window.location.pathname);
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCategory !== "all" ? selectedCategory : null,
    selectedType !== "all" ? selectedType : null,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Campaigns
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Explore {allCampaigns.length} amazing projects from creators around the world
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search campaigns, creators, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="reward">Reward-based</SelectItem>
                    <SelectItem value="donation">Donation-based</SelectItem>
                    <SelectItem value="equity">Equity-based</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="mostFunded">Most Funded</SelectItem>
                    <SelectItem value="leastFunded">Least Funded</SelectItem>
                    <SelectItem value="endingSoon">Ending Soon</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Search
                  </Button>
                  {activeFiltersCount > 0 && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear ({activeFiltersCount})
                    </Button>
                  )}
                </div>
              </div>
            </form>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: "{searchQuery}"
                  </Badge>
                )}
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Category: {categories.find(c => c.slug === selectedCategory)?.name}
                  </Badge>
                )}
                {selectedType !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Type: {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}-based
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">
            {campaignsWithDetails.length} campaign{campaignsWithDetails.length !== 1 ? 's' : ''} found
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Sorted by {sortBy.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
          </div>
        </div>

        {/* Campaign Grid */}
        {campaignsWithDetails.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaignsWithDetails.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onBack={handleBackCampaign}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mb-4">
                <Filter className="h-12 w-12 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No campaigns found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try adjusting your search criteria or filters to find more campaigns.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}

        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          campaign={selectedCampaign}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}
