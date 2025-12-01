FROM mcr.microsoft.com/dotnet/runtime:8.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["OrderManagement.Worker.csproj", "./"]
RUN dotnet restore "OrderManagement.Worker.csproj"
COPY . .
RUN dotnet build "OrderManagement.Worker.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "OrderManagement.Worker.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "OrderManagement.Worker.dll"]
