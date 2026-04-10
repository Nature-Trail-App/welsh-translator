import { describe, it, expect } from 'vitest';

describe('demo data', () => {
  it('POI body text has no unmatched trailing punctuation', async () => {
    const { pois } = await import('../examples/data.js');
    for (const poi of pois) {
      expect(poi.body.endsWith('"'), `${poi.id} body ends with stray double-quote`).toBe(false);
    }
  });
});
