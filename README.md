# REMi

### A cycle-aware haptic action layer for women’s sleep and recovery

> **Wearables are good at telling us what happened. REMi explores what they could do next.**

REMi is a research-oriented wearable concept that translates cycle context, recovery signals, sleep history, and self-reported symptoms into subtle, personalized haptic patterns delivered through a device the user already wears.

Most wearables stop at the **insight layer**: they measure heart rate, heart-rate variability, temperature, stress, sleep, and menstrual-cycle context, then return a score or recommendation inside an app. The user must open the app, interpret the information, decide what matters, and remember to act.

REMi is designed to bridge that gap between **insight and action**.

Instead of only saying, “Your body may have a harder time winding down tonight,” REMi is intended to initiate a low-effort response through gentle, rhythmic haptic cues on the wrist.

---

## Project status

> [!IMPORTANT]
> REMi is currently a **hackathon research prototype**. It is not a medical device, diagnostic tool, treatment, or validated digital therapeutic.

| Component | Status |
|---|---|
| Mobile-first product interface | Implemented / prototype |
| Synthetic wearable and cycle data | Implemented |
| Cycle-aware risk logic | Prototype |
| Personalized bedtime protocol | Prototype |
| Browser vibration or haptic preview | Prototype; device-dependent |
| Real wearable API connection | Not yet integrated |
| Native smartwatch haptics | Not yet integrated |
| Tavily evidence retrieval | **Planned — not yet integrated** |
| Nebius embeddings and model inference | **Planned — not yet integrated** |
| Prospective physiological validation | Not yet conducted |
| Clinical validation | Not yet conducted |

The current experience demonstrates the intended workflow using local or synthetic data. Tavily and Nebius are described below as planned architectural components; they should not be interpreted as active production integrations in the current build.

---

## The problem

Women’s sleep and recovery are not physiologically static.

Across the menstrual cycle, changes in reproductive hormones can coincide with measurable changes in thermoregulation, resting heart rate, heart-rate variability, symptoms, and—in some individuals—sleep experience. At the same time, consumer wearables increasingly collect these signals continuously.

The missing piece is not always another score.

The missing piece is an intervention that is:

- timely;
- personalized;
- discreet;
- low effort;
- delivered without requiring another app check;
- designed around the body’s changing context.

A user who is already tired should not need to interpret six charts and complete a ten-step routine before receiving support.

---

## The REMi solution

REMi converts passive measurements into an active, body-level response.

```text
Wearable + cycle signals
        ↓
Personal baseline comparison
        ↓
Tonight’s sleep-disruption or arousal context
        ↓
Evidence- and rule-informed protocol selection
        ↓
Subtle rhythmic haptic pattern
        ↓
Feedback, adaptation, and learning over time
```

REMi is intended to answer two questions:

1. **How might this person’s body respond tonight?**
2. **What is the smallest helpful action the wearable can initiate now?**

---

## What the haptics are intended to do

REMi delivers subtle, rhythmic vibrotactile patterns through a wearable on the wrist.

These patterns are not designed as ordinary alerts. A notification demands attention; REMi’s haptics are intended to provide a quiet, repeatable sensory rhythm that can be perceived without looking at a screen.

The working hypothesis is that carefully designed tactile rhythms may:

- provide a predictable sensory cue;
- redirect attention from cognitive rumination toward bodily sensation;
- support interoceptive awareness;
- reduce perceived arousal in some contexts;
- help create a consistent transition cue for sleep;
- make a recommended action automatic rather than dependent on memory.

Some experimental work has reported calming or autonomic effects from specific tactile and heartbeat-like stimulation patterns. However, the effects depend on factors such as rhythm, intensity, duration, body location, expectation, and individual response.

> [!CAUTION]
> REMi does **not** currently claim that ordinary wrist vibration directly stimulates the vagus nerve or reliably activates the parasympathetic nervous system. The safer scientific framing is that rhythmic haptic stimulation may influence perceived or physiological arousal and may support a shift toward a calmer state. This mechanism must be validated for REMi’s specific hardware, patterns, users, and use cases.

