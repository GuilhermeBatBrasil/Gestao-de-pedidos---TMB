import { OrderStatus } from '../types/order';

export const getStatusLabel = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.Pendente:
      return 'Pendente';
    case OrderStatus.Processando:
      return 'Processando';
    case OrderStatus.Finalizado:
      return 'Finalizado';
    default:
      return 'Desconhecido';
  }
};

export const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.Pendente:
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case OrderStatus.Processando:
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case OrderStatus.Finalizado:
      return 'bg-green-100 text-green-800 border-green-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date));
};
