import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { 
  ArrowRight, 
  Recycle, 
  Users, 
  Coins, 
  Shirt,
  Star,
  Heart,
  Shuffle
} from 'lucide-react';

interface FeaturedItem {
  id: string;
  title: string;
  images: string[];
  category: string;
  condition: string;
  uploader: {
    name: string;
  };
}

const LandingPage = () => {
  const { user } = useAuth();
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedItems();
  }, []);

  const fetchFeaturedItems = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/items/featured');
      if (response.ok) {
        const items = await response.json();
        setFeaturedItems(items);
      }
    } catch (error) {
      console.error('Failed to fetch featured items:', error);
      toast.error('Failed to load featured items');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Recycle className="h-8 w-8 text-green-500" />,
      title: 'Sustainable Fashion',
      description: 'Give your clothes a second life and reduce textile waste.',
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: 'Community Driven',
      description: 'Connect with like-minded individuals who share your style.',
    },
    {
      icon: <Coins className="h-8 w-8 text-yellow-500" />,
      title: 'Points System',
      description: 'Earn points for each item you share and use them to get new pieces.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 flex justify-center">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                <Shirt className="mr-2 h-4 w-4" />
                Sustainable Fashion Platform
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Transform Your Wardrobe
              <span className="block text-primary">Sustainably</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Join ReWear, the community-driven platform where fashion meets sustainability. 
              Exchange, redeem, and discover amazing clothing while making a positive impact.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link to={user ? "/items" : "/auth"}>
                  Start Swapping
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" asChild className="text-lg px-8 py-6">
                <Link to="/items">
                  Browse Items
                </Link>
              </Button>
            </div>
            
            {!user && (
              <p className="text-sm text-muted-foreground mt-4">
                No account needed to browse • Sign up to start swapping
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose ReWear?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              More than just a clothing exchange - we're building a sustainable fashion community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-8 pb-6">
                  <div className="mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Items
            </h2>
            <p className="text-xl text-muted-foreground">
              Discover amazing pieces from our community members
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {featuredItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                >
                  <Link to={`/items/${item.id}`}>
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={item.images[0]} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>by {item.uploader.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.condition}
                        </Badge>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link to="/items">
                View All Items
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How ReWear Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to start your sustainable fashion journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shirt className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. List Your Items</h3>
              <p className="text-muted-foreground">
                Upload photos and details of clothes you no longer wear. Set them for swap or points redemption.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shuffle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Discover & Exchange</h3>
              <p className="text-muted-foreground">
                Browse amazing items from the community. Propose swaps or use your points to redeem items.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Enjoy & Repeat</h3>
              <p className="text-muted-foreground">
                Complete your exchanges, earn points, and continue building your sustainable wardrobe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Wardrobe?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of fashion-forward individuals who are making sustainable choices every day.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
              <Link to={user ? "/add-item" : "/auth"}>
                {user ? "List Your First Item" : "Get Started Free"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            {!user && (
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link to="/items">
                  Browse Without Signing Up
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;