---

## Why women’s health

REMi is not a generic stress score with a period calendar attached.

The system is intended to model a person’s signals relative to:

- their own baseline;
- their current cycle phase or cycle-day estimate;
- recent temperature patterns;
- resting heart rate;
- HRV or pulse-rate variability;
- sleep debt;
- prior sleep quality;
- symptom reports;
- stress and recovery context;
- medication, pregnancy, contraception, perimenopause, or irregular-cycle context when voluntarily provided and scientifically appropriate.

The product should not assume that every woman experiences the same phase-related changes. Individual variation is central to the design.

The goal is **personalized pattern recognition**, not hormonal stereotyping.

---

## Example user experience

### 1. Passive sensing

REMi receives or simulates:

- cycle phase;
- skin-temperature deviation;
- resting heart rate;
- HRV;
- sleep duration and sleep debt;
- recent stress load;
- prior-night sleep quality;
- optional symptoms such as cramps, bloating, warmth, restlessness, or mood changes.

### 2. Context interpretation

The system compares tonight’s signals with the user’s own baseline rather than treating a population average as the truth.

Example:

```json
{
  "cyclePhase": "late_luteal",
  "skinTemperatureDeltaC": 0.34,
  "restingHeartRateDeltaBpm": 5,
  "hrvDeltaPercent": -14,
  "sleepDebtHours": 1.8,
  "reportedSymptoms": ["warm", "restless"],
  "estimatedArousalRisk": "elevated"
}
```

### 3. Protocol selection

REMi selects a short intervention plan, such as:

- a slow, low-intensity rhythmic pattern;
- a limited session duration;
- a check-in after the pattern;
- a reduced-stimulation option when the user is sensory-sensitive;
- no intervention when confidence is low or the user opts out.

### 4. Haptic delivery

The prototype currently demonstrates haptic patterns through supported browser/device vibration behavior.

A production version would require a native wearable integration—such as watchOS, Wear OS, or a dedicated wearable SDK—to control haptic timing and intensity with greater precision.

### 5. Learning loop

The user can report:

- “helped me settle”;
- “too strong”;
- “did not notice it”;
- “made me more alert”;
- “stop using this pattern.”

These responses should update future pattern selection. Physiological metrics alone should never override explicit user feedback.

---

## Planned architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                     USER / WEARABLE LAYER                    │
│                                                              │
│  Cycle context  HRV  RHR  temperature  sleep  symptoms       │
│  Haptic delivery  feedback  consent  preferences             │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    NORMALIZATION LAYER                       │
│                                                              │
│  Validate → clean → baseline → calculate deltas → confidence │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                     DECISION / SAFETY LAYER                  │
│                                                              │
│  Deterministic rules + contraindications + intensity limits  │
│  Cycle-aware risk context + user preferences                 │
└───────────────┬──────────────────────────────┬───────────────┘
                │                              │
                ▼                              ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│       NEBIUS — PLANNED      │   │       TAVILY — PLANNED     │
│                             │   │                             │
│  Embeddings                 │   │  Evidence retrieval         │
│  Similarity search          │   │  Source discovery           │
│  Grounded text generation   │   │  Citation metadata          │
│  Optional model guardrails  │   │  Research-update workflow   │
└───────────────┬─────────────┘   └──────────────┬──────────────┘
                │                                │
                └────────────────┬───────────────┘
                                 ▼
