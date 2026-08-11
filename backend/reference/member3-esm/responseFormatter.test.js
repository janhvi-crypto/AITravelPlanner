/**
 * Unit tests for responseFormatter utilities.
 * Run with: npm test
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  stripMarkdownFences,
  extractJsonObject,
  repairJsonString,
  parseJsonSafely,
  normalizeTravelPlanResponse,
  formatTravelPlanResponse,
  TravelPlanFormatError,
} from '../utils/responseFormatter.js';

const minimalValidPlan = {
  tripSummary: {
    destination: 'Paris',
    duration: 2,
    overview: 'A cultural weekend',
    highlights: ['Eiffel Tower'],
    paceRecommendation: 'Relaxed',
    dailyTravelSummary: ['Day 1 summary', 'Day 2 summary'],
  },
  dailyPlan: [
    {
      day: 1,
      morning: { activities: ['Louvre visit'] },
      afternoon: {},
      evening: {},
    },
    {
      day: 2,
      morning: {},
      afternoon: {},
      evening: {},
    },
  ],
};

describe('stripMarkdownFences', () => {
  it('removes ```json fences', () => {
    const input = '```json\n{"a":1}\n```';
    assert.equal(stripMarkdownFences(input), '{"a":1}');
  });

  it('removes plain ``` fences', () => {
    const input = '```\n{"a":1}\n```';
    assert.equal(stripMarkdownFences(input), '{"a":1}');
  });

  it('returns empty string for non-string input', () => {
    assert.equal(stripMarkdownFences(null), '');
    assert.equal(stripMarkdownFences(undefined), '');
  });
});

describe('extractJsonObject', () => {
  it('extracts JSON embedded in explanatory text', () => {
    const input = 'Here is your plan: {"tripSummary":{}} end.';
    assert.equal(extractJsonObject(input), '{"tripSummary":{}}');
  });

  it('returns null when no object is found', () => {
    assert.equal(extractJsonObject('no json here'), null);
  });
});

describe('repairJsonString', () => {
  it('removes trailing commas', () => {
    const broken = '{"a":1,"b":2,}';
    assert.equal(repairJsonString(broken), '{"a":1,"b":2}');
  });

  it('replaces smart quotes', () => {
    const broken = '{\u201Cname\u201D:\u201CParis\u201D}';
    const repaired = repairJsonString(broken);
    assert.doesNotThrow(() => JSON.parse(repaired));
  });
});

describe('parseJsonSafely', () => {
  it('parses clean JSON', () => {
    const result = parseJsonSafely('{"ok":true}');
    assert.deepEqual(result, { ok: true });
  });

  it('parses fenced JSON with trailing commas', () => {
    const input = '```json\n{"items":["a",],}\n```';
    const result = parseJsonSafely(input);
    assert.deepEqual(result, { items: ['a'] });
  });

  it('throws TravelPlanFormatError on invalid input', () => {
    assert.throws(() => parseJsonSafely('not json at all'), TravelPlanFormatError);
  });
});

describe('normalizeTravelPlanResponse', () => {
  it('fills missing fields with safe defaults', () => {
    const normalized = normalizeTravelPlanResponse({
      dailyPlan: [{ morning: {}, afternoon: {}, evening: {} }],
    });

    assert.equal(normalized.tripSummary.destination, 'Information may vary.');
    assert.deepEqual(normalized.safetyTips, []);
    assert.deepEqual(normalized.packingList, []);
    assert.equal(normalized.bestTimeToVisit, 'Information may vary.');
    assert.equal(normalized.emergencyInfo.disclaimer.length > 0, true);
  });

  it('normalizes time blocks with all required keys', () => {
    const normalized = normalizeTravelPlanResponse(minimalValidPlan);
    const morning = normalized.dailyPlan[0].morning;

    assert.deepEqual(morning.activities, ['Louvre visit']);
    assert.equal(morning.location, 'Information may vary.');
    assert.equal(morning.estimatedCost, 'Information may vary.');
    assert.deepEqual(morning.travelTips, []);
  });

  it('coerces invalid priority to medium in travelChecklist', () => {
    const normalized = normalizeTravelPlanResponse({
      dailyPlan: [{ morning: {}, afternoon: {}, evening: {} }],
      travelChecklist: [{ task: 'Get passport', priority: 'urgent' }],
    });

    assert.equal(normalized.travelChecklist[0].priority, 'medium');
  });
});

describe('formatTravelPlanResponse', () => {
  it('returns a fully normalized plan from valid JSON string', () => {
    const result = formatTravelPlanResponse(JSON.stringify(minimalValidPlan));
    assert.equal(result.dailyPlan.length, 2);
    assert.equal(result.tripSummary.destination, 'Paris');
  });

  it('throws on empty response', () => {
    assert.throws(() => formatTravelPlanResponse(''), TravelPlanFormatError);
    assert.throws(() => formatTravelPlanResponse('   '), TravelPlanFormatError);
  });

  it('throws when dailyPlan is missing after normalization', () => {
    assert.throws(
      () => formatTravelPlanResponse(JSON.stringify({ tripSummary: {}, dailyPlan: [] })),
      TravelPlanFormatError
    );
  });

  it('handles markdown-wrapped AI output end-to-end', () => {
    const wrapped = `\`\`\`json\n${JSON.stringify(minimalValidPlan)}\n\`\`\``;
    const result = formatTravelPlanResponse(wrapped);
    assert.equal(result.dailyPlan.length, 2);
  });
});
