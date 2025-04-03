import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { DramaSeries, Episode, Rating, InsertRating, Advertisement as AdvertisementType } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Advertisement } from '@/components/advertisement';
import { Link } from 'wouter';
import { Star, Clock, Play, Plus, Bookmark, BookmarkCheck, ThumbsUp, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Extend DramaSeries type for this component
interface ExtendedDramaSeries extends DramaSeries {
  backdropUrl?: string | null;
  isCompleted?: boolean;
  country?: string;
  cast?: string[];
}

export default function SeriesDetailPage() {
  const [_, params] = useRoute('/series/:id');
  const seriesId = parseInt(params?.id || '0');
  const { user } = useAuth();
  const { toast } = useToast();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  
  // Fetch series details
  const { 
    data: series,
    isLoading: isLoadingSeries,
    error: seriesError
  } = useQuery<ExtendedDramaSeries>({
    queryKey: [`/api/drama-series/${seriesId}`],
    enabled: seriesId > 0,
  });
  
  // Fetch series episodes
  const {
    data: episodes = [],
    isLoading: isLoadingEpisodes
  } = useQuery<Episode[]>({
    queryKey: [`/api/drama-series/${seriesId}/episodes`],
    enabled: !!seriesId && seriesId > 0,
  });
  
  // Fetch series ratings
  const {
    data: ratings = [],
    isLoading: isLoadingRatings
  } = useQuery<(Rating & { user: { username: string, profilePicture: string | null } })[]>({
    queryKey: [`/api/drama-series/${seriesId}/ratings`],
    enabled: !!seriesId && seriesId > 0,
  });
  
  // Fetch user's rating for this series
  const {
    data: userRatingData
  } = useQuery<Rating>({
    queryKey: [`/api/drama-series/${seriesId}/ratings/user`],
    enabled: !!user && !!seriesId && seriesId > 0,
  });
  
  // Check if series is in user's watchlist
  const {
    data: isInWatchlist = false,
    isLoading: isCheckingWatchlist
  } = useQuery<boolean>({
    queryKey: [`/api/users/${user?.id}/watchlist/${seriesId}`],
    enabled: !!user && !!seriesId && seriesId > 0,
  });
  
  // Get sidebar ads
  const {
    data: sidebarAds = [] as AdvertisementType[]
  } = useQuery<AdvertisementType[]>({
    queryKey: ['/api/ads/sidebar'],
  });
  
  // Add to watchlist mutation
  const addToWatchlistMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/watchlist', { userId: user?.id, seriesId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/watchlist/${seriesId}`] });
      toast({
        title: 'Added to Watchlist',
        description: 'This series has been added to your watchlist.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Remove from watchlist mutation
  const removeFromWatchlistMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/watchlist/${user?.id}/${seriesId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/watchlist/${seriesId}`] });
      toast({
        title: 'Removed from Watchlist',
        description: 'This series has been removed from your watchlist.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Rate series mutation
  const rateMutation = useMutation({
    mutationFn: async (rating: number) => {
      const ratingData: InsertRating = {
        userId: user?.id || 0,
        seriesId,
        rating,
        comment: '',
      };
      
      await apiRequest('POST', '/api/ratings', ratingData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/drama-series/${seriesId}/ratings`] });
      queryClient.invalidateQueries({ queryKey: [`/api/drama-series/${seriesId}/ratings/user`] });
      queryClient.invalidateQueries({ queryKey: [`/api/drama-series/${seriesId}`] });
      toast({
        title: 'Rating Submitted',
        description: 'Your rating has been submitted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle watchlist toggle
  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      removeFromWatchlistMutation.mutate();
    } else {
      addToWatchlistMutation.mutate();
    }
  };
  
  // Handle rating submission
  const handleRateClick = (rating: number) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to rate series.',
        variant: 'destructive',
      });
      return;
    }
    
    setUserRating(rating);
    rateMutation.mutate(rating);
  };
  
  // Update userRating state when data is loaded
  useEffect(() => {
    if (userRatingData) {
      setUserRating(userRatingData.rating);
    }
  }, [userRatingData]);
  
  // Loading state
  if (isLoadingSeries || !series) {
    return (
      <div className="container py-8">
        <div className="animate-pulse">
          <div className="h-[400px] bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-8 bg-gray-200 w-1/4 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 w-3/4 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 w-2/3 rounded mb-6"></div>
          <div className="flex gap-4 mb-6">
            <div className="h-10 bg-gray-200 w-32 rounded"></div>
            <div className="h-10 bg-gray-200 w-32 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (seriesError) {
    return (
      <div className="container py-8">
        <div className="bg-red-50 p-6 rounded-lg text-red-600">
          <h2 className="text-xl font-bold mb-2">Error Loading Series</h2>
          <p>We encountered an error while loading this series. Please try again later.</p>
          <Button className="mt-4" asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div 
        className="relative w-full h-[60vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${series.backdropUrl || series.thumbnailUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent">
          <div className="container h-full flex items-end pb-8">
            <div className="w-full max-w-3xl">
              <div className="flex items-center mb-2">
                {series.genre && series.genre.length > 0 && (
                  <div className="flex gap-2 mb-2">
                    {series.genre.map((genre) => (
                      <span 
                        key={genre} 
                        className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-2">{series.title}</h1>
              <div className="flex items-center gap-4 text-sm mb-4">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span>{series.averageRating?.toFixed(1) || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-muted-foreground mr-1" />
                  <span>{series.totalEpisodes} episodes</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Released: {new Date(series.releaseDate || '').getFullYear()}</span>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">{series.description}</p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  className="flex items-center gap-2"
                  disabled={!episodes || episodes.length === 0}
                  asChild={episodes && episodes.length > 0}
                >
                  {episodes && episodes.length > 0 ? (
                    <Link href={`/episode/${episodes[0].id}`}>
                      <Play className="w-4 h-4" />
                      Watch Now
                    </Link>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      No Episodes Available
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handleWatchlistToggle}
                  disabled={isCheckingWatchlist || !user}
                >
                  {isInWatchlist ? (
                    <>
                      <BookmarkCheck className="w-4 h-4" />
                      In Watchlist
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add to Watchlist
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            {/* Rating section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Rate This Series</h2>
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    className="p-1 focus:outline-none"
                    onMouseEnter={() => setHoverRating(rating)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => handleRateClick(rating)}
                  >
                    <Star 
                      className={`w-8 h-8 ${
                        (hoverRating !== null ? rating <= hoverRating : rating <= (userRating || 0))
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {userRating ? `Your rating: ${userRating}/5` : 'Click to rate'}
                </span>
              </div>
            </div>
            
            {/* Episodes section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Episodes</h2>
              {isLoadingEpisodes ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : episodes.length === 0 ? (
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p>No episodes available yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {episodes.map((episode) => (
                    <Link key={episode.id} href={`/episode/${episode.id}`}>
                      <div className="border rounded-lg overflow-hidden hover:bg-accent/50 transition-colors">
                        <div className="flex flex-col sm:flex-row">
                          <div className="relative w-full sm:w-48 aspect-video">
                            <img 
                              src={episode.thumbnailUrl || series.thumbnailUrl} 
                              alt={episode.title} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                              <Play className="w-12 h-12 text-white" />
                            </div>
                          </div>
                          <div className="p-4 flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-bold mb-1">{episode.title}</h3>
                              <span className="text-sm text-muted-foreground">{episode.duration} min</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{episode.description}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <span>Episode {episode.episodeNumber}</span>
                              {episode.isPremium && (
                                <span className="ml-2 bg-yellow-400/10 text-yellow-600 px-2 py-0.5 rounded-full">
                                  Premium
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {/* Comments/Ratings section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">User Reviews</h2>
              {isLoadingRatings ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : ratings.length === 0 ? (
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p>No reviews yet. Be the first to rate this series!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ratings.filter(r => r.comment).map((rating) => (
                    <div key={rating.id} className="border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                          {rating.user.profilePicture ? (
                            <img 
                              src={rating.user.profilePicture} 
                              alt={rating.user.username} 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold">{rating.user.username.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{rating.user.username}</div>
                          <div className="flex items-center">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < rating.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground ml-2">
                              {new Date(rating.createdAt || '').toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {rating.comment && (
                        <p className="text-sm mt-2">{rating.comment}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span>Helpful</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-full lg:w-72 space-y-6">
            {/* Series Info */}
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <h3 className="font-bold mb-3">Series Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Director:</span>
                  <span className="font-medium">{series.director || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Release:</span>
                  <span className="font-medium">{new Date(series.releaseDate || '').toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Country:</span>
                  <span className="font-medium">{series.country || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium">
                    {series.isCompleted ? 'Completed' : 'On-going'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Cast List (if available) */}
            {series.cast && series.cast.length > 0 && (
              <div className="bg-card rounded-lg p-4 shadow-sm">
                <h3 className="font-bold mb-3">Cast</h3>
                <div className="space-y-2">
                  {series.cast.map((castMember: string, index: number) => (
                    <div key={index} className="text-sm">{castMember}</div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Sidebar Ad */}
            {sidebarAds.length > 0 && (
              <div>
                <Advertisement ad={sidebarAds[0]} placement="sidebar" />
              </div>
            )}
            
            {/* Similar Series (placeholder) */}
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <h3 className="font-bold mb-3">Similar Series</h3>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Similar series will appear here.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}