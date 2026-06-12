# REMi architecture

## End-to-end flow

```text
User taps Run tonight's plan
  -> local synthetic data loads
  -> TypeScript data adapter normalizes signals
  -> risk engine creates a risk profile
  -> Nebius mock creates a sleep plan
  -> Tavily mock returns evidence
  -> Composio mock returns actions
  -> ElevenLabs mock returns a voice note
  -> UI displays the final output
```

## Layers

### Data

`data/demoNight.json` and `data/demoUser.json` contain synthetic demo inputs.
The protocol and evidence JSON files provide deterministic content for the
prototype.

### Normalization

`lib/dataAdapter.ts` accepts unknown input, applies safe defaults, clamps basic
numeric ranges, and returns the stable `REMiSignals` schema. Provider-specific
wearable adapters can later map into this same schema.

### Decision support

`lib/riskEngine.ts` contains intentionally transparent rules. The score is not a
medical prediction. It is a product-level sleep-friction estimate used to
choose an appropriate wellness routine.

`lib/protocolBuilder.ts` maps risk and phase context to one of the local
protocol templates.

### Provider adapters

The sponsor integrations are isolated behind typed functions:

- `generateSleepPlan` in `lib/nebius.ts`
- `retrieveEvidence` in `lib/tavily.ts`
- `triggerBedtimeActions` in `lib/composio.ts`
- `generateVoiceNote` in `lib/elevenlabs.ts`

Replacing a mock should not require changes to product components as long as
the function contract remains stable.

### API

`app/api/run-agent/route.ts` orchestrates the complete pipeline and returns a
single `REMiAgentResult`. Additional routes expose each mock adapter separately
for demos and incremental integration work.

### Interface

The home page runs the agent through the API and animates each stage. The
Tonight, Protocol, and Actions routes use the same deterministic demo pipeline
to support direct navigation and reliable presentations.

## Live integration considerations

Before live integrations, add authentication, consent capture, encrypted secret
storage, provider token lifecycle management, audit logging, retries, explicit
partial-failure states, and data retention controls.
