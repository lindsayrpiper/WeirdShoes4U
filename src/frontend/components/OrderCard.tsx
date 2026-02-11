'use client';

import Link from 'next/link';
import { Order } from '@/types';
import { Package, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';

interface OrderCardProps {
  order: Order;
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending' },
  processing: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelled' },
};

export default function OrderCard({ order }: OrderCardProps) {
  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  return (
    <Link href={`/orders/${order.id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-semibold text-gray-800">{order.id.substring(0, 8)}</p>
          </div>
          <div className={`flex items-center space-x-2 ${status.bg} ${status.color} px-3 py-1 rounded-full`}>
            <StatusIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{status.label}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Items</span>
            <span className="font-medium">{order.items.length}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Total</span>
            <span className="font-bold text-primary-600">${order.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Date</span>
            <span className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            Shipping to: {order.shippingAddress.city}, {order.shippingAddress.state}
          </p>
        </div>
      </div>
    </Link>
  );
}
