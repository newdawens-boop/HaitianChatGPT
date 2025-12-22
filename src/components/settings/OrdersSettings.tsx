import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { settingsService } from '@/lib/settingsService';
import { Order } from '@/types/settings';
import { ShoppingBag } from 'lucide-react';

export function OrdersSettings() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    const userOrders = await settingsService.getOrders(user.id);
    setOrders(userOrders);
    setIsLoading(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Orders</h3>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          </div>
          <h4 className="font-medium mb-2">No orders yet</h4>
          <p className="text-sm text-muted-foreground">
            Your purchase history and active subscriptions will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold">{order.product_name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        order.status === 'active'
                          ? 'bg-green-500/10 text-green-600'
                          : order.status === 'cancelled'
                          ? 'bg-red-500/10 text-red-600'
                          : 'bg-gray-500/10 text-gray-600'
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    {order.billing_cycle && (
                      <span className="text-xs text-muted-foreground">
                        • {order.billing_cycle}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatAmount(order.amount, order.currency)}
                  </div>
                  {order.billing_cycle && (
                    <div className="text-xs text-muted-foreground">per {order.billing_cycle}</div>
                  )}
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <div>Purchased: {formatDate(order.created_at)}</div>
                {order.renewal_date && order.status === 'active' && (
                  <div>Next renewal: {formatDate(order.renewal_date)}</div>
                )}
              </div>

              {order.status === 'active' && (
                <button className="mt-3 text-sm text-primary hover:underline">
                  Manage subscription
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Need help with an order?{' '}
          <button className="text-primary hover:underline">Contact support</button>
        </p>
      </div>
    </div>
  );
}
