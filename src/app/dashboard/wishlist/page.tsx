import Link from 'next/link';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

export default function WishlistPage() {
  // Mock wishlist data
  const wishlistItems = [
    {
      id: 'prod-1',
      name: 'Hydrating Face Cream',
      price: 24.99,
      image: '/placeholder.jpg',
      inStock: true
    },
    {
      id: 'prod-2',
      name: 'Vitamin C Serum',
      price: 29.99,
      image: '/placeholder.jpg',
      inStock: true
    },
    {
      id: 'prod-3',
      name: 'Rejuvenating Night Cream',
      price: 34.99,
      image: '/placeholder.jpg',
      inStock: false
    },
    {
      id: 'prod-4',
      name: 'Matte Lipstick - Ruby Red',
      price: 12.99,
      image: '/placeholder.jpg',
      inStock: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        <span className="text-sm text-muted-foreground">{wishlistItems.length} items</span>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
              <div className="relative h-48 bg-muted flex items-center justify-center">
                <div className="text-muted-foreground">Product Image</div>
                <button className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
              
              <div className="p-4">
                <Link href={`/shop/product/${item.id}`} className="font-medium hover:underline">
                  {item.name}
                </Link>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-medium">${item.price.toFixed(2)}</span>
                  {item.inStock ? (
                    <span className="text-xs text-green-600">In Stock</span>
                  ) : (
                    <span className="text-xs text-red-500">Out of Stock</span>
                  )}
                </div>
                
                <div className="mt-4">
                  <button 
                    disabled={!item.inStock}
                    className={`w-full flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                      item.inStock 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">Your wishlist is empty</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Save your favorite products to your wishlist for easy access later.
          </p>
          <Link 
            href="/shop" 
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
}