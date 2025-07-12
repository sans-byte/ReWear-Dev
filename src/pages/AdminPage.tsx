import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Users, Shirt, Shuffle, Gift, CheckCircle2, XCircle, Trash2, User, Crown, Search, Filter, ArrowLeft, ArrowRight } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalItems: number;
  totalSwaps: number;
  totalRedemptions: number;
  itemsByStatus: { status: string; _count: { status: number } }[];
}

interface Item {
  id: string;
  title: string;
  images: string[];
  category: string;
  condition: string;
  status: string;
  createdAt: string;
  uploader: { id: string; name: string; email: string };
  adminActions: { id: string; actionType: string; reason?: string; createdAt: string; admin: { id: string; name: string } }[];
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  points: number;
  role: string;
  createdAt: string;
  _count: { items: number; swapsOffered: number; redemptions: number };
}

const AdminPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsPage, setItemsPage] = useState(1);
  const [itemsPages, setItemsPages] = useState(1);
  const [itemStatusFilter, setItemStatusFilter] = useState("AVAILABLE");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPages, setUsersPages] = useState(1);
  const [userSearch, setUserSearch] = useState('');

  // Fetch stats
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    fetch('http://localhost:3001/api/admin/stats', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.json())
      .then(setStats);
  }, [user]);

  // Fetch items
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    setItemsLoading(true);
    const params = new URLSearchParams({ page: itemsPage.toString(), ...(itemStatusFilter && { status: itemStatusFilter }) });
    fetch(`http://localhost:3001/api/admin/items?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items);
        setItemsPages(data.pagination.pages);
      })
      .finally(() => setItemsLoading(false));
  }, [user, itemsPage, itemStatusFilter]);

  // Fetch users
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    setUsersLoading(true);
    const params = new URLSearchParams({ page: usersPage.toString() });
    fetch(`http://localhost:3001/api/admin/users?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users);
        setUsersPages(data.pagination.pages);
      })
      .finally(() => setUsersLoading(false));
  }, [user, usersPage]);

  if (authLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Crown className="h-6 w-6 text-yellow-500" /> Admin Dashboard
      </h1>
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="mb-6 w-full grid grid-cols-3 gap-2 text-white">
          <TabsTrigger value="stats" className="flex items-center gap-2 justify-center">
            <Users className="h-4 w-4" /> Stats
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2 justify-center">
            <Shirt className="h-4 w-4" /> Items
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2 justify-center">
            <User className="h-4 w-4" /> Users
          </TabsTrigger>
        </TabsList>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Total Users</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{stats?.totalUsers ?? <Loader2 className="h-5 w-5 animate-spin" />}</CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Shirt className="h-5 w-5 text-primary" />
                <CardTitle>Total Items</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{stats?.totalItems ?? <Loader2 className="h-5 w-5 animate-spin" />}</CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Shuffle className="h-5 w-5 text-primary" />
                <CardTitle>Total Swaps</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{stats?.totalSwaps ?? <Loader2 className="h-5 w-5 animate-spin" />}</CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                <CardTitle>Total Redemptions</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{stats?.totalRedemptions ?? <Loader2 className="h-5 w-5 animate-spin" />}</CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Items by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {stats?.itemsByStatus?.map((s) => (
                  <Badge key={s.status} variant="secondary" className="capitalize text-base">
                    {s.status.toLowerCase()}: {s._count.status}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={itemStatusFilter} onValueChange={setItemStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SWAPPED">Swapped</SelectItem>
                <SelectItem value="REDEEMED">Redeemed</SelectItem>
                <SelectItem value="REMOVED">Removed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {itemsLoading ? (
            <div className="flex items-center justify-center min-h-[30vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-muted">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-2 text-left">Image</th>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Uploader</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Created</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/20">
                      <td className="px-4 py-2">
                        {item.images && item.images[0] ? (
                          <img src={item.images[0]} alt={item.title} className="h-12 w-12 object-cover rounded" />
                        ) : (
                          <Shirt className="h-8 w-8 text-muted-foreground" />
                        )}
                      </td>
                      <td className="px-4 py-2 font-medium">{item.title}</td>
                      <td className="px-4 py-2">
                        <div className="font-medium">{item.uploader.name}</div>
                        <div className="text-xs text-muted-foreground">{item.uploader.email}</div>
                      </td>
                      <td className="px-4 py-2">
                        <Badge variant="secondary" className="capitalize">{item.status.toLowerCase()}</Badge>
                      </td>
                      <td className="px-4 py-2 text-xs">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <Button size="sm" variant="outline" disabled>
                          <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" disabled>
                          <XCircle className="h-4 w-4 mr-1 text-red-600" /> Reject
                        </Button>
                        <Button size="sm" variant="outline" disabled>
                          <Trash2 className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between mt-4 text-white">
                <Button variant="ghost" size="sm" className='text-white' onClick={() => setItemsPage((p) => Math.max(1, p - 1))} disabled={itemsPage === 1}>
                  <ArrowLeft className="h-4 w-4" /> Prev
                </Button>
                <span className="text-sm">Page {itemsPage} of {itemsPages}</span>
                <Button variant="ghost" size="sm" className="text-white" onClick={() => setItemsPage((p) => Math.min(itemsPages, p + 1))} disabled={itemsPage === itemsPages}>
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="flex items-center gap-4 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email (not implemented)"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-64"
              disabled
            />
          </div>
          {usersLoading ? (
            <div className="flex items-center justify-center min-h-[30vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-muted">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Points</th>
                    <th className="px-4 py-2 text-left">Items</th>
                    <th className="px-4 py-2 text-left">Swaps</th>
                    <th className="px-4 py-2 text-left">Redemptions</th>
                    <th className="px-4 py-2 text-left">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-muted/20">
                      <td className="px-4 py-2 font-medium flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{u.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {u.name}
                        {u.role === 'ADMIN' && <Crown className="h-3 w-3 text-yellow-500 ml-1" />}
                      </td>
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2">
                        <Badge variant="secondary" className="capitalize">{u.role.toLowerCase()}</Badge>
                      </td>
                      <td className="px-4 py-2">{u.points}</td>
                      <td className="px-4 py-2">{u._count.items}</td>
                      <td className="px-4 py-2">{u._count.swapsOffered}</td>
                      <td className="px-4 py-2">{u._count.redemptions}</td>
                      <td className="px-4 py-2 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between mt-4">
                <Button variant="ghost" size="sm" className="text-white" onClick={() => setUsersPage((p) => Math.max(1, p - 1))} disabled={usersPage === 1}>
                  <ArrowLeft className="h-4 w-4" /> Prev
                </Button>
                <span className="text-sm">Page {usersPage} of {usersPages}</span>
                <Button variant="ghost" size="sm" className='text-white' onClick={() => setUsersPage((p) => Math.min(usersPages, p + 1))} disabled={usersPage === usersPages}>
                  Next <ArrowRight className="h-4 w-4 " />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
