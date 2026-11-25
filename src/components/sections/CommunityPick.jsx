import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useApiMutation } from '../../hooks/useApiMutation';
import { useApiQuery } from '../../hooks/useApiQuery';
import { getQueryData, setQueryData } from '../../services/queryStore';
import { useFlipList } from '../../hooks/useFlipList';
import { cn } from '../../utils/cn';
import { QueryState, Skeleton } from '../ui/AsyncState';
import { Avatar } from '../ui/Avatar';
import { Section } from '../ui/Section';
import { SectionHeader } from '../ui/SectionHeader';
import { SegmentedControl } from '../ui/SegmentedControl';

/** Moves the visitor's vote locally so the ranking reacts before the server replies. */
function applyVote(data, categoryId, nextEntryId) {
  const previousId = data.userVotes?.[categoryId] ?? null;
  return {
    ...data,
    userVotes: { ...data.userVotes, [categoryId]: nextEntryId },
    categories: data.categories.map((category) =>
      category.id !== categoryId
        ? category
        : {
            ...category,
            entries: category.entries.map((entry) => ({
              ...entry,
              votes: entry.votes - (entry.id === previousId ? 1 : 0) + (entry.id === nextEntryId ? 1 : 0),
            })),
          },
    ),
  };
}

function VoteBoard({ data }) {
  const { showToast } = useUI();
  const castVote = useApiMutation('castVote');
  const [chosenCategory, setCategoryId] = useState(null);

  const categoryOptions = data.categories.map((category) => ({ value: category.id, label: category.label }));
  const categoryId = data.categories.some((item) => item.id === chosenCategory) ? chosenCategory : data.categories[0]?.id;
  const category = data.categories.find((item) => item.id === categoryId);
  const myVote = data.userVotes?.[categoryId] ?? null;

  // `votes` from the API already include the visitor's own vote.
  const ranked = useMemo(
    () =>
      (category?.entries ?? [])
        .map((entry) => ({ ...entry, total: entry.votes }))
        .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name)),
    [category],
  );

  const ceiling = Math.max(1, ranked[0]?.total ?? 1) * 1.55;
  const register = useFlipList(`${categoryId}:${ranked.map((entry) => entry.id).join('|')}`);

  const vote = async (entry) => {
    const removing = myVote === entry.id;
    const nextEntryId = removing ? null : entry.id;
    const before = getQueryData('votes', {});
    setQueryData('votes', {}, (current) => applyVote(current, categoryId, nextEntryId));

    if (removing) showToast(`Vote removed from ${entry.name}.`, { tone: 'info' });
    else if (myVote) showToast(`Vote moved to ${entry.name}.`);
    else showToast(`Voted for ${entry.name}.`);

    try {
      const confirmed = await castVote.mutate({ categoryId, entryId: nextEntryId }); // POST /votes
      if (confirmed?.categories) setQueryData('votes', {}, confirmed);
    } catch {
      setQueryData('votes', {}, before);
      showToast('Your vote could not be saved. Please try again.', { tone: 'info' });
    }
  };

  if (!category) return null;

  return (
    <>

      <SegmentedControl
        label="Vote category"
        options={categoryOptions}
        value={categoryId}
        onChange={setCategoryId}
        tone="light"
        mode="tabs"
        idPrefix="votes"
        size="sm"
        className="max-w-full overflow-x-auto scrollbar-none"
      />

      <ol
        id="votes-panel"
        role="tabpanel"
        aria-labelledby={`votes-tab-${categoryId}`}
        className="relative mt-10 border-t border-line"
      >
        {ranked.map((entry, index) => {
          const mine = myVote === entry.id;
          return (
            <li
              key={entry.id}
              ref={register(entry.id)}
              className={cn(
                'grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 border-b border-line px-2 py-4 transition-colors sm:grid-cols-[40px_minmax(0,280px)_minmax(0,1fr)_56px_64px] sm:gap-x-5 sm:px-3',
                mine ? 'bg-gold/[0.08]' : 'bg-ink-800',
              )}
            >
              <span className="text-[13px] font-semibold tabular-nums text-accent">{String(index + 1).padStart(2, '0')}</span>
              <span className="flex min-w-0 items-center gap-3">
                <Avatar initials={entry.initials} tone="slate" size="sm" />
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-bold text-fg">{entry.name}</span>
                  <span className={cn('block text-xs', mine ? 'font-semibold text-mint-ink' : 'text-fg-muted')}>
                    {mine ? 'Your vote' : 'Click to vote'}
                  </span>
                </span>
              </span>
              <span className="col-span-3 col-start-1 row-start-2 block h-1.5 overflow-hidden rounded-full bg-line sm:col-span-1 sm:col-start-auto sm:row-start-auto" aria-hidden="true">
                <span
                  className="block h-full rounded-full bg-gold-bar transition-[width] duration-500"
                  style={{ width: `${(entry.total / ceiling) * 100}%` }}
                />
              </span>
              <span className="hidden text-right font-sans text-base font-extrabold tabular-nums text-fg sm:block">{entry.total}</span>
              <span className="flex items-center justify-end gap-3">
                <span className="font-sans text-base font-extrabold tabular-nums text-fg sm:hidden">{entry.total}</span>
                <button
                  type="button"
                  onClick={() => vote(entry)}
                  aria-pressed={mine}
                  aria-label={mine ? `Remove your vote for ${entry.name}` : `Vote for ${entry.name}`}
                  className={cn(
                    'caps inline-flex h-9 w-14 items-center justify-center text-[11px] font-extrabold transition-colors',
                    mine ? 'bg-gold text-navy hover:bg-gold-hover' : 'border border-line-strong text-fg hover:border-gold',
                  )}
                >
                  {mine ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : 'Vote'}
                </button>
              </span>
            </li>
          );
        })}
      </ol>
    </>
  );
}

export function CommunityPick() {
  // GET /votes → { categories, userVotes }
  const votesQuery = useApiQuery('votes');
  return (
    <Section id="community-pick" tone={900} aria-labelledby="community-title">
      <SectionHeader
        eyebrow="Community pick"
        title="Vote for the brand you want to see more"
        accent="want to see more"
        titleId="community-title"
        description="One vote in each category. You can move your vote at any time, and the ranking reorders as it changes."
      />
      <QueryState
        query={votesQuery}
        errorTitle="Couldn’t load the community vote."
        skeleton={
          <div className="space-y-3">
            <Skeleton className="h-10 w-80" />
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        }
      >
        {(data) => <VoteBoard data={data} />}
      </QueryState>
    </Section>
  );
}
