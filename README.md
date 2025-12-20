# Prolepsis

Prolepsis is an Agentic AI Swarm that manages maritime logistics autonomously. Unlike traditional dashboards that wait for human input, Prolepsis agents Detect, Negotiate, and Heal supply chain disruptions in milliseconds.

Built on the Motia Framework, it demonstrates:

- Multi-Agent Governance: A "Council" of AI agents voting on fleet safety.

- Swarm Negotiation: Ships talking to each other to resolve collisions.

- Real-World Leaks: Integration with twilio for alerts and Web Speech API.

# Requirements

1. Node.js
2. Redis Server
3. Python

# Installation

1. Clone the Repository
    ```
    git clone https://github.com/cnu1812/prolepsis.git
    cd prolepsis
    ```
2. Install Dependencies
 
    ` npm install `
3. Configure Environment: Create a `.env` file in the root directory:

    ```
    GROQ_API_KEY=
    OPENWEATHER_API_KEY=

    # --- TWILIO KEYS ---
    TWILIO_SID=
    TWILIO_TOKEN=
    TWILIO_FROM=
    TWILIO_TO=

    # --- SYSTEM SECURITY ---
    ADMIN_PASSWORD=admin123
    ```
    Paste the keys without quotes('')

4. Start: ` npx motia dev  `

5. Open your browser to: http://localhost:3000/dashboard
- http://localhost:3000/ to see the backend logs.

Built with Motia.

Frontend: Leaflet.js, Web Speech API.

Backend: Node.js, Python.

Database: Redis.

Motia is an open-source, unified backend framework that eliminates runtime fragmentation by bringing **APIs, background jobs, queueing, streaming, state, workflows, AI agents, observability, scaling, and deployment** into one unified system using a single core primitive, the **Step**.

## Learn More

- [Documentation](https://motia.dev/docs) - Complete guides and API reference
- [Quick Start Guide](https://motia.dev/docs/getting-started/quick-start) - Detailed getting started tutorial
- [Core Concepts](https://motia.dev/docs/concepts/overview) - Learn about Steps and Motia architecture
- [Discord Community](https://discord.gg/motia) - Get help and connect with other developers