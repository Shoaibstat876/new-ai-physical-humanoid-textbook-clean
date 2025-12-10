# Claude Subagents for Physical AI & Humanoid Robotics

This folder defines the multi-agent system used for the AI-native textbook:

- `content-agent.yml` – writes and improves textbook content.
- `rag-agent.yml` – orchestrates retrieval-augmented generation over the docs.
- `translator-agent.yml` – translates content into Urdu for local context.
- `summarizer-agent.yml` – creates summaries, objectives, and revision notes.

These subagents are designed to work together with the FastAPI + Qdrant backend
and Docusaurus frontend to power advanced AI features in the textbook.
