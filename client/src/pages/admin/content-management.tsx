import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Film, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertDramaSeriesSchema, insertEpisodeSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Using AdminLayout imported from @/components/layout/admin

// Custom form schema for drama series with array for genres
const dramaFormSchema = insertDramaSeriesSchema.extend({
  genreString: z.string().min(3, "Please enter at least one genre"),
}).omit({ genre: true });

export default function ContentManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDrama, setSelectedDrama] = useState<any>(null);
  const [isAddDramaOpen, setIsAddDramaOpen] = useState(false);
  const [isAddEpisodeOpen, setIsAddEpisodeOpen] = useState(false);
  
  // Drama series form
  const dramaForm = useForm<z.infer<typeof dramaFormSchema>>({
    resolver: zodResolver(dramaFormSchema),
    defaultValues: {
      title: "",
      description: "",
      thumbnailUrl: "",
      bannerUrl: "",
      genreString: "",
      rating: 0,
      isFeatured: false,
      isPremium: false,
      coinPrice: 0,
      releaseDate: new Date().toISOString().split('T')[0],
      channelId: 1, // Default to first channel
    },
  });
  
  // Episode form
  const episodeForm = useForm<z.infer<typeof insertEpisodeSchema>>({
    resolver: zodResolver(insertEpisodeSchema),
    defaultValues: {
      seriesId: 0,
      title: "",
      description: "",
      duration: 0,
      videoUrl: "",
      thumbnailUrl: "",
      seasonNumber: 1,
      episodeNumber: 1,
      releaseDate: new Date().toISOString().split('T')[0],
    },
  });
  
  // Fetch dramas
  const { data: dramas, isLoading: isLoadingDramas } = useQuery<any[]>({
    queryKey: ["/api/dramas"],
  });
  
  // Fetch channels (for dropdown)
  const { data: channels } = useQuery<any[]>({
    queryKey: ["/api/channels"],
  });
  
  // Fetch episodes for selected drama
  const { data: episodes, isLoading: isLoadingEpisodes } = useQuery<any[]>({
    queryKey: ["/api/dramas", selectedDrama?.id, "episodes"],
    enabled: !!selectedDrama,
  });
  
  // Add drama mutation
  const addDramaMutation = useMutation({
    mutationFn: async (data: any) => {
      // Convert genreString to genre array
      const { genreString, ...rest } = data;
      const genre = genreString.split(",").map((g: string) => g.trim());
      
      const res = await apiRequest("POST", "/api/dramas", { ...rest, genre });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dramas"] });
      setIsAddDramaOpen(false);
      dramaForm.reset();
      toast({
        title: "Success",
        description: "Drama series added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add drama: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Add episode mutation
  const addEpisodeMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/episodes", data);
      return await res.json();
    },
    onSuccess: () => {
      if (selectedDrama) {
        queryClient.invalidateQueries({ queryKey: ["/api/dramas", selectedDrama.id, "episodes"] });
      }
      setIsAddEpisodeOpen(false);
      episodeForm.reset();
      toast({
        title: "Success",
        description: "Episode added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add episode: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete drama mutation
  const deleteDramaMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/dramas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dramas"] });
      toast({
        title: "Success",
        description: "Drama series deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete drama: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete episode mutation
  const deleteEpisodeMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/episodes/${id}`);
    },
    onSuccess: () => {
      if (selectedDrama) {
        queryClient.invalidateQueries({ queryKey: ["/api/dramas", selectedDrama.id, "episodes"] });
      }
      toast({
        title: "Success",
        description: "Episode deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete episode: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle add drama form submission
  const onAddDramaSubmit = (data: z.infer<typeof dramaFormSchema>) => {
    addDramaMutation.mutate(data);
  };
  
  // Handle add episode form submission
  const onAddEpisodeSubmit = (data: z.infer<typeof insertEpisodeSchema>) => {
    addEpisodeMutation.mutate(data);
  };
  
  // Set selected drama and pre-fill episode form
  const selectDrama = (drama: any) => {
    setSelectedDrama(drama);
    episodeForm.setValue("seriesId", drama.id);
    
    // Calculate next episode number
    if (episodes) {
      const lastEpisode = [...episodes].sort((a, b) => b.episodeNumber - a.episodeNumber)[0];
      if (lastEpisode) {
        episodeForm.setValue("seasonNumber", lastEpisode.seasonNumber);
        episodeForm.setValue("episodeNumber", lastEpisode.episodeNumber + 1);
      }
    }
  };
  
  // Filter dramas by search query
  const filteredDramas = dramas?.filter(drama => 
    drama.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    drama.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Content Management</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search dramas..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Dialog open={isAddDramaOpen} onOpenChange={setIsAddDramaOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="mr-2" size={16} />
                Add New Drama
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Drama Series</DialogTitle>
                <DialogDescription>
                  Create a new drama series. You'll be able to add episodes after creation.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...dramaForm}>
                <form onSubmit={dramaForm.handleSubmit(onAddDramaSubmit)} className="space-y-4">
                  <FormField
                    control={dramaForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Drama title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={dramaForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Drama description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={dramaForm.control}
                      name="genreString"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Genres</FormLabel>
                          <FormControl>
                            <Input placeholder="Romance, Drama, Comedy" {...field} />
                          </FormControl>
                          <FormDescription>Comma-separated list</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={dramaForm.control}
                      name="releaseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Release Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={dramaForm.control}
                    name="thumbnailUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thumbnail URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={dramaForm.control}
                    name="bannerUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banner URL (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/banner.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={dramaForm.control}
                      name="channelId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Channel</FormLabel>
                          <FormControl>
                            <select
                              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            >
                              {channels?.map((channel) => (
                                <option key={channel.id} value={channel.id}>
                                  {channel.name}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={dramaForm.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rating (0-5)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="5" 
                              step="0.1" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-6">
                    <FormField
                      control={dramaForm.control}
                      name="isFeatured"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Featured</FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={dramaForm.control}
                      name="isPremium"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                // Set coinPrice to 50 by default if premium
                                if (checked && dramaForm.getValues("coinPrice") === 0) {
                                  dramaForm.setValue("coinPrice", 50);
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Premium Content</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {dramaForm.watch("isPremium") && (
                    <FormField
                      control={dramaForm.control}
                      name="coinPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coin Price</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={addDramaMutation.isPending}
                      className="w-full"
                    >
                      {addDramaMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Drama Series"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {selectedDrama && (
            <Dialog open={isAddEpisodeOpen} onOpenChange={setIsAddEpisodeOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2" size={16} />
                  Add Episode
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Episode</DialogTitle>
                  <DialogDescription>
                    Add an episode to "{selectedDrama.title}"
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...episodeForm}>
                  <form onSubmit={episodeForm.handleSubmit(onAddEpisodeSubmit)} className="space-y-4">
                    <input type="hidden" {...episodeForm.register("seriesId")} />
                    
                    <FormField
                      control={episodeForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Episode Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Episode title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={episodeForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Episode description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={episodeForm.control}
                        name="seasonNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Season</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={episodeForm.control}
                        name="episodeNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Episode Number</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={episodeForm.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (seconds)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              placeholder="e.g. 600 for 10 minutes"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={episodeForm.control}
                      name="videoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/video.mp4" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={episodeForm.control}
                      name="thumbnailUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thumbnail URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/thumbnail.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={episodeForm.control}
                      name="releaseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Release Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={addEpisodeMutation.isPending}
                        className="w-full"
                      >
                        {addEpisodeMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          "Add Episode"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <Tabs defaultValue="dramas">
          <TabsList>
            <TabsTrigger value="dramas">Drama Series</TabsTrigger>
            <TabsTrigger value="episodes" disabled={!selectedDrama}>
              Episodes {selectedDrama ? `(${selectedDrama.title})` : ""}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dramas" className="mt-4">
            {isLoadingDramas ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredDramas && filteredDramas.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Genres</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDramas.map((drama) => (
                        <TableRow key={drama.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                                <img
                                  src={drama.thumbnailUrl}
                                  alt={drama.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-medium">{drama.title}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {new Date(drama.releaseDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {channels?.find(c => c.id === drama.channelId)?.name || "Unknown"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {drama.genre.map((genre: string, i: number) => (
                                <Badge key={i} variant="outline">
                                  {genre}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {drama.isFeatured && (
                                <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                              )}
                              {drama.isPremium && (
                                <Badge className="bg-yellow-400 text-black">Premium</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => selectDrama(drama)}>
                                  <Film className="mr-2" size={16} />
                                  Manage Episodes
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a href={`/watch/${drama.id}`} target="_blank">
                                    <Eye className="mr-2" size={16} />
                                    View
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {}}>
                                  <Edit className="mr-2" size={16} />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this drama series? This action cannot be undone.")) {
                                      deleteDramaMutation.mutate(drama.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="mr-2" size={16} />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center p-8">
                <Film className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No dramas found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "No dramas match your search query" 
                    : "Start by adding a drama series"
                  }
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="episodes" className="mt-4">
            {selectedDrama ? (
              <>
                <div className="mb-4 p-4 bg-muted rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{selectedDrama.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Managing episodes for this series
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedDrama(null)}>
                    Back to All Series
                  </Button>
                </div>
                
                {isLoadingEpisodes ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : episodes && episodes.length > 0 ? (
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Episode</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Release Date</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {episodes.map((episode) => {
                            // Format duration as MM:SS
                            const minutes = Math.floor(episode.duration / 60);
                            const seconds = episode.duration % 60;
                            const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                            
                            return (
                              <TableRow key={episode.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                                      <img
                                        src={episode.thumbnailUrl}
                                        alt={episode.title}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="font-medium">
                                      S{episode.seasonNumber}:E{episode.episodeNumber}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{episode.title}</TableCell>
                                <TableCell>{formattedDuration}</TableCell>
                                <TableCell>
                                  {new Date(episode.releaseDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreVertical size={16} />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem asChild>
                                        <a href={`/watch/${selectedDrama.id}?episode=${episode.id}`} target="_blank">
                                          <Eye className="mr-2" size={16} />
                                          Preview
                                        </a>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => {}}>
                                        <Edit className="mr-2" size={16} />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        className="text-destructive"
                                        onClick={() => {
                                          if (confirm("Are you sure you want to delete this episode? This action cannot be undone.")) {
                                            deleteEpisodeMutation.mutate(episode.id);
                                          }
                                        }}
                                      >
                                        <Trash2 className="mr-2" size={16} />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center p-8">
                    <Film className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No episodes found</h3>
                    <p className="text-muted-foreground mb-4">
                      This drama series doesn't have any episodes yet
                    </p>
                    <Button onClick={() => setIsAddEpisodeOpen(true)}>
                      <Plus className="mr-2" size={16} />
                      Add First Episode
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-8">
                <Film className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No drama selected</h3>
                <p className="text-muted-foreground">
                  Select a drama series to manage its episodes
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
