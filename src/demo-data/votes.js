/**
 * DEMO DATA · GET /votes  ·  POST /votes
 * Community pick categories. `votes` excludes the visitor's own vote.
 */
/**
 * Community pick categories. `votes` excludes the visitor's own vote,
 * which is added on top so it can move freely between entries.
 */
export const VOTE_CATEGORIES = [
  {
    id: 'banner',
    label: 'Banner of the Month',
    entries: [
      { id: 'kaveri-studio', name: 'Kaveri Studio', initials: 'KS', votes: 42 },
      { id: 'northstar-labs', name: 'Northstar Labs', initials: 'NL', votes: 35 },
      { id: 'mango-radio', name: 'Mango Radio', initials: 'MR', votes: 27 },
      { id: 'orbit-works', name: 'Orbit Works', initials: 'OW', votes: 21 },
    ],
  },
  {
    id: 'founder',
    label: 'Founder Story of the Month',
    entries: [
      { id: 'meera-iyer', name: 'Meera Iyer, Kaveri Silk House', initials: 'MI', votes: 38 },
      { id: 'daniel-brooks', name: 'Daniel Brooks, Northstar Labs', initials: 'DB', votes: 31 },
      { id: 'priya-ellison', name: 'Priya Ellison, Harlow & Pine', initials: 'PE', votes: 29 },
      { id: 'arjun-mehta', name: 'Arjun Mehta, Veda Estates', initials: 'AM', votes: 17 },
    ],
  },
];

/** The design shows the visitor's vote already on Northstar Labs. */
export const DEFAULT_USER_VOTES = { banner: 'northstar-labs', founder: null };
