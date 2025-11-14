# Hitster

A simple .NET 8 Azure Functions application for streaming music. This dockerized application features:

- **Music Player Function** - An HTTP-triggered function that serves a web page for listening to music
- **KeepAlive Function** - A timer-triggered function that runs every 5 minutes to keep the app warm

## Features

- 🎵 Stream embedded MP3 files
- 🎬 Stream music from YouTube (embed any YouTube video)
- 🔄 Auto keep-alive functionality to prevent cold starts
- 🐳 Fully containerized with Docker support
- 🎨 Modern, responsive web interface

## Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Docker](https://www.docker.com/get-started) (for containerized deployment)
- [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local) (optional, for local testing)

## Project Structure

```
hitster/
├── MusicPlayerFunction.cs    # Main HTTP function serving the music player
├── KeepAliveFunction.cs      # Timer function to keep the app warm
├── wwwroot/
│   └── sample.mp3            # Sample music file
├── Dockerfile                 # Docker configuration
├── HitsterFunction.csproj    # Project file
├── Program.cs                 # Application entry point
└── host.json                  # Azure Functions host configuration
```

## Local Development

### Using VS Code Dev Containers (Recommended)

The easiest way to get started is using VS Code Dev Containers, which provides a fully configured development environment.

#### Prerequisites
- [Visual Studio Code](https://code.visualstudio.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

#### Getting Started

1. **Open in Dev Container:**
   - Clone the repository
   - Open the folder in VS Code
   - When prompted, click "Reopen in Container" (or press `F1` and select "Dev Containers: Reopen in Container")
   - Wait for the container to build and initialize (this may take a few minutes on first run)

2. **Run the Application:**
   ```bash
   dotnet build HitsterFunction.csproj
   cd bin/Debug/net8.0
   func start
   ```
   
   Or use the provided convenience script:
   ```bash
   ./start-functions.sh
   ```

3. **Access the Music Player:**
   - VS Code will automatically forward port 7071
   - Click the notification to open in browser, or navigate to: `http://localhost:7071/api/MusicPlayer`

#### What's Included

The dev container comes pre-configured with:
- ✅ .NET 8.0 SDK
- ✅ Azure Functions Core Tools v4
- ✅ Azure CLI
- ✅ Docker-in-Docker support
- ✅ Recommended VS Code extensions:
  - C# Dev Kit
  - Azure Functions
  - Azure CLI Tools
  - Docker

#### Benefits

- **No local setup required** - Everything is containerized
- **Consistent environment** - Same setup for all developers
- **Automatic port forwarding** - Easy testing
- **Pre-installed tools** - Azure Functions Core Tools, .NET SDK, and Azure CLI
- **Isolated dependencies** - Doesn't affect your local machine

### Running Locally (without Docker)

1. Install Azure Functions Core Tools:
   ```bash
   npm install -g azure-functions-core-tools@4 --unsafe-perm true
   ```

2. Build and run the application:
   ```bash
   dotnet build
   func start
   ```

3. Access the music player at: `http://localhost:7071/api/MusicPlayer`

### Building the Application

```bash
dotnet restore
dotnet build
```

## Docker Deployment

### Building the Docker Image

```bash
docker build -t hitster-function:latest .
```

### Running the Container

```bash
docker run -p 8080:80 hitster-function:latest
```

The application will be available at: `http://localhost:8080/api/MusicPlayer`

### Environment Variables

The following environment variables can be configured:

- `AzureWebJobsStorage` - Azure Storage connection string (for timer function state)
- `FUNCTIONS_WORKER_RUNTIME` - Set to `dotnet-isolated` (already configured)
- `WEBSITE_HOSTNAME` - The hostname for the deployed app (used by KeepAlive function)

## Functions

### MusicPlayer (HTTP Trigger)

**Endpoint:** `GET /api/MusicPlayer`

Serves a web interface with:
- Audio player for embedded MP3 files
- YouTube video embed functionality
- Modern, responsive design

**Audio Endpoint:** `GET /api/audio/{filename}`

Serves audio files from the `wwwroot` directory.

### KeepAlive (Timer Trigger)

**Schedule:** Every 5 minutes (`0 */5 * * * *`)

Automatically pings the MusicPlayer function to:
- Keep the application warm
- Prevent cold starts
- Ensure continuous availability

## Adding Music Files

1. Place MP3 files in the `wwwroot/` directory
2. The files will be automatically copied to the output during build
3. Access them via `/api/audio/{filename}`

## Deployment to Azure

This project uses **Bicep** (Infrastructure as Code) for deploying a containerized Azure Function App. The deployment creates all necessary Azure resources and deploys the function app from a Docker container.

### Prerequisites

- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed and configured
- [Docker](https://docs.docker.com/get-docker/) installed
- `jq` for JSON parsing (auto-installed by script if missing)
- Azure subscription with appropriate permissions

### Deployment Configuration

Edit `infra/main.parameters.json` to customize your deployment:

```json
{
  "functionAppName": "hitster-function-app",      // Must be globally unique
  "location": "eastus",                            // Azure region
  "storageAccountName": "hitsterfuncstorage",     // Must be globally unique, lowercase, no hyphens
  "appServicePlanName": "hitster-asp",
  "containerRegistryName": "hitsteracr",          // Must be globally unique, lowercase, alphanumeric only
  "dockerImageTag": "latest"
}
```

### Deployment Methods

#### Option 1: Full Infrastructure + Container Deployment (Bicep)

**Recommended for first-time setup**

This deploys all Azure infrastructure using Bicep and pushes your containerized function app:

```bash
./deploy-bicep.sh
```

**What it does:**
1. ✅ Creates Resource Group
2. ✅ Deploys infrastructure via Bicep:
   - Azure Container Registry (ACR)
   - Storage Account
   - App Service Plan (Linux)
   - Function App configured for containers
   - Application Insights
   - Log Analytics Workspace
3. ✅ Builds Docker image locally
4. ✅ Pushes image to Azure Container Registry
5. ✅ Configures Function App to use the container
6. ✅ Sets up all environment variables including WEBSITE_HOSTNAME

**Deployment time:** ~5-8 minutes

#### Option 2: Update Container Only

**Recommended for code updates**

When you've already deployed the infrastructure and just want to update the code:

```bash
./deploy-container-update.sh
```

**What it does:**
1. ✅ Builds new Docker image
2. ✅ Pushes to existing Azure Container Registry
3. ✅ Restarts Function App to pull new image

**Deployment time:** ~1-2 minutes

### Architecture

The Bicep deployment creates a **containerized Azure Function App** that:

- Runs your .NET 8 function code in a Docker container
- Uses Azure Container Registry for private image storage
- Automatically configures all required settings
- Includes monitoring via Application Insights
- Uses Linux App Service Plan for better container support

### Infrastructure as Code (Bicep)

The infrastructure is defined in `infra/main.bicep` and includes:

```
📁 infra/
├── main.bicep              # Main infrastructure template
└── main.parameters.json    # Configuration parameters
```

**Key resources created:**
- Azure Container Registry (for Docker images)
- Storage Account (for function state)
- App Service Plan (Linux, for containers)
- Function App (containerized)
- Application Insights (monitoring)
- Log Analytics Workspace (logging)

### Manual Deployment Steps

If you prefer to deploy manually or understand the process:

```bash
# 1. Login to Azure
az login

# 2. Set your subscription (if you have multiple)
az account set --subscription "Your-Subscription-Name"

# 3. Create resource group
az group create --name hitster-rg --location eastus

# 4. Deploy infrastructure using Bicep
az deployment group create \
    --resource-group hitster-rg \
    --template-file infra/main.bicep \
    --parameters @infra/main.parameters.json

# 5. Build and push Docker image
docker build -t hitster-function:latest .
az acr login --name hitsteracr
docker tag hitster-function:latest hitsteracr.azurecr.io/hitster-function:latest
docker push hitsteracr.azurecr.io/hitster-function:latest

# 6. Restart function app
az functionapp restart --name hitster-function-app --resource-group hitster-rg
```

### Legacy Shell Script Deployment

For reference, the older shell-based deployment scripts are still available but are **deprecated** in favor of Bicep:

- `deploy-to-azure.sh` - Legacy full deployment
- `deploy-to-azure-improved.sh` - Legacy with config file
- `deploy-code-only.sh` - Legacy code-only deployment

**Note:** These scripts deploy using `func azure functionapp publish` instead of containers. Use the Bicep deployment for container-based deployment.

## Customization

### Adding More Music

Edit the HTML in `MusicPlayerFunction.cs` or add more MP3 files to the `wwwroot/` directory.

### Changing the Timer Schedule

Modify the CRON expression in `KeepAliveFunction.cs`:
```csharp
[TimerTrigger("0 */5 * * * *")] // Every 5 minutes
```

CRON format: `{second} {minute} {hour} {day} {month} {day-of-week}`

### Styling

The HTML includes embedded CSS. Modify the `<style>` section in the `GetMusicPlayerHtml()` method in `MusicPlayerFunction.cs`.

## Troubleshooting

### Function not starting locally
- Ensure Azure Functions Core Tools are installed
- Check that port 7071 is not in use
- Verify .NET 8.0 SDK is installed

### Audio file not playing
- Verify the file exists in `wwwroot/`
- Check the file path in the audio source
- Ensure the file format is supported (MP3, WAV, etc.)

### Docker build issues
- Ensure Docker is running
- Check internet connectivity for NuGet package restore
- Try clearing Docker cache: `docker builder prune`

### KeepAlive function not working
- Check the `WEBSITE_HOSTNAME` environment variable
- Verify the MusicPlayer function URL is accessible
- Check function logs for errors

## Technologies Used

- **.NET 8.0** - Runtime framework
- **Azure Functions V4** - Serverless platform
- **Docker** - Containerization
- **HTML5/CSS3/JavaScript** - Frontend
- **YouTube IFrame API** - Video embedding

## License

This project is open source and available under the MIT License.
