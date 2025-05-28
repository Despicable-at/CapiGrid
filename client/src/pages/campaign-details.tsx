import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { PaymentModal } from "@/components/payment-modal";
import { 
  Calendar, 
  Users, 
  Target, 
  Share2, 
  Heart, 
  MapPin, 
  Clock,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Star
} from "lucide-react";
import type { Campaign, User, Reward, Contribution, CampaignUpdate } from "@shared/schema";
import type { CampaignWithDetails } from "@/lib/types";

interface CampaignDetailsProps {
  campaignId: number;
  currentUser?: User;
}

export default function CampaignDetails({ campaignId, currentUser }: CampaignDetailsProps) {
  const [, navigate] = useLocation();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState("story");

  const { data: campaign, isLoading: campaignLoading } = useQuery<Campaign>({
    queryKey: [`/api/campaigns/${campaignId}`],
  });

  const { data: creator } = useQuery<User>({
    queryKey: [`/api/users/${campaign?.creatorId}`],
    enabled: !!campaign?.creatorId,
  });

  const { data: rewards = [] } = useQuery<Reward[]>({
    queryKey: [`/api/campaigns/${campaignId}/rewards`],
    enabled: !!campaign,
  });

  const { data: contributions = [] } = useQuery<Contribution[]>({
    queryKey: [`/api/campaigns/${campaignId}/contributions`],
    enabled: !!campaign,
  });

  const { data: updates = [] } = useQuery<CampaignUpdate[]>({
    queryKey: [`/api/campaigns/${campaignId}/updates`],
    enabled: !!campaign,
  });

  if (campaignLoading || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = (parseFloat(campaign.currentAmount) / parseFloat(campaign.goalAmount)) * 100;
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  const campaignWithDetails: CampaignWithDetails = {
    ...campaign,
    creator,
    rewards,
    contributions,
    progress,
    daysLeft,
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "reward":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "donation":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "equity":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getActionButton = () => {
    const baseProps = {
      size: "lg" as const,
      className: "w-full font-semibold",
      onClick: () => setShowPaymentModal(true),
    };

    switch (campaign.type) {
      case "reward":
        return (
          <Button {...baseProps} className="bg-primary hover:bg-primary/90 text-white">
            Back This Project
          </Button>
        );
      case "donation":
        return (
          <Button {...baseProps} className="bg-green-600 hover:bg-green-700 text-white">
            Donate Now
          </Button>
        );
      case "equity":
        return (
          <Button {...baseProps} className="bg-purple-600 hover:bg-purple-700 text-white">
            Invest Now
          </Button>
        );
      default:
        return (
          <Button {...baseProps}>
            Support
          </Button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Image */}
        <div className="aspect-video mb-8 overflow-hidden rounded-xl">
          <img
            src={campaign.image}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Header */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className={getTypeColor(campaign.type)}>
                  {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}-based
                </Badge>
                {campaign.featured && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {campaign.title}
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                {campaign.shortDescription}
              </p>

              {creator && (
                <div className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={creator.avatar} alt={creator.fullName} />
                    <AvatarFallback>
                      {creator.fullName?.charAt(0) || creator.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {creator.fullName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Campaign Creator
                    </p>
                    {creator.bio && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {creator.bio}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="story">Story</TabsTrigger>
                <TabsTrigger value="rewards">
                  {campaign.type === "equity" ? "Investment" : "Rewards"} ({rewards.length})
                </TabsTrigger>
                <TabsTrigger value="updates">Updates ({updates.length})</TabsTrigger>
                <TabsTrigger value="community">Community ({contributions.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="story" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="prose max-w-none dark:prose-invert">
                      <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                        {campaign.description}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rewards" className="mt-6">
                <div className="space-y-4">
                  {rewards.length > 0 ? (
                    rewards.map((reward) => (
                      <Card key={reward.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                {reward.title}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {reward.description}
                              </p>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                {reward.estimatedDelivery && (
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span>Est. {reward.estimatedDelivery}</span>
                                  </div>
                                )}
                                {reward.limitedQuantity && (
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    <span>{reward.limitedQuantity - reward.claimed} left</span>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <Target className="h-4 w-4 mr-1" />
                                  <span>{reward.claimed} claimed</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right ml-6">
                              <div className="text-2xl font-bold text-primary mb-2">
                                ${parseFloat(reward.amount).toLocaleString()}
                              </div>
                              <Button 
                                onClick={() => setShowPaymentModal(true)}
                                disabled={reward.limitedQuantity && reward.claimed >= reward.limitedQuantity}
                              >
                                {campaign.type === "equity" ? "Invest" : "Select"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          No {campaign.type === "equity" ? "investment tiers" : "rewards"} available
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {campaign.type === "equity" 
                            ? "Investment details will be available soon."
                            : "The creator hasn't set up rewards yet."
                          }
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="updates" className="mt-6">
                <div className="space-y-6">
                  {updates.length > 0 ? (
                    updates.map((update) => (
                      <Card key={update.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{update.title}</CardTitle>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{new Date(update.createdAt!).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="prose max-w-none dark:prose-invert">
                            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                              {update.content}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          No updates yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          The creator hasn't posted any updates for this campaign.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="community" className="mt-6">
                <div className="space-y-4">
                  {contributions.length > 0 ? (
                    contributions
                      .filter(c => !c.anonymous)
                      .map((contribution) => (
                        <Card key={contribution.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {contribution.anonymous ? "A" : "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium">
                                    {contribution.anonymous ? "Anonymous" : "Supporter"}
                                  </span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    contributed ${parseFloat(contribution.amount).toLocaleString()}
                                  </span>
                                  <span className="text-sm text-gray-400">
                                    {new Date(contribution.createdAt!).toLocaleDateString()}
                                  </span>
                                </div>
                                {contribution.message && (
                                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    "{contribution.message}"
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          No public contributions yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Be the first to support this campaign!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Funding Card */}
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        ${parseFloat(campaign.currentAmount).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        pledged of ${parseFloat(campaign.goalAmount).toLocaleString()} goal
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(progress)}%
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">funded</div>
                    </div>
                  </div>

                  <Progress 
                    value={Math.min(progress, 100)} 
                    className={`h-3 ${
                      campaign.type === "donation" 
                        ? "[&>div]:bg-green-500" 
                        : campaign.type === "equity"
                        ? "[&>div]:bg-purple-500"
                        : "[&>div]:bg-primary"
                    }`}
                  />

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {campaign.backerCount}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {campaign.type === "equity" ? "investors" : "backers"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {daysLeft}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        days to go
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {getActionButton()}

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Heart className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      Ends {new Date(campaign.endDate).toLocaleDateString()}
                    </div>
                    {progress >= 100 && (
                      <div className="flex items-center justify-center text-green-600">
                        <Target className="h-3 w-3 mr-1" />
                        Goal reached!
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Creator Info */}
            {creator && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About the Creator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={creator.avatar} alt={creator.fullName} />
                        <AvatarFallback>
                          {creator.fullName?.charAt(0) || creator.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {creator.fullName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          @{creator.username}
                        </div>
                      </div>
                    </div>
                    
                    {creator.bio && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {creator.bio}
                      </p>
                    )}

                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Joined {new Date(creator.createdAt!).toLocaleDateString()}</span>
                    </div>

                    <Button variant="outline" className="w-full">
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          campaign={campaignWithDetails}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}
