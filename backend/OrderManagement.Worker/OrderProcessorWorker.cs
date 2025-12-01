using Azure.Messaging.ServiceBus;
using Microsoft.EntityFrameworkCore;
using OrderManagement.Worker.Data;
using OrderManagement.Worker.Models;
using System.Text.Json;

namespace OrderManagement.Worker;

public class OrderProcessorWorker : BackgroundService
{
    private readonly ILogger<OrderProcessorWorker> _logger;
    private readonly ServiceBusClient _serviceBusClient;
    private readonly IConfiguration _configuration;
    private readonly IServiceProvider _serviceProvider;
    private ServiceBusProcessor? _processor;
    private readonly HashSet<string> _processedMessages = new();

    public OrderProcessorWorker(
        ILogger<OrderProcessorWorker> logger,
        ServiceBusClient serviceBusClient,
        IConfiguration configuration,
        IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceBusClient = serviceBusClient;
        _configuration = configuration;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var queueName = _configuration["AzureServiceBus:QueueName"];
        
        _processor = _serviceBusClient.CreateProcessor(queueName, new ServiceBusProcessorOptions
        {
            AutoCompleteMessages = false,
            MaxConcurrentCalls = 1
        });

        _processor.ProcessMessageAsync += MessageHandler;
        _processor.ProcessErrorAsync += ErrorHandler;

        await _processor.StartProcessingAsync(stoppingToken);

        _logger.LogInformation("Worker started processing messages at: {time}", DateTimeOffset.Now);

        // Keep the service running
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(1000, stoppingToken);
        }
    }

    private async Task MessageHandler(ProcessMessageEventArgs args)
    {
        var messageBody = args.Message.Body.ToString();
        var correlationId = args.Message.CorrelationId;

        _logger.LogInformation("Received message: {MessageBody} with CorrelationId: {CorrelationId}", 
            messageBody, correlationId);

        // Idempotency check
        if (_processedMessages.Contains(correlationId))
        {
            _logger.LogInformation("Message with CorrelationId {CorrelationId} already processed, skipping", 
                correlationId);
            await args.CompleteMessageAsync(args.Message);
            return;
        }

        try
        {
            var orderMessage = JsonSerializer.Deserialize<OrderMessage>(messageBody);
            
            if (orderMessage == null)
            {
                _logger.LogError("Failed to deserialize message");
                await args.DeadLetterMessageAsync(args.Message, "Deserialization failed");
                return;
            }

            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<OrderDbContext>();

            // Update to Processando
            var order = await dbContext.Orders.FindAsync(orderMessage.OrderId);
            if (order == null)
            {
                _logger.LogError("Order {OrderId} not found", orderMessage.OrderId);
                await args.DeadLetterMessageAsync(args.Message, "Order not found");
                return;
            }

            // Check if already processed beyond Pendente
            if (order.Status != OrderStatus.Pendente)
            {
                _logger.LogInformation("Order {OrderId} already in status {Status}, marking as processed", 
                    order.Id, order.Status);
                _processedMessages.Add(correlationId);
                await args.CompleteMessageAsync(args.Message);
                return;
            }

            // Update to Processando
            order.Status = OrderStatus.Processando;
            order.DataAtualizacao = DateTime.UtcNow;
            await dbContext.SaveChangesAsync();

            _logger.LogInformation("Order {OrderId} updated to Processando", order.Id);

            // Simulate processing time (5 seconds)
            await Task.Delay(5000);

            // Update to Finalizado
            order.Status = OrderStatus.Finalizado;
            order.DataAtualizacao = DateTime.UtcNow;
            await dbContext.SaveChangesAsync();

            _logger.LogInformation("Order {OrderId} updated to Finalizado", order.Id);

            // Mark as processed (idempotency)
            _processedMessages.Add(correlationId);

            // Complete the message
            await args.CompleteMessageAsync(args.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing message");
            // Don't complete the message, it will be retried
        }
    }

    private Task ErrorHandler(ProcessErrorEventArgs args)
    {
        _logger.LogError(args.Exception, "Error in message processing: {ErrorSource}", args.ErrorSource);
        return Task.CompletedTask;
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Worker stopping at: {time}", DateTimeOffset.Now);
        
        if (_processor != null)
        {
            await _processor.StopProcessingAsync(cancellationToken);
            await _processor.DisposeAsync();
        }

        await base.StopAsync(cancellationToken);
    }
}
