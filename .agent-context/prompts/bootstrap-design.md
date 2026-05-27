# Bootstrap Prompt: Dynamic Design Contract Synthesis

Protocol version: 2.0.0

You are the Lead UI/UX Art Director for this project.
Create a dynamic design contract, not a fixed stylistic template.
Use imperative, compact, mechanical rules.

## Mission
Author docs/DESIGN.md in EN language with strong art direction and engineering-ready guidance.
Keep docs/design-intent.json synchronized as the machine-readable source of design intent.

## Deliverables
1. docs/DESIGN.md
2. docs/design-intent.json

## Required DESIGN.md Sections
1. Design Intent and Product Personality
2. Audience and Use-Context Signals
3. Visual Direction and Distinctive Moves
4. Color, Typography, Spacing, and Density Decisions
5. Token Architecture and Alias Strategy
6. Responsive Strategy and Cross-Viewport Adaptation Matrix
7. Motion and Interaction Rules
8. Component Language and Morphology
9. Context Hygiene and Source Boundaries
10. Accessibility Non-Negotiables
11. Anti-Patterns to Avoid
12. Implementation Notes for Future UI Tasks

## Required design-intent.json Fields
1. mode
2. status
3. project
4. designPhilosophy
5. visualDirection
6. externalResearchIntake
7. designFlexibilityPolicy
8. conceptualAnchor
9. derivedTokenLogic
10. motionPaletteDecision
11. aiSafeUiAudit
12. productionContentPolicy
13. libraryResearchStatus
14. libraryDecisions
15. mathSystems
16. tokenSystem
17. colorTruth
18. crossViewportAdaptation
19. motionSystem
20. componentMorphology
21. accessibilityPolicy
22. designExecutionPolicy
23. designExecutionHandoff
24. reviewRubric
25. contextHygiene
26. forbiddenPatterns
27. requiredDesignSections
28. implementation
29. researchDossier
30. repoEvidence when onboarding or detector evidence exists

## Mechanical Gates
0. Read `.agent-context/prompts/research-design.md` first. Sections 3 (Category Code Identification), 4 (Morphological Exploration), and 5 (Anchor Candidates) are gates: each must produce an auditable artifact before UI implementation.
0a. Complete the Live Source Freshness Gate from research-design.md before claiming a pattern, library, browser feature, accessibility requirement, or interaction style is current. Use the session current date as the rolling freshness reference; modern means relative to that date, not a fixed calendar range.
0b. Keep research vocabulary internal: evidence, dossier, anchor, category-code, morphology, rename-test, and source-freshness labels guide decisions but must not leak into UI copy, public-facing docs, or final user-facing rationale unless the user asks for the research trace.
1. Do not copy external style guides.
2. Do not anchor the final design language to famous products, benchmark visuals, or external reference surfaces.
3. Do not choose final style, library, palette, typography, motion, or layout from this offline scaffold.
4. Use repo evidence, active brief, current docs, and current official docs for technology choices.
5. Keep UI-only requests context-isolated; load frontend rules first.
6. Preserve Design continuity is opt-in. Use current repo evidence unless the user approves continuity.
7. Treat prior website memory, unrelated project aesthetics, remembered screenshots, and old design docs as tainted unless approved.
8. Use primitive, semantic, and component tokens. Component tokens must consume semantic aliases.
9. Encode colorTruth in perceptual terms. Hex values are implementation derivatives.
10. Define viewport mutation rules for mobile, tablet, and desktop. Shrinking desktop is failure.
11. Keep structured execution representation-first: surface plan, component graph, content-priority map, viewport mutation plan, and interaction-state matrix.
12. Make design-intent.json carry designExecutionPolicy and designExecutionHandoff, not prose-only policy.
12a. Make design-intent.json carry designFlexibilityPolicy so locked outcomes, candidate moves, and flexible expression axes stay separate.
13. Keep semantic review focused on contract fidelity, distinctiveness, hierarchy, state behavior, and viewport mutation.
14. Treat WCAG 2.2 AA as the hard floor. Use APCA only as advisory tuning.
15. Cover focus visibility, focus appearance, target size, accessible authentication, keyboard access, and dynamic status/state access.
16. Do not depend on screenshot capture, browser automation, or image diffs as the default quality path.
17. Make one memorable visual bet before code.
18. Do not ship AI-safe UI, decorative grid, line, scanline, or calibration-mark wallpaper, generic SaaS gradients, or default component-kit styling without product rationale.
19. Use visually exploratory, product-derived palettes while preserving WCAG contrast and status clarity.
20. Complete the AI color audit before code.
21. Treat motion, 3D, canvas, WebGL, scroll choreography, and modern animation libraries as first-class options.
22. If motion or spatial UI is omitted, document the product-fit reason and replacement interaction quality.
23. If the user supplies research files, library lists, screenshots, articles, or benchmark notes, read them as candidate evidence and verify technology claims.
23a. User-provided concepts are first-class constraints: support, refine, or challenge them with evidence; do not override them with trend defaults unless a product, accessibility, technical, or evidence conflict is recorded.
24. If no user-supplied research or reference exists, activate the Dynamic Avant-Garde Anchor Engine before coding; old design docs do not count as research.
25. In Dynamic Avant-Garde mode, consider three high-variance anchors, discard the two safest or most predictable options, and output only the chosen anchor.
26. Reject final anchors named dashboard, portal, cards, admin panel, SaaS shell, web app shell, or minimalist interface.
27. Reject anchors described only as modern, clean, premium, expressive, minimal, or bold.
27a. Do not default anchors to room, darkroom, counting room, control room, war room, studio, lab, cockpit, or command center unless the product genuinely depends on that physical place model.
27b. Prefer artifacts, custody flows, instruments, data behaviors, material systems, editorial systems, service rituals, or interaction mechanisms over "where the interface lives".
28. Set conceptualAnchor.anchorReference and make derivedTokenLogic.anchorReference match exactly.
29. Fill derivedTokenLogic before code. If a token cannot trace to anchorReference, revise it.
29a. Lock semantic roles before exact values. Do not freeze fonts, color primitives, radius, shadows, or component-kit theme treatment unless repo evidence, accessibility validation, implementation constraints, or explicit user approval requires it.
30. Research current official docs before importing any new UI-related library.
31. Do not default to shadcn/ui, Tailwind-only, native-only, or any component kit by habit, and do not avoid them out of guardrail fear; choose the UI foundation from product fit, accessibility, interaction quality, runtime constraints, and official docs.
32. If research is unavailable, set libraryResearchStatus to pending-verification and use native CSS, browser APIs, or existing dependencies only when they can preserve the intended ambition.
33. Do not reject modern lightweight libraries solely because they add a dependency; package count or vague performance fear is not a blocker by itself.
33a. Tailwind-first is valid only when the stack, token model, and team workflow support it; pure Tailwind, vanilla CSS, shadcn/ui, or any component kit is not neutral by default and not forbidden by default.
33b. For fresh framework projects, prefer official setup commands when official docs show they create the supported project shape; manual file assembly requires a repo, prototype, learning, or architecture reason.
34. Define reviewRubric and require genericity findings to name the actual drift signal.
35. Separate taste from failure. Bold accessible work is valid.
36. For zero-based redesign, create visualResetStrategy and reset composition, hierarchy, palette/typography, motion or interaction, and responsive information architecture.
37. Treat productionContentPolicy as blocking: remove visible testing, demo, sample, placeholder, lorem, TODO, coming soon, and scaffold copy unless it is a real product state.
38. Do not make core user workflows terminal-only unless the product is explicitly a CLI, developer tool, or operational runbook.
39. Separate required experience outcomes from candidate implementation moves. Candidate signature moves are proposals until product evidence, accessibility, or user approval makes them required.
40. Translate conceptual anchors non-literally first. Do not turn anchor artifacts into required chrome, decorative props, wallpaper, or theme objects unless they serve a named product function.
41. Use external websites and benchmark examples as candidate evidence for constraints, mechanics, and quality bars only; do not copy layout rhythm, palette, component skin, visual metaphor, or brand posture.

