import type { QuizQuestionSeed } from '@/lib/roadmap/quiz-bank'

type ConceptQuestion = readonly [
  question: string,
  correctAnswer: string,
  distractors: readonly [string, string, string],
  explanation: string,
]

function buildQuiz(skill: string, concepts: readonly ConceptQuestion[]): QuizQuestionSeed[] {
  return concepts.map(([questionText, correctAnswer, distractors, explanation], index) => {
    const options = [correctAnswer, ...distractors]
    const shift = index % options.length

    return {
      questionText,
      options: [...options.slice(shift), ...options.slice(0, shift)],
      correctAnswer,
      explanation,
      relatedSkill: skill,
      difficulty: index < 4 ? 'easy' : index < 8 ? 'medium' : 'hard',
    }
  })
}

export const SPECIALIZED_QUIZ_BANK: Record<string, QuizQuestionSeed[]> = {
  accessibility: buildQuiz('Accessibility', [
    ['Which element should be used for an action that changes UI state without navigation?', '<button>', ['<a>', '<div>', '<span>'], 'A button provides keyboard and assistive-technology behavior for an in-page action.'],
    ['What does a visible focus indicator communicate?', 'Which interactive element currently has keyboard focus', ['Which element is disabled', 'Which element is loading', 'Which element has an error'], 'Keyboard users need a visible indication of the active control.'],
    ['When should aria-live be considered?', 'When dynamic status text must be announced without moving focus', ['For every heading', 'For decorative icons', 'For static navigation labels'], 'Live regions are intended for important dynamic updates.'],
    ['What is the best accessible name for an icon-only close button?', 'An aria-label such as Close dialog', ['The filename close.svg', 'No label because the icon is visible', 'A title on the parent page'], 'Icon-only controls need a programmatic accessible name.'],
    ['What should reduced-motion mode preserve?', 'The meaning and state change while removing unnecessary motion', ['All animation timing exactly', 'Only decorative colors', 'A blank static screen'], 'Reduced motion changes presentation, not the information conveyed.'],
    ['Why should validation not rely on red color alone?', 'Color may not be perceived and does not describe the error', ['Red is too slow to render', 'Browsers block red text', 'It prevents form submission'], 'Errors need text or another non-color signal.'],
    ['What is the preferred keyboard behavior for a native button?', 'Enter and Space activate it', ['Only mouse click activates it', 'Tab submits the form immediately', 'Escape always activates it'], 'Native buttons include expected keyboard semantics.'],
    ['What should happen when a modal opens?', 'Focus moves into the modal and remains managed until it closes', ['Focus stays behind the modal', 'The page scrolls to the footer', 'All controls lose accessible names'], 'A modal must manage focus so keyboard users remain in its active context.'],
    ['Why is heading order important?', 'It exposes a meaningful document structure', ['It determines CSS specificity', 'It reduces API requests', 'It enables local storage'], 'Headings help users navigate and understand hierarchy.'],
    ['Which test is still required after an automated accessibility scan passes?', 'Manual keyboard and interaction testing', ['No further testing', 'Only a production build', 'Only a color palette export'], 'Automated tools cannot verify every interaction and usability requirement.'],
  ]),
  'design systems': buildQuiz('Design Systems', [
    ['What is the main purpose of a semantic color token such as color-danger?', 'Describe the role of a value instead of a fixed visual value', ['Store a component filename', 'Replace accessibility testing', 'Force every component to be red'], 'Semantic tokens make intent stable across themes and implementations.'],
    ['What should a component story document?', 'A representative component state or usage scenario', ['Only the package version', 'Only the CSS reset', 'Only database schema'], 'Stories make component behavior and states reviewable.'],
    ['Why define component anatomy?', 'To make parts and composition boundaries explicit', ['To increase bundle size', 'To remove all variants', 'To avoid writing accessible names'], 'Anatomy clarifies which parts own behavior and styling.'],
    ['What is a useful variant boundary?', 'A supported product state with a clear semantic difference', ['Every possible class combination', 'A random color per render', 'A duplicate component file'], 'Variants should represent meaningful and supported behavior.'],
    ['What should happen when a token value changes?', 'Components using the semantic token update consistently', ['Each component keeps a copied value', 'All tests are deleted', 'The token name changes randomly'], 'Central semantic tokens prevent visual drift.'],
    ['Why document empty and error states in a component system?', 'They are part of the public UI contract', ['They are only backend concerns', 'They should appear only in demos', 'They remove the need for testing'], 'Production components need explicit non-happy states.'],
    ['What is the best reason to add a new shared component?', 'A repeated stable behavior and interface exists', ['One page has two similar colors', 'A helper name sounds reusable', 'To hide all product terminology'], 'Shared abstractions should follow real repeated behavior.'],
    ['What should design-system accessibility documentation include?', 'Names, roles, keyboard behavior, focus, and state semantics', ['Only screenshot dimensions', 'Only brand history', 'Only npm install output'], 'Accessibility behavior is part of a component contract.'],
    ['How should breaking component API changes be handled?', 'Document and migrate consumers deliberately', ['Silently change every prop', 'Keep two conflicting implementations forever', 'Ignore downstream usage'], 'Consumers need a clear migration path for contract changes.'],
    ['What is the strongest component test?', 'A test of user-visible behavior across important states', ['A snapshot of private variable names', 'A test of Tailwind class order only', 'A test that imports the file'], 'Behavior tests protect the contract without coupling to implementation trivia.'],
  ]),
  'react native': buildQuiz('React Native', [
    ['Which React Native component is the basic layout container?', 'View', ['div', 'section', 'canvas'], 'React Native uses View instead of browser DOM container elements.'],
    ['Which component is optimized for long scrolling lists?', 'FlatList', ['Text', 'Pressable', 'StatusBar'], 'FlatList virtualizes list rendering and supports list-specific behavior.'],
    ['What is the correct way to display text in React Native?', 'Wrap text in a Text component', ['Place raw text directly inside View', 'Use an HTML paragraph', 'Use CSS content'], 'Text content must be rendered through Text.'],
    ['What does Expo Router use to define routes?', 'The file structure in the app directory', ['A SQL table', 'CSS selectors', 'Environment variable names'], 'Expo Router maps files and folders to routes.'],
    ['Where should a sensitive token be stored?', 'In a secure platform storage solution, not Async Storage', ['In a public constant', 'In the route filename', 'In component props forever'], 'Async Storage is not designed as encrypted secret storage.'],
    ['What should an API screen show while a request is pending?', 'An explicit loading state that preserves context', ['Old data labeled as current', 'A blank screen with no status', 'A success message'], 'Users need honest feedback about request state.'],
    ['Why use stable keys in FlatList?', 'To preserve item identity across updates', ['To enable database indexes', 'To request permissions', 'To create a release build'], 'Stable keys help React reconcile list items correctly.'],
    ['When should a device permission be requested?', 'At the point the related feature is used', ['On every app launch without context', 'Before the user sees the feature', 'After the operation already failed silently'], 'Contextual permission requests are clearer and less intrusive.'],
    ['What should EAS Build produce for testing?', 'An installable build artifact for the target platform', ['A PostgreSQL migration', 'A browser-only CSS file', 'A Git commit automatically'], 'EAS Build creates platform build artifacts.'],
    ['What is a valid offline-state requirement?', 'Clearly label stale data and provide retry or recovery', ['Pretend every request succeeded', 'Delete cached preferences immediately', 'Disable all navigation permanently'], 'Offline behavior must remain honest and recoverable.'],
  ]),
  python: buildQuiz('Python', [
    ['Which Python structure stores key-value pairs?', 'dict', ['list', 'tuple', 'set'], 'A dict maps unique keys to values.'],
    ['What does a Python function return when no return statement runs?', 'None', ['0', 'false', 'An empty string'], 'Python functions return None implicitly.'],
    ['Which pandas object represents tabular data?', 'DataFrame', ['SeriesBuilder', 'TableView', 'RowSet'], 'A DataFrame stores labeled two-dimensional tabular data.'],
    ['Which pandas method is commonly used to inspect the first rows?', 'head()', ['start()', 'peekRows()', 'firstPage()'], 'head() returns the first rows of a Series or DataFrame.'],
    ['Why should raw data remain unchanged?', 'It provides a reproducible source for cleaning and audit', ['It makes charts colorful', 'It avoids Python imports', 'It replaces validation'], 'Keeping source data immutable supports reproducibility.'],
    ['What does drop_duplicates() address?', 'Repeated rows according to selected columns', ['Missing values', 'Incorrect chart scales', 'SQL permissions'], 'drop_duplicates removes duplicate records by defined keys.'],
    ['What should happen before converting a string column to numeric?', 'Inspect invalid values and define coercion or rejection rules', ['Assume every value is valid', 'Delete the column name', 'Sort the file alphabetically'], 'Type conversion needs explicit invalid-data handling.'],
    ['What is vectorized pandas code designed to avoid?', 'Unnecessary row-by-row Python loops', ['Column labels', 'Data validation', 'Reproducible notebooks'], 'Vectorized operations are usually clearer and faster for tabular transformations.'],
    ['What should an exploratory notebook separate?', 'Observed evidence from hypotheses or explanations', ['Code from all output', 'Rows from columns', 'Python from documentation'], 'EDA should not present untested explanations as facts.'],
    ['What proves a notebook is reproducible?', 'It runs from a clean state in documented order', ['It has many hidden cells', 'It uses local absolute paths', 'It only works after manual edits'], 'A reproducible notebook does not depend on hidden execution state.'],
  ]),
  'data analysis': buildQuiz('Data Analysis', [
    ['What should be defined before selecting a chart?', 'The analytical question and metric', ['The chart color', 'The slide transition', 'The repository name'], 'Visualization choices follow the question and data.'],
    ['What is data grain?', 'What one row represents', ['The file extension', 'The chart legend position', 'The database password'], 'Grain determines how records and metrics should be interpreted.'],
    ['Which quality dimension asks whether required values are present?', 'Completeness', ['Uniqueness', 'Timeliness', 'Linearity'], 'Completeness measures missing required data.'],
    ['Why record analysis assumptions?', 'They affect interpretation and reproducibility', ['They increase API rate limits', 'They replace source data', 'They guarantee causation'], 'Assumptions define the limits of the analysis.'],
    ['Which chart is usually suitable for a time trend?', 'Line chart', ['Pie chart', 'Gauge for every date', 'Unsorted word cloud'], 'A line chart shows ordered change over time.'],
    ['What does median reduce sensitivity to compared with mean?', 'Extreme outliers', ['Column names', 'Missing documentation', 'Join keys'], 'Median is more robust to extreme values.'],
    ['What should be checked after a SQL join?', 'Row counts, key uniqueness, and unexpected duplication', ['Only text color', 'Only query filename', 'Only network speed'], 'Joins can multiply or drop rows when assumptions are wrong.'],
    ['What makes a recommendation evidence-based?', 'It traces to a validated finding and states limitations', ['It sounds confident', 'It uses the most charts', 'It ignores sample size'], 'Recommendations should follow evidence without hiding uncertainty.'],
    ['Why can a truncated axis be misleading?', 'It can exaggerate small differences', ['It prevents filtering', 'It changes SQL syntax', 'It removes null values'], 'Axis choices change perceived magnitude.'],
    ['What is the difference between correlation and causation?', 'Correlation alone does not prove one variable caused the other', ['They are always identical', 'Causation requires only a chart', 'Correlation is a database constraint'], 'Causal claims need stronger design and evidence than association.'],
  ]),
  deployment: buildQuiz('Deployment', [
    ['Where should production secrets be configured?', 'In the deployment platform secret or environment settings', ['In a committed source file', 'In a public client constant', 'In README screenshots'], 'Secrets must stay outside committed and client-exposed code.'],
    ['What should run before deployment?', 'The project validation and build checks', ['Only a browser refresh', 'Only git status', 'Only a color audit'], 'Validation catches contract and compilation failures before release.'],
    ['Why separate development and production configuration?', 'Each environment has different URLs, credentials, and operational constraints', ['To duplicate secrets in code', 'To remove error handling', 'To avoid documentation'], 'Environment-specific config should be injected, not hardcoded.'],
    ['What is a health verification after deploy?', 'A real request that proves the deployed service responds correctly', ['A local screenshot only', 'A package install log', 'A design token export'], 'A deployment is not verified until the deployed runtime is checked.'],
    ['What should a rollback plan identify?', 'How to restore a known-good version or apply a forward recovery', ['Only who wrote the code', 'Only the branch color', 'Only the deployment timestamp'], 'Recovery steps reduce release risk.'],
    ['Why should database migrations be applied deliberately?', 'Application and schema versions must remain compatible', ['They improve image compression', 'They create OAuth credentials', 'They replace tests'], 'Schema changes can break deployed application assumptions.'],
    ['What should be documented for a required environment variable?', 'Its name, purpose, scope, and safe placeholder', ['Its real secret value', 'Only its character count', 'A user password'], 'Setup docs must be useful without leaking credentials.'],
    ['What is a deployment smoke test?', 'A short check of critical routes and behavior in the target environment', ['A full redesign', 'A random load test', 'A local type alias'], 'Smoke tests quickly detect broken release paths.'],
    ['Why should build output not be the only verification?', 'Runtime configuration and external integrations can still fail', ['Build output contains no code', 'Builds cannot detect syntax', 'Deployments never use builds'], 'A successful build does not prove the deployed environment works.'],
    ['What should happen when release verification fails?', 'Stop promotion or roll back and preserve evidence', ['Hide the error', 'Delete logs', 'Mark the release successful'], 'Failed release gates must block or trigger recovery.'],
  ]),
  documentation: buildQuiz('Documentation', [
    ['What should a project README explain first?', 'What the project does and how to run it', ['The author password', 'Every private implementation detail', 'Only the license year'], 'A README should orient users and developers quickly.'],
    ['Why document architecture decisions?', 'To preserve the decision, context, and consequences', ['To replace source control', 'To store API secrets', 'To avoid tests'], 'Decision records make tradeoffs understandable later.'],
    ['What makes setup instructions reproducible?', 'Exact prerequisites, commands, variables, and expected outcomes', ['Screenshots without commands', 'A statement that setup is easy', 'A private local path'], 'Readers need concrete steps and observable results.'],
    ['How should secret variables appear in documentation?', 'As safe placeholders with scope and purpose', ['As real production values', 'As browser console output', 'As committed cookies'], 'Documentation must never disclose credentials.'],
    ['When an API behavior changes, what should be updated?', 'The API contract in the same change', ['Only the landing page', 'Only a code comment', 'Nothing until release'], 'Public contracts must match implementation.'],
    ['What should verification notes distinguish?', 'Checks actually run from checks still pending', ['Frontend from backend colors', 'Folders from filenames', 'Git from GitHub'], 'Honest verification prevents false completion claims.'],
    ['Why include limitations in a portfolio case study?', 'They show accurate scope and engineering judgment', ['They make the app slower', 'They expose secrets', 'They replace feature descriptions'], 'Limitations keep claims defensible.'],
    ['What should a troubleshooting section contain?', 'Observable symptoms, likely causes, and concrete recovery steps', ['Generic encouragement', 'Only screenshots', 'Unrelated package lists'], 'Troubleshooting should help reproduce and resolve failures.'],
    ['What is the value of a Mermaid flow diagram?', 'It makes sequence or system flow reviewable as versioned text', ['It encrypts credentials', 'It executes database queries', 'It replaces all prose'], 'Text diagrams are diffable and useful for flow documentation.'],
    ['What should happen when documentation conflicts with code?', 'Verify the code and update the stale contract or implementation deliberately', ['Trust the oldest file automatically', 'Keep both conflicting claims', 'Delete validation'], 'Repository evidence must converge on one accurate contract.'],
  ]),
}
