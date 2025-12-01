using Microsoft.EntityFrameworkCore;
using OrderManagement.Worker;
using OrderManagement.Worker.Data;
using Azure.Messaging.ServiceBus;

var builder = Host.CreateApplicationBuilder(args);

// Database
builder.Services.AddDbContext<OrderDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Azure Service Bus
builder.Services.AddSingleton(sp =>
{
    var connectionString = builder.Configuration["AzureServiceBus:ConnectionString"];
    return new ServiceBusClient(connectionString);
});

// Worker
builder.Services.AddHostedService<OrderProcessorWorker>();

// Health Checks
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection")!, name: "database")
    .AddAzureServiceBusQueue(
        builder.Configuration["AzureServiceBus:ConnectionString"]!,
        builder.Configuration["AzureServiceBus:QueueName"]!,
        name: "servicebus");

var host = builder.Build();

// Apply migrations automatically
using (var scope = host.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
    db.Database.Migrate();
}

host.Run();
