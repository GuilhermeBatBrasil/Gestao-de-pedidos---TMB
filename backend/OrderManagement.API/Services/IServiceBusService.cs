using OrderManagement.API.Models;

namespace OrderManagement.API.Services;

public interface IServiceBusService
{
    Task SendOrderMessageAsync(OrderMessage message);
}