┌──────────────────────────────────────────────────────────────┐
│                    PROTOCOL COMPOSER                         │
│                                                              │
│  Select haptic pattern → duration → intensity → explanation  │
│  Attach evidence and uncertainty → log decision              │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                      HAPTIC OUTPUT                           │
│                                                              │
│  Browser preview today → native wearable integration later   │
└──────────────────────────────────────────────────────────────┘
```

---

# Planned sponsor and platform integrations

## Tavily: planned evidence-retrieval layer

**Status: not yet integrated into the current REMi prototype.**

Tavily is intended to serve as REMi’s external evidence-search and source-discovery layer.

### Intended role

Tavily would be used to:

1. Search for current, relevant research about:
   - menstrual-cycle physiology;
   - thermoregulation and sleep;
   - wearable-derived HRV and temperature;
   - vibrotactile stimulation;
   - autonomic arousal;
   - human-factors and haptic safety.

2. Retrieve source metadata:
   - article title;
   - authors;
   - publication year;
   - journal or institution;
   - URL or DOI;
   - extracted passage;
   - retrieval date.

3. Produce evidence cards in the REMi interface.

4. Support a scheduled research-refresh workflow so the knowledge base is not frozen at the date of the prototype.

5. Restrict health-related searches to an allowlist of trusted domains whenever possible, for example:
   - PubMed;
   - PubMed Central;
   - NIH;
   - peer-reviewed journal publishers;
   - recognized academic institutions;
   - standards bodies and official technical documentation.

### What Tavily should not do

Tavily should not independently:

- diagnose a condition;
- determine that a user is in a specific hormonal phase without adequate input;
- select a medical treatment;
- convert a search result directly into a user-facing recommendation;
- treat search-result ranking as clinical evidence grading.

Search retrieves information. It does not establish clinical validity.

### Proposed Tavily flow

```text
Normalized user context
        ↓
Structured evidence query
        ↓
Tavily Search API
        ↓
Domain filtering + deduplication
        ↓
Study metadata and relevant passages
        ↓
Evidence quality checks
        ↓
Store approved evidence in REMi knowledge base
```

### Example future query

```text
wearable distal skin temperature luteal phase sleep heart rate
site:pubmed.ncbi.nlm.nih.gov OR site:pmc.ncbi.nlm.nih.gov
```

### Proposed environment variable

```bash
TAVILY_API_KEY=your_tavily_api_key
```

The key must remain server-side and must not be committed to Git.

---

## Nebius: planned intelligence, embedding, and retrieval layer

**Status: not yet integrated into the current REMi prototype.**

Nebius AI Studio is intended to power the semantic layer that connects a user’s current context with relevant evidence and appropriate intervention templates.

### Intended role

Nebius would be used for four separate tasks.

#### 1. Create embeddings

Convert approved evidence passages, haptic-protocol descriptions, and normalized user-state summaries into vector representations.

Example evidence record:

```json
{
  "id": "paper_azevedo_2017",
  "type": "research_evidence",
  "title": "The calming effect of a new wearable device...",
  "population": "healthy adults under anticipatory stress",
  "intervention": "heartbeat-like wrist tactile stimulation",
  "outcomes": ["skin conductance", "subjective anxiety"],
  "limitations": ["single context", "device-specific", "not a sleep study"],
  "textForEmbedding": "..."
}
```

Example user-state summary:

```text
Late-luteal context; skin temperature above personal baseline;
resting heart rate elevated; HRV below baseline; sleep debt present;
user reports warmth and difficulty settling.
```

#### 2. Perform semantic similarity retrieval

Compare the current state with:

- previously approved evidence;
- intervention templates;
- haptic patterns;
- prior user responses;
- safety rules.

Cosine similarity may help retrieve relevant records, but it should not be the sole decision-maker.

```text
User-state embedding
        ↓
Vector similarity search
        ↓
Top matching evidence and protocol candidates
        ↓
Rule-based safety filter
        ↓
Final candidate set
```

#### 3. Generate a grounded explanation

Use a Nebius-hosted language model to create a concise explanation such as:

> “Your temperature and resting heart rate are above your recent baseline, while HRV is lower. REMi selected a slower, lower-intensity pattern intended to support settling without requiring another screen-based task.”

The model should receive only the approved retrieved context and must be instructed not to diagnose, overstate causality, or invent evidence.

#### 4. Support model safety and evaluation

A future implementation may use Nebius-hosted models or safety tooling for:

- structured-output validation;
- unsupported-claim detection;
- citation-presence checks;
- medical-claim filtering;
- response consistency testing;
- latency and model-comparison experiments.

### What Nebius should not do

Nebius should not be allowed to autonomously:

- make a diagnosis;
- decide that haptics are safe for every user;
- generate arbitrary vibration patterns without constraints;
- override deterministic safety limits;
- cite evidence that was not actually retrieved;
- infer pregnancy, disease, fertility, or reproductive status from weak signals.

### Proposed Nebius flow

```text
Approved research + protocol library
        ↓
