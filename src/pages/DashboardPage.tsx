import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Shirt, Coins, Shuffle, Gift, User, Plus, Edit, Trash2, ArrowRight, Check, XCircle, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Item {
  id: string;
  title: string;
  images: string[];
  category: string;
  condition: string;
  status: string;
  createdAt: string;
}

interface Swap {
  id: string;
  itemOffered: Item & { uploader: { id: string; name: string } };
  itemRequested: Item & { uploader: { id: string; name: string } };
  status: string;
  requester: { id: string; name: string };
  responder: { id: string; name: string };
  createdAt: string;
}

interface Redemption {
  id: string;
  item: Item & { uploader: { id: string; name: string } };
  pointsUsed: number;
  status: string;
  createdAt: string;
}

const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    Promise.all([
      fetch('http://localhost:3001/api/users/items', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.ok ? r.json() : []),
      fetch('http://localhost:3001/api/users/swaps', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.ok ? r.json() : []),
      fetch('http://localhost:3001/api/users/redemptions', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.ok ? r.json() : []),
    ])
      .then(([items, swaps, redemptions]) => {
        setItems(items);
        setSwaps(swaps);
        setRedemptions(redemptions);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Profile Card */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <Card className="flex-1 flex flex-col md:flex-row items-center gap-6 p-6">
          <Avatar className="h-20 w-20">
            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> {user.name}
              {user.role === 'ADMIN' && (
                <Badge variant="secondary" className="ml-2">Admin</Badge>
              )}
            </h2>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">{user.points} points</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={() => navigate('/add-item')}>
              <Plus className="mr-2 h-4 w-4" /> List New Item
            </Button>
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              <ArrowRight className="mr-2 h-4 w-4" /> Log Out
            </Button>
          </div>
        </Card>
      </div>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="items" className="w-full">
        <TabsList className="mb-6 w-full grid grid-cols-3">
          <TabsTrigger value="items" className="flex items-center gap-2 justify-center">
            <Shirt className="h-4 w-4" /> My Items
          </TabsTrigger>
          <TabsTrigger value="swaps" className="flex items-center gap-2 justify-center">
            <Shuffle className="h-4 w-4" /> My Swaps
          </TabsTrigger>
          <TabsTrigger value="redemptions" className="flex items-center gap-2 justify-center">
            <Gift className="h-4 w-4" /> My Redemptions
          </TabsTrigger>
        </TabsList>

        {/* My Items Tab */}
        <TabsContent value="items">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.length === 0 ? (
              <Card className="col-span-full text-center p-8">
                <CardContent>
                  <p className="text-muted-foreground mb-4">You haven't listed any items yet.</p>
                  <Button asChild>
                    <Link to="/add-item">
                      <Plus className="mr-2 h-4 w-4" /> List Your First Item
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              items.map((item) => (
                <Card key={item.id} className="overflow-hidden group flex flex-col">
                  <div className="aspect-square bg-muted overflow-hidden">
                    {item.images && item.images[0] ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <Shirt className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  <CardContent className="flex-1 flex flex-col p-4">
                    <h3 className="font-semibold text-lg mb-1 truncate">{item.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      <Badge variant="secondary" className="text-xs capitalize">{item.condition.replace('_', ' ').toLowerCase()}</Badge>
                      <Badge variant="secondary" className="text-xs capitalize">{item.status.toLowerCase()}</Badge>
                    </div>
                    <div className="mt-auto flex gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link to={`/items/${item.id}`}><Edit className="h-4 w-4 mr-1" /> View</Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" disabled>
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* My Swaps Tab */}
        <TabsContent value="swaps">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {swaps.length === 0 ? (
              <Card className="col-span-full text-center p-8">
                <CardContent>
                  <p className="text-muted-foreground">No swap activity yet.</p>
                </CardContent>
              </Card>
            ) : (
              swaps.map((swap) => (
                <Card key={swap.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Shuffle className="h-5 w-5 text-primary" />
                    <CardTitle className="flex-1 text-base font-semibold">
                      Swap: <span className="font-normal">{swap.itemOffered.title}</span> ↔ <span className="font-normal">{swap.itemRequested.title}</span>
                    </CardTitle>
                    <Badge variant="secondary" className="capitalize">{swap.status.toLowerCase()}</Badge>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground">You offered</div>
                        <div className="font-medium">{swap.itemOffered.title}</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground">You requested</div>
                        <div className="font-medium">{swap.itemRequested.title}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <User className="h-3 w-3" /> {swap.requester.name} → {swap.responder.name}
                      <Clock className="h-3 w-3 ml-2" /> {new Date(swap.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* My Redemptions Tab */}
        <TabsContent value="redemptions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {redemptions.length === 0 ? (
              <Card className="col-span-full text-center p-8">
                <CardContent>
                  <p className="text-muted-foreground">No redemption activity yet.</p>
                </CardContent>
              </Card>
            ) : (
              redemptions.map((redemption) => (
                <Card key={redemption.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Gift className="h-5 w-5 text-primary" />
                    <CardTitle className="flex-1 text-base font-semibold">
                      Redeemed: <span className="font-normal">{redemption.item.title}</span>
                    </CardTitle>
                    <Badge variant="secondary" className="capitalize">{redemption.status.toLowerCase()}</Badge>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Coins className="h-3 w-3" /> {redemption.pointsUsed} points
                      <Clock className="h-3 w-3 ml-2" /> {new Date(redemption.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <User className="h-3 w-3" /> Owner: {redemption.item.uploader.name}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
