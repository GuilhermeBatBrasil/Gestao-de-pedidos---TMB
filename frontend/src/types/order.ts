export enum OrderStatus {
  Pendente = 0,
  Processando = 1,
  Finalizado = 2
}

export interface Order {
  id: string;
  cliente: string;
  produto: string;
  valor: number;
  status: OrderStatus;
  dataCriacao: string;
  dataAtualizacao?: string;
}

export interface CreateOrderRequest {
  cliente: string;
  produto: string;
  valor: number;
}