Nebius embedding endpoint
        ↓
Vector store
        ↓
Similarity retrieval
        ↓
Safety and rule filter
        ↓
Nebius model inference
        ↓
Structured REMi protocol + explanation + evidence IDs
```

### Proposed environment variable

```bash
NEBIUS_API_KEY=your_nebius_api_key
```

For a Next.js server route, the key should be read through `process.env.NEBIUS_API_KEY`.  
For an optional Python ingestion script, it can be loaded through `os.getenv("NEBIUS_API_KEY")`.

---

## Why use both Tavily and Nebius?

They solve different problems.

| Layer | Tavily | Nebius |
|---|---|---|
| Primary function | Find external information | Represent, retrieve, and generate from information |
| Input | Research query | Text, structured context, or retrieved evidence |
| Output | Search results and source content | Embeddings or model output |
| REMi use | Keep evidence current | Match context to evidence and compose grounded output |
| Current status | Planned | Planned |

In plain terms:

- **Tavily finds the evidence.**
- **Nebius helps REMi understand and use the approved evidence.**
- **The deterministic REMi safety layer decides what is permitted.**

---

## Decision logic: rules first, AI second

REMi should not use an unrestricted language model as its physiological decision engine.

The recommended hierarchy is:

```text
1. Consent and user preferences
2. Device and data-quality checks
3. Contraindications and safety limits
4. Deterministic feature calculations
5. Personal-baseline comparison
6. Retrieval of approved evidence and protocols
7. AI-generated explanation
8. User feedback and audit logging
```

Example risk calculation:

```ts
type RiskLevel = "low" | "moderate" | "elevated";

