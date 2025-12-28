'use client';

import { useEffect, useState } from 'react';
import { supabase, Product, Category, Brand } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import {
  Heart,
  ChevronRight,
  Smartphone,
  Tv,
  Headphones,
  Watch,
  Laptop,
  Gamepad,
  Search,
  Menu,
  ShoppingBag,
  User,
  Zap,
  Tag,
  ShieldCheck,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

const NAV_LINKS = [
  { name: 'New Arrivals', href: '#' },
  { name: 'Mobiles', href: '#' },
  { name: 'TV & Audio', href: '#' },
  { name: 'Gaming', href: '#' },
  { name: 'Accessories', href: '#' },
  { name: 'Daily Deals', href: '#' },
  { name: 'Best Sellers', href: '#' }
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
    fetchData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  async function fetchData() {
    try {
      const [productsRes, categoriesRes, brandsRes, wishlistRes] = await Promise.all([
        supabase.from('products').select(`
          *,
          brand:brands(*),
          category:categories(*)
        `).order('created_at', { ascending: false }),
        supabase.from('categories').select('*'),
        supabase.from('brands').select('*'),
        supabase.from('wishlists').select('product_id').eq('user_id', userId)
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (brandsRes.data) setBrands(brandsRes.data);
      if (wishlistRes.data) {
        setWishlist(new Set(wishlistRes.data.map(w => w.product_id)));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterProducts() {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }

    setFilteredProducts(filtered);
  }

  async function toggleWishlist(productId: string) {
    const isInWishlist = wishlist.has(productId);

    if (isInWishlist) {
      await supabase.from('wishlists').delete().eq('user_id', userId).eq('product_id', productId);
      setWishlist(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    } else {
      await supabase.from('wishlists').insert({ user_id: userId, product_id: productId });
      setWishlist(prev => new Set(prev).add(productId));
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold uppercase tracking-widest text-foreground/40">Opening Marketplace</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Top Professional Header */}
      <div className="bg-[#1a1a1a] text-[10px] text-white/50 font-bold py-2.5 px-6 hidden sm:block">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center uppercase tracking-[1.5px]">
          <div className="flex gap-8">
            <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> 100% Secure Checkout</span>
            <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-primary" /> Fastest Delivery in Country</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-primary transition-colors">Gift Cards</a>
            <a href="#" className="hover:text-primary transition-colors">Support Center</a>
            <a href="#" className="text-primary font-black">Sell on Marketplace</a>
          </div>
        </div>
      </div>

      {/* Main Header - Center Search Focus */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-3 md:py-5">
          <div className="flex items-center justify-between gap-4 md:gap-12">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-primary rounded-sm flex items-center justify-center group">
                <span className="text-white font-bold text-xl md:text-2xl italic">D</span>
              </div>
              <span className="font-display text-xl md:text-2xl font-bold tracking-tighter text-foreground">D2C<span className="text-primary">store</span></span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-8">
              {NAV_LINKS.slice(0, 5).map(link => (
                <a key={link.name} href="#" className="text-[13px] font-bold text-foreground/60 hover:text-primary transition-colors uppercase tracking-wider">
                  {link.name}
                </a>
              ))}
            </nav>

            {/* Account & Cart */}
            <div className="flex items-center gap-4 md:gap-6 shrink-0">
              <button className="flex flex-col items-center gap-0.5 group">
                <User className="w-4 h-4 md:w-5 md:h-5 text-foreground/70 group-hover:text-primary transition-colors" />
                <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-tighter text-foreground/40 group-hover:text-primary transition-colors">SignIn</span>
              </button>
              <button className="flex flex-col items-center gap-0.5 group relative">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-foreground/70 group-hover:text-primary transition-colors" />
                <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-tighter text-foreground/40 group-hover:text-primary transition-colors">Cart</span>
                <span className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1.5 w-3.5 h-3.5 md:w-4 md:h-4 bg-primary text-white text-[8px] md:text-[9px] font-bold flex items-center justify-center rounded-sm">0</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Compact & Focused */}
      <section className="bg-white pt-10 pb-8 md:pt-16 md:pb-12 border-b border-border text-center overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 relative">
          {/* Subtle Decorative Accents */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-secondary border border-border rounded-sm mb-4 md:mb-6">
              <Tag className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />
              <span className="text-[9px] md:text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Summer Sale: Up to 40% Off</span>
            </div>

            <h1 className="font-display text-4xl md:text-7xl font-bold text-foreground mb-6 md:mb-8 leading-tight tracking-tighter px-2 uppercase">
              Discovery
            </h1>

            {/* THE MIDDLE SEARCH BAR */}
            <SearchBar onSearch={setSearchQuery} />
          </div>
        </div>
      </section>



      {/* Main Content Wrapper */}
      <div className="max-w-[1440px] mx-auto px-6 py-20">

        {/* Featured Categories */}
        <section className="mb-16 md:mb-24">
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-1.5 h-8 md:w-2 md:h-10 bg-primary" />
              <h2 className="font-display text-xl md:text-3xl font-bold text-foreground">Explore Departments</h2>
            </div>
            <Link href="#" className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary transition-all">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4">
            {[
              { name: 'Smartphones', icon: <Smartphone />, count: '240+ Deals' },
              { name: 'TV & Video', icon: <Tv />, count: '180+ Deals' },
              { name: 'Laptops', icon: <Laptop />, count: '120+ Deals' },
              { name: 'Audio Gear', icon: <Headphones />, count: '310+ Deals' },
              { name: 'Wearables', icon: <Watch />, count: '150+ Deals' },
              { name: 'Gaming', icon: <Gamepad />, count: '90+ Deals' }
            ].map((cat) => (
              <div key={cat.name} className="group relative bg-white border border-border p-5 md:p-8 text-center cursor-pointer transition-all hover:bg-primary/[0.02]">
                <div className="mb-4 md:mb-6 text-foreground/20 group-hover:text-primary transition-colors transform group-hover:-translate-y-1 duration-300">
                  {cat.icon && <div className="w-8 h-8 md:w-10 md:h-10 mx-auto flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">{cat.icon}</div>}
                </div>
                <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-foreground mb-1">{cat.name}</h3>
                <p className="text-[8px] md:text-[10px] font-bold text-foreground/30 uppercase tracking-tighter">{cat.count}</p>
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-500" />
              </div>
            ))}
          </div>
        </section>

        {/* Dynamic Product Feeds */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-40 bg-secondary/30 rounded-lg">
            <Search className="w-12 h-12 text-foreground/10 mx-auto mb-6" />
            <h3 className="text-xl font-display font-bold text-foreground mb-2">No results matched your search</h3>
            <p className="text-sm font-bold text-foreground/40 mb-8">Try searching for generic terms like "Mobile" or "TV"</p>
            <Button onClick={() => { setSearchQuery(''); setSelectedCategory(null); }} className="font-bold bg-primary text-white px-10 rounded-sm">
              Show All Products
            </Button>
          </div>
        ) : (
          <>
            {categories.map((category) => {
              const categoryProducts = filteredProducts.filter(
                (p) => p.category_id === category.id
              );

              if (categoryProducts.length === 0) return null;

              return (
                <section key={category.id} className="mb-16 md:mb-24 last:mb-0">
                  <div className="flex items-center justify-between mb-6 md:mb-10 pb-4 md:pb-6 border-b border-border">
                    <div>
                      <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground">
                        {category.name}
                      </h2>
                      <p className="text-[10px] md:text-sm text-foreground/30 font-bold uppercase tracking-[2px] md:tracking-[3px] mt-1 md:mt-2">
                        Curated Selection / {categoryProducts.length} Products
                      </p>
                    </div>
                    <Link href="#" className="flex items-center gap-2 group text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary">
                      View All <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {categoryProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onWishlistToggle={toggleWishlist}
                        isInWishlist={wishlist.has(product.id)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}

        {/* Wishlist Center */}
        {wishlist.size > 0 && (
          <section id="wishlist-section" className="mt-40 pt-20 border-t-4 border-foreground">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
              <div>
                <h2 className="font-display text-5xl font-bold text-foreground uppercase italic tracking-tighter">Your Bag <span className="text-primary block sm:inline">Favorites</span></h2>
                <p className="text-foreground/40 font-bold uppercase tracking-widest text-sm mt-4">You have {wishlist.size} items securely saved for your next shopping session</p>
              </div>
              <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center animate-pulse">
                <Heart className="w-10 h-10 fill-rose-500 text-rose-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products
                .filter(p => wishlist.has(p.id))
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onWishlistToggle={toggleWishlist}
                    isInWishlist={true}
                  />
                ))}
            </div>
          </section>
        )}
      </div>

      {/* Trust & Features Bar - Moved to bottom */}
      <div className="bg-white border-y border-border py-12 md:py-16 mt-20 md:mt-32">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6">
          {[
            { icon: <Zap className="w-6 h-6 md:w-8 md:h-8" />, title: "Instant Access", desc: "Buy direct from verified brands" },
            { icon: <ShieldCheck className="w-6 h-6 md:w-8 md:h-8" />, title: "Verified Store", desc: "100% Genuine product guarantee" },
            { icon: <Star className="w-6 h-6 md:w-8 md:h-8" />, title: "Premium Quality", desc: "Hand-picked curated selections" },
            { icon: <ShoppingBag className="w-6 h-6 md:w-8 md:h-8" />, title: "Easy Returns", desc: "Hassle-free 30-day refund policy" }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-4 md:gap-6 group">
              <div className="w-14 h-14 md:w-20 md:h-20 bg-secondary flex items-center justify-center rounded-sm transition-all duration-500 group-hover:bg-primary group-hover:text-white text-foreground/40 shrink-0 transform group-hover:rotate-6">
                {feature.icon}
              </div>
              <div>
                <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest text-foreground mb-2">{feature.title}</h4>
                <p className="text-[10px] md:text-xs font-bold text-foreground/30 uppercase tracking-tighter leading-relaxed max-w-[200px]">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Robust Market Footer */}
      <footer className="bg-white border-t border-border pt-32 pb-12 mt-40">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center">
                  <span className="text-white font-bold text-2xl italic">D</span>
                </div>
                <span className="font-display text-3xl font-bold tracking-tighter text-foreground">D2C<span className="text-primary">store</span></span>
              </Link>
              <p className="text-base text-foreground/50 leading-relaxed max-w-sm mb-10 font-medium">
                The world's most trusted marketplace for verified Direct-to-Consumer tech. We skip the middleman, you get the absolute best flagship tech at honest prices.
              </p>
              <div className="flex gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 bg-secondary border border-border flex items-center justify-center hover:bg-primary transition-all group cursor-pointer">
                    <div className="w-4 h-4 bg-foreground/20 group-hover:bg-white rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-[2px] text-foreground mb-10">Store Directory</h4>
              <ul className="space-y-5 text-sm font-bold text-foreground/50">
                <li><Link href="#" className="hover:text-primary transition-colors">Smartphone Hub</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Video & TV Center</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Audio Professional</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">PC & Laptop Depot</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-[2px] text-foreground mb-10">Service Links</h4>
              <ul className="space-y-5 text-sm font-bold text-foreground/50">
                <li><Link href="#" className="hover:text-primary transition-colors">Track My Order</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Return Policy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Verified Program</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-[2px] text-foreground mb-10">Marketplace</h4>
              <ul className="space-y-5 text-sm font-bold text-foreground/50">
                <li><Link href="#" className="hover:text-primary transition-colors">Partner With Us</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Our Story</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Press & Media</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[11px] font-bold text-foreground/30 uppercase tracking-[2px]">
              © 2025 D2Cstore GLOBAL MARKETPLACE. NO MIDDLEMAN. NO UPCHARGES.
            </p>
            <div className="flex gap-10 text-[11px] font-bold text-foreground/30 uppercase tracking-[2px]">
              <Link href="#" className="hover:text-foreground transition-colors">Legal</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Compliance</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
