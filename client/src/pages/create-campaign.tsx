import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertCampaignSchema, insertRewardSchema } from "@shared/schema";
import { Plus, Trash2, DollarSign, Calendar, Target, Users, FileText, Image, Info } from "lucide-react";
import type { Category, User } from "@shared/schema";

interface CreateCampaignProps {
  currentUser?: User;
}

const createCampaignFormSchema = insertCampaignSchema.extend({
  endDate: z.string().min(1, "End date is required"),
  rewards: z.array(z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    amount: z.string().min(1, "Amount is required"),
    limitedQuantity: z.number().optional(),
    estimatedDelivery: z.string().optional(),
  })).optional(),
});

type CreateCampaignFormData = z.infer<typeof createCampaignFormSchema>;

export default function CreateCampaign({ currentUser }: CreateCampaignProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [rewards, setRewards] = useState<any[]>([]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<CreateCampaignFormData>({
    resolver: zodResolver(createCampaignFormSchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      description: "",
      goalAmount: "",
      categoryId: 0,
      type: "reward",
      image: "",
      endDate: "",
      status: "draft",
      featured: false,
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: CreateCampaignFormData) => {
      if (!currentUser) throw new Error("Must be logged in");
      
      const campaignData = {
        ...data,
        creatorId: currentUser.id,
        endDate: new Date(data.endDate),
        goalAmount: data.goalAmount,
      };

      const response = await apiRequest("POST", "/api/campaigns", campaignData);
      return response.json();
    },
    onSuccess: async (campaign) => {
      // Create rewards if any
      if (rewards.length > 0) {
        for (const reward of rewards) {
          await apiRequest("POST", `/api/campaigns/${campaign.id}/rewards`, {
            ...reward,
            amount: reward.amount,
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      
      toast({
        title: "Campaign Created!",
        description: "Your campaign has been created successfully.",
      });
      
      navigate(`/campaigns/${campaign.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create campaign",
        variant: "destructive",
      });
    },
  });

  const addReward = () => {
    setRewards([...rewards, {
      title: "",
      description: "",
      amount: "",
      limitedQuantity: undefined,
      estimatedDelivery: "",
    }]);
  };

  const removeReward = (index: number) => {
    setRewards(rewards.filter((_, i) => i !== index));
  };

  const updateReward = (index: number, field: string, value: any) => {
    const updatedRewards = [...rewards];
    updatedRewards[index] = { ...updatedRewards[index], [field]: value };
    setRewards(updatedRewards);
  };

  const onSubmit = (data: CreateCampaignFormData) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a campaign.",
        variant: "destructive",
      });
      return;
    }

    if (data.type === "reward" && rewards.length === 0) {
      toast({
        title: "Rewards Required",
        description: "Please add at least one reward for reward-based campaigns.",
        variant: "destructive",
      });
      return;
    }

    createCampaignMutation.mutate(data);
  };

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="p-12 text-center">
              <Info className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Sign In Required
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You need to be signed in to create a campaign.
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Create Your Campaign
          </h1>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Tell us about your project and set your funding goal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Give your campaign a compelling title" {...field} />
                        </FormControl>
                        <FormDescription>
                          Keep it clear and under 60 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description *</FormLabel>
                        <FormControl>
                          <Input placeholder="Briefly describe your project in one sentence" {...field} />
                        </FormControl>
                        <FormDescription>
                          This appears in campaign listings and previews
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Funding Model *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select funding model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="reward">Reward-based</SelectItem>
                              <SelectItem value="donation">Donation-based</SelectItem>
                              <SelectItem value="equity">Equity-based</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {field.value === "reward" && "Backers receive rewards for their contributions"}
                            {field.value === "donation" && "Pure donations with no expected returns"}
                            {field.value === "equity" && "Investors receive equity in your company"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="goalAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Funding Goal *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input 
                                type="number" 
                                min="1" 
                                step="0.01"
                                placeholder="50000" 
                                className="pl-10"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            How much do you need to raise?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campaign End Date *</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              min={new Date().toISOString().split('T')[0]}
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            When should your campaign end?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Campaign Story */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Tell Your Story
                  </CardTitle>
                  <CardDescription>
                    Explain your project in detail and why people should support it
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell the full story of your project. What problem does it solve? Why are you passionate about it? What will the funds be used for?"
                            rows={12}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Be detailed and authentic. This is your chance to connect with potential supporters.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Image URL *</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/your-campaign-image.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                          Add a compelling image that represents your project. Use high-quality images for better engagement.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("image") && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Preview</label>
                      <div className="aspect-video max-w-md overflow-hidden rounded-lg border">
                        <img
                          src={form.watch("image")}
                          alt="Campaign preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Rewards (for reward-based campaigns) */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    {form.watch("type") === "reward" ? "Rewards" : 
                     form.watch("type") === "equity" ? "Investment Tiers" : "Contribution Options"}
                  </CardTitle>
                  <CardDescription>
                    {form.watch("type") === "reward" && "Set up rewards for different contribution levels"}
                    {form.watch("type") === "equity" && "Define investment tiers and equity offerings"}
                    {form.watch("type") === "donation" && "You can optionally set up contribution recognition tiers"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {rewards.length > 0 && (
                    <div className="space-y-4">
                      {rewards.map((reward, index) => (
                        <Card key={index} className="border-dashed">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-medium">
                                {form.watch("type") === "equity" ? `Investment Tier ${index + 1}` : `Reward ${index + 1}`}
                              </h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeReward(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium mb-1 block">Title</label>
                                <Input
                                  placeholder={form.watch("type") === "equity" ? "Investor tier name" : "Reward title"}
                                  value={reward.title}
                                  onChange={(e) => updateReward(index, "title", e.target.value)}
                                />
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium mb-1 block">
                                  {form.watch("type") === "equity" ? "Investment Amount" : "Contribution Amount"}
                                </label>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    placeholder="100"
                                    className="pl-10"
                                    value={reward.amount}
                                    onChange={(e) => updateReward(index, "amount", e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="mt-4">
                              <label className="text-sm font-medium mb-1 block">Description</label>
                              <Textarea
                                placeholder={
                                  form.watch("type") === "equity" 
                                    ? "What does this investment tier include? What equity percentage?"
                                    : "What will the backer receive for this contribution?"
                                }
                                rows={2}
                                value={reward.description}
                                onChange={(e) => updateReward(index, "description", e.target.value)}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <label className="text-sm font-medium mb-1 block">
                                  Limited Quantity (Optional)
                                </label>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="100"
                                  value={reward.limitedQuantity || ""}
                                  onChange={(e) => updateReward(index, "limitedQuantity", e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </div>
                              
                              {form.watch("type") === "reward" && (
                                <div>
                                  <label className="text-sm font-medium mb-1 block">
                                    Estimated Delivery
                                  </label>
                                  <Input
                                    placeholder="March 2025"
                                    value={reward.estimatedDelivery || ""}
                                    onChange={(e) => updateReward(index, "estimatedDelivery", e.target.value)}
                                  />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  <Button type="button" variant="outline" onClick={addReward} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add {form.watch("type") === "equity" ? "Investment Tier" : "Reward"}
                  </Button>

                  {form.watch("type") === "reward" && rewards.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Reward-based campaigns require at least one reward tier.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    Review Your Campaign
                  </CardTitle>
                  <CardDescription>
                    Review all the details before publishing your campaign
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Basic Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Title:</strong> {form.watch("title")}</div>
                        <div><strong>Goal:</strong> ${form.watch("goalAmount")}</div>
                        <div><strong>Type:</strong> {form.watch("type")}-based</div>
                        <div><strong>Category:</strong> {categories.find(c => c.id === form.watch("categoryId"))?.name}</div>
                        <div><strong>End Date:</strong> {form.watch("endDate")}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">
                        {form.watch("type") === "equity" ? "Investment Tiers" : "Rewards"}
                      </h4>
                      <div className="space-y-1 text-sm">
                        {rewards.length > 0 ? (
                          rewards.map((reward, index) => (
                            <div key={index}>
                              <strong>${reward.amount}</strong> - {reward.title}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500">No rewards added</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {form.watch("image") && (
                    <div>
                      <h4 className="font-semibold mb-2">Campaign Image</h4>
                      <div className="aspect-video max-w-md overflow-hidden rounded-lg border">
                        <img
                          src={form.watch("image")}
                          alt="Campaign preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">Description Preview</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg max-h-32 overflow-y-auto text-sm">
                      {form.watch("description") || "No description provided"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={createCampaignMutation.isPending}
                  className="min-w-32"
                >
                  {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
