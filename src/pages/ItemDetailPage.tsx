import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Heart,
  Share2,
  Loader2,
  User,
  Calendar,
  Tag,
  Ruler,
  Star,
  Shuffle,
  Coins,
  MessageCircle
} from 'lucide-react';

interface Item {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  size: string;
  condition: string;
  tags: string[];
  status: string;
  createdAt: string;
  uploader: {
    id: string;
    name: string;
    email: string;
  };
}

interface UserItem {
  id: string;
  title: string;
  images: string[];
  category: string;
  condition: string;
}

const ItemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState<Item | null>(null);
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [swapLoading, setSwapLoading] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [selectedItemForSwap, setSelectedItemForSwap] = useState('');
  const [pointsToOffer, setPointsToOffer] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchItem();
      if (user) {
        fetchUserItems();
      }
    }
  }, [id, user]);

  const fetchItem = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/items/${id}`);
      if (response.ok) {
        const itemData = await response.json();
        setItem(itemData);
      } else {
        toast.error('Item not found');
        navigate('/items');
      }
    } catch (error) {
      console.error('Failed to fetch item:', error);
      toast.error('Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/users/items', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const items = await response.json();
        setUserItems(items.filter((item: UserItem) => item.id !== id));
      }
    } catch (error) {
      console.error('Failed to fetch user items:', error);
    }
  };

  const handleSwapRequest = async () => {
    if (!selectedItemForSwap) {
      toast.error('Please select an item to offer');
      return;
    }

    setSwapLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/swaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemOfferedId: selectedItemForSwap,
          itemRequestedId: id,
        }),
      });

      if (response.ok) {
        toast.success('Swap request sent successfully!');
        setSelectedItemForSwap('');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send swap request');
      }
    } catch (error) {
      console.error('Swap request error:', error);
      toast.error('Failed to send swap request');
    } finally {
      setSwapLoading(false);
    }
  };

  const handleRedemption = async () => {
    const points = parseInt(pointsToOffer);
    if (!points || points <= 0) {
      toast.error('Please enter a valid number of points');
      return;
    }

    if (user && points > user.points) {
      toast.error('Insufficient points');
      return;
    }

    setRedeemLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/redemptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: id,
          pointsUsed: points,
        }),
      });

      if (response.ok) {
        toast.success('Redemption request sent successfully!');
        setPointsToOffer('');
        // Update user points in context
        if (user) {
          user.points -= points;
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send redemption request');
      }
    } catch (error) {
      console.error('Redemption error:', error);
      toast.error('Failed to send redemption request');
    } finally {
      setRedeemLoading(false);
    }
  };

  const formatCategoryName = (category: string) => {
    return category.toLowerCase().replace('_', ' ');
  };

  const formatConditionName = (condition: string) => {
    return condition.replace('_', ' ').toLowerCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Item not found</h1>
          <Button asChild>
            <Link to="/items">Browse Items</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === item.uploader.id;
  const canInteract = user && !isOwner && item.status === 'AVAILABLE';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/items">Items</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{item.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Back Button */}
      <Button variant="ghost" className="mb-6 text-white" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={item.images[currentImageIndex]}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>

          {item.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {item.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${index === currentImageIndex ? 'border-primary' : 'border-transparent'
                    }`}
                >
                  <img
                    src={image}
                    alt={`${item.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">
                    {formatCategoryName(item.category)}
                  </Badge>
                  <Badge variant="outline">
                    {formatConditionName(item.condition)}
                  </Badge>
                  <Badge variant={item.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                    {item.status.toLowerCase()}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              {item.description}
            </p>

            {/* Item Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Size:</span>
                <span className="font-medium">{item.size}</span>
              </div>

              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Condition:</span>
                <span className="font-medium">{formatConditionName(item.condition)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Category:</span>
                <span className="font-medium">{formatCategoryName(item.category)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Listed:</span>
                <span className="font-medium">{formatDate(item.createdAt)}</span>
              </div>
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Owner Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Listed by</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {item.uploader.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{item.uploader.name}</p>
                  <p className="text-sm text-muted-foreground">Member since {formatDate(item.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {!user ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground mb-4">
                  Sign in to interact with this item
                </p>
                <Button asChild className="w-full">
                  <Link to="/auth">Sign In</Link>
                </Button>
              </CardContent>
            </Card>
          ) : isOwner ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground mb-4">
                  This is your item
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Edit Item
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => navigate("/requests")}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    View Requests
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : canInteract ? (
            <div className="space-y-4">
              {/* Swap Option */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shuffle className="h-5 w-5" />
                    Propose a Swap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Offer one of your items in exchange for this item
                  </p>

                  {userItems.length > 0 ? (
                    <div className="space-y-4">
                      <Select value={selectedItemForSwap} onValueChange={setSelectedItemForSwap}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an item to offer" />
                        </SelectTrigger>
                        <SelectContent>
                          {userItems.map((userItem) => (
                            <SelectItem key={userItem.id} value={userItem.id}>
                              {userItem.title} - {formatCategoryName(userItem.category)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        onClick={handleSwapRequest}
                        disabled={!selectedItemForSwap || swapLoading}
                        className="w-full"
                      >
                        {swapLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending Request...
                          </>
                        ) : (
                          <>
                            <Shuffle className="mr-2 h-4 w-4" />
                            Send Swap Request
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        You need to list items before you can propose swaps
                      </p>
                      <Button asChild variant="outline">
                        <Link to="/add-item">List Your First Item</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Points Redemption Option */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    Redeem with Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Use your points to request this item. You have {user.points} points available.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="points">Points to offer</Label>
                      <Input
                        id="points"
                        type="number"
                        placeholder="Enter points amount"
                        value={pointsToOffer}
                        onChange={(e) => setPointsToOffer(e.target.value)}
                        min="1"
                        max={user.points}
                      />
                    </div>

                    <Button
                      onClick={handleRedemption}
                      disabled={!pointsToOffer || redeemLoading}
                      className="w-full"
                    >
                      {redeemLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending Request...
                        </>
                      ) : (
                        <>
                          <Coins className="mr-2 h-4 w-4" />
                          Send Redemption Request
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  This item is currently {item.status.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;