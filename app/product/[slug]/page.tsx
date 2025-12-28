'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase, Product } from '@/lib/supabase';
import { Heart, ArrowLeft, ExternalLink, Check, Share2, ShieldCheck, Truck, Zap, ChevronRight, RefreshCw, ShoppingBag } from 'lucide-react';
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
        .limit(5);

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Top Breadcrumb Header - Professional Style */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-6">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-foreground" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-[10px] md:text-sm font-bold text-foreground/40 uppercase tracking-widest">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <span className="text-foreground/60">{product.category?.name}</span>
            </div>
          </div>
          {/* Mini Logo */}
          <Link href="/" className="flex items-center gap-1">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-white text-sm md:text-base font-bold italic">D</span>
            </div>
          </Link>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 pt-6 md:pt-12 pb-20">
        <div className="grid lg:grid-cols-12 gap-8 md:gap-12">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 space-y-4 md:space-y-6">
            <div className="bg-white border border-border p-1 md:p-2 shadow-sm">
              <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {product.new_arrival && (
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 px-3 py-1 md:px-4 md:py-1.5 bg-primary text-white text-[8px] md:text-[10px] font-bold uppercase tracking-widest rounded-sm">
                    New Arrival
                  </div>
                )}
              </div>
            </div>
            {/* Features Row */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {[
                { icon: <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4" />, label: "Warranty" },
                { icon: <Truck className="w-3.5 h-3.5 md:w-4 md:h-4" />, label: "Shipping" },
                { icon: <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" />, label: "Returns" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-3 p-3 md:p-4 bg-white border border-border text-center md:text-left">
                  <div className="text-primary">{item.icon}</div>
                  <span className="text-[8px] md:text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Product Info */}
          <div className="lg:col-span-5 space-y-6 md:space-y-8">
            <div className="space-y-3 md:space-y-4">
              {product.brand && (
                <div className="inline-block px-2 md:px-3 py-0.5 md:py-1 bg-secondary text-foreground/60 text-[9px] md:text-[11px] font-bold uppercase tracking-widest border border-border">
                  {product.brand.name}
                </div>
              )}
              <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground leading-[1.2] md:leading-[1.1]">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm font-medium text-foreground/40">
                <div className="flex items-center scale-90 md:scale-100 origin-left">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-base md:text-lg ${i < 4 ? 'text-amber-400' : 'text-foreground/10'}`}>★</span>
                  ))}
                </div>
                <span>4.8 (124 reviews)</span>
              </div>
            </div>

            <div className="py-6 md:py-8 border-y border-border flex flex-wrap items-baseline gap-3 md:gap-4">
              <span className="font-display text-3xl md:text-5xl font-bold text-foreground tracking-tight">₹{product.price}</span>
              <span className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] md:text-sm">Included Taxes</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <a
                href={product.buy_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-3 py-3 md:py-5 bg-primary text-white text-xs md:text-sm font-bold uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                Proceed to Checkout
              </a>
              <button
                onClick={toggleWishlist}
                className={`flex items-center justify-center gap-3 py-3 md:py-5 px-6 md:px-10 border transition-all ${isInWishlist
                  ? 'bg-rose-50 border-rose-200 text-rose-500'
                  : 'bg-white border-border text-foreground hover:bg-secondary'
                  }`}
              >
                <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                <span className="text-xs md:text-sm font-bold uppercase tracking-widest sm:hidden lg:inline">
                  {isInWishlist ? 'Saved' : 'Save'}
                </span>
              </button>
            </div>

            <div className="space-y-6 pt-4">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">About this item</h3>
                <p className="text-foreground/60 leading-relaxed font-medium">
                  {product.description || "Discover the pinnacle of D2C craftsmanship. This premium asset is sourced directly from verified manufacturers, ensuring absolute authenticity and top-tier performance for your tech ecosystem."}
                </p>
              </div>

              <div className="bg-secondary/30 p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <Zap className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Verified Asset</p>
                    <p className="text-xs font-medium text-foreground/40 mt-1">This product has been quality-checked by D2Cmarket experts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-32 pt-20 border-t border-border">
            <div className="flex items-center justify-between mb-12">
              <h2 className="font-display text-3xl font-black text-foreground">Items you might <span className="text-primary italic">like</span></h2>
              <Link href="/" className="text-sm font-bold text-primary flex items-center gap-1 group">
                Browse all assets <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {relatedProducts.map(rel => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  onWishlistToggle={() => { }}
                  isInWishlist={false}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Simplified Footer for Detail Page */}
      <footer className="mt-32 border-t border-border pt-12 px-6">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-white text-[10px] font-black italic">D</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-foreground/40">© 2025 D2Cmarket Marketplace</span>
          </div>
          <div className="flex gap-8 text-[11px] font-bold uppercase tracking-widest text-foreground/40">
            <Link href="#" className="hover:text-primary transition-colors">Support</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

