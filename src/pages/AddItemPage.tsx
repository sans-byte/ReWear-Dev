import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  Upload,
  X,
  Plus,
  Loader2,
  Camera,
  Tag,
  Shirt,
  AlertCircle
} from 'lucide-react';

const itemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  category: z.enum(['TOPS', 'BOTTOMS', 'DRESSES', 'OUTERWEAR', 'SHOES', 'ACCESSORIES', 'ACTIVEWEAR', 'FORMAL', 'CASUAL'], {
    required_error: 'Please select a category',
  }),
  size: z.string().min(1, 'Size is required'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'WORN'], {
    required_error: 'Please select a condition',
  }),
  images: z.array(z.string().url()).min(1, 'At least one image is required').max(5, 'Maximum 5 images allowed'),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed'),
});

type ItemFormData = z.infer<typeof itemSchema>;

const categories = [
  { value: 'TOPS', label: 'Tops' },
  { value: 'BOTTOMS', label: 'Bottoms' },
  { value: 'DRESSES', label: 'Dresses' },
  { value: 'OUTERWEAR', label: 'Outerwear' },
  { value: 'SHOES', label: 'Shoes' },
  { value: 'ACCESSORIES', label: 'Accessories' },
  { value: 'ACTIVEWEAR', label: 'Activewear' },
  { value: 'FORMAL', label: 'Formal' },
  { value: 'CASUAL', label: 'Casual' },
];

const conditions = [
  { value: 'NEW', label: 'New', description: 'Brand new with tags' },
  { value: 'LIKE_NEW', label: 'Like New', description: 'Excellent condition, barely worn' },
  { value: 'GOOD', label: 'Good', description: 'Good condition with minor signs of wear' },
  { value: 'FAIR', label: 'Fair', description: 'Noticeable wear but still functional' },
  { value: 'WORN', label: 'Worn', description: 'Significant wear but still usable' },
];

const sampleImages = [
  'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg',
  'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg',
  'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
  'https://images.pexels.com/photos/5710082/pexels-photo-5710082.jpeg',
  'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg',
  'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
  'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg',
  'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg',
];

const AddItemPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      images: [],
      tags: [],
    },
  });

  const watchedImages = watch('images') || [];
  const watchedTags = watch('tags') || [];
  const watchedCategory = watch('category');
  const watchedCondition = watch('condition');

  const onSubmit = async (data: ItemFormData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const item = await response.json();
        toast.success('Item listed successfully!');
        navigate(`/items/${item.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to list item');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to list item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addImage = () => {
    if (imageUrl && watchedImages.length < 5) {
      try {
        new URL(imageUrl); // Validate URL
        setValue('images', [...watchedImages, imageUrl]);
        setImageUrl('');
      } catch {
        toast.error('Please enter a valid image URL');
      }
    }
  };

  const removeImage = (index: number) => {
    setValue('images', watchedImages.filter((_, i) => i !== index));
  };

  const addSampleImage = (url: string) => {
    if (watchedImages.length < 5 && !watchedImages.includes(url)) {
      setValue('images', [...watchedImages, url]);
    }
  };

  const addTag = () => {
    if (newTag.trim() && watchedTags.length < 10 && !watchedTags.includes(newTag.trim().toLowerCase())) {
      setValue('tags', [...watchedTags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setValue('tags', watchedTags.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
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
            <BreadcrumbPage>Add Item</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Shirt className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">List Your Item</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Share your pre-loved clothing with the ReWear community. Add detailed information and photos to attract potential swappers.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shirt className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Item Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Vintage Denim Jacket"
                  {...register('title')}
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Size *</Label>
                <Input
                  id="size"
                  placeholder="e.g., M, L, 32, 8.5"
                  {...register('size')}
                  className={errors.size ? 'border-destructive' : ''}
                />
                {errors.size && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.size.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your item in detail. Include brand, material, fit, and any notable features..."
                rows={4}
                {...register('description')}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={watchedCategory} onValueChange={(value) => setValue('category', value as any)}>
                  <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Condition *</Label>
                <Select value={watchedCondition} onValueChange={(value) => setValue('condition', value as any)}>
                  <SelectTrigger className={errors.condition ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        <div className='flex justify-center items-center gap-3'>
                          <span className="font-medium flex-1">{condition.label}</span>
                          <span className="text-xs text-muted-foreground">({condition.description})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.condition && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.condition.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Photos ({watchedImages.length}/5)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, addImage)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addImage}
                  disabled={!imageUrl || watchedImages.length >= 5}
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Sample Images */}
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Or choose from sample images:
                </Label>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {sampleImages.map((url, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => addSampleImage(url)}
                      disabled={watchedImages.length >= 5 || watchedImages.includes(url)}
                      className="aspect-square rounded-md overflow-hidden border-2 border-transparent hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <img
                        src={url}
                        alt={`Sample ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Images */}
              {watchedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {watchedImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={url}
                          alt={`Item ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      {index === 0 && (
                        <Badge className="absolute bottom-2 left-2 text-xs">
                          Main
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {errors.images && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.images.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tags ({watchedTags.length}/10)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add tags (e.g., vintage, summer, casual)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addTag)}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={addTag}
                disabled={!newTag.trim() || watchedTags.length >= 10}
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {watchedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedTags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {errors.tags && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.tags.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-32">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Listing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                List Item
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddItemPage;