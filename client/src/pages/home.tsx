import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CampaignCard } from "@/components/campaign-card";
import { PaymentModal } from "@/components/payment-modal";
import { Search, Laptop, Palette, Gamepad2, Heart, GraduationCap, Leaf, ArrowRight, Users, Target, Zap } from "lucide-react";
import type { Campaign, Category, User } from "@shared/schema";
import type { CampaignWithDetails } from "@/lib/types";

interface HomeProps {
  currentUser?: User;
}

export default function Home({ currentUser }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignWithDetails | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: featuredCampaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns", { featured: true }],
    queryFn: () => fetch("/api/campaigns?featured=true").then(res => res.json()),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: () => fetch("/api/users").then(res => res.json()).catch(() => []),
  });

  const campaignsWithDetails: CampaignWithDetails[] = featuredCampaigns.map(campaign => {
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
    if (searchQuery.trim()) {
      window.location.href = `/discover?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleBackCampaign = async (campaignId: number) => {
    const campaign = campaignsWithDetails.find(c => c.id === campaignId);
    if (campaign) {
      setSelectedCampaign(campaign);
      setShowPaymentModal(true);
    }
  };

  const categoryIcons = {
    "Technology": Laptop,
    "Art & Design": Palette,
    "Games": Gamepad2,
    "Health": Heart,
    "Education": GraduationCap,
    "Environment": Leaf,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="gradient-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Bring Your Ideas to Life
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Join thousands of creators and backers on the world's most trusted crowdfunding platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/create-campaign">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Start Your Campaign
                </Button>
              </Link>
              <Link href="/discover">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary"
                >
                  Explore Projects
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative mb-16">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search campaigns, creators, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 text-gray-900 placeholder-gray-500 bg-white border-0 rounded-xl text-lg pr-16"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">{stats.totalFunded}</div>
                <div className="text-blue-200">Total Funded</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">{stats.activeCampaigns.toLocaleString()}</div>
                <div className="text-blue-200">Active Campaigns</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">{stats.successfulProjects.toLocaleString()}</div>
                <div className="text-blue-200">Successful Projects</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">{stats.totalBackers.toLocaleString()}+</div>
                <div className="text-blue-200">Total Backers</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Campaigns
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Discover the most exciting projects happening right now
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaignsWithDetails.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onBack={handleBackCampaign}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/discover">
              <Button variant="outline" size="lg" className="group">
                View All Campaigns
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Explore by Category
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Find projects that match your interests
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => {
              const IconComponent = categoryIcons[category.name as keyof typeof categoryIcons] || Target;
              return (
                <Link key={category.id} href={`/discover?category=${category.slug}`}>
                  <Card className="text-center group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <IconComponent className="h-8 w-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {category.projectCount} projects
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How Capigrid Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Whether you're looking to fund your dream project or support amazing ideas, we make it simple
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* For Creators */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                For Creators
              </h3>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Create Your Campaign
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Tell your story, set your funding goal, and choose your crowdfunding model
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    2
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Share & Promote
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Spread the word to your network and our community of backers
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    3
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Receive Funding
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Get funded and bring your project to life with our support
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Backers */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                For Backers
              </h3>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Discover Projects
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Browse thousands of innovative projects across all categories
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    2
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Back & Support
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Choose your support level and help bring ideas to life
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    3
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Get Rewards
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Receive exclusive rewards, products, or equity based on your contribution
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 gradient-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
            <p className="text-lg text-blue-100">See what our community has accomplished</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face"
                    alt="David Park"
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold">David Park</div>
                    <div className="text-blue-200 text-sm">EcoBottle Creator</div>
                  </div>
                </div>
                <p className="text-blue-100 mb-4">
                  "Capigrid helped us raise $2.3M for our sustainable water bottle project. The platform's tools and community support were incredible."
                </p>
                <div className="text-sm text-blue-200">Funded: $2.3M • 15,000+ backers</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=50&h=50&fit=crop&crop=face"
                    alt="Lisa Chen"
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold">Lisa Chen</div>
                    <div className="text-blue-200 text-sm">SmartGarden Founder</div>
                  </div>
                </div>
                <p className="text-blue-100 mb-4">
                  "From zero to $850K in 30 days. The Capigrid community believed in our vision for automated urban gardening."
                </p>
                <div className="text-sm text-blue-200">Funded: $850K • 8,500+ backers</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=50&h=50&fit=crop&crop=face"
                    alt="Marcus Johnson"
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold">Marcus Johnson</div>
                    <div className="text-blue-200 text-sm">CodeLearner Creator</div>
                  </div>
                </div>
                <p className="text-blue-100 mb-4">
                  "Our educational coding platform reached its goal in just 10 days. Capigrid's equity model opened doors we never imagined."
                </p>
                <div className="text-sm text-blue-200">Funded: $1.5M • 500+ investors</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        campaign={selectedCampaign}
        currentUser={currentUser}
      />
    </div>
  );
}
