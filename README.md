# REMi

REMi is a cycle-aware AI sleep agent that turns body signals into personalized
bedtime actions.

The prototype answers a practical nightly question:

> How will my body likely sleep tonight, and what should I do about it?

It combines synthetic wearable recovery signals, cycle phase context, optional
symptom inputs, and recent sleep load. A transparent TypeScript risk engine
turns those inputs into a wellness-oriented sleep-friction estimate. Mock AI and
automation adapters then create a wind-down protocol, evidence cards, bedtime
actions, and a gentle voice note.

## Why cycle-aware sleep planning?

Sleep can feel different across a cycle. REMi treats cycle phase as one piece of
context alongside personal baselines, stress, prior sleep, and comfort inputs.
It does not infer hormone levels, diagnose conditions, or replace medical care.
The product goal is simpler: make tonight's signals understandable and
actionable.

## Tech stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- Framer Motion
- Local JSON demo data
- Route handlers for the agent pipeline
- Replaceable mock adapters for external services

No database, authentication, PHI, or live API credentials are required.

## Agent loop

1. Load the synthetic demo night.
2. Normalize inputs into `REMiSignals`.
3. Calculate a transparent `REMiRiskProfile`.
4. Generate a `REMiSleepPlan`.
5. Retrieve mock `REMiEvidenceItem` objects.
6. Prepare mock `REMiAction` objects.
7. Generate a mock `REMiVoiceNote`.
8. Return one `REMiAgentResult` to the UI.

The primary endpoint is `POST /api/run-agent`. Thin adapter routes are also
available at:

- `/api/nebius-plan`
- `/api/tavily-evidence`
- `/api/composio-actions`
- `/api/elevenlabs-voice`

## Sponsor stack mapping

| Technology | REMi role |
| --- | --- |
| Nebius | Personalized sleep protocol generation |
| Tavily | Evidence grounding |
| Composio | Calendar, Sheets, reminder, and save actions |
| ElevenLabs | Calming voice note and bedtime narration |
| OpenClaw | Future agent runtime and harness |
| Next.js / TypeScript | App, data pipeline, API routes, and risk engine |

## Mock mode today

Every external integration is represented by a small function in `lib/`.
Responses are deterministic, fast, and safe for a hackathon demo. The UI still
uses real route handlers, so the product flow is representative of a live
agent without depending on network services.

## Future live API mode

Each mock adapter can later be replaced internally while keeping its public
typed function contract stable:

- `lib/nebius.ts`
- `lib/tavily.ts`
- `lib/composio.ts`
- `lib/elevenlabs.ts`

Live mode should add explicit user consent, secret management, retries,
observability, secure data handling, and provider-specific error states before
connecting real health or account data.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then select **Run tonight's
plan**.

Useful checks:

```bash
npm run typecheck
npm run build
```

## Project structure

```text
app/          Pages and API routes
components/   Product UI and motion components
data/         Synthetic demo inputs and mock content
lib/          Types, risk engine, pipeline, and provider adapters
docs/         Architecture, demo flow, and safety notes
```

## Safety boundaries

- Synthetic data only
- No PHI
- No medical diagnosis or treatment claims
- Wellness support only
- No inference of hormone levels from common wearable data
- Not a medical device

See [docs/safety.md](docs/safety.md) for the full prototype boundary.