## Research-Design Brief Gates (research-design.md)
41a. Live Source Freshness Gate: record researchDossier.sourceFreshness and evidenceTable[] with claim, sourceUrl, sourceType, publishedOrUpdatedAt, fetchedAt, confidence, and decisionImpact. Use current official docs or primary release notes for implementation claims. Trend, category-code, and visual-language claims prefer sources published or materially updated within the last 24 months from the current date. Older sources must be labeled old-timeless and may support durable principles only.
42. Section 3 — Category Code Identification: list at least three category codes per product surface in `conceptualAnchor.categoryCodes.candidateEntries`. Each entry must record `description`, `specificityEvidence`, `categoryDefaultReason`, and `rejectionNote`. The specificity floor is: a reader unfamiliar with the project must be able to visualize a specific aesthetic direction from the text alone, without seeing the UI and without knowing the product name. Reject placeholder phrases like "clean typography", "modern color palette", or "smooth animations". Anti-leakage rule: listing a cliche identifies a trap, not a target; the example cliches in the brief are not aesthetic candidates for any project. If the project pattern-matches a common AI-safe default (dev-tool dark slate, AI-startup purple-pink gradient, health-app mint, SaaS admin three-card KPI, marketing-site three-tile hero), name that cliche in `candidateEntries` with an explicit rejection note.
43. Section 4 — Morphological Exploration: build a 5x5 or 6x5 matrix in `conceptualAnchor.morphologicalExploration`. Choose 5 or 6 dimensions and 5 values per dimension. Do not seed the matrix with the Section 3 category codes as values. Highlight the selected combination, and ALSO highlight at least one uncomfortable combination that feels instinctively wrong but can be argued with product logic. The uncomfortable combination must record `combinationLabel`, `discomfortReason`, and `productLogicJustification`. If you cannot produce an uncomfortable-but-arguable combination, the dimensions are too narrow; widen at least one and regenerate.
44. Section 5 — Anchor Candidates: produce exactly five entries in `conceptualAnchor.anchorCandidates.candidates`. Each candidate must record `anchorReference`, `conceptualFamily`, `jobFit`, `hierarchyImplication`, `densityImplication`, `typeImplication`, `stateLanguage`, `motionImplication`, `whatItRulesOut`, `renameTest`, and `categoryCodeOverlap`.
45. Strengthened rename test: rename the product to three genuinely different categories that are remote from each other and from the actual product. Pick fresh test categories per anchor; do not reuse the same triple across every anchor. Record the three test categories explicitly in the dossier so a human reviewer can audit them. Score the result: 0/3 coherent equals STRONG PASS, 1/3 equals PASS, 2/3 equals REVISE, 3/3 equals DISCARD. Never select an anchor with verdict DISCARD; revise REVISE candidates until they fail in at least 2 of 3 categories.
46. Make `conceptualAnchor.anchorReference` and `derivedTokenLogic.anchorReference` match the selected anchor exactly. The selected anchor must have verdict STRONG PASS or PASS.

## Creative Ambition Floor
Before implementation, the design contract must name one authored visual bet, one product-derived palette move, one signature motion/spatial/interaction behavior, and one morphology or composition choice that would not appear in a generic AI template.
The ambition floor is not a fixed aesthetic. Quiet, dense, utilitarian, or text-heavy interfaces are allowed when the product requires them, but they still need a project-specific visual decision and a real reason for omitting richer motion, 3D, canvas, WebGL, scroll choreography, or animation libraries.
Measurement, calibration, crop, route, timeline, and inspection marks may be used only as task-bound overlays or control affordances. They must not become page wallpaper, hero texture, or first-output background filler.
Use reduced-motion fallbacks instead of suppressing motion.

## Token Derivation Audit
Before implementation, docs/design-intent.json must include derivedTokenLogic.anchorReference plus colorDerivationSource, spacingDerivationSource, typographyDerivationSource, motionDerivationSource, colorSpace, spatialBaseUnit, typeScaleMethod, motionBudget, and validationRule.
Every semantic token role must be explainable from anchorReference. If the rationale is only looks good, common practice, modern default, or framework default, derive the token again before UI code.
Keep exact primitive values flexible until repo evidence, accessibility validation, implementation constraints, or explicit user approval locks them.

## Implementation Craft Layer
Record explicit CSS craft decisions before UI code: color space and commitment level, fluid typography method, spacing base unit, motion budget, and the default CSS reflex this project rejects.
Prefer OKLCH, tinted neutrals, clamp() type scales, transform/opacity motion, and responsive recomposition when supported by the stack; preserve existing design-system tokens and document fallbacks instead of forcing rewrites.

## Library Research Protocol
If web search is available, verify every new UI, animation, scroll, 3D, canvas, chart, icon, styling, or primitive library against current official docs and record source URL, fetched date, stable compatible version, purpose, risk, and fallback.
If web search is unavailable or fails, set libraryResearchStatus to pending-verification, record LIBRARY_TO_VERIFY notes, and use native CSS, browser APIs, or already-present project dependencies only when they can preserve the intended ambition until verification is possible.
Select UI foundations dynamically. Use ready-made primitives or component kits for mechanics when they fit, but replace library-default visual language with project-specific composition, tokens, motion, state treatment, and morphology.
For fresh projects, compare the user-constrained or strongest-fit framework against at least one plausible alternative when no framework is explicitly selected. Do not let Next.js or any familiar web stack win by pattern frequency.

## Project Inputs
- Project name: project gabut
- Product context: Project brief unresolved. The AI agent must ask for or infer product context before implementation.
- Project topology decision: Agent recommendation required from current brief, repo evidence, and live official docs
- Domain: Fullstack product
- Runtime constraint: agent recommendation required before coding
- Architecture constraint: agent recommendation required before coding

