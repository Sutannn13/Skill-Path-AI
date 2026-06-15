import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const requiredFiles = [
  'README.md',
  'docs/doc-index.md',
  'docs/project-brief.md',
  'docs/architecture-decision-record.md',
  'docs/flow-overview.md',
  'docs/database-schema.md',
  'docs/api-contract.md',
  'docs/DESIGN.md',
]

for (const relativePath of requiredFiles) {
  assert.ok(
    fs.existsSync(path.join(repositoryRoot, relativePath)),
    `Required project document is missing: ${relativePath}`
  )
}

const contentValidation = spawnSync(
  process.execPath,
  [path.join(repositoryRoot, 'scripts/validate-roadmap-content.mjs')],
  {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: 'inherit',
  }
)

if (contentValidation.status !== 0) {
  process.exit(contentValidation.status ?? 1)
}

console.log('Repository validation passed.')
