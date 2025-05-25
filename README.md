## Lokaal installeren
### 1. Download het project
Download dit project als een ZIP-bestand
Pak dit ZIP-bestand uit
Open het uitgepakte bestand met Visual Studio Code of een IDE dat je prefereert
**Backend:**
### Stap 1: Maak de configuratiebestanden aan
Navigeer naar de `serverless-backend` folder en maak de volgende bestanden aan:
#### `host.json`
```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  }
}
```

#### `local.settings.json`
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_KEY": "6dJYIoSk6PzAFXQNpLQoBa0ftCkZlnq5Gs1zIC8Yvoz4YrFhSuDh7OF8Wsh7bi3FvtR1IcdmdQmmACDbWTjCHA==",
    "COSMOS_ENDPOINT": "https://wout-svrns.documents.azure.com:443/",
    "COSMOS_DATABASE_NAME": "my-db",
    "JWT_SECRET": "e715aaffbd8a705625869f147c77f97aa85d5b3c3e0f0b588e8a9506e05845683d81223d168d7cf4871a5cb0c3d58ffa1dff463d51c2aa993206903e6d118ae38773f0a8be46bd061fd191dfd545e98bd8722a064e542b7bab05082b46726e6d7506336274a6d4f06883ada13e2a905bde35b58db43f166c16a365bbfd6551827f3b8aced9469ac7f3fff53eef3a79b603196c6a79f9c8dc015144eb7c61b59254ef3a25b197ba8bbfbe4eadc92b8c9b8920b862e1adc913f96307393a7f36e587aad72015fe052884bf27460d7fa3af235cb12a8cb57f84c9f1ac5a4a1d8fad2e616a58c17329e8ee96e902807f29478229db43f57638aa9ff5c7d7c3ac8dbf"
  }
}
```
### Stap 2: Installeer dependencies en start de backend
Voer de volgende commando's uit in de serverless-backend folder:
- nmp install
- npm run build
- func start
Om de backend te stoppen, gebruik ctrl + c en bevestig met yes.

Backend API: http://localhost:7071/api

**Frontend:**
Navigeer naar de frontend folder en voer de volgende commando’s uit:
Open een nieuwe terminal in de frontend folder
Doe het commando npm install
Doe het commando npm run dev om de frontend op te starten
Doe ctr-c yes om de frontend af te sluiten

Frontend API: http://localhost:8000/

**Extern**
Gebruik de live versie van de applicatie via de volgende link:
https://cne11blob.z1.web.core.windows.net/

