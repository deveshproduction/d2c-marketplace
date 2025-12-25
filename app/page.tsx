'use client';

import { useEffect, useState } from 'react';
import { supabase, Product, Category, Brand } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import { Heart, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'featured' | 'trending' | 'new'>('all');
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
  }, [products, searchQuery, selectedCategory, selectedBrand, filterType]);

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

      if (productsRes.error) {
        console.error('Products error:', productsRes.error);
      }
      if (categoriesRes.error) {
        console.error('Categories error:', categoriesRes.error);
      }
      if (brandsRes.error) {
        console.error('Brands error:', brandsRes.error);
      }

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

    if (selectedBrand) {
      filtered = filtered.filter(p => p.brand_id === selectedBrand);
    }

    if (filterType !== 'all') {
      if (filterType === 'featured') {
        filtered = filtered.filter(p => p.featured === true);
      } else if (filterType === 'trending') {
        filtered = filtered.filter(p => p.trending === true);
      } else if (filterType === 'new') {
        filtered = filtered.filter(p => p.new_arrival === true);
      }
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

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setFilterType('all');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory || selectedBrand || filterType !== 'all' || searchQuery;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="w-20 h-20 border-4 border-purple-600 border-b-transparent rounded-full animate-spin absolute top-0 left-1/2 -translate-x-1/2" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-display font-bold text-gray-900 animate-pulse">Loading Your Discovery Experience</p>
            <p className="text-sm text-gray-600">Preparing amazing products for you...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border glass-effect sticky top-0 z-50 animate-fade-in-down shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 smooth-transition shadow-lg">
                <span className="font-display text-white text-lg font-bold">T</span>
              </div>
              <span className="font-display text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">TechDiscover</span>
            </div>
            <button
              onClick={() => {
                const wishlistSection = document.getElementById('wishlist-section');
                wishlistSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="relative p-3 rounded-xl hover:bg-blue-50 smooth-transition button-press group/wishlist"
            >
              <Heart className="w-5 h-5 text-gray-700 group-hover/wishlist:text-rose-500 smooth-transition group-hover/wishlist:scale-110" />
              {wishlist.size > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs flex items-center justify-center rounded-full font-bold animate-pulse-glow shadow-lg">
                  {wishlist.size}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6">
        <div className="py-12 md:py-20 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-full mb-6 animate-fade-in-down shadow-lg marketplace-badge cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
              </span>
              <span className="text-sm font-black text-orange-700 uppercase tracking-wide">🔥 Hot Deals Today</span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-black mb-8 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 bg-clip-text text-transparent leading-tight animate-fade-in-up animation-delay-100">
              Discover Amazing Products
            </h1>

            <div className="animate-fade-in-up animation-delay-200 mb-8">
              <SearchBar onSearch={setSearchQuery} />
            </div>

            <div className="flex items-center justify-center gap-6 text-sm animate-fade-in-up animation-delay-300">
              <div className="flex items-center gap-2 text-gray-600 hover:scale-110 smooth-transition cursor-default group/feature">
             
              </div>
              <div className="flex items-center gap-2 text-gray-600 hover:scale-110 smooth-transition cursor-default group/feature">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl shadow-sm border-2 border-blue-200 group-hover/feature:scale-110 smooth-transition">
                  <span className="text-base">💳</span>
                </div>
                <span className="font-bold">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 hover:scale-110 smooth-transition cursor-default group/feature">
                <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl shadow-sm border-2 border-orange-200 group-hover/feature:scale-110 smooth-transition">
                  <span className="text-base">🏷️</span>
                </div>
                <span className="font-bold">Best Prices</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border animate-fade-in animation-delay-400">
          <div className="flex gap-2 flex-wrap">
            {['all', 'featured', 'trending', 'new'].map((type, index) => (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold smooth-transition button-press ${
                  filterType === type
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-secondary text-secondary-foreground hover:bg-blue-50 hover:text-blue-600 hover:scale-105'
                }`}
                style={{ animationDelay: `${500 + index * 50}ms` }}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="h-11 px-5 gap-2 font-semibold button-press hover:scale-105 hover:border-blue-400 hover:text-blue-600"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full font-bold animate-pulse-glow">
                {[selectedCategory, selectedBrand].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="mb-8 p-6 bg-white rounded-2xl border border-border slide-up space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-accent hover:text-accent/80 flex items-center gap-1 smooth-transition"
                >
                  <X className="w-4 h-4" />
                  Clear all
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium mb-3 text-foreground">Category</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium smooth-transition ${
                        selectedCategory === category.id
                          ? 'bg-accent text-white'
                          : 'bg-secondary text-secondary-foreground hover:bg-accent/10'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-3 text-foreground">Brand</p>
                <div className="flex flex-wrap gap-2">
                  {brands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => setSelectedBrand(selectedBrand === brand.id ? null : brand.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium smooth-transition ${
                        selectedBrand === brand.id
                          ? 'bg-accent text-white'
                          : 'bg-secondary text-secondary-foreground hover:bg-accent/10'
                      }`}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

{filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl font-display text-muted-foreground mb-2">No products found</p>
            <button
              onClick={clearFilters}
              className="text-accent hover:text-accent/80 smooth-transition"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {categories.map((category) => {
              const categoryProducts = filteredProducts.filter(
                (p) => p.category_id === category.id
              );

              if (categoryProducts.length === 0) return null;

              return (
                <div key={category.id} className="mb-16 pb-16 border-b border-border last:border-0 animate-fade-in-up">
                  <div className="flex items-center justify-between mb-8 animate-slide-in-left">
                    <div>
                      <h2 className="font-display text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="text-base text-muted-foreground mt-2 max-w-2xl">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-semibold px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-full border border-blue-200">
                      {categoryProducts.length} {categoryProducts.length === 1 ? 'product' : 'products'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {categoryProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="stagger-item"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <ProductCard
                          product={product}
                          onWishlistToggle={toggleWishlist}
                          isInWishlist={wishlist.has(product.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}

{wishlist.size > 0 && (
          <div id="wishlist-section" className="border-t-2 border-gray-200 pt-20 pb-20 animate-fade-in-up">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-full mb-4 animate-scale-in">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse-glow" />
                <span className="text-sm font-bold text-rose-700">Your Collection</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-rose-600 bg-clip-text text-transparent">
                Your Wishlist
              </h2>
              <p className="text-lg text-muted-foreground">
                {wishlist.size} {wishlist.size === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {products
                .filter(p => wishlist.has(p.id))
                .map((product, index) => (
                  <div
                    key={product.id}
                    className="stagger-item"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ProductCard
                      product={product}
                      onWishlistToggle={toggleWishlist}
                      isInWishlist={true}
                    />
                  </div>
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
