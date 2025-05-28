
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, Target } from "lucide-react";
import type { CampaignWithDetails } from "@/lib/types";

interface CampaignCardProps {
  campaign: CampaignWithDetails;
  onBack?: (campaignId: number) => void;
}

export function CampaignCard({ campaign, onBack }: CampaignCardProps) {
  const progress = campaign.progress || 
    (parseFloat(campaign.currentAmount) / parseFloat(campaign.goalAmount)) * 100;
  
  const daysLeft = campaign.daysLeft || 
    Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

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
      className: "w-full font-semibold transition-colors",
      onClick: () => onBack?.(campaign.id),
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
    <Card className="card-hover overflow-hidden">
      <div className="aspect-video overflow-hidden">
        <img
          src={campaign.image}
          alt={campaign.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge className={getTypeColor(campaign.type)}>
            {campaign.category?.name || "General"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}-based
          </Badge>
        </div>

        <Link href={`/campaigns/${campaign.id}`}>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-primary cursor-pointer line-clamp-2">
            {campaign.title}
          </h3>
        </Link>

        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {campaign.shortDescription}
        </p>

        {campaign.creator && (
          <div className="flex items-center mb-4">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={campaign.creator.avatar} alt={campaign.creator.fullName} />
              <AvatarFallback>
                {campaign.creator.fullName?.charAt(0) || campaign.creator.username?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {campaign.creator.fullName}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {campaign.creator.bio?.split(" ").slice(0, 4).join(" ")}...
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">
              ${parseFloat(campaign.currentAmount).toLocaleString()}
            </span>
            <span>
              ${parseFloat(campaign.goalAmount).toLocaleString()} goal
            </span>
          </div>

          <Progress 
            value={Math.min(progress, 100)} 
            className={`h-2 ${
              campaign.type === "donation" 
                ? "[&>div]:bg-green-500" 
                : campaign.type === "equity"
                ? "[&>div]:bg-purple-500"
                : "[&>div]:bg-primary"
            }`}
          />

          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{campaign.backerCount} {campaign.type === "equity" ? "investors" : "backers"}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{daysLeft} days left</span>
            </div>
          </div>

          {progress >= 100 && (
            <div className="flex items-center text-green-600 text-sm font-medium">
              <Target className="h-4 w-4 mr-1" />
              <span>Goal reached!</span>
            </div>
          )}
        </div>

        <div className="mt-6">
          {getActionButton()}
        </div>
      </CardContent>
    </Card>
  );
}
