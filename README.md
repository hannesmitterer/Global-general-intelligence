# Global General Intelligence
Euystacio/AI Collective

## Overview

This repository contains the **Euystacio AI** system - a collaborative artificial intelligence framework designed for global general intelligence processing. Euystacio AI is part of the AI Collective, enabling intelligent information processing, learning, and knowledge sharing.

## Features

- **Intelligent Processing**: Process and respond to various types of input
- **Knowledge Management**: Store and retrieve knowledge dynamically
- **Interaction History**: Track all interactions for learning and analysis
- **State Export**: Export complete AI state for backup or analysis
- **Collaborative Design**: Built to work as part of an AI collective

## Quick Start

### Prerequisites

- Python 3.7 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/hannesmitterer/Global-general-intelligence.git
cd Global-general-intelligence

# No additional dependencies required
```

### Usage

Run the Euystacio AI demonstration:

```bash
python euystacio_ai.py
```

### Example Code

```python
from euystacio_ai import EuystacioAI

# Create an AI instance
ai = EuystacioAI(name="Euystacio", version="1.0.0")

# Process input
response = ai.process_input("Hello!")
print(response['response'])

# Add knowledge
ai.add_knowledge("topic", "General Intelligence")

# Get knowledge
topic = ai.get_knowledge("topic")

# Check status
status = ai.get_status()
print(status)
```

## API Reference

### EuystacioAI Class

#### Methods

- `__init__(name, version)`: Initialize the AI instance
- `process_input(input_data)`: Process input and generate response
- `add_knowledge(key, value)`: Add knowledge to the knowledge base
- `get_knowledge(key)`: Retrieve knowledge by key
- `get_status()`: Get current system status
- `export_state()`: Export complete AI state as JSON

## Contributing

Contributions to the Euystacio/AI Collective are welcome! Please feel free to submit pull requests or open issues.

## License

This project is part of the Euystacio/AI Collective initiative.

## About

Euystacio AI represents a step toward global general intelligence through collaborative AI systems. The goal is to create intelligent systems that can work together, share knowledge, and evolve collectively.

---

## ALO-001 Backend API

### Overview

This repository now includes **ALO-001**, a Node.js/Express backend with Google OAuth authentication and role-based access control (RBAC).

### Features

- **Google OAuth Authentication**: Server-side verification of Google ID tokens
- **Role-Based Access Control**: Two roles with different permissions:
  - **Seedbringer**: Full access (read + write)
  - **Council**: Read-only access
- **Protected Endpoints**:
  - `GET /sfi` - Retrieve SFI data (Council or Seedbringer)
  - `GET /mcl/live` - Retrieve MCL live data (Council or Seedbringer)
  - `POST /allocations` - Create allocations (Seedbringer only)

### Prerequisites

- Node.js 16+
- Google OAuth 2.0 Client ID ([Create one here](https://console.cloud.google.com/apis/credentials))

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env` and update with your Google Client ID:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your `GOOGLE_CLIENT_ID`:
   ```
   GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   ```

3. **Build the TypeScript code**:
   ```bash
   npm run build
   ```

4. **Start the server**:
   ```bash
   npm start
   ```
   
   The server will run on `http://localhost:8080`

### Frontend Demo

Access the demo at: `http://localhost:8080/pbl-001/`

The demo includes:
- Google Sign-In button
- Role detection (Seedbringer or Council)
- Interactive API testing interface
- Form for creating allocations (Seedbringer only)

### API Usage

All protected endpoints require a valid Google ID token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_GOOGLE_ID_TOKEN" \
     http://localhost:8080/sfi
```

### Development

- **Build**: `npm run build` - Compile TypeScript to JavaScript
- **Dev**: `npm run dev` - Build and run the server
- **Clean**: `npm run clean` - Remove compiled files

### Role Configuration

Edit `.env` to configure authorized users. See `.env.example` for the required format:

```
SEEDBRINGER_EMAILS=user1@example.com
COUNCIL_EMAILS=user2@example.com, user3@example.com
```
