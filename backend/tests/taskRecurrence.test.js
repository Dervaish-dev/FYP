import test from 'node:test';
import assert from 'node:assert/strict';
import { computeNextDueTime } from '../utils/taskRecurrence.js';

test('computeNextDueTime daily adds 1 day', () => {
  const base = new Date('2025-12-20T10:00:00.000Z');
  const next = computeNextDueTime(base, 'daily');
  assert.equal(next.toISOString(), '2025-12-21T10:00:00.000Z');
});

test('computeNextDueTime weekly adds 7 days', () => {
  const base = new Date('2025-12-20T10:00:00.000Z');
  const next = computeNextDueTime(base, 'weekly');
  assert.equal(next.toISOString(), '2025-12-27T10:00:00.000Z');
});

test('computeNextDueTime custom adds N days', () => {
  const base = new Date('2025-12-20T10:00:00.000Z');
  const next = computeNextDueTime(base, 'custom', 3);
  assert.equal(next.toISOString(), '2025-12-23T10:00:00.000Z');
});

test('computeNextDueTime once returns null', () => {
  const base = new Date('2025-12-20T10:00:00.000Z');
  const next = computeNextDueTime(base, 'once');
  assert.equal(next, null);
});