function estimateTonightContext(input: {
  hrvDeltaPercent: number;
  restingHeartRateDeltaBpm: number;
  skinTemperatureDeltaC: number;
  sleepDebtHours: number;
  symptomCount: number;
}): RiskLevel {
  let score = 0;

  if (input.hrvDeltaPercent <= -10) score += 1;
  if (input.restingHeartRateDeltaBpm >= 4) score += 1;
  if (input.skinTemperatureDeltaC >= 0.3) score += 1;
  if (input.sleepDebtHours >= 1.5) score += 1;
  if (input.symptomCount >= 2) score += 1;

  if (score >= 4) return "elevated";
  if (score >= 2) return "moderate";
  return "low";
}
```

This is illustrative prototype logic, not a clinically validated scoring model.

---

## Haptic-pattern representation

A pattern should be stored as explicit, auditable parameters rather than generated as unconstrained prose.

```ts
type HapticPattern = {
  id: string;
  label: string;
  pulsesMs: number[];
  repeatCount: number;
  totalDurationMs: number;
  intendedExperience: "settling" | "grounding" | "transition";
  intensity: "low" | "medium";
  evidenceIds: string[];
  contraindications: string[];
};
```

Example:

```ts
const settlePattern: HapticPattern = {
  id: "settle-01",
  label: "Slow settling rhythm",
  pulsesMs: [180, 900, 180, 1400],
  repeatCount: 6,
  totalDurationMs: 15960,
  intendedExperience: "settling",
  intensity: "low",
  evidenceIds: ["paper_azevedo_2017"],
  contraindications: []
};
```

The example timing is a prototype interaction pattern—not a validated therapeutic dose.

---

## Browser vibration versus wearable haptics

The web prototype may use the browser Vibration API:

```ts
navigator.vibrate([180, 900, 180, 1400]);
```

This is useful for demonstrating timing patterns, but it has major limitations:

- support varies by browser and operating system;
- the API may be unavailable or ignored;
- laptops generally do not provide a meaningful vibration output;
- browser APIs do not offer reliable control over actuator waveform or intensity;
- phone vibration is not equivalent to wrist-worn haptic delivery;
- Apple-device browser support may be limited;
- a user gesture and permission context may be required.

A serious wearable implementation would require native device APIs and hardware-specific testing.

---

## Suggested technical stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Framer Motion
- Local JSON demo data
- Server-side API routes
- Browser Vibration API for prototype preview
- Planned Tavily Search API
- Planned Nebius AI Studio embeddings and inference
- Planned vector store: PostgreSQL with `pgvector`, managed vector database, or local prototype index
- Future native wearable application or companion app

---

## Suggested repository structure

```text
remi/
├── app/
│   ├── api/
│   │   ├── evidence/route.ts
│   │   ├── protocol/route.ts
│   │   └── wearable/route.ts
│   ├── page.tsx
│   └── layout.tsx
├── components/
│   ├── moon-orb.tsx
│   ├── tonight-card.tsx
│   ├── evidence-card.tsx
│   ├── haptic-preview.tsx
│   └── protocol-view.tsx
├── data/
│   ├── demo-profile.json
│   ├── evidence-library.json
│   └── haptic-patterns.json
├── lib/
│   ├── adapters/
│   │   ├── tavily.ts
│   │   ├── nebius.ts
│   │   └── wearable.ts
│   ├── haptics/
│   │   ├── patterns.ts
│   │   └── vibrate.ts
│   ├── risk/
│   │   ├── normalize.ts
│   │   └── score.ts
│   ├── retrieval/
│   │   ├── embeddings.ts
│   │   └── similarity.ts
│   └── safety/
│       ├── constraints.ts
│       └── validate-output.ts
├── public/
├── .env.example
├── README.md
└── package.json
```

This structure is a recommended target architecture and may not exactly match the current repository.

---

## Local setup

```bash
git clone <your-repository-url>
cd remi
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Environment configuration

Create a local `.env.local` file:

```bash
TAVILY_API_KEY=
NEBIUS_API_KEY=
```

At the current prototype stage, these values may remain empty because the integrations are not yet active.

Never commit `.env.local` or real API keys.

Suggested `.gitignore` entries:

```gitignore
.env
.env.local
.env.*.local
```

---

## Proposed integration roadmap

### Phase 1 — Current prototype

- [x] Product narrative and interface
- [x] Synthetic cycle and wearable data
- [x] Prototype risk calculation
- [x] Haptic-pattern preview
- [x] Evidence-card UI
- [ ] Confirm browser/device compatibility

### Phase 2 — Tavily integration

- [ ] Create server-side Tavily adapter
- [ ] Add trusted-domain allowlist
- [ ] Normalize search results
- [ ] Extract DOI, authors, year, and publication
- [ ] Add evidence-review state
- [ ] Cache approved results
- [ ] Prevent raw search output from directly driving recommendations

### Phase 3 — Nebius integration

- [ ] Create Nebius embedding adapter
- [ ] Embed approved evidence library
- [ ] Embed haptic-protocol library
- [ ] Add a vector store
- [ ] Implement cosine-similarity retrieval
- [ ] Add structured model output
- [ ] Add claim and citation validation
- [ ] Log model, prompt version, evidence IDs, and output

### Phase 4 — Wearable integration

- [ ] Select target wearable platform
- [ ] Build native haptic controller
- [ ] Validate timing accuracy and actuator behavior
- [ ] Add intensity limits and emergency stop
- [ ] Test comfort, habituation, and sensory sensitivity
- [ ] Collect explicit user feedback

### Phase 5 — Research validation

- [ ] Feasibility study
- [ ] Compare active pattern with sham or inactive condition
- [ ] Pre-register endpoints
- [ ] Measure subjective calmness and sleep-related outcomes
- [ ] Include objective autonomic measures where appropriate
- [ ] Assess cycle phase, contraception, age, and perimenopause
- [ ] Evaluate bias, accessibility, and skin-tone-related sensor limitations

