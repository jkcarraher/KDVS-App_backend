# KDVS App Backend
[![Status](https://api.uptimesignal.io/badge/17c081c2-bc3e-4f67-83a0-72731a8551d9/status.svg)](https://uptimesignal.io/badges)
[![Uptime](https://api.uptimesignal.io/badge/17c081c2-bc3e-4f67-83a0-72731a8551d9/uptime.svg)](https://uptimesignal.io/badges)
[![Response Time](https://api.uptimesignal.io/badge/17c081c2-bc3e-4f67-83a0-72731a8551d9/response.svg)](https://uptimesignal.io/badges)

Backend service for the KDVS App, providing live programming schedule data, APN (Apple Push Notification) show notifications, listener tracking and analytics.

###
![KDVS App Backend Dashboard](https://github.com/user-attachments/assets/12b639d4-af47-4207-83db-386b5572580f)

## Running Locally

### Prerequisites

- Docker
- Docker Compose
- APN Key in /secrets
- ENV Keys

### 1. Start the application

```bash
docker compose up --build
```

### 2. Stop the application

```bash
docker compose down
```

### 3. Verify the service

Open:

```text
http://localhost:3000/health
```

### 4. Restart the service

```bash
docker compose restart
```
