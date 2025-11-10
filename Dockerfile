FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Install Node.js and Azure Functions Core Tools
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g azure-functions-core-tools@4 --unsafe-perm true && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy everything
COPY . ./

# Restore and build
RUN dotnet restore && dotnet publish -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/azure-functions/dotnet-isolated:4-dotnet-isolated8.0
WORKDIR /home/site/wwwroot

# Install Node.js and Azure Functions Core Tools in runtime container
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g azure-functions-core-tools@4 --unsafe-perm true && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy published app
COPY --from=build /app/publish .

# Ensure wwwroot directory and files are present
RUN mkdir -p wwwroot

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true
