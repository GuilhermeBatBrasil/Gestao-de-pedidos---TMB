import React from 'react';
import { Order } from '../types/order';
import { getStatusLabel, getStatusColor, formatCurrency, formatDate } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

interface OrderTableProps {
  orders: Order[];
}

const OrderTable: React.FC<OrderTableProps> = ({ orders }) => {
  const navigate = useNavigate();

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Nenhum pedido encontrado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              Cliente
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Produto
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Valor
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Data de Criação
            </th>
            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {orders.map((order) => (
            <tr
              key={order.id}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                {order.cliente}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {order.produto}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {formatCurrency(order.valor)}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold border ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {formatDate(order.dataCriacao)}
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/orders/${order.id}`);
                  }}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Ver detalhes
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
