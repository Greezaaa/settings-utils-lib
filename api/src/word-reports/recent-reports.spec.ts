import { RecentReports } from './recent-reports.js';

describe('RecentReports', () => {
  it('counts each visitor once per word for a day', () => {
    const recent = new RecentReports();
    expect(recent.isNew('1.1.1.1', 'en', 'word', 0)).toBe(true);
    expect(recent.isNew('1.1.1.1', 'en', 'word', 1000)).toBe(false);
    expect(recent.isNew('1.1.1.1', 'es', 'word', 1000)).toBe(true);
    expect(recent.isNew('2.2.2.2', 'en', 'word', 1000)).toBe(true);
    expect(recent.isNew('1.1.1.1', 'en', 'word', 25 * 60 * 60 * 1000)).toBe(
      true,
    );
  });
});
