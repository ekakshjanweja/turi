# Turi - Voice-Powered Email Assistant

Voice-first Gmail assistant. Talk to your inbox, compose hands-free.

**🎙️ [Request Early Access](https://www.turi.email/)**

## Tech Stack

- **Backend**: Bun, Hono, Better Auth, Drizzle, AI SDK, Gemini, Gmail API
- **Mobile**: Flutter, Better Auth, Go Router, Provider, Value Notifiers
- **Frontend**: Next.js, shadcn

## Streaming Chat Workflow

```
Mobile App -----> Backend Agent
    |                    |
    |<---- SSE Stream ---|
    |                    |
Chat Provider      Gmail Service
```

## Agent Workflow

```
User Input
    |
    v
+------------------+
| Intent Detection |
| (End chat?)      |
+------------------+
    |
    v
+------------------+
| Gemini 2.0 Flash |
| Processing       |
+------------------+
    |
    v
+------------------+
| Tool Execution   |
| (Gmail API)      |
+------------------+
    |
    v
+------------------+
| Response Stream  |
| + Audio (TTS)    |
+------------------+
    |
    v
+------------------+
| Context Update   |
| & History        |
+------------------+
```

## Agent Tools

**Email Operations:**

- `search_email` - Search emails with Gmail syntax
- `read_email` - Read email by ID or reference (supports ordinal: "first", "second", etc.)
- `send_email` - Compose and send emails
- `get_email_context` - Get currently loaded email context

**Label Management:**

- `list_email_labels` - Get all Gmail labels
- `create_email_label` - Create new labels
- `update_email_label` - Modify existing labels
- `delete_email_label` - Remove labels
- `get_or_create_email_label` - Get or create labels

## Agent Endpoints

- `/agent/chat` (GET) - Streaming chat interface with AI agent
- `/audio/stt` (POST) - Audio file to text transcription

## Audio System (Flutter)

**Voice Activity Detection (VAD) Flow:**

```
Start Recording (AAC, 44.1kHz, 128kbps)
    |
    v
+------------------+
| Amplitude        |
| Monitoring       |
| (100ms intervals)|
+------------------+
    |
    v
+------------------+
| VAD Processing   |
| Speech: -30dB    |
| Silence: -40dB   |
+------------------+
    |
    v
+------------------+
| Smart Trimming   |
| Start Detection  |
+------------------+
    |
    v
+------------------+
| Silence Timeout  |
| Initial: 5s      |
| After Speech: 2s |
+------------------+
    |
    v
+------------------+
| Auto-Stop &      |
| Audio Trimming   |
+------------------+
    |
    v
+------------------+
| Upload to STT    |
| Service          |
+------------------+
```

**Audio Playback Manager:**

```
Receive Audio Chunks (SSE)
    |
    v
+------------------+
| Queue by         |
| Message ID       |
+------------------+
    |
    v
+------------------+
| Sequential       |
| Playback         |
+------------------+
    |
    v
+------------------+
| Chunk Tracking   |
| & Cleanup        |
+------------------+
```

**Key Features:**

- **Smart VAD**: Configurable thresholds, trim detection, timeout handling
- **Real-time Processing**: 100ms amplitude monitoring with waveform visualization
- **Streaming Playback**: Queued audio chunks with sequential playback per message
- **Audio Trimming**: Automatic silence removal from recordings
- **State Management**: Provider pattern with ValueNotifiers for reactive UI

## Getting Started

1. **Backend**: `cp backend/.env.example backend/.env` → Fill API keys → `cd backend && bun install && bun run dev`
2. **Mobile**: `cp mobile/.env.example mobile/.env` → Set backend URL → `cd mobile && flutter pub get && flutter run`
3. **Frontend**: `cp frontend/.env.example frontend/.env.local` → Set URLs → `cd frontend && bun install && bun run dev`
