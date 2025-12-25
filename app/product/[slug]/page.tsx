'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase, Product } from '@/lib/supabase';
import { Heart, ArrowLeft, ExternalLink, Check } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [userId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('userId');
      if (!id) {
        id = `user_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('userId', id);
      }
      return id;
    }
    return `user_${Math.random().toString(36).substr(2, 9)}`;
  });

  useEffect(() => {
    fetchProductData();
  }, [slug]);

  async function fetchProductData() {
    try {
      const { data: productData, error } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands(*),
          category:categories(*)
        `)
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      if (!productData) {
        router.push('/');
        return;
      }

      setProduct(productData);

      const { data: wishlistData } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productData.id)
        .maybeSingle();

      setIsInWishlist(!!wishlistData);

      const { data: related } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands(*),
          category:categories(*)
        `)
        .eq('category_id', productData.category_id)
        .neq('id', productData.id)
        .limit(3);

      if (related) setRelatedProducts(related);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleWishlist() {
    if (!product) return;

    if (isInWishlist) {
      await supabase.from('wishlists').delete().eq('user_id', userId).eq('product_id', product.id);
      setIsInWishlist(false);
    } else {
      await supabase.from('wishlists').insert({ user_id: userId, product_id: product.id });
      setIsInWishlist(true);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:text-accent smooth-transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="font-display text-white text-lg font-semibold">T</span>
              </div>
              <span className="font-display text-xl font-semibold">TechDiscover</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute top-4 left-4 flex gap-2">
                {product.new_arrival && (
                  <div className="px-3 py-1.5 bg-accent text-white text-sm font-semibold rounded-full">
                    New
                  </div>
                )}
                {product.trending && (
                  <div className="px-3 py-1.5 bg-primary text-white text-sm font-semibold rounded-full">
                    Trending
                  </div>
                )}
                {product.featured && (
                  <div className="px-3 py-1.5 bg-primary text-white text-sm font-semibold rounded-full">
                    Featured
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {product.brand && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden">
                  <Image
                    src={product.brand.logo_url}
                    alt={product.brand.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Brand</p>
                  <p className="font-semibold text-accent">{product.brand.name}</p>
                </div>
              </div>
            )}

            <div>
              <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3">
                {product.name}
              </h1>
              <p className="text-xl text-muted-foreground">
                {product.short_description}
              </p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-display text-5xl font-semibold">
                ${product.price}
              </span>
              <span className="text-muted-foreground">{product.currency}</span>
            </div>

            <div className="flex gap-3">
              <a
                href={product.buy_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground text-base font-semibold rounded-xl hover:bg-accent smooth-transition"
              >
                Shop now
                <ExternalLink className="w-5 h-5" />
              </a>
              <button
                onClick={toggleWishlist}
                className={`px-6 py-4 rounded-xl border-2 smooth-transition ${
                  isInWishlist
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border hover:border-accent hover:bg-accent/5'
                }`}
              >
                <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-accent' : ''}`} />
              </button>
            </div>

            {product.brand && (
              <div className="pt-6 border-t border-border space-y-4">
                <h3 className="font-display text-lg font-semibold">About {product.brand.name}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.brand.description}
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <p className="text-muted-foreground">Founded</p>
                    <p className="font-semibold">{product.brand.founded_year}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-semibold">{product.category?.name}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-border space-y-4">
              <h3 className="font-display text-lg font-semibold">Product details</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="pt-6 border-t border-border">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Direct from brand - authentic products guaranteed</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Secure checkout on official brand website</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Brand warranty and customer support included</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="border-t border-border pt-16">
            <div className="mb-8">
              <h2 className="font-display text-3xl font-semibold mb-2">You might also like</h2>
              <p className="text-muted-foreground">More products from {product.category?.name}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  onWishlistToggle={async (productId) => {
                    const { data } = await supabase
                      .from('wishlists')
                      .select('id')
                      .eq('user_id', userId)
                      .eq('product_id', productId)
                      .maybeSingle();

                    if (data) {
                      await supabase.from('wishlists').delete().eq('user_id', userId).eq('product_id', productId);
                    } else {
                      await supabase.from('wishlists').insert({ user_id: userId, product_id: productId });
                    }
                  }}
                  isInWishlist={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-border bg-secondary/30 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
                <span className="font-display text-white text-base font-semibold">T</span>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">TechDiscover</h3>
                <p className="text-xs text-muted-foreground">Discover innovative tech</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground mb-1">
                Curated electronics from the best D2C brands
              </p>
              <p className="text-xs text-muted-foreground">
                All purchases redirect to official brand websites
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
