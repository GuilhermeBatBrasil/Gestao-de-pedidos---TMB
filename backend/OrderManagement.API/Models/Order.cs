namespace OrderManagement.API.Models;

public class Order
{
    public Guid Id { get; set; }
    public string Cliente { get; set; } = string.Empty;
    public string Produto { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public OrderStatus Status { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime? DataAtualizacao { get; set; }
}

public enum OrderStatus
{
    Pendente = 0,
    Processando = 1,
    Finalizado = 2
}
