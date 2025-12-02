import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { CreateOrderRequest } from '../types/order';

const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateOrderRequest>({
    cliente: '',
    produto: '',
    valor: 0,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await orderService.createOrder(formData);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Erro ao criar pedido. Verifique os dados e tente novamente.'
      );
      console.error('Error creating order:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Novo Pedido</h1>
        <p className="mt-2 text-sm text-gray-700">
          Preencha os dados abaixo para criar um novo pedido
        </p>
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

      <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8">
            <div>
              <label
                htmlFor="cliente"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Cliente *
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="cliente"
                  id="cliente"
                  required
                  minLength={3}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={formData.cliente}
                  onChange={(e) =>
                    setFormData({ ...formData, cliente: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="produto"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Produto *
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="produto"
                  id="produto"
                  required
                  minLength={3}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={formData.produto}
                  onChange={(e) =>
                    setFormData({ ...formData, produto: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="valor"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Valor (R$) *
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  name="valor"
                  id="valor"
                  required
                  min="0.01"
                  step="0.01"
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
          <button
            type="button"
            className="text-sm font-semibold leading-6 text-gray-900"
            onClick={() => navigate('/')}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando...' : 'Criar Pedido'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;
