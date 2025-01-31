# WhatsApp Ticket Status Service

## 🚀 Overview
This service allows users to check the status of their support tickets via **WhatsApp Business API**. It interacts with:
- **Meta's WhatsApp API** → To send & receive messages.
- **Express.js Webhook** → To process incoming messages.
- **Redis** → To store & manage user sessions.
- **gRPC Client** → To fetch ticket status from the gRPC server.

## 📌 How It Works
### 1️⃣ User Initiates a Chat
- A customer sends a message (e.g., "Hi") to the **business WhatsApp number**.
- The **Meta Webhook** forwards the message to the backend.
- The backend extracts the sender’s **phone number** and **message text**.

### 2️⃣ Session Handling (via Redis)
- The system checks if the user has an **active session** in Redis.
- If **no session exists**, it creates a new session and sends a menu:
  
  ```
  👋 Welcome to Ajeek!
  Select an option:
  1️⃣ Check ticket status
  ```

### 3️⃣ User Selects an Option
- If the user replies **"1"**, the system:
  - Updates the session to **"awaiting_ticket_id"**.
  - Asks: **"📌 Please provide your Ticket ID."**

### 4️⃣ User Provides Ticket ID
- If the user enters a **valid numeric Ticket ID**, the system:
  - Stores the Ticket ID.
  - Calls **gRPC service** to fetch the ticket status.
  
### 5️⃣ Fetching Ticket Status via gRPC
- The **gRPC server** returns the **ticket’s status** (e.g., "In Progress", "Resolved").
- The backend sends a response:
  ```
  📄 Your ticket status: *Resolved*
  ```

### 6️⃣ Session Reset
- After sending the status, the session is **cleared**.
- If the user sends another message, a **new session starts**, showing the menu again.

## 🛠️ Setup Instructions
### 1️⃣ Prerequisites
- Node.js & npm
- Redis installed & running
- gRPC server access (provided by .NET team)
- Meta WhatsApp API Access Token

### 2️⃣ Installation
```sh
# Clone the repository
git clone https://github.com/your-repo/whatsapp-ticket-service.git
cd whatsapp-ticket-service

# Install dependencies
npm install
```

### 3️⃣ Configure Environment Variables
Create a `.env` file and add:
```
META_API_TOKEN=your_meta_whatsapp_api_token
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
GRPC_SERVER=grpc.server.address:50051
```

### 4️⃣ Start the Service
```sh
# Run Redis
redis-server

# Start the Express server
npx ts-node src/server.ts
```

### 5️⃣ Expose Webhook via Ngrok
```sh
ngrok http 3000
```
Copy the **ngrok URL** and configure it in the **Meta Webhook settings**.

## 📡 API Endpoints
### ✅ Webhook Verification
```http
GET /api/whatsapp/webhook
```
Used for Meta Webhook verification.

### ✅ Handle Incoming Messages
```http
POST /api/whatsapp/webhook
```
Processes incoming WhatsApp messages.

## 🤝 Contributing
Feel free to submit issues and pull requests to improve the service!

## 📄 License
MIT License