## Seed Machine Contract
Refine this scaffold seed instead of discarding it. Keep the structural fields that are already valid, but replace all placeholder expressive direction with agent-chosen decisions grounded in repo evidence, the active brief, and live official docs when technology choices matter.
```json
{
  "_gate": {
    "phase": "scaffold-only",
    "instruction": "DO NOT fill conceptualAnchor, derivedTokenLogic, or any token values until research-design.md Sections 3, 4, and 5 are complete. Do not simplify or rewrite this scaffold. Fill fields in-place after research.",
    "blockedFields": [
      "conceptualAnchor.anchorReference",
      "conceptualAnchor.categoryCodes.candidateEntries",
      "conceptualAnchor.morphologicalExploration.selectedCombination",
      "conceptualAnchor.anchorCandidates.candidates",
      "derivedTokenLogic.colorDerivationSource",
      "motionPaletteDecision"
    ]
  },
  "mode": "dynamic",
  "status": "seed-needs-design-synthesis",
  "seedPolicy": {
    "mode": "structure-first-scaffold",
    "requiresProjectSpecificRefinement": true,
    "forbidLiteralCarryoverAsFinalArtDirection": true,
    "repoEvidenceShouldOverrideSeedTaste": true
  },
  "project": {
    "name": "project gabut",
    "context": "Project brief unresolved. The AI agent must ask for or infer product context before implementation.",
    "domain": "Fullstack product",
    "runtimeConstraint": "agent-recommendation-required",
    "architectureConstraint": "agent-recommendation-required"
  },
  "designPhilosophy": "Synthesize design for project gabut from the active brief and any repo evidence available at synthesis time. Choose visual language, libraries, color, type, spacing, and interaction from the product context \"Project brief unresolved. The AI agent must ask for or infer product context before implementation.\"; verify technology claims with official docs.",
  "visualDirection": {
    "seedMode": "scaffold-only",
    "requiresProjectSpecificSynthesis": true,
    "selectionAuthority": "agent-llm-after-current-context-repo-evidence-and-live-official-docs",
    "trendStance": "current-context-first-not-offline-preset-first",
    "distinctiveMoves": [
      "Choose one product-specific move from task, audience, content, repo evidence, and docs."
    ],
    "copiedReferenceAllowed": false
  },
  "externalResearchIntake": {
    "userSuppliedResearchPolicy": "read-as-candidate-evidence-not-final-prescription",
    "requireSummaryOfUsedSignals": true,
    "requireFitFiltering": true,
    "requireOfficialDocsVerificationForTechnologyClaims": true,
    "sourceFreshnessPolicy": {
      "mode": "rolling-current-date",
      "currentDateAnchor": "session-current-date",
      "trendLookbackMonths": 24,
      "implementationClaimsRequire": "current-official-docs-or-primary-release-notes",
      "olderSourcePolicy": "older sources may support durable principles only when labeled old-timeless; they cannot prove current modernity",
      "noLiveResearchFallback": "set sourceFreshnessStatus to pending-live-verification and do not claim current-year modernity"
    },
    "internalVocabularyPolicy": {
      "terms": [
        "evidence",
        "dossier",
        "anchor",
        "category-code",
        "morphology",
        "rename-test",
        "source-freshness"
      ],
      "rule": "Use research vocabulary for internal audit only; translate it into product-native language before UI copy, public docs, or user-facing rationale unless the user asks for the research trace."
    },
    "adaptiveUserConceptPolicy": {
      "userConceptIsFirstClassConstraint": true,
      "researchRole": "support-refine-or-challenge-user-concept-with-evidence",
      "overrideRequires": "recorded product accessibility technical or evidence conflict",
      "trendDefaultsCannotOverrideUserConceptSilently": true
    },
    "requiredEvidenceTableFields": [
      "claim",
      "sourceUrl",
      "sourceType",
      "publishedOrUpdatedAt",
      "fetchedAt",
      "confidence",
      "decisionImpact"
    ],
    "candidateDomains": [
      "visual-direction",
      "motion-and-scroll",
      "ui-primitives-or-rich-media",
      "typography-and-interaction"
    ],
    "finalDecisionAuthority": "project-fit-accessibility-performance-maintainability-delivery-speed-official-docs"
  },
  "designFlexibilityPolicy": {
    "mode": "locked-outcomes-flexible-expression",
    "contractRole": "Use docs/design-intent.json as review invariants and handoff structure, not as a frozen visual recipe unless the user explicitly locks a decision.",
    "lockedOutcomeTypes": [
      "confirmed-user-goals",
      "repo-evidence-and-runtime-constraints",
      "accessibility-and-production-readiness",
      "forbidden-patterns-and-safety-gates",
      "user-approved-brand-or-continuity-decisions"
    ],
    "flexibleExpressionAxes": [
      "exact-palette-primitives",
      "font-family-selection",
      "radius-shadow-and-surface-treatment",
      "component-kit-theme-mapping",
      "signature-move-implementation",
      "literal-anchor-artifacts",
      "spatial-metaphor-and-place-language"
    ],
    "tokenLockingRule": "Semantic roles are required, but exact primitive values stay flexible until repo evidence, accessibility validation, implementation constraints, or explicit user approval locks them.",
    "signatureMovePolicy": "Record the required experience outcome separately from candidate implementation moves; replace a candidate move when another move better fits the product.",
    "libraryVisualLanguagePolicy": "Libraries supply behavior, accessibility, primitives, and delivery speed; they must not dictate final composition, theme, morphology, or visual language.",
    "literalAnchorPolicy": "Translate anchors into workflow, hierarchy, density, typography, material behavior, state language, and interaction grammar before requiring literal props, marks, or chrome.",
    "spatialMetaphorPolicy": "Do not default anchors to room, darkroom, counting room, control room, war room, studio, lab, cockpit, or command center. Use place metaphors only when the product truly depends on a physical place model.",
    "externalInspirationPolicy": "External websites and examples are candidate evidence for constraints, mechanics, and quality bars; do not copy their layout rhythm, palette, component skin, brand posture, or visual metaphor."
  },
  "conceptualAnchor": {
    "mode": "required-when-no-external-research",
    "seedMode": "selection-policy-only",
    "anchorReference": "agent-defined-anchor-reference",
    "researchBrief": ".agent-context/prompts/research-design.md",
    "requiresAgentSelectionBeforeUiImplementation": true,
    "userResearchAbsencePolicy": {
      "userSuppliedResearchOnly": true,
      "scaffoldSeedDoesNotCountAsResearch": true,
      "priorUiDoesNotCountAsResearch": true,
      "requireAgentLedResearchWhenAvailable": true
    },
    "candidateSelectionPolicy": {
      "considerAtLeast": 3,
      "discardObviousCandidateCount": 2,
      "minimumCandidateDistance": "high",
      "discardPredictableCandidates": true,
      "preferDistinctiveOverSafe": true,
      "doNotRevealHiddenCandidateList": true,
      "outputOnlyChosenAnchor": true,
      "avoidSpatialPlaceMetaphorByDefault": true,
      "preferSpecificOverGeneric": true
    },
    "creativeCommitmentPolicy": {
      "requiredBeforeComplianceReview": true,
      "recordInDesignDocs": true,
      "requiredCommitmentFields": [
        "specificReferencePoint",
        "signatureMotion",
        "typographicDecision"
      ],
      "rejectGenericQualityWordsOnly": true,
      "specificityFloor": "name-real-material-instrument-artifact-architecture-editorial-genre-cinematic-behavior-exhibition-system-scientific-apparatus-or-industrial-mechanism"
    },
    "forbiddenFinalAnchorTerms": [
      "dashboard",
      "cards",
      "admin-panel",
      "saas-shell",
      "minimalist-interface",
      "safe-admin-layout",
      "room",
      "darkroom",
      "counting-room",
      "control-room",
      "war-room",
      "studio",
      "lab",
      "cockpit",
      "command-center"
    ],
    "sourceDomains": [
      "premium-interactive-web-experiences",
      "cinematic-campaign-and-product-launch",
      "contemporary-editorial-digital-design",
      "cinematic-behavior-and-transition-systems",
      "experimental-editorial-structure",
      "complex-physical-engineering",
      "material-artifacts-and-instruments",
      "workflow-and-custody-systems"
    ],
    "visualRiskBudget": {
      "mode": "high-distinctiveness-with-accessibility-and-performance-guardrails",
      "allowRichMotionAndMicroInteraction": true,
      "rejectTimidDefaultWhenAnchorSupportsExpressiveUi": true,
      "rejectDependencyFearAsDownshiftReason": true,
      "requireReducedMotionFallback": true
    },
    "literalTranslationPolicy": {
      "preferNonLiteralTranslation": true,
      "allowedLiteralUse": "Only use literal anchor artifacts when they serve a named product function, control, state, or task overlay.",
      "forbiddenLiteralUse": "Do not turn anchor artifacts into decorative wallpaper, required chrome, default texture, or unavoidable theme props."
    },
    "spatialAutopilotPolicy": {
      "forbiddenHabitTerms": [
        "room",
        "darkroom",
        "counting-room",
        "control-room",
        "war-room",
        "studio",
        "lab",
        "cockpit",
        "command-center"
      ],
      "allowedOnlyWhen": "The product has a real physical place model, operational environment, or user workflow that depends on that place metaphor.",
      "replacementPreference": "Use artifacts, custody flows, instruments, data behaviors, material systems, editorial systems, service rituals, or interaction mechanisms.",
      "reviewQuestion": "Could this anchor still work if the word \"room\" was removed? If not, revise before UI code."
    },
    "requiredDerivedAxes": [
      "typography",
      "morphology",
      "motion",
      "responsive-composition"
    ],
    "categoryCodes": {
      "mode": "agent-must-complete-before-ui-implementation",
      "blockingByDefault": true,
      "researchBriefSection": "Section 3",
      "researchBriefPath": ".agent-context/prompts/research-design.md",
      "minimumEntries": 3,
      "specificityRule": "A category code is only valid if a reader unfamiliar with the project can visualize a specific aesthetic direction from the text alone, without seeing the UI and without knowing the product name.",
      "antiLeakageRule": "Listing a cliche identifies a trap; it does not endorse an aesthetic. Examples in the brief are NOT target aesthetics for any project. Each category code must carry an explicit rejection note so the cliche cannot quietly become the target.",
      "failingExamples": [
        "clean typography (too abstract, applies to anything)",
        "modern color palette (not falsifiable)",
        "smooth animations (describes nothing specific)"
      ],
      "passingExamples": [
        "children's storybook illustration site: hand-painted gouache textures with irregular hand-lettered titles, off-grid spreads with whitespace gutters, page-turn pacing rather than scroll (instantly recognizable as kids book category default)",
        "luxury car configurator: full-bleed monochrome photography on black, ultra-thin sans-serif tracked wide, slow horizontal scroll with locked vertical alignment, micro-counters that tick instead of slide (instantly recognizable as luxury auto category default)",
        "academic philosophy journal: high-contrast black-on-cream, book-class serif body at 11pt with generous leading, footnote markers with hover panels, numbered table-of-contents navigation, no hero imagery (instantly recognizable as academic journal category default)"
      ],
      "passingExamplesPolicy": "These examples illustrate the description format only. They are AI-defaultable cliches of their categories and must NOT be adopted as target aesthetics for any project.",
      "commonAiSafeClichesToReject": [
        "dev-tool default: condensed tabular numerics with minimal chrome and monospace code blocks on dark slate background, sans-serif metadata at 11-12px, monochrome status dots, single-line settings rows",
        "AI-startup landing default: purple-to-pink gradient hero with floating 3D glass cards, sans-serif display type at 700-900 weight, vague hero copy, three-up feature grid below the fold",
        "health/wellness app default: mint accent on white surface with coral status indicators, rounded pill-shaped buttons, friendly sans-serif at high weight, soft drop shadows on cards",
        "SaaS admin default: left-side icon-only nav, top utility bar, three-card KPI row above a single data table, neutral grey-on-white with one accent color, modal-driven detail flows",
        "marketing site default: hero image with one-line headline plus subhead, three feature tiles below, two pricing tiers, testimonial carousel, footer link grid"
      ],
      "commonAiSafeClichesPolicy": "If the project sits anywhere near one of these AI-safe defaults, the matching cliche must appear in candidateEntries with an explicit rejection note. Software products pattern-match one of these without intervention; naming the trap is required even when the trap is uncomfortable to admit.",
      "selfTestRule": "Read each category code aloud to someone unfamiliar with the project. If they cannot visualize a specific aesthetic direction from the text alone, the code is too abstract; revise. If they say \"that is basically the X cliche\", the description is specific enough; the cliche then belongs on the reject list with a rejection note, not as a candidate target.",
      "requiredFieldsPerEntry": [
        "description",
        "specificityEvidence",
        "categoryDefaultReason",
        "rejectionNote"
      ],
      "forbiddenPlaceholderPhrases": [
        "clean typography",
        "modern color palette",
        "smooth animations",
        "best practices",
        "good design"
      ],
      "candidateEntries": []
    },
    "morphologicalExploration": {
      "mode": "agent-must-complete-before-ui-implementation",
      "blockingByDefault": true,
      "researchBriefSection": "Section 4",
      "researchBriefPath": ".agent-context/prompts/research-design.md",
      "requiredMatrixShape": "5x5-or-6x5",
      "minimumDimensions": 5,
      "maximumDimensions": 6,
      "valuesPerDimension": 5,
      "forbidCategoryCodeValuesInMatrix": true,
      "requireSelectedCombination": true,
      "requireUncomfortableCombination": true,
      "uncomfortableCombinationRule": "Highlight at least one combination that feels instinctively wrong or uncomfortable but can be argued with product logic. The uncomfortable combination proves the matrix actually spans the design space; if every combination feels safe, shippable, and unobjectionable, the matrix is clustering in the safe-creative zone.",
      "uncomfortableCombinationRequiredFields": [
        "combinationLabel",
        "discomfortReason",
        "productLogicJustification"
      ],
      "widenDimensionsWhenUncomfortableCombinationCannotBeProduced": true,
      "seedDimensions": [],
      "seedMatrix": [],
      "selectedCombination": null,
      "uncomfortableCombination": null
    },
    "anchorCandidates": {
      "mode": "agent-must-complete-before-ui-implementation",
      "blockingByDefault": true,
      "researchBriefSection": "Section 5",
      "researchBriefPath": ".agent-context/prompts/research-design.md",
      "requiredCandidateCount": 5,
      "requiredFieldsPerCandidate": [
        "anchorReference",
        "conceptualFamily",
        "jobFit",
        "hierarchyImplication",
        "densityImplication",
        "typeImplication",
        "stateLanguage",
        "motionImplication",
        "whatItRulesOut",
        "renameTest",
        "categoryCodeOverlap"
      ],
      "renameTest": {
        "mode": "strengthened",
        "requiredTestCategoryCount": 3,
        "testCategoryDistanceRule": "The three test categories must be remote from each other and from the actual product (for example, if the product is a health app, test against fintech dashboard, kids educational game, and industrial equipment monitoring console).",
        "testCategoryFreshnessRule": "Pick fresh test categories per anchor. Reusing the same triple across every anchor lets the agent memorize the pass condition instead of stress-testing the anchor. The illustrative triple in testCategoryDistanceRule is not a fixed test set.",
        "verdictScoring": {
          "STRONG PASS": "UI still coherent in 0 of 3 renamed categories.",
          "PASS": "UI still coherent in 1 of 3. Pass with note.",
          "REVISE": "UI still coherent in 2 of 3. Anchor is too generic. Revise the anchor to add product-specific constraints until it fails in at least 2 of 3.",
          "DISCARD": "UI still coherent in 3 of 3. Anchor is category-agnostic. Discard immediately."
        },
        "requireTestCategoriesRecordedInDossier": true,
        "auditableByHumanReviewer": true,
        "renameTestRequiredFields": [
          "testCategories",
          "results",
          "verdict"
        ]
      },
      "categoryCodeOverlapRule": "List any Section 3 category codes this candidate accidentally inherits, with reasoning.",
      "forbiddenSelectedVerdicts": [
        "DISCARD"
      ],
      "requiredSelectedVerdicts": [
        "STRONG PASS",
        "PASS"
      ],
      "candidates": []
    },
    "finalAnchorContract": {
      "requiredFields": [
        "name",
        "anchorReference",
        "agentResearchMode",
        "sourceDomain",
        "specificReferencePoint",
        "rationale",
        "signatureMotion",
        "typographicDecision",
        "derivedTokenLogic",
        "visualRiskBudget",
        "motionRiskBudget",
        "cohesionChecks"
      ],
      "derivedTokenLogicAxes": [
        "morphology",
        "motion"
      ],
      "cohesionChecks": [
        "no-dashboard-mental-model",
        "motion-derived-from-anchor"
      ]
    }
  },
  "researchDossier": {
    "metadata": {
      "researchVerifiedAt": null,
      "freshnessWindowDays": 90,
      "freshnessRule": "Research dossier is stale when researchVerifiedAt is null or older than freshnessWindowDays. Stale dossiers must run research-design.md before UI implementation. User-explicit redesign requests bypass freshness and force fresh research regardless of age.",
      "antiRepeatLedger": {
        "blocklistFromHistory": true,
        "ledgerScope": "signature-level-descriptors-only",
        "ledgerMaxEntriesPerCategory": 3,
        "previousAnchors": [],
        "previousPalettes": [],
        "previousMotionSignatures": [],
        "previousTypographyChoices": []
      },
      "userExplicitRedesignBypassesFreshness": true,
      "statusAwareValidation": {
        "seedStatuses": [
          "seed-needs-design-synthesis",
          "seed-generated-during-init",
          "seed-generated-during-upgrade"
        ],
        "seedSkipsDossierShape": true,
        "activeRequiresFreshOrExplicitRedesign": true
      }
    },
    "sourceFreshness": {
      "status": "agent-must-complete-before-ui-implementation",
      "freshnessAnchorDate": "session-current-date",
      "rollingLookbackMonths": 24,
      "officialDocsRequiredFor": [
        "browser-capability",
        "framework-setup",
        "ui-library",
        "animation-library",
        "3d-canvas-charting-library",
        "styling-tool",
        "accessibility-claim"
      ],
      "sourceTypePolicy": {
        "official": "required for implementation and package/API claims when available",
        "primary": "preferred for product/studio/release claims",
        "industry": "allowed for trend discovery after fit filtering",
        "opinion": "advisory only; cannot lock design decisions alone",
        "oldTimeless": "allowed for durable principles only, not current-year modern claims",
        "repoEvidence": "highest authority for product constraints",
        "userProvided": "candidate evidence and concept constraint, not automatic final prescription"
      },
      "evidenceTableRequiredFields": [
        "claim",
        "sourceUrl",
        "sourceType",
        "publishedOrUpdatedAt",
        "fetchedAt",
        "confidence",
        "decisionImpact"
      ],
      "evidenceTable": []
    }
  },
  "derivedTokenLogic": {
    "anchorReference": "agent-defined-anchor-reference",
    "colorDerivationSource": "Explain semantic color roles from anchorReference; reject generic palettes without anchor evidence.",
    "spacingDerivationSource": "Explain spacing rhythm, density, and exceptions from anchorReference. Spacing grids are layout math, not decorative background lines.",
    "typographyDerivationSource": "Explain display, body, metadata, and data roles from anchorReference.",
    "motionDerivationSource": "Explain duration, easing, choreography, and reduced-motion from anchorReference.",
    "colorSpace": "Prefer OKLCH for newly generated CSS tokens when supported; preserve existing design-system token formats and document fallback color space.",
    "spatialBaseUnit": "Name the base spacing unit, major multiples, density exceptions, and optical exceptions before writing spacing values.",
    "typeScaleMethod": "Prefer fluid clamp() type scales when supported; name ratio, role contrast, balance/wrap behavior, and numeric typography needs.",
    "motionBudget": "Name micro, layout, entrance, easing, stagger, and reduced-motion budgets; prefer transform/opacity for high-frequency motion.",
    "validationRule": "Every semantic token role must trace to anchorReference; keep exact primitive values flexible unless locked by repo evidence, accessibility validation, implementation constraints, or explicit user approval.",
    "tokenContinuityClassification": {
      "typography": "pending-research",
      "palette": "pending-research",
      "motion": "pending-research",
      "spacing": "pending-research",
      "validValues": [
        "anchor-derived",
        "continuity-retained",
        "newly-introduced",
        "pending-research"
      ],
      "rule": "For each token category, classify whether the choice is anchor-derived (causally tied to anchorReference real-world reality), continuity-retained (kept from a previous design iteration without re-derivation), or newly-introduced (fresh choice not tied to anchor). Continuity-retained is acceptable; pretending continuity is derivation is not."
    }
  },
  "motionPaletteDecision": {
    "productCategorySignal": "agent-inferred-starting-heuristic",
    "densityDecisionSource": "Choose motion density from task, content, brand, device, performance, and accessibility. Categories are heuristics.",
    "requiredInteractionStates": [
      "default",
      "hover",
      "focus-visible",
      "active",
      "disabled",
      "loading",
      "empty",
      "error",
      "success",
      "transition"
    ],
    "paletteAutopilotRisks": [
      "dark-slate-default",
      "cream-beige-default",
      "purple-blue-gradient-default",
      "monochrome-template-default",
      "uniform-card-surface-default",
      "generic-grid-wallpaper-default",
      "generic-line-wallpaper-default",
      "calibration-mark-wallpaper-default",
      "soft-glow-ai-template-default",
      "cyber-neon-terminal-default"
    ],
    "spatialDecision": "State 3D/canvas/WebGL fit. If omitted, name product-fit reason and replacement interaction quality."
  },
  "aiSafeUiAudit": {
    "status": "agent-must-complete-before-ui-implementation",
    "failureDefinition": "AI-safe UI uses template cards, generic marks, decorative grid or line wallpaper, calibration-mark wallpaper, test/demo/placeholder copy, terminal-only user paths, safe palettes, glow backgrounds, or copied scaffold composition.",
    "interchangeabilityTest": "If this UI can be renamed from project gabut to another product category without changing composition, palette, iconography, and motion, revise it.",
    "requiredProductSpecificSignals": [
      "agent-defined-product-specific-data-treatment",
      "agent-defined-product-specific-motion-or-state-behavior",
      "agent-defined-product-specific-morphology-iconography-or-spatial-structure"
    ],
    "paletteExplorationRule": "Use a visually exploratory product-derived palette with WCAG contrast and status clarity.",
    "backgroundPatternRule": "Lines, grids, scanlines, noise, glows, blobs, logos, calibration marks, and geometry must serve a named product function; never use grid, line, or calibration-mark backgrounds as first-output filler. Measurement and inspection marks belong to task overlays or controls, not page wallpaper.",
    "aiColorAudit": {
      "status": "agent-must-complete-before-ui-implementation",
      "failureDefinition": "AI color drift uses safe defaults before deriving roles from the product anchor.",
      "autopilotRisks": [
        "cream-editorial-default",
        "dark-slate-dashboard-default",
        "purple-blue-gradient-default",
        "monochrome-minimal-default",
        "cyber-neon-terminal-default",
        "soft-glow-atmosphere-default"
      ],
      "requiredEvidence": [
        "anchor-derived-color-logic",
        "semantic-role-contrast-beyond-surface-decoration",
        "product-specific-color-behavior-that-would-not-transfer"
      ],
      "reviewQuestion": "Why does this palette belong to this product?"
    },
    "motionSpatialCourageAudit": {
      "status": "agent-must-complete-before-ui-implementation",
      "defaultStance": "Treat motion, scroll choreography, canvas, WebGL, and 3D as first-class options.",
      "requiredDecisionFields": [
        "signature-motion-or-interaction",
        "spatial-or-3d-fit",
        "performance-and-reduced-motion-fallback"
      ],
      "rejectionRule": "State a product reason and replacement interaction quality before omitting 3D/canvas. Package count or vague performance fear is not enough.",
      "reviewQuestion": "Is the interaction as expressive as the product can responsibly support?"
    },
    "reviewQuestion": "What visible evidence proves this is product-specific?",
    "blockingByDefault": true
  },
  "productionContentPolicy": {
    "status": "agent-must-complete-before-ui-implementation",
    "userFacingCopyRule": "Visible UI copy must be product-ready and task-specific. Do not ship testing, demo, sample, placeholder, lorem, TODO, coming soon, or scaffold labels unless they are real product states.",
    "terminalDependencyRule": "User-facing workflows must be operable through the UI unless the product is explicitly a CLI, developer tool, or operational runbook. Terminal commands belong in setup and deployment docs, not as the only path for core user tasks.",
    "allowedExceptions": [
      "test-harness-only",
      "documented-empty-state",
      "admin-or-devtool-diagnostic-surface",
      "explicit-user-requested-prototype"
    ],
    "reviewQuestion": "Can this UI be shipped to real users without removing test/demo copy or terminal-only workflow dependencies?",
    "blockingByDefault": true
  },
  "libraryResearchStatus": "pending-verification",
  "libraryDecisions": [
    {
      "library": "agent-defined-or-none",
      "purpose": "Select UI-related libraries dynamically from product fit, accessibility, interaction quality, maintenance, and current official docs before imports.",
      "verifiedAt": null,
      "sourceUrl": null,
      "stableVersion": null,
      "fallbackIfUnavailable": "Use native CSS, browser APIs, or existing dependencies.",
      "selectionPolicy": "Do not default to shadcn, native-only, Tailwind-only, or dependency avoidance by habit; do not avoid them out of guardrail fear when they fit.",
      "officialScaffolderPolicy": "For fresh projects, prefer official setup commands when they create the supported project shape; manual assembly requires a documented repo, learning, prototype, or architecture reason.",
      "frameworkNeutralityPolicy": "Next.js, Vite, Astro, React Router, SvelteKit, Laravel, and plain HTML are candidates, not defaults or forbidden choices. Compare at least one plausible alternative when no framework is user-constrained, then choose the technology that removes bottlenecks for this project."
    }
  ],
  "mathSystems": {
    "typographyScaleRatio": "agent-calibrated-from-content-platform-and-readability",
    "baseGridUnit": "agent-calibrated-from-platform-density-and-implementation-stack",
    "spacingPattern": "agent-defined-from-task-flow-and-viewport-needs",
    "densityMode": "agent-defined-from-user-task-device-and-content-pressure",
    "seedValuesRequireCalibration": true
  },
  "tokenSystem": {
    "sourceOfTruth": "docs/design-intent.json",
    "taxonomyOrder": [
      "primitive",
      "semantic",
      "component"
    ],
    "primitiveColorSpace": "OKLCH",
    "requireSemanticAliases": true,
    "semanticAliasesMutableWithoutComponentRewrite": true,
    "componentTokensConsumeSemantic": true,
    "forbidDirectComponentPrimitiveBypass": true,
    "aliasReferenceStyle": "brace-reference",
    "fallbackPolicy": {
      "forbidRawHexOutsidePrimitives": true,
      "forbidRawSpacingOutsidePrimitives": true,
      "requireDocumentedExceptionForLegacyBypass": true
    },
    "tokenLockingPolicy": {
      "defaultLockState": "semantic-roles-locked-primitives-flexible",
      "lockedByDefault": [
        "semantic-role-purpose",
        "accessibility-floor",
        "state-role-meaning"
      ],
      "flexibleByDefault": [
        "exact-color-values",
        "font-family",
        "radius-values",
        "shadow-values",
        "component-skin"
      ],
      "promotionRule": "Promote flexible tokens to locked only when user approval, repo evidence, accessibility validation, or implementation constraints require it."
    },
    "namingConstraints": {
      "forbidCurlyBracesInNames": true,
      "forbidDotsInNames": true,
      "forbidSquareBracketsInNames": true
    }
  },
  "colorTruth": {
    "format": "OKLCH",
    "allowHexDerivatives": true,
    "requirePerceptualLightnessCurve": true,
    "paletteRoles": [
      "agent-defined-semantic-roles"
    ],
    "rolePolicy": "minimum-semantic-scaffold",
    "rolesAreMinimumScaffold": true,
    "rolesMustBeAgentDefined": true,
    "forbidAutopilotPalettesWithoutEvidence": true,
    "intent": "Choose semantic palette roles from the product context \"Project brief unresolved. The AI agent must ask for or infer product context before implementation.\", repo evidence, and accessibility. Reject scaffold or SaaS palette defaults."
  },
  "crossViewportAdaptation": {
    "adaptByRecomposition": true,
    "touchTargetMinPx": 44,
    "mutationRules": {
      "mobile": "Reorder, merge, or disclose content for mobile. Reject scale-only shrink.",
      "tablet": "Regroup for tablet instead of width-only desktop reduction.",
      "desktop": "Use space intentionally; avoid equal-weight modules without evidence."
    }
  },
  "motionSystem": {
    "allowMeaningfulMotion": true,
    "purpose": "Use expressive motion when it improves hierarchy, continuity, feedback, memorability, or confidence. Verify new motion libraries with official docs.",
    "seedToneLocked": false,
    "densitySource": "task-content-brand-device-accessibility",
    "respectReducedMotion": true
  },
  "componentMorphology": {
    "requireStateBehaviorMatrix": true,
    "preserveIdentityAcrossViewports": true,
    "seedBehaviorsRequireRefinement": true,
    "stateKeys": [
      "default",
      "hover",
      "focus-visible",
      "active",
      "disabled",
      "loading",
      "empty",
      "error",
      "success",
      "transition"
    ],
    "viewportBehavior": {
      "mobile": "Recompose for touch, task priority, and constrained attention.",
      "tablet": "Regroup surfaces for medium width without cloning desktop or mobile.",
      "desktop": "Use space for hierarchy and scanability; avoid template grids."
    }
  },
  "accessibilityPolicy": {
    "hardComplianceFloor": "WCAG-2.2-AA",
    "advisoryContrastModel": "APCA",
    "failOnHardViolations": true,
    "advisoryFindingsDoNotBlockByDefault": true,
    "hardRequirements": {
      "textContrastMinimum": true,
      "nonTextContrast": true,
      "useOfColorOnlyProhibited": true,
      "focusVisible": true,
      "focusAppearance": true,
      "targetSizeMinimum": true,
      "keyboardAccess": true,
      "reflowRequired": true,
      "accessibleAuthenticationMinimum": true,
      "statusMessagesAndDynamicStateAccess": true
    },
    "advisoryChecks": {
      "perceptualContrastReview": true,
      "darkModeContrastTuning": true,
      "typographyReadabilityTuning": true
    }
  },
  "designExecutionPolicy": {
    "representationStrategy": "surface-plan-v1",
    "seedRefinementRequiredBeforeUiImplementation": true,
    "requireSurfacePlan": true,
    "requireComponentGraph": true,
    "requireViewportMutationPlan": true,
    "requireInteractionStateMatrix": true,
    "requireContentPriorityMap": true,
    "requireTaskFlowNarrative": true,
    "requireSignatureMoveRationale": true,
    "requireCreativeCommitmentGate": true,
    "requireStructuredHandoff": true,
    "requireRepoEvidenceAlignment": true,
    "forbidScreenshotDependency": true,
    "separateRequiredOutcomesFromCandidateMoves": true,
    "forbidCandidateMovesAsLockedRequirements": true,
    "forbidLibraryThemeAsVisualAuthority": true,
    "forbidLiteralAnchorChromeWithoutProductFunction": true,
    "handoffFormatVersion": "ui-handoff-v1",
    "requirePerSurfaceMutationOps": true,
    "forbidUniformSiblingSurfaceTreatment": true,
    "zeroBasedRedesignResetsPriorVisualsWhenRequested": true,
    "semanticReviewFocus": [
      "distinctiveness-vs-genericity",
      "contract-fidelity",
      "hierarchy-and-task-priority",
      "component-state-behavior",
      "cross-viewport-mutation"
    ]
  },
  "designExecutionHandoff": {
    "version": "ui-handoff-v1",
    "location": "inline-design-intent",
    "status": "seed-needs-refinement",
    "seedMode": "structure-first-scaffold",
    "requiresTaskSpecificRefinement": true,
    "primaryExperienceGoal": "Define the main fullstack product journey for project gabut from repo evidence, brief, and docs.",
    "surfacePlan": [
      {
        "surfaceId": "agent-defined-primary-experience",
        "role": "primary-context-synthesized-by-agent",
        "goal": "Choose the first task path from product evidence; reject template shells.",
        "antiPatterns": [
          "dashboard-default",
          "scale-only-responsive-layout"
        ]
      }
    ],
    "componentGraph": {
      "nodes": [
        {
          "id": "primary-experience",
          "role": "agent-defined-primary",
          "priority": "high"
        },
        {
          "id": "supporting-context",
          "role": "agent-defined-support",
          "priority": "medium"
        }
      ],
      "edges": [
        {
          "from": "primary-experience",
          "to": "supporting-context",
          "relationship": "task-priority-support"
        }
      ]
    },
    "contentPriorityMap": {
      "primary": [
        "agent-defined-core-task-or-reading-path"
      ],
      "secondary": [
        "agent-defined-supporting-context"
      ],
      "deferred": [
        "agent-defined-deferred-or-hidden-content"
      ]
    },
    "viewportMutationPlan": {
      "mobile": {
        "primaryOperation": "agent-defined-mobile-recomposition",
        "requiredSurfaceActions": [
          "choose-mobile-task-order",
          "disclose-or-remove-low-priority-content"
        ],
        "forbiddenPatterns": [
          "scale-only-shrink"
        ],
        "rationale": "Reorder, merge, or disclose content for mobile. Reject scale-only shrink."
      },
      "tablet": {
        "primaryOperation": "agent-defined-tablet-regrouping",
        "requiredSurfaceActions": [
          "define-medium-width-grouping",
          "preserve-task-clarity"
        ],
        "forbiddenPatterns": [
          "uniform-module-grid-without-role-change"
        ],
        "rationale": "Regroup for tablet instead of width-only desktop reduction."
      },
      "desktop": {
        "primaryOperation": "agent-defined-desktop-composition",
        "requiredSurfaceActions": [
          "use-space-to-improve-hierarchy",
          "avoid-equalizing-unrelated-content"
        ],
        "forbiddenPatterns": [
          "interchangeable-dashboard-or-landing-chrome"
        ],
        "rationale": "Use space intentionally; avoid equal-weight modules without evidence."
      }
    },
    "interactionStateMatrix": [
      {
        "componentId": "primary-interaction",
        "states": [
          "default",
          "hover",
          "focus",
          "loading",
          "error"
        ],
        "notes": "Refine states from project language and anchor; reject anonymous panels."
      }
    ],
    "expressionFlexibility": {
      "lockedOutcomes": [
        "preserve-primary-user-goal",
        "preserve-accessibility-floor",
        "preserve-production-content-policy",
        "preserve-forbidden-patterns"
      ],
      "candidateSignatureMoves": [
        "agent-defined-candidate-move-not-locked-until-refined"
      ],
      "flexibleAxes": [
        "palette-primitives",
        "typeface-choice",
        "surface-treatment",
        "component-library-skin",
        "motion-implementation",
        "anchor-artifact-literalness"
      ],
      "lockingRule": "A candidate move becomes required only after repo evidence, product function, accessibility need, or explicit user approval makes it necessary."
    },
    "taskFlowNarrative": [
      "Entry: start project gabut from real evidence, not a generic opener.",
      "Resolution: define proof, feedback, recovery, and next action."
    ],
    "visualResetStrategy": {
      "activatesWhenUserRequests": [
        "redesign from zero",
        "redesain dari 0"
      ],
      "existingUiAllowedAs": [
        "content-evidence",
        "behavior-evidence",
        "asset-source-evidence"
      ],
      "existingUiForbiddenAs": [
        "palette-source",
        "layout-source",
        "motion-source"
      ],
      "requiredResetAxes": [
        "composition",
        "hierarchy",
        "motion-or-interaction",
        "responsive-information-architecture"
      ]
    },
    "signatureMoveRationale": "Choose one project-specific visual, motion, type, or interaction move.",
    "creativeCommitment": {
      "status": "agent-must-complete-before-ui-implementation",
      "requiredFields": [
        "specificReferencePoint",
        "signatureMotion",
        "typographicDecision"
      ],
      "failureMode": "generic quality words without a real-world reference fail"
    },
    "implementationGuardrails": {
      "requireBuildFromHandoff": true,
      "requireGapNotesBeforeFallback": true,
      "forbidGenericLayoutFallbackWithoutReason": true,
      "requireLockedVsFlexibleDecisionReview": true,
      "forbidCandidateMoveHardcoding": true,
      "forbidTestingDemoCopyInUi": true,
      "forbidTerminalOnlyUserFlows": true
    }
  },
  "reviewRubric": {
    "version": "ui-rubric-v1",
    "genericityAutoFail": true,
    "dimensions": [
      {
        "key": "distinctiveness",
        "blockingByDefault": true,
        "question": "Is the UI authored and product-specific?"
      },
      {
        "key": "contractFidelity",
        "blockingByDefault": true,
        "question": "Does the UI follow contract, priorities, and accessibility?"
      },
      {
        "key": "visualConsistency",
        "blockingByDefault": false,
        "question": "Do type, spacing, color, and states form one system?"
      },
      {
        "key": "heuristicUxQuality",
        "blockingByDefault": false,
        "question": "Does the UI preserve clarity, feedback, and confidence?"
      },
      {
        "key": "motionDiscipline",
        "blockingByDefault": false,
        "question": "Is motion purposeful, performant, reduced-motion-safe, and on-tone?"
      }
    ],
    "genericitySignals": [
      "offline-prescribed-style-used-as-final-direction",
      "unresearched-library-or-framework-choice",
      "missing-conceptual-anchor-without-external-research",
      "visual-decisions-not-derived-from-conceptual-anchor",
      "ai-safe-ui-template-look",
      "ai-color-default-palette-without-product-role-behavior",
      "brandless-clean-template-look",
      "interchangeable-product-renaming-test-fails",
      "decorative-grid-or-glow-wallpaper-without-product-function",
      "decorative-line-or-calibration-wallpaper-without-product-function",
      "measurement-or-calibration-marks-used-as-page-background",
      "testing-demo-or-placeholder-copy-shipped-to-ui",
      "terminal-only-user-flow-without-product-reason",
      "safe-cream-slate-or-monochrome-palette-used-as-readability-excuse",
      "generic-abstract-logo-or-iconography",
      "timid-anchor-that-renames-dashboard-or-admin-shell",
      "motion-suppressed-without-accessibility-or-performance-reason",
      "motion-or-3d-omitted-from-fear-without-fit-analysis",
      "modern-library-rejected-from-dependency-fear-without-tradeoff-analysis",
      "component-library-selected-by-habit-without-product-fit",
      "scale-only-responsive-layout",
      "zero-based-redesign-kept-prior-visual-dna",
      "restyle-instead-of-recomposition",
      "literal-anchor-artifacts-used-as-required-ui-chrome",
      "candidate-signature-move-treated-as-locked-implementation",
      "library-theme-tokens-drive-visual-language",
      "spatial-room-anchor-used-by-habit",
      "place-metaphor-used-as-layout-model-without-product-function",
      "external-website-reference-copied-as-style",
      "tailwind-only-or-component-kit-used-as-neutrality-claim",
      "framework-selected-by-familiarity-instead-of-evidence",
      "manual-framework-scaffold-used-when-official-setup-fits"
    ],
    "validBoldSignals": [
      "single-cohesive-conceptual-anchor",
      "high-variance-candidate-selection",
      "context-derived-visual-direction",
      "three-at-a-glance-product-specific-signals",
      "visually-exploratory-accessible-palette-derived-from-product",
      "audacious-accessible-palette-with-product-role-behavior",
      "background-or-geometry-serves-product-function",
      "motion-or-spatial-experience-derived-from-anchor",
      "explicit-3d-canvas-fit-or-nonfit-decision",
      "official-docs-backed-modern-library-choice",
      "headless-or-component-primitive-restyled-to-product-language",
      "responsive-recomposition-by-task-priority",
      "purposeful-motion-with-reduced-motion-path",
      "non-spatial-product-anchor-or-workflow-mechanism",
      "official-scaffolder-used-for-supported-project-shape",
      "framework-choice-compared-against-plausible-alternative"
    ],
    "reportingRules": {
      "mustExplainGenericity": true,
      "mustSeparateTasteFromFailure": true,
      "contractFidelityOverridesPersonalTaste": true
    }
  },
  "contextHygiene": {
    "continuityMode": "opt-in-only",
    "allowedSources": [
      "current-repo-evidence",
      "current-user-brief",
      "current-project-docs",
      "explicitly-approved-current-task-constraints"
    ],
    "taintedSources": [
      "prior-chat-visual-memory",
      "unrelated-project-aesthetics",
      "remembered-screenshots-without-current-approval",
      "generic-template-recall"
    ],
    "repoEvidenceOverridesMemory": true,
    "requireExplicitContinuityApproval": true,
    "forbidCarryoverWhenUnapproved": true,
    "approvedExternalConstraintUsage": "Convert approved external constraints into current-project rules; do not imitate source surfaces.",
    "externalWebsiteReferencePolicy": "Use outside websites for mechanics, constraints, and quality bar analysis only. Do not copy layout rhythm, palette, component skin, visual metaphor, or brand posture.",
    "driftSignals": [
      "palette-reused-without-brief-support",
      "prior-ui-visual-dna-carried-into-reset-request",
      "room-or-control-room-anchor-repeated-without-product-need",
      "external-reference-copied-instead-of-translated"
    ]
  },
  "forbiddenPatterns": [
    "offline-prescribed-style-used-as-final-direction",
    "missing-conceptual-anchor-without-external-research",
    "visual-decisions-not-derived-from-conceptual-anchor",
    "ai-safe-ui-template-look",
    "ai-color-default-palette-without-product-role-behavior",
    "brandless-clean-template-look",
    "interchangeable-product-renaming-test-fails",
    "decorative-grid-or-glow-wallpaper-without-product-function",
    "decorative-line-or-calibration-wallpaper-without-product-function",
    "measurement-or-calibration-marks-used-as-page-background",
    "testing-demo-or-placeholder-copy-shipped-to-ui",
    "terminal-only-user-flow-without-product-reason",
    "safe-cream-slate-or-monochrome-palette-used-as-readability-excuse",
    "generic-abstract-logo-or-iconography",
    "timid-anchor-that-renames-dashboard-or-admin-shell",
    "motion-suppressed-without-accessibility-or-performance-reason",
    "motion-or-3d-omitted-from-fear-without-fit-analysis",
    "modern-library-rejected-from-dependency-fear-without-tradeoff-analysis",
    "component-library-selected-by-habit-without-product-fit",
    "scale-only-responsive-layout",
    "zero-based-redesign-kept-prior-visual-dna",
    "restyle-instead-of-recomposition",
    "literal-anchor-artifacts-used-as-required-ui-chrome",
    "candidate-signature-move-treated-as-locked-implementation",
    "library-theme-tokens-drive-visual-language",
    "spatial-room-anchor-used-by-habit",
    "place-metaphor-used-as-layout-model-without-product-function",
    "external-website-reference-copied-as-style",
    "tailwind-only-or-component-kit-used-as-neutrality-claim",
    "framework-selected-by-familiarity-instead-of-evidence",
    "manual-framework-scaffold-used-when-official-setup-fits",
    "single-safe-typographic-family-without-role-contrast-or-rationale"
  ],
  "validationHints": [
    "rejectArbitraryHexOnlyPalette",
    "requireViewportMutationRules",
    "requirePerceptualColorRationale",
    "requireTokenLayering",
    "requireTokenAliasingPlan",
    "allowHexDerivatives",
    "requireMotionRationale",
    "requireStateMorphology",
    "requireAccessibilitySplit",
    "requireWcagHardFloor",
    "requireStructuredDesignExecutionPolicy",
    "requireStructuredDesignHandoff",
    "requireVisualResetStrategyWhenZeroBasedRedesignRequested",
    "requireConceptualAnchorWhenNoExternalResearch",
    "requireAgentLedAnchorResearchWhenUserResearchMissing",
    "rejectTimidDashboardAnchor",
    "requireReviewRubric",
    "requireGenericityExplanation",
    "genericityAutoFail",
    "requireSignatureMove",
    "rejectTemplateNeutralLayout",
    "requireAiSafeUiAudit",
    "requireProductionContentPolicy",
    "requireAiColorAudit",
    "rejectAiColorDefaults",
    "requireMotionSpatialCourageAudit",
    "requireExplicit3dCanvasFitDecision",
    "rejectSafetyAsCreativitySubstitute",
    "rejectAiSafeUiTemplateLook",
    "requireThreeProductSpecificSignals",
    "rejectDecorativeBackgroundPatternsWithoutProductFunction",
    "rejectTestingDemoUiCopy",
    "rejectTerminalOnlyUserFlows"
  ],
  "requiredDesignSections": [
    "Design Intent and Product Personality",
    "Audience and Use-Context Signals",
    "Visual Direction and Distinctive Moves",
    "Color Science and Semantic Roles",
    "Typographic Engineering and Hierarchy",
    "Spacing, Layout Rhythm, and Density Strategy",
    "Token Architecture and Alias Strategy",
    "Responsive Strategy and Cross-Viewport Adaptation Matrix",
    "Interaction, Motion, and Feedback Rules",
    "Component Language, Morphology, and Shared Patterns",
    "Context Hygiene and Source Boundaries",
    "Accessibility Non-Negotiables",
    "Anti-Patterns to Avoid",
    "Implementation Notes for Future UI Tasks"
  ],
  "implementation": {
    "requiredDeliverables": [
      "docs/DESIGN.md",
      "docs/design-intent.json"
    ],
    "requireDesignRationale": true,
    "requireDistinctVisualDirection": true,
    "requireMachineReadableContract": true,
    "requireViewportMutationRules": true,
    "requirePurposefulMotionGuidelines": true,
    "requireRecognizableVisualBet": true,
    "requireConceptualAnchor": true,
    "bootstrapPrompt": ".agent-context/prompts/bootstrap-design.md",
    "autoLoadedRuleFiles": [
      ".agent-context/prompts/bootstrap-design.md",
      ".agent-context/prompts/research-design.md",
      ".agent-context/rules/frontend-architecture.md"
    ],
    "disallowedAutoLoadedRuleFiles": [
      ".agent-context/rules/database-design.md",
      ".agent-context/rules/docker-runtime.md",
      ".agent-context/rules/microservices.md"
    ]
  }
}
```

