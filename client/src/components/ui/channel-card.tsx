import { Channel } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatNumber } from "@/lib/utils";

interface ChannelCardProps {
  channel: Channel;
  isSubscribed?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ChannelCard({ channel, isSubscribed = false, size = "md" }: ChannelCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const sizeClasses = {
    sm: {
      container: "flex items-center space-x-3",
      image: "w-8 h-8",
      text: "text-sm"
    },
    md: {
      container: "flex flex-col items-center",
      image: "w-16 h-16 md:w-20 md:h-20",
      text: "text-center"
    },
    lg: {
      container: "flex flex-col items-center",
      image: "w-24 h-24",
      text: "text-center text-lg"
    }
  };
  
  const subscribeToChannelMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/subscriptions", { 
        channelId: channel.id 
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({
        title: "Subscribed",
        description: `You are now subscribed to ${channel.name}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to subscribe",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const unsubscribeFromChannelMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/subscriptions/${channel.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({
        title: "Unsubscribed",
        description: `You have unsubscribed from ${channel.name}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to unsubscribe",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const toggleSubscription = () => {
    if (!user) return;
    
    if (isSubscribed) {
      unsubscribeFromChannelMutation.mutate();
    } else {
      subscribeToChannelMutation.mutate();
    }
  };
  
  return (
    <div className={sizeClasses[size].container}>
      <div 
        className={`${sizeClasses[size].image} rounded-full overflow-hidden border-2 ${isSubscribed ? 'border-primary' : 'border-gray-700 hover:border-primary'} p-1 cursor-pointer`}
        onClick={toggleSubscription}
      >
        <img
          src={channel.logoUrl}
          alt={channel.name}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
      
      <div className={size !== "sm" ? "mt-2" : ""}>
        <p className={`${sizeClasses[size].text} font-medium`}>{channel.name}</p>
        <p className={`${sizeClasses[size].text} text-muted-foreground text-xs`}>
          {formatNumber(channel.followerCount)} followers
        </p>
      </div>
    </div>
  );
}
