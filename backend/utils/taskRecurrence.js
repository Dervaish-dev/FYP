export function computeNextDueTime(dueTime, repeat, customIntervalDays = null) {
  const base = new Date(dueTime);
  if (Number.isNaN(base.getTime())) {
    throw new Error('Invalid dueTime');
  }

  switch (repeat) {
    case 'daily': {
      return new Date(base.getTime() + 24 * 60 * 60 * 1000);
    }
    case 'weekly': {
      return new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    case 'custom': {
      const days = Number(customIntervalDays);
      if (!Number.isFinite(days) || days <= 0) {
        throw new Error('customInterval must be a positive number of days');
      }
      return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    }
    case 'once':
    default:
      return null;
  }
}

export function resetSteps(steps) {
  if (!Array.isArray(steps)) return [];
  return steps.map((s) => ({
    id: s?.id || cryptoRandomId(),
    text: String(s?.text || '').trim(),
    done: false,
  })).filter((s) => s.text.length > 0);
}

function cryptoRandomId() {
  // Avoid adding deps; good-enough id for checklist items
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function shouldCreateNextOccurrence(existingTask, updateData) {
  const prevStatus = existingTask?.status;
  const nextStatus = updateData?.status;

  // Only create next when transitioning into done
  if (prevStatus === 'done') return false;
  if (nextStatus !== 'done') return false;

  const repeat = updateData?.repeat ?? existingTask?.repeat;
  if (!repeat || repeat === 'once') return false;

  return true;
}