## Required Execution
1. Create or update docs/DESIGN.md with complete content.
2. Create or update docs/design-intent.json with machine-readable design intent.
3. Keep both files synchronized: the markdown explains the rationale and the JSON captures the machine-readable contract.
4. Encode accessibility as a split policy: WCAG 2.2 AA hard floor, APCA advisory readability tuning, and explicit hard-vs-advisory checks.
5. Encode structured design execution as policy: representation strategy, surface plan, component graph, content-priority map, viewport mutation plan, interaction-state matrix, semantic review focus, and structured handoff requirements.
6. Encode an explicit structured handoff inside docs/design-intent.json: surface plan, component graph, content-priority map, viewport mutation plan, interaction-state matrix, task-flow narrative, and signature move rationale.
7. Encode a stable review rubric: required dimensions, genericity signals, valid bold signals, and reporting rules that separate taste from real failure.
7a. Encode designFlexibilityPolicy and designExecutionHandoff.expressionFlexibility so future agents know what is locked and what can change.
8. Make the handoff executable without screenshot dependency. The contract must still guide high-precision UI generation from repo evidence and changed code alone.
9. Preserve repoEvidence.designEvidenceSummary when onboarding or detector evidence exists instead of discarding it.
10. If repoEvidence.designEvidenceSummary.structuredInspection exists, use it as stronger evidence for class surfaces, inline style bypasses, and expression-backed UI structure before defaulting to generic assumptions.
11. Ensure both files stay project-specific, dynamic, and practical for implementation and review. The seed may guide structure, but it must not decide style offline.
12. Keep visualResetStrategy in the machine-readable handoff so reset-language tasks cannot quietly become restyles of the previous UI.
13. Preserve externalResearchIntake so user-provided research becomes reviewed evidence without turning into an offline style or dependency preset.
14. Preserve conceptualAnchor so prompt-only UI work has one cohesive non-template concept instead of a mixed collection of bold but unrelated visual decisions.
15. Record conceptualAnchor.agentResearchMode, specificReferencePoint, signatureMotion, typographicDecision, visualRiskBudget, motionRiskBudget, and cohesionChecks so the final UI cannot quietly fall back to a timid dashboard/admin mental model.
15a. Record conceptualAnchor.categoryCodes.candidateEntries (Section 3 of research-design.md), conceptualAnchor.morphologicalExploration with selectedCombination and uncomfortableCombination (Section 4), and conceptualAnchor.anchorCandidates.candidates with full renameTest results (Section 5) before UI implementation.
16. Preserve derivedTokenLogic, libraryResearchStatus, and libraryDecisions so token choices and dependency uncertainty stay visible before implementation.
16a. Preserve designFlexibilityPolicy so the machine contract guides consistency without freezing literal anchor artifacts, exact token primitives, or component-kit visual language.
17. Preserve productionContentPolicy so UI output is ship-ready and not a testing-looking scaffold.
18. After the contract exists, use it as a first-class source for future UI tasks.
