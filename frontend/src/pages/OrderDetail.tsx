import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { Order } from '../types/order';
import { getStatusLabel, getStatusColor, formatCurrency, formatDate } from '../utils/formatters';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrder(id);
      setOrder(data);
    } catch (err) {
      setError('Erro ao carregar pedido. Tente novamente.');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Auto-refresh every 3 seconds
    const interval = setInterval(fetchOrder, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading && !order) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              {error || 'Pedido não encontrado'}
            </h3>
            <button
              onClick={() => navigate('/')}
              className="mt-4 text-sm text-red-700 underline"
            >
              Voltar para lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          ← Voltar para lista
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Detalhes do Pedido</h1>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Pedido #{order.id.substring(0, 8)}
            </h3>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold border ${getStatusColor(
                order.status
              )}`}
            >
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>

        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">ID</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{order.id}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">{getStatusLabel(order.status)}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Cliente</dt>
              <dd className="mt-1 text-sm text-gray-900">{order.cliente}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Produto</dt>
              <dd className="mt-1 text-sm text-gray-900">{order.produto}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Valor</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {formatCurrency(order.valor)}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Data de Criação</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(order.dataCriacao)}
              </dd>
            </div>

            {order.dataAtualizacao && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Última Atualização</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(order.dataAtualizacao)}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500 text-center">
        Atualização automática a cada 3 segundos
      </div>
    </div>
  );
};

export default OrderDetail;
