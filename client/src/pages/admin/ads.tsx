import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Advertisement, InsertAdvertisement } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  MousePointer,
} from "lucide-react";
import { format } from "date-fns";

export default function AdminAdsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [formData, setFormData] = useState<Partial<InsertAdvertisement>>({
    name: "",
    imageUrl: "",
    targetUrl: "",
    placement: "home",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    isActive: true,
    impressions: 0,
    clicks: 0,
  });

  // Fetch all advertisements
  const {
    data: advertisements = [],
    isLoading,
    error,
  } = useQuery<Advertisement[]>({
    queryKey: ["/api/ads"],
  });

  // Create advertisement mutation
  const createAdMutation = useMutation({
    mutationFn: async (adData: InsertAdvertisement) => {
      const response = await apiRequest("POST", "/api/ads", adData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ads"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Advertisement Created",
        description: "The advertisement has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create advertisement: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update advertisement mutation
  const updateAdMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Advertisement>;
    }) => {
      const response = await apiRequest("PATCH", `/api/ads/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ads"] });
      setIsEditDialogOpen(false);
      setSelectedAd(null);
      toast({
        title: "Advertisement Updated",
        description: "The advertisement has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update advertisement: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete advertisement mutation
  const deleteAdMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/ads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ads"] });
      setIsDeleteDialogOpen(false);
      setSelectedAd(null);
      toast({
        title: "Advertisement Deleted",
        description: "The advertisement has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete advertisement: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name || !formData.imageUrl || !formData.placement || !formData.startDate || !formData.endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    createAdMutation.mutate(formData as InsertAdvertisement);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAd) return;
    
    // Validate form data
    if (!formData.name || !formData.imageUrl || !formData.placement || !formData.startDate || !formData.endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    updateAdMutation.mutate({
      id: selectedAd.id,
      data: formData,
    });
  };

  const handleDeleteConfirm = () => {
    if (!selectedAd) return;
    deleteAdMutation.mutate(selectedAd.id);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      imageUrl: "",
      targetUrl: "",
      placement: "home",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      impressions: 0,
      clicks: 0,
    });
  };

  const openEditDialog = (ad: Advertisement) => {
    setSelectedAd(ad);
    setFormData({
      name: ad.name,
      imageUrl: ad.imageUrl,
      targetUrl: ad.targetUrl || "",
      placement: ad.placement,
      startDate: ad.startDate,
      endDate: ad.endDate,
      isActive: ad.isActive,
      impressions: ad.impressions || 0,
      clicks: ad.clicks || 0,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (ad: Advertisement) => {
    setSelectedAd(ad);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  const getPlacementLabel = (placement: string) => {
    switch (placement) {
      case "home":
        return "Home Page";
      case "sidebar":
        return "Sidebar";
      case "video":
        return "Video Player";
      case "search":
        return "Search Results";
      case "banner":
        return "Banner";
      case "in-feed":
        return "In-Feed";
      default:
        return placement;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <header className="flex items-center py-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold ml-4">Advertisement Management</h1>
        </header>
        <div className="flex justify-center">
          <div className="animate-pulse flex flex-col gap-4 w-full">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <header className="flex items-center py-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold ml-4">Advertisement Management</h1>
        </header>
        <div className="bg-red-50 p-6 rounded-lg text-red-600 mb-6">
          <h2 className="text-xl font-bold mb-2">Error Loading Advertisements</h2>
          <p>We encountered an error while loading advertisements. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center py-4 mb-8">
        <div className="flex items-center">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold ml-4">Advertisement Management</h1>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create New Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Advertisement</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new advertisement.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Summer Promotion"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL *</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/ad-image.jpg"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetUrl">Target URL</Label>
                <Input
                  id="targetUrl"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  placeholder="https://example.com/landing-page"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="placement">Placement *</Label>
                <Select 
                  value={formData.placement} 
                  onValueChange={(value) => setFormData({ ...formData, placement: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select placement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home Page</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="video">Video Player</SelectItem>
                    <SelectItem value="search">Search Results</SelectItem>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="in-feed">In-Feed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value).toISOString() })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value).toISOString() })}
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAdMutation.isPending}>
                  {createAdMutation.isPending ? "Creating..." : "Create Advertisement"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>
      
      {/* Ad List */}
      <div className="bg-card rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Placement</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Stats</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {advertisements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No advertisements found. Create your first ad to get started.
                </TableCell>
              </TableRow>
            ) : (
              advertisements.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium">{ad.name}</TableCell>
                  <TableCell>
                    <div className="w-24 h-12 overflow-hidden rounded">
                      <img
                        src={ad.imageUrl}
                        alt={ad.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>{getPlacementLabel(ad.placement)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span>{formatDate(ad.startDate)}</span>
                      <span className="text-muted-foreground"> to </span>
                      <span>{formatDate(ad.endDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {ad.isActive ? (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        <span>Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 text-red-500 mr-1" />
                        <span>Inactive</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center text-xs">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{ad.impressions.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MousePointer className="h-3 w-3" />
                        <span>{ad.clicks.toLocaleString()}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(ad)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(ad)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Advertisement</DialogTitle>
            <DialogDescription>
              Make changes to the advertisement details.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Ad Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-imageUrl">Image URL *</Label>
              <Input
                id="edit-imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-targetUrl">Target URL</Label>
              <Input
                id="edit-targetUrl"
                value={formData.targetUrl}
                onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-placement">Placement *</Label>
              <Select 
                value={formData.placement} 
                onValueChange={(value) => setFormData({ ...formData, placement: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select placement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home Page</SelectItem>
                  <SelectItem value="sidebar">Sidebar</SelectItem>
                  <SelectItem value="video">Video Player</SelectItem>
                  <SelectItem value="search">Search Results</SelectItem>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="in-feed">In-Feed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date *</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value).toISOString() })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date *</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value).toISOString() })}
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateAdMutation.isPending}>
                {updateAdMutation.isPending ? "Updating..." : "Update Advertisement"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Advertisement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this advertisement? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAd && (
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-12 overflow-hidden rounded">
                <img
                  src={selectedAd.imageUrl}
                  alt={selectedAd.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold">{selectedAd.name}</h3>
                <p className="text-sm text-muted-foreground">{getPlacementLabel(selectedAd.placement)}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteAdMutation.isPending}
            >
              {deleteAdMutation.isPending ? "Deleting..." : "Delete Advertisement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}