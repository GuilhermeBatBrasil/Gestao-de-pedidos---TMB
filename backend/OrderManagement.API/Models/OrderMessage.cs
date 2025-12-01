namespace OrderManagement.API.Models;

public class OrderMessage
{
    public Guid OrderId { get; set; }
    public string Cliente { get; set; } = string.Empty;
    public string Produto { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public string EventType { get; set; } = "OrderCreated";
}
