import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, Loader2, Coins, User, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Requests = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [redemptions, setRedemptions] = useState<Redemption[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    interface Redemption {
        id: string;
        item: Item & { uploader: { id: string; name: string } };
        pointsUsed: number;
        status: string;
        createdAt: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
    }

    interface Item {
        id: string;
        title: string;
        images: string[];
        category: string;
        condition: string;
        status: string;
        createdAt: string;
    }

    const fetchRedemptions = () => {
        if (!user) return;
        setLoading(true);
        const token = localStorage.getItem('token');
        fetch('http://localhost:3001/api/redemptions/incoming', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.ok ? r.json() : [])
            .then((redemptions) => {
                setRedemptions(redemptions);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchRedemptions();
        // eslint-disable-next-line
    }, [user]);

    const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        setActionLoading(id + status);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3001/api/redemptions/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });
            if (response.ok) {
                fetchRedemptions();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to update request');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
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
                        <BreadcrumbPage>Requests</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <MessageCircle className="h-8 w-8 text-primary" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold mb-2">Requests</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Approve or reject incoming redemption requests for your items.
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[30vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : redemptions.length === 0 ? (
                <Card className="text-center p-8">
                    <CardContent>
                        <p className="text-muted-foreground">No requests found.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {redemptions.map((r) => (
                        <Card key={r.id} className="overflow-hidden">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className="w-16 h-16 bg-muted rounded flex items-center justify-center overflow-hidden">
                                    {r.item.images && r.item.images[0] ? (
                                        <img src={r.item.images[0]} alt={r.item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <MessageCircle className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-lg font-semibold mb-1">{r.item.title}</CardTitle>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="text-xs capitalize">{r.item.category.toLowerCase()}</Badge>
                                        <Badge variant="secondary" className="text-xs capitalize">{r.item.condition.replace('_', ' ').toLowerCase()}</Badge>
                                        <Badge variant="secondary" className="text-xs capitalize">{r.status.toLowerCase()}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Coins className="h-3 w-3" /> {r.pointsUsed} points
                                        <User className="h-3 w-3 ml-2" /> {r.user.name}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 min-w-[120px]">
                                    {r.status === 'PENDING' ? (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-green-700 border-green-700 hover:bg-green-50"
                                                disabled={actionLoading === r.id + 'APPROVED'}
                                                onClick={() => handleAction(r.id, 'APPROVED')}
                                            >
                                                {actionLoading === r.id + 'APPROVED' ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                                )}
                                                Accept
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-700 border-red-700 hover:bg-red-50"
                                                disabled={actionLoading === r.id + 'REJECTED'}
                                                onClick={() => handleAction(r.id, 'REJECTED')}
                                            >
                                                {actionLoading === r.id + 'REJECTED' ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                )}
                                                Reject
                                            </Button>
                                        </>
                                    ) : (
                                        <Badge variant={r.status === 'APPROVED' ? 'secondary' : 'destructive'} className="capitalize p-2 m-auto">
                                            {r.status.toLowerCase()}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Requests;