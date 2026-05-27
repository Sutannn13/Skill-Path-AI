# Scoring Method

SkillPath uses a deterministic scoring algorithm to calculate career readiness and job match scores. This ensures consistent, explainable results without relying on AI for the core calculation.

## Skill Level Normalization

Each skill is rated on a 0-4 scale:

| Level | Label | Normalized Value |
|-------|-------|------------------|
| 0 | Not learned | 0.00 |
| 1 | Learning | 0.25 |
| 2 | Basic | 0.50 |
| 3 | Project-level | 0.75 |
| 4 | Professional | 1.00 |

## Basic Match Score

The basic match score calculates what percentage of required skills the user has:

```
basicMatchScore = (matchedRequiredSkills / totalRequiredSkills) * 100
```

Where:
- `matchedRequiredSkills` = Count of skills with level > 0
- `totalRequiredSkills` = Count of required skills for target role

## Weighted Score Calculation

The weighted score considers skill priority weights:

```
weightedScore = (sum(normalizedLevel * priorityWeight) / sum(priorityWeight)) * 100
```

### Example Calculation

**User Skills:**
- JavaScript: Level 3 (normalized: 0.75, weight: 5)
- React: Level 2 (normalized: 0.50, weight: 5)
- TypeScript: Level 0 (normalized: 0.00, weight: 4)
- CSS: Level 2 (normalized: 0.50, weight: 4)

**Calculation:**
```
numerator = (0.75 * 5) + (0.50 * 5) + (0.00 * 4) + (0.50 * 4)
          = 3.75 + 2.50 + 0.00 + 2.00
          = 8.25

denominator = 5 + 5 + 4 + 4
            = 18

weightedScore = (8.25 / 18) * 100
              = 45.83%
```

## Priority Weights

Skills have priority weights based on their importance for the role:

| Skill | Priority Weight |
|-------|-----------------|
| JavaScript | 5 |
| React | 5 |
| Node.js | 5 |
| TypeScript | 4 |
| Git | 4 |
| HTML/CSS | 4 |
| REST API | 4 |
| Testing | 3 |
| State Management | 3 |

Higher weights mean the skill contributes more to the overall score.

## Readiness Labels

Based on the weighted score:

| Score Range | Label | Description |
|-------------|-------|-------------|
| 85-100 | Strong Candidate | Ready for professional roles |
| 70-84 | Internship-ready Soon | Almost ready for internships |
| 50-69 | Getting Close | Making good progress |
| 25-49 | Foundation Stage | Building core foundations |
| 0-24 | Not Ready Yet | Focus on fundamentals |

## Missing Skills

Skills with level 0 are classified as "missing":

```typescript
const missingSkills = requiredSkills.filter(skill =>
  userSkillLevel[skill.id] === 0
)
```

## Weak Skills

Skills with level 1-2 are "weak":

```typescript
const weakSkills = requiredSkills.filter(skill =>
  userSkillLevel[skill.id] >= 1 && userSkillLevel[skill.id] <= 2
).sort((a, b) => b.priorityWeight - a.priorityWeight)
```

Sorted by priority so the most impactful weak skills come first.

## Strong Skills

Skills with level 3-4 are "strong":

```typescript
const strongSkills = requiredSkills.filter(skill =>
  userSkillLevel[skill.id] >= 3
)
```

## Recommended Next Skills

Combines missing and weak skills sorted by priority:

```typescript
const recommendedNextSkills = [
  ...missingSkills.slice(0, 3),
  ...weakSkills.slice(0, 2).map(w => w.name)
].slice(0, 5)
```

## Job Match Score

For job matching, skills are extracted from job descriptions and matched against user skills:

```typescript
const jobRequiredSkills = extractSkillsFromJob(job)
const userJobScore = calculateWeightedScore(
  userSkills.filter(s => jobRequiredSkills.includes(s.name)),
  jobRequiredSkills
)
```

## Score Display

### ScoreMeter Component
- Animated circular progress
- Color-coded by score range
- Shows percentage prominently

### ScoreBar Component
- Horizontal progress bar
- Animated fill
- Label and percentage

### MatchScorePill Component
- Compact pill badge
- Color and label based on score
- "Great Match", "Good Match", etc.

## Consistency Guarantee

The scoring algorithm is:
- **Deterministic**: Same inputs always produce same outputs
- **Transparent**: Scores can be explained by breaking down components
- **Testable**: Unit tests verify all edge cases
- **No AI dependency**: Core scoring uses math, not ML models

AI may be used to generate explanations or roadmaps, but never for the fundamental score calculation.