---

# Scientific foundation

REMi sits at the intersection of four research areas:

1. menstrual-cycle physiology and thermoregulation;
2. wearable sensing;
3. sleep and autonomic regulation;
4. rhythmic tactile or interoceptive stimulation.

The studies below support parts of the product rationale. None of them, individually or collectively, validate REMi as a clinical intervention.

---

## Key research papers

### Menstrual-cycle physiology, sleep, and wearable signals

**Alzueta, E., de Zambotti, M., Javitz, H., Dulai, T., Albinni, B., Simon, K. C., Sattari, N., Zhang, J., Shuster, A., Mednick, S. C., & Baker, F. C. (2022).**  
Tracking sleep, temperature, heart rate, and daily symptoms across the menstrual cycle with the Oura Ring in healthy women. *International Journal of Women’s Health, 14*, 491–503.  
https://doi.org/10.2147/IJWH.S341917

**Why it matters to REMi:** The study demonstrates that a consumer wearable can capture cycle-associated changes in distal skin temperature and heart rate, while also showing why REMi must not assume that sleep outcomes change identically for every user.

---

**Gombert-Labedens, M., Alzueta, E., Perez-Amparan, E., Yuksel, D., Kiss, O., de Zambotti, M., Simon, K., Zhang, J., Shuster, A., Morehouse, A., Pena, A. A., Mednick, S., & Baker, F. C. (2024).**  
Using wearable skin temperature data to advance tracking and characterization of the menstrual cycle in a real-world setting. *Journal of Biological Rhythms, 39*(4).  
https://doi.org/10.1177/07487304241247893

**Why it matters to REMi:** It supports the use of longitudinal wearable temperature patterns rather than relying only on a calendar-based cycle label.

---

**Shechter, A., Varin, F., & Boivin, D. B. (2010).**  
Circadian variation of sleep during the follicular and luteal phases of the menstrual cycle. *Sleep, 33*(5), 647–656.  
https://doi.org/10.1093/sleep/33.5.647

**Why it matters to REMi:** It illustrates the interaction between menstrual phase, circadian processes, core body temperature, and aspects of sleep. It also reinforces that observed effects may be modest and outcome-specific.

---

**Baker, F. C., & Lee, K. A. (2018).**  
Menstrual cycle effects on sleep. *Sleep Medicine Clinics, 13*(3), 283–294.  
https://doi.org/10.1016/j.jsmc.2018.04.002

**Why it matters to REMi:** This review describes the complexity and individual variability of menstrual-cycle effects on sleep and cautions against simplistic phase-based assumptions.

---

### Haptics, interoception, and autonomic arousal

**Azevedo, R. T., Bennett, N., Bilicki, A., Hooper, J., Markopoulou, F., & Tsakiris, M. (2017).**  
The calming effect of a new wearable device during the anticipation of public speech. *Scientific Reports, 7*, 2285.  
https://doi.org/10.1038/s41598-017-02274-2

**Why it matters to REMi:** The study tested heartbeat-like tactile stimulation on the wrist and reported a calming effect during an anticipatory stress task. It is relevant proof of concept for rhythmic wrist stimulation, but it was not a menstrual-health or sleep study.

---

**Di Lernia, D., Cipresso, P., Pedroli, E., & Riva, G. (2018).**  
Toward an embodied medicine: A portable device with programmable interoceptive stimulation for heart rate variability enhancement. *Sensors, 18*(8), 2469.  
https://doi.org/10.3390/s18082469

**Why it matters to REMi:** The study explored programmable tactile interoceptive stimulation and reported changes in HRV-related measures. The device, stimulation mechanics, location, and small sample differ materially from a standard smartwatch vibration motor.

---

