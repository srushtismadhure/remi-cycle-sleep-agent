# REMi safety boundary

REMi is a hackathon wellness prototype. It is not a medical device.

## Current safeguards

- All demo data is synthetic.
- The app stores and processes no protected health information (PHI).
- The interface does not provide medical diagnosis.
- The interface does not recommend or claim to provide treatment.
- Recommendations are framed as general wellness support.
- Risk language describes sleep friction, not disease or clinical risk.
- The evidence adapter returns clearly labeled mock summaries.
- No live wearable, health record, calendar, voice, or messaging API is called.

## Cycle and hormone context

Cycle phase is an optional user-provided or future consented data point.
Hormone values are optional and are not inferred from common wearable signals.
Temperature, heart rate, and HRV can add general context but should not be used
alone to infer hormone levels or diagnose a condition.

## Live API requirements

Any real integration requires:

- explicit user consent
- clear disclosure of what data is accessed
- least-privilege provider scopes
- secure token and secret handling
- encryption in transit and at rest
- deletion and retention controls
- error and revocation handling
- review of applicable privacy and health-data obligations

## Escalation language

A production product should clearly direct users to qualified care for urgent,
persistent, or concerning symptoms. REMi should never imply that a generated
plan is a substitute for professional medical advice, diagnosis, or treatment.
