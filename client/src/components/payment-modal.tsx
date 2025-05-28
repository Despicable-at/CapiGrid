import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, DollarSign, Heart, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CampaignWithDetails, PaymentData } from "@/lib/types";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignWithDetails | null;
  currentUser?: any;
}

export function PaymentModal({ isOpen, onClose, campaign, currentUser }: PaymentModalProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedReward, setSelectedReward] = useState<string>("");
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit");

  if (!campaign) return null;

  const handlePayment = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to support this campaign.",
        variant: "destructive",
      });
      return;
    }

    let amount = customAmount;
    let rewardId: number | undefined;

    if (selectedReward && selectedReward !== "custom") {
      const reward = campaign.rewards?.find(r => r.id.toString() === selectedReward);
      if (reward) {
        amount = reward.amount;
        rewardId = reward.id;
      }
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contribution amount.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const paymentData: PaymentData = {
        amount,
        message: message.trim() || undefined,
        anonymous,
        rewardId,
      };

      await apiRequest("POST", `/api/campaigns/${campaign.id}/contributions`, {
        ...paymentData,
        userId: currentUser.id,
      });

      // Invalidate campaign data to refresh
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaign.id}`] });

      toast({
        title: "Thank you!",
        description: `Your ${campaign.type === "equity" ? "investment" : "contribution"} has been processed successfully.`,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getModalTitle = () => {
    switch (campaign.type) {
      case "reward":
        return "Back This Project";
      case "donation":
        return "Make a Donation";
      case "equity":
        return "Make an Investment";
      default:
        return "Support This Campaign";
    }
  };

  const getIcon = () => {
    switch (campaign.type) {
      case "reward":
        return <CreditCard className="h-5 w-5" />;
      case "donation":
        return <Heart className="h-5 w-5" />;
      case "equity":
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getIcon()}
            <span>{getModalTitle()}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg line-clamp-1">{campaign.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {campaign.shortDescription}
                  </p>
                  <Badge className="mt-2" variant="outline">
                    {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}-based
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reward Selection (for reward-based campaigns) */}
          {campaign.type === "reward" && campaign.rewards && campaign.rewards.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Select Your Reward</Label>
              <RadioGroup value={selectedReward} onValueChange={setSelectedReward}>
                {campaign.rewards.map((reward) => (
                  <div key={reward.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={reward.id.toString()} id={`reward-${reward.id}`} />
                    <Label htmlFor={`reward-${reward.id}`} className="flex-1 cursor-pointer">
                      <Card className="hover:border-primary transition-colors">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold">{reward.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {reward.description}
                              </p>
                              {reward.estimatedDelivery && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Estimated delivery: {reward.estimatedDelivery}
                                </p>
                              )}
                              {reward.limitedQuantity && (
                                <p className="text-xs text-orange-600 mt-1">
                                  Limited: {reward.limitedQuantity - reward.claimed} remaining
                                </p>
                              )}
                            </div>
                            <div className="text-primary font-bold text-lg ml-4">
                              ${parseFloat(reward.amount).toLocaleString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Label>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom-amount" />
                  <Label htmlFor="custom-amount" className="font-medium">
                    Custom amount (no reward)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Custom Amount Input */}
          {(campaign.type !== "reward" || selectedReward === "custom" || !campaign.rewards?.length) && (
            <div className="space-y-2">
              <Label htmlFor="amount">
                {campaign.type === "equity" ? "Investment Amount" : "Contribution Amount"}
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder={`Share why you're supporting this ${campaign.type === "equity" ? "company" : "project"}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={anonymous}
              onCheckedChange={(checked) => setAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="text-sm">
              {campaign.type === "equity" ? "Make investment anonymous" : "Make contribution anonymous"}
            </Label>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="grid grid-cols-3 gap-3">
                <Label htmlFor="credit" className="cursor-pointer">
                  <RadioGroupItem value="credit" id="credit" className="sr-only" />
                  <Card className={`border-2 transition-colors ${
                    paymentMethod === "credit" ? "border-primary bg-primary/5" : "border-gray-200"
                  }`}>
                    <CardContent className="p-4 text-center">
                      <CreditCard className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm font-medium">Credit Card</p>
                    </CardContent>
                  </Card>
                </Label>
                
                <Label htmlFor="paypal" className="cursor-pointer">
                  <RadioGroupItem value="paypal" id="paypal" className="sr-only" />
                  <Card className={`border-2 transition-colors ${
                    paymentMethod === "paypal" ? "border-primary bg-primary/5" : "border-gray-200"
                  }`}>
                    <CardContent className="p-4 text-center">
                      <div className="h-6 w-6 mx-auto mb-2 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                        PP
                      </div>
                      <p className="text-sm font-medium">PayPal</p>
                    </CardContent>
                  </Card>
                </Label>

                <Label htmlFor="bank" className="cursor-pointer">
                  <RadioGroupItem value="bank" id="bank" className="sr-only" />
                  <Card className={`border-2 transition-colors ${
                    paymentMethod === "bank" ? "border-primary bg-primary/5" : "border-gray-200"
                  }`}>
                    <CardContent className="p-4 text-center">
                      <div className="h-6 w-6 mx-auto mb-2 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">
                        B
                      </div>
                      <p className="text-sm font-medium">Bank Transfer</p>
                    </CardContent>
                  </Card>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Action Button */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing
              ? "Processing..."
              : `Complete ${campaign.type === "equity" ? "Investment" : "Contribution"}`
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