**Barralon, P., Dumont, G., Schwarz, S. K. W., & Ansermino, J. M. (2008).**  
Autonomic nervous system response to vibrating and electrical stimuli on the forearm and wrist. In *Proceedings of the 30th Annual International Conference of the IEEE Engineering in Medicine and Biology Society* (pp. 931–934).  
https://doi.org/10.1109/IEMBS.2008.4649307

**Why it matters to REMi:** It directly investigated autonomic responses to tactile stimulation at the forearm and wrist, while also highlighting that stimulation type and body location matter.

---

## Research interpretation

The evidence supports the plausibility of three separate ideas:

1. wearables can detect meaningful longitudinal physiological variation across the menstrual cycle;
2. tactile rhythms can affect attention, subjective state, or autonomic measures under some experimental conditions;
3. a wearable can deliver tactile stimulation discreetly and repeatedly.

The evidence does **not** yet prove that:

- REMi improves sleep;
- REMi treats PMS, PMDD, insomnia, anxiety, or dysmenorrhea;
- a smartwatch vibration directly stimulates the vagus nerve;
- one haptic pattern is appropriate across users or cycle phases;
- changes in HRV are always equivalent to beneficial parasympathetic activation;
- cycle phase alone should determine an intervention.

That gap is the research opportunity—not a footnote to hide.

---

## Intended use

REMi is intended as:

- an educational and research prototype;
- a demonstration of cycle-aware adaptive computing;
- a haptic interaction concept;
- a platform for studying low-effort wearable interventions;
- a hackathon MVP showing an insight-to-action workflow.

REMi is not intended for:

- diagnosis;
- fertility determination;
- contraception;
- pregnancy monitoring;
- treatment of a medical or psychiatric condition;
- emergency detection;
- replacement of professional care;
- direct vagus-nerve stimulation.

---

## Safety and privacy principles

A production-quality version should include:

- explicit opt-in consent;
- manual stop and disable controls;
- intensity and duration ceilings;
- no overnight continuous vibration by default;
- sensory-sensitivity settings;
- pregnancy and medical-device disclaimers;
- auditable evidence and model versions;
- data minimization;
- encryption in transit and at rest;
- deletion and export controls;
- no sale of reproductive-health data;
- no model training on identifiable user data without explicit consent;
- clear separation between wellness support and medical claims.

---

## Evaluation plan

A future REMi study should avoid measuring success only through app engagement.

Potential endpoints include:

### Feasibility

- completion rate;
- device adherence;
- comfort;
- pattern detectability;
- battery impact;
- adverse or irritating sensations.

### Subjective outcomes

- perceived calmness;
- ease of settling;
- perceived helpfulness;
- sensory burden;
- sleep-related rumination;
- user trust.

### Physiological outcomes

- heart rate;
- ECG-derived HRV where feasible;
- skin conductance;
- skin temperature;
- sleep onset measured with validated methods;
- awakenings and sleep continuity.

### Study-design considerations

- within-person crossover design;
- active versus sham condition;
- cycle phase confirmation;
- individual baseline normalization;
- preregistered primary outcome;
- adequate sample size;
- reporting of null and adverse findings;
- analysis by hormonal contraception, age, regularity, and symptom profile.

---

## Contributing

Contributions are welcome in:

- haptic pattern design;
- women’s sleep research;
- signal processing;
- wearable integration;
- evidence retrieval;
- model evaluation;
- privacy engineering;
- accessibility;
- human-computer interaction.

Please avoid submitting medical claims that are not supported by evidence.

---

## License

Add the project’s selected license here.

Example:

```text
MIT License
```

---

## Acknowledgments

REMi is built around a simple premise:

> **When a wearable detects that the body’s context has changed, the next step should not always be another screen.**

The current prototype explores how women’s wearable data could move beyond passive tracking and become a careful, personalized, and testable action layer.

---

## Final disclaimer

REMi is an experimental wellness and research concept. The haptic mechanisms, cycle-aware logic, Tavily evidence workflow, Nebius retrieval pipeline, and wearable integrations require further engineering and validation. Nothing in this repository should be interpreted as medical advice or evidence of clinical effectiveness.
