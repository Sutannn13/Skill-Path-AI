// @ts-check

import { existsSync } from 'node:fs';
import { AVAILABLE_TEST_SUITES, INTERNAL_SCRIPT_PATHS } from './constants.mjs';

export function buildToolDefinitions() {
  const toolDefinitions = [];

  if (existsSync(INTERNAL_SCRIPT_PATHS.validate)) {
    toolDefinitions.push({
      name: 'validate',
      description: 'Run repository validation checks.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
    });
  }

  if (AVAILABLE_TEST_SUITES.length > 0) {
    toolDefinitions.push({
      name: 'test',
      description: 'Run test suites (full or targeted).',
      inputSchema: {
        type: 'object',
        properties: {
          suite: {
            type: 'string',
            enum: AVAILABLE_TEST_SUITES,
            description: 'Target test suite. Defaults to the first available suite.',
          },
        },
        additionalProperties: false,
      },
    });
  }

  if (existsSync(INTERNAL_SCRIPT_PATHS.release_gate)) {
    toolDefinitions.push({
      name: 'release_gate',
      description: 'Run release gate checks.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
    });
  }

  if (existsSync(INTERNAL_SCRIPT_PATHS.forbidden_content_check)) {
    toolDefinitions.push({
      name: 'forbidden_content_check',
      description: 'Run forbidden content scan used by publish gate.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
    });
  }

  toolDefinitions.push(
    {
      name: 'lookup_rule',
      description: 'Look up a canonical .agent-context rule section by stable rule ID.',
      inputSchema: {
        type: 'object',
        properties: {
          ruleId: {
            type: 'string',
            description: 'Stable rule section ID, such as ARCH-003 or API-001.',
          },
        },
        required: ['ruleId'],
        additionalProperties: false,
      },
    },
    {
      name: 'validate_against_rules',
      description: 'Validate that cited rule IDs resolve to canonical rule sections.',
      inputSchema: {
        type: 'object',
        properties: {
          ruleIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Rule IDs cited by a response, plan, or review.',
          },
          summary: {
            type: 'string',
            description: 'Optional one-line context for the validation request.',
          },
        },
        required: ['ruleIds'],
        additionalProperties: false,
      },
    },
    {
      name: 'audit_compliance',
      description: 'Run a lightweight compliance audit over cited rule IDs and scope labels.',
      inputSchema: {
        type: 'object',
        properties: {
          ruleIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Rule IDs used as the compliance basis.',
          },
          scope: {
            type: 'string',
            description: 'Optional changed scope label, such as api, security, testing, architecture, ui, or release.',
          },
        },
        required: ['ruleIds'],
        additionalProperties: false,
      },
    },
    {
      name: 'research_fetch',
      description: 'Fetch external documentation/news content and return query-focused excerpts with citation metadata.',
      inputSchema: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'Absolute HTTP/HTTPS URL to fetch.',
          },
          query: {
            type: 'string',
            description: 'Optional search query used to extract focused excerpts.',
          },
          maxChars: {
            type: 'integer',
            description: 'Maximum characters to return when query is not provided (default 6000, max 20000).',
          },
        },
        required: ['url'],
        additionalProperties: false,
      },
    },
    {
      name: 'trend_snapshot',
      description: 'Generate ecosystem trend snapshot from npm registry metadata with source timestamps.',
      inputSchema: {
        type: 'object',
        properties: {
          packages: {
            type: 'array',
            items: { type: 'string' },
            description: 'Package names to inspect (max 10).',
          },
          windowDays: {
            type: 'integer',
            description: 'Release activity window in days (default 90).',
          },
        },
        required: ['packages'],
        additionalProperties: false,
      },
    },
    {
      name: 'state_read',
      description: 'Read a file from .agent-context/state for cross-session continuity.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path relative to .agent-context/state, such as memory-continuity-benchmark.json.',
          },
        },
        required: ['path'],
        additionalProperties: false,
      },
    },
    {
      name: 'state_write',
      description: 'Write a file under .agent-context/state for cross-session continuity updates.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path relative to .agent-context/state.',
          },
          content: {
            type: 'string',
            description: 'UTF-8 content to write.',
          },
          mode: {
            type: 'string',
            enum: ['overwrite', 'append'],
            description: 'Write mode. Defaults to overwrite.',
          },
        },
        required: ['path', 'content'],
        additionalProperties: false,
      },
    },
  );

  return toolDefinitions;
}
