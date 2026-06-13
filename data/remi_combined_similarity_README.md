# REMi Combined Similarity Dataset

Synthetic demo dataset for REMi similarity search.

## Purpose

This single table blends four dataset concepts into one row-level schema:

- mcPHASES-style cycle, hormone, sleep, wearable, and symptom fields
- WESAD-style stress/affect physiology and self-report fields
- BigLabs-style multi-device heart-rate and activity fields
- VibViz-style haptic descriptors and recommendation targets

Each row represents one synthetic user-night/body-state case.

## Primary similarity field

Use `embedding_text` for Nebius embeddings.

Recommended retrieval fields:
- `record_id`
- `embedding_text`
- `sleep_friction_score`
- `friction_level`
- `haptic_mode`
- `target_recommendation_json`
- `recommendation_rationale`

## Suggested flow

1. Generate embeddings for `embedding_text`.
2. Store vectors in local JSON or a vector DB.
3. Build today's user profile in the same language/template.
4. Embed today's profile.
5. Retrieve top-k similar rows.
6. Send today's profile + retrieved rows to Nebius.
7. Ask Nebius for strict JSON: score, haptic mode, breath rhythm, pulse, duration, intensity, drivers, Spot message, and moon/body summary.

## Safety

Synthetic demo data only. Not PHI. Not clinically validated. Do not use for diagnosis or treatment claims.
