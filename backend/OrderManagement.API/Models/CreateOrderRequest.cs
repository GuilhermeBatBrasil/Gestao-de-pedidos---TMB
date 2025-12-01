using System.ComponentModel.DataAnnotations;

namespace OrderManagement.API.Models;

public class CreateOrderRequest
{
    [Required(ErrorMessage = "Cliente é obrigatório")]
    [MinLength(3, ErrorMessage = "Cliente deve ter no mínimo 3 caracteres")]
    public string Cliente { get; set; } = string.Empty;

    [Required(ErrorMessage = "Produto é obrigatório")]
    [MinLength(3, ErrorMessage = "Produto deve ter no mínimo 3 caracteres")]
    public string Produto { get; set; } = string.Empty;

    [Required(ErrorMessage = "Valor é obrigatório")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Valor deve ser maior que zero")]
    public decimal Valor { get; set; }
}
