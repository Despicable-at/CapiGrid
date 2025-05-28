import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  DollarSign, 
  Users, 
  Target, 
  TrendingUp, 
  Calendar, 
  Plus, 
  Eye, 
  Edit,
  MessageSquare,
  Share2,
  Download
} from "lucide-react";
import type { Campaign, User, Contribution } from "@shared/schema";
import type { CampaignWithDetails } from "@/lib/types";

interface DashboardProps {
  currentUser?: User;
}

export default function Dashboard({ currentUser }: DashboardProps) {
  const [, navigate] = useLocation();
  const [selectedTab, setSelectedTab] = useState("overview");

  const { data: userCampaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns", { creatorId: currentUser?.id }],
    queryFn: () => 
      currentUser 
        ? fetch(`/api/campaigns?creatorId=${currentUser.id}`).then(res => res.json())
        : Promise.resolve([]),
    enabled: !!currentUser,
  });

  const { data: userContributions = [] } = useQuery<Contribution[]>({
    queryKey: [`/api/users/${currentUser?.id}/contributions`],
    enabled: !!currentUser,
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Sign In Required
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You need to be signed in to access your dashboard.
              </p>
              <Button onClick={() => navigate("/")}>
                Go to Home Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalRaised = userCampaigns.reduce((sum, campaign) => sum + parseFloat(campaign.currentAmount), 0);
  const totalBackers = userCampaigns.reduce((sum, campaign) => sum + campaign.backerCount, 0);
  const activeCampaigns = userCampaigns.filter(c => c.status === "active").length;
  const successfulCampaigns = userCampaigns.filter(c => c.status === "funded").length;
  const totalBacked = userContributions.reduce((sum, contribution) => sum + parseFloat(contribution.amount), 0);

  // Prepare chart data
  const campaignData = userCampaigns.map(campaign => ({
    name: campaign.title.length > 20 ? campaign.title.substring(0, 20) + "..." : campaign.title,
    raised: parseFloat(campaign.currentAmount),
    goal: parseFloat(campaign.goalAmount),
    progress: (parseFloat(campaign.currentAmount) / parseFloat(campaign.goalAmount)) * 100,
    backers: campaign.backerCount,
  }));

  const typeDistribution = userCampaigns.reduce((acc, campaign) => {
    acc[campaign.type] = (acc[campaign.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(typeDistribution).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
    color: type === "reward" ? "#2563eb" : type === "donation" ? "#059669" : "#7c3aed",
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "funded":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "ended":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {currentUser.fullName}! Here's an overview of your campaigns.
            </p>
          </div>
          <Link href="/create-campaign">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Campaign</span>
            </Button>
          </Link>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">My Campaigns ({userCampaigns.length})</TabsTrigger>
            <TabsTrigger value="backed">Backed Projects ({userContributions.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Raised
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${totalRaised.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Backers
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {totalBackers.toLocaleString()}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Active Campaigns
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {activeCampaigns}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Success Rate
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userCampaigns.length > 0 ? Math.round((successfulCampaigns / userCampaigns.length) * 100) : 0}%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            {userCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Performance</CardTitle>
                    <CardDescription>Funding progress of your campaigns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={campaignData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="raised" fill="#2563eb" name="Raised" />
                        <Bar dataKey="goal" fill="#e5e7eb" name="Goal" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Types</CardTitle>
                    <CardDescription>Distribution of your campaign types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No campaigns yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start your crowdfunding journey by creating your first campaign.
                  </p>
                  <Link href="/create-campaign">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Campaign
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {userCampaigns.map((campaign) => {
                const progress = (parseFloat(campaign.currentAmount) / parseFloat(campaign.goalAmount)) * 100;
                const daysLeft = Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

                return (
                  <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={campaign.image}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <Badge variant="outline">
                          {campaign.type}
                        </Badge>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {campaign.title}
                      </h3>

                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">
                            ${parseFloat(campaign.currentAmount).toLocaleString()}
                          </span>
                          <span className="text-gray-500">
                            ${parseFloat(campaign.goalAmount).toLocaleString()} goal
                          </span>
                        </div>

                        <Progress value={Math.min(progress, 100)} className="h-2" />

                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{campaign.backerCount} backers</span>
                          <span>{daysLeft} days left</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Link href={`/campaigns/${campaign.id}`}>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {userCampaigns.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No campaigns created yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start your crowdfunding journey by creating your first campaign.
                  </p>
                  <Link href="/create-campaign">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Campaign
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="backed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Contributions</CardTitle>
                <CardDescription>
                  Projects you've supported: ${totalBacked.toLocaleString()} total backed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userContributions.length > 0 ? (
                  <div className="space-y-4">
                    {userContributions.map((contribution) => (
                      <div key={contribution.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Campaign #{contribution.campaignId}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(contribution.createdAt!).toLocaleDateString()}
                          </div>
                          {contribution.message && (
                            <div className="text-sm text-gray-600 mt-1">
                              "{contribution.message}"
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            ${parseFloat(contribution.amount).toLocaleString()}
                          </div>
                          {contribution.anonymous && (
                            <Badge variant="outline" className="text-xs">
                              Anonymous
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>You haven't backed any projects yet.</p>
                    <Link href="/discover">
                      <Button variant="outline" className="mt-4">
                        Discover Projects
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {userCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Funding Trends</CardTitle>
                    <CardDescription>Campaign performance over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={campaignData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="progress" stroke="#2563eb" name="Progress %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Backer Engagement</CardTitle>
                    <CardDescription>Number of backers per campaign</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={campaignData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="backers" fill="#059669" name="Backers" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Performance Insights</CardTitle>
                    <CardDescription>Key metrics and recommendations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(totalRaised / Math.max(userCampaigns.length, 1))}
                        </div>
                        <div className="text-sm text-gray-600">Average Raised per Campaign</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(totalBackers / Math.max(userCampaigns.length, 1))}
                        </div>
                        <div className="text-sm text-gray-600">Average Backers per Campaign</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {userCampaigns.length > 0 ? Math.round((successfulCampaigns / userCampaigns.length) * 100) : 0}%
                        </div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No analytics data available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Create some campaigns to see detailed analytics and insights.
                  </p>
                  <Link href="/create-campaign">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Campaign
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
