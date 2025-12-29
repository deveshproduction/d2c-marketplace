"use client";

import { useEffect, useState } from "react";
import { supabase, Product, Category, Brand } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
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
  ShoppingBag,
  User,
  Zap,
  Tag,
  ShieldCheck,
  Star,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const NAV_LINKS = [
  { name: "New Arrivals", href: "#new" },
  { name: "Trending", href: "#trending" },
  { name: "Featured", href: "#featured" },
  { name: "Categories", href: "#categories" },
  { name: "Brands", href: "#brands" },
];

// Category icons mapping
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes("phone") || name.includes("mobile"))
    return <Smartphone className="w-full h-full" />;
  if (name.includes("laptop") || name.includes("computer"))
    return <Laptop className="w-full h-full" />;
  if (name.includes("gaming") || name.includes("console"))
    return <Gamepad className="w-full h-full" />;
  if (name.includes("audio") || name.includes("headphone"))
    return <Headphones className="w-full h-full" />;
  if (name.includes("watch") || name.includes("wearable"))
    return <Watch className="w-full h-full" />;
  if (name.includes("tv") || name.includes("video"))
    return <Tv className="w-full h-full" />;
  return <Package className="w-full h-full" />;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userId] = useState(() => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("userId");
      if (!id) {
        id = `user_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("userId", id);
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
      const [productsRes, categoriesRes, brandsRes, wishlistRes] =
        await Promise.all([
          supabase
            .from("products")
            .select(
              `
          *,
          brand:brands(*),
          category:categories(*)
        `
            )
            .order("created_at", { ascending: false })
            .limit(500),
          supabase.from("categories").select("*").order("name"),
          supabase.from("brands").select("*").order("name"),
          supabase.from("wishlists").select("product_id").eq("user_id", userId),
        ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (brandsRes.data) setBrands(brandsRes.data);
      if (wishlistRes.data) {
        setWishlist(new Set(wishlistRes.data.map((w) => w.product_id)));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  function filterProducts() {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category_id === selectedCategory);
    }

    setFilteredProducts(filtered);
  }

  async function toggleWishlist(productId: string) {
    const isInWishlist = wishlist.has(productId);

    if (isInWishlist) {
      await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId);
      setWishlist((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    } else {
      await supabase
        .from("wishlists")
        .insert({ user_id: userId, product_id: productId });
      setWishlist((prev) => new Set(prev).add(productId));
    }
  }

  // Get product counts per category
  const getCategoryProductCount = (categoryId: string) => {
    return products.filter((p) => p.category_id === categoryId).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold uppercase tracking-widest text-foreground/40">
            Opening Marketplace
          </p>
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
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> 100% Secure
              Checkout
            </span>
            <span className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-primary" /> Fastest Delivery
            </span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-primary transition-colors">
              Gift Cards
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Support
            </a>
            <span className="text-primary font-black">
              {products.length}+ Products
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-3 md:py-5">
          <div className="flex items-center justify-between gap-4 md:gap-12">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-primary rounded-sm flex items-center justify-center group">
                <span className="text-white font-bold text-xl md:text-2xl italic">
                  D
                </span>
              </div>
              <span className="font-display text-xl md:text-2xl font-bold tracking-tighter text-foreground">
                D2C<span className="text-primary">store</span>
              </span>
            </Link>

            <nav className="hidden xl:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-[13px] font-bold text-foreground/60 hover:text-primary transition-colors uppercase tracking-wider"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-4 md:gap-6 shrink-0">
              <button
                onClick={() => {
                  const wishlistSection =
                    document.getElementById("wishlist-section");
                  if (wishlistSection)
                    wishlistSection.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex flex-col items-center gap-0.5 group relative"
              >
                <Heart className="w-4 h-4 md:w-5 md:h-5 text-foreground/70 group-hover:text-primary transition-colors" />
                <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-tighter text-foreground/40 group-hover:text-primary transition-colors">
                  Wishlist
                </span>
                {wishlist.size > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[8px] font-bold flex items-center justify-center rounded-full">
                    {wishlist.size}
                  </span>
                )}
              </button>
              <button className="flex flex-col items-center gap-0.5 group">
                <User className="w-4 h-4 md:w-5 md:h-5 text-foreground/70 group-hover:text-primary transition-colors" />
                <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-tighter text-foreground/40 group-hover:text-primary transition-colors">
                  Account
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white pt-10 pb-8 md:pt-16 md:pb-12 border-b border-border text-center overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-secondary border border-border rounded-sm mb-4 md:mb-6">
              <Tag className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />
              <span className="text-[9px] md:text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                {categories.length} Categories • {brands.length} Brands •{" "}
                {products.length}+ Products
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-7xl font-bold text-foreground mb-6 md:mb-8 leading-tight tracking-tighter px-2 uppercase">
              Discovery
            </h1>

            <SearchBar onSearch={setSearchQuery} />
          </div>
        </div>
      </section>

      {/* Main Content Wrapper */}
      <div className="max-w-[1440px] mx-auto px-3 md:px-6 py-10 md:py-20">
        {/* Search Results */}
        {searchQuery && (
          <div className="mb-16 md:mb-24">
            <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-12">
              <div className="w-1.5 h-8 md:w-2 md:h-10 bg-primary" />
              <h2 className="font-display text-xl md:text-3xl font-bold text-foreground">
                Search Results for &rdquo;{searchQuery}&rdquo;
              </h2>
              <span className="text-sm text-foreground/40 font-bold">
                ({filteredProducts.length} found)
              </span>
            </div>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-secondary/30 rounded-lg">
                <Search className="w-12 h-12 text-foreground/10 mx-auto mb-6" />
                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                  No results found
                </h3>
                <p className="text-sm font-bold text-foreground/40 mb-8">
                  Try different keywords or browse categories
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                  className="font-bold bg-primary text-white px-10 rounded-sm"
                >
                  Show All Products
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onWishlistToggle={toggleWishlist}
                    isInWishlist={wishlist.has(product.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Featured Categories - Using Real Database Categories */}
        {!searchQuery && categories.length > 0 && (
          <section id="categories" className="mb-16 md:mb-24">
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-1.5 h-8 md:w-2 md:h-10 bg-primary" />
                <h2 className="font-display text-xl md:text-3xl font-bold text-foreground">
                  Explore Categories
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              {categories.slice(0, 12).map((category) => {
                const productCount = getCategoryProductCount(category.id);
                if (productCount === 0) return null;

                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSearchQuery("");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="group relative bg-white border border-border p-5 md:p-8 text-center cursor-pointer transition-all hover:bg-primary/[0.02]"
                  >
                    <div className="mb-4 md:mb-6 text-foreground/20 group-hover:text-primary transition-colors transform group-hover:-translate-y-1 duration-300">
                      <div className="w-8 h-8 md:w-10 md:h-10 mx-auto flex items-center justify-center">
                        {getCategoryIcon(category.name)}
                      </div>
                    </div>
                    <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-foreground mb-1">
                      {category.name}
                    </h3>
                    <p className="text-[8px] md:text-[10px] font-bold text-foreground/30 uppercase tracking-tighter">
                      {productCount} Products
                    </p>
                    <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-500" />
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Dynamic Product Collections by Category */}
        {!searchQuery && !selectedCategory && (
          <div className="space-y-16 md:space-y-24">
            {categories.map((category) => {
              const categoryProducts = products
                .filter((p) => p.category_id === category.id)
                .slice(0, 10);

              if (categoryProducts.length === 0) return null;

              return (
                <section key={category.id}>
                  <div className="flex items-center justify-between mb-6 md:mb-10 pb-4 md:pb-6 border-b border-border">
                    <div>
                      <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground">
                        {category.name}
                      </h2>
                      <p className="text-[10px] md:text-sm text-foreground/30 font-bold uppercase tracking-[2px] md:tracking-[3px] mt-1 md:mt-2">
                        {categoryProducts.length} Products Available
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategory(category.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex items-center gap-2 group text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary"
                    >
                      View All{" "}
                      <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
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
          </div>
        )}

        {/* Filtered by Category */}
        {selectedCategory && !searchQuery && (
          <div className="mb-16 md:mb-24">
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-1.5 h-8 md:w-2 md:h-10 bg-primary" />
                <h2 className="font-display text-xl md:text-3xl font-bold text-foreground">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-wider"
              >
                Clear Filter
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onWishlistToggle={toggleWishlist}
                  isInWishlist={wishlist.has(product.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Wishlist Section */}
        {wishlist.size > 0 && (
          <section
            id="wishlist-section"
            className="mt-40 pt-20 border-t-4 border-foreground"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
              <div>
                <h2 className="font-display text-5xl font-bold text-foreground uppercase italic tracking-tighter">
                  Your <span className="text-primary">Favorites</span>
                </h2>
                <p className="text-foreground/40 font-bold uppercase tracking-widest text-sm mt-4">
                  {wishlist.size} {wishlist.size === 1 ? "item" : "items"} saved
                </p>
              </div>
              <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center animate-pulse">
                <Heart className="w-10 h-10 fill-rose-500 text-rose-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
              {products
                .filter((p) => wishlist.has(p.id))
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

      {/* Trust Features Bar */}
      <div className="bg-white border-y border-border py-12 md:py-16 mt-20 md:mt-32">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6">
          {[
            {
              icon: <Zap className="w-6 h-6 md:w-8 md:h-8" />,
              title: "Direct Access",
              desc: "Buy from verified D2C brands",
            },
            {
              icon: <ShieldCheck className="w-6 h-6 md:w-8 md:h-8" />,
              title: "100% Authentic",
              desc: "Genuine products guaranteed",
            },
            {
              icon: <Star className="w-6 h-6 md:w-8 md:h-8" />,
              title: "Curated Selection",
              desc: `${brands.length}+ premium brands`,
            },
            {
              icon: <Package className="w-6 h-6 md:w-8 md:h-8" />,
              title: "Fast Delivery",
              desc: "Quick & secure shipping",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center gap-4 md:gap-6 group"
            >
              <div className="w-14 h-14 md:w-20 md:h-20 bg-secondary flex items-center justify-center rounded-sm transition-all duration-500 group-hover:bg-primary group-hover:text-white text-foreground/40 shrink-0 transform group-hover:rotate-6">
                {feature.icon}
              </div>
              <div>
                <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest text-foreground mb-2">
                  {feature.title}
                </h4>
                <p className="text-[10px] md:text-xs font-bold text-foreground/30 uppercase tracking-tighter leading-relaxed max-w-[200px]">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-border pt-32 pb-12 mt-40">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center">
                  <span className="text-white font-bold text-2xl italic">
                    D
                  </span>
                </div>
                <span className="font-display text-3xl font-bold tracking-tighter text-foreground">
                  D2C<span className="text-primary">store</span>
                </span>
              </Link>
              <p className="text-base text-foreground/50 leading-relaxed max-w-sm mb-10 font-medium">
                Your trusted marketplace for authentic Direct-to-Consumer
                products. {products.length}+ products from {brands.length}+
                verified brands.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-[2px] text-foreground mb-10">
                Categories
              </h4>
              <ul className="space-y-5 text-sm font-bold text-foreground/50">
                {categories.slice(0, 4).map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => setSelectedCategory(cat.id)}
                      className="hover:text-primary transition-colors"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-[2px] text-foreground mb-10">
                Support
              </h4>
              <ul className="space-y-5 text-sm font-bold text-foreground/50">
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Returns
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-[2px] text-foreground mb-10">
                Company
              </h4>
              <ul className="space-y-5 text-sm font-bold text-foreground/50">
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Press
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Partners
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[11px] font-bold text-foreground/30 uppercase tracking-[2px]">
              © 2025 D2Cstore. All rights reserved.
            </p>
            <div className="flex gap-10 text-[11px] font-bold text-foreground/30 uppercase tracking-[2px]">
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Legal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
