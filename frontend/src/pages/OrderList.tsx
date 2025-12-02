import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { Order } from '../types/order';
import OrderTable from '../components/OrderTable';
import { Link } from 'react-router-dom';

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (err) {
      setError('Erro ao carregar pedidos. Tente novamente.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos os pedidos do sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/create"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            + Novo Pedido
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <OrderTable orders={orders} />
      )}

      <div className="mt-4 text-sm text-gray-500 text-center">
        Atualização automática a cada 5 segundos
      </div>
    </div>
  );
};

export default OrderList;
