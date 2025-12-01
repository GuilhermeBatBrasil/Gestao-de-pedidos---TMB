using Azure.Messaging.ServiceBus;
using OrderManagement.API.Models;
using System.Text.Json;

namespace OrderManagement.API.Services;

public class ServiceBusService : IServiceBusService
{
    private readonly ServiceBusClient _client;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ServiceBusService> _logger;

    public ServiceBusService(ServiceBusClient client, IConfiguration configuration, ILogger<ServiceBusService> logger)
    {
        _client = client;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendOrderMessageAsync(OrderMessage message)
    {
        var queueName = _configuration["AzureServiceBus:QueueName"];
        var sender = _client.CreateSender(queueName);

        try
        {
            var messageBody = JsonSerializer.Serialize(message);
            var serviceBusMessage = new ServiceBusMessage(messageBody)
            {
                ContentType = "application/json",
                CorrelationId = message.OrderId.ToString(),
                ApplicationProperties =
                {
                    { "EventType", message.EventType }
                }
            };

            await sender.SendMessageAsync(serviceBusMessage);
            _logger.LogInformation("Message sent to Service Bus for Order {OrderId}", message.OrderId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message to Service Bus for Order {OrderId}", message.OrderId);
            throw;
        }
        finally
        {
            await sender.DisposeAsync();
        }
    }
}
