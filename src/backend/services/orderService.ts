import { Order, ShippingAddress, OrderStatus } from '@/backend/models';
import { ordersStore } from '@/backend/lib/mockData';
import { cartService } from './cartService';
import { productService } from './productService';
import { v4 as uuidv4 } from 'uuid';
import * as Sentry from '@sentry/nextjs';

class OrderService {
  createOrder(
    userId: string,
    cartId: string,
    shippingAddress: ShippingAddress
  ): Order | null {
    return Sentry.startSpan(
      { name: 'orderService.createOrder', op: 'db.query', attributes: { userId, cartId } },
      () => {
        const cart = cartService.getCart(cartId);
        if (!cart || cart.items.length === 0) {
          Sentry.logger.error('Order creation failed: cart is empty', { cartId });
          throw new Error('Cart is empty');
        }

        Sentry.logger.info('Verifying stock for order', { cartId, itemCount: cart.items.length });

        // Verify stock availability
        for (const item of cart.items) {
          const product = productService.getProductById(item.product.id);
          if (!product || product.stock < item.quantity) {
            Sentry.logger.error('Insufficient stock during order creation', {
              productId: item.product.id,
              productName: item.product.name,
              requested: item.quantity,
              available: product?.stock ?? 0,
            });
            throw new Error(`Insufficient stock for ${item.product.name}`);
          }
        }

        // Update stock
        for (const item of cart.items) {
          productService.updateProductStock(item.product.id, item.quantity);
        }

        const order: Order = {
          id: uuidv4(),
          userId,
          items: [...cart.items],
          total: cart.total,
          status: 'pending',
          shippingAddress,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        ordersStore.set(order.id, order);

        // Clear the cart after order is created
        cartService.clearCart(cartId);

        Sentry.logger.info('Order created', {
          orderId: order.id,
          userId,
          total: order.total,
          itemCount: order.items.length,
        });

        return order;
      }
    );
  }

  getOrderById(orderId: string): Order | undefined {
    return ordersStore.get(orderId);
  }

  getUserOrders(userId: string): Order[] {
    return Array.from(ordersStore.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
    const order = ordersStore.get(orderId);
    if (!order) return null;

    order.status = status;
    order.updatedAt = new Date();
    ordersStore.set(orderId, order);
    return order;
  }

  getAllOrders(): Order[] {
    return Array.from(ordersStore.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
}

export const orderService = new OrderService();
