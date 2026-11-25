import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Clock3, Info, Loader2 } from 'lucide-react';
import { useUI } from '../../../context/UIContext';
import { useApiMutation } from '../../../hooks/useApiMutation';
import { useApiQuery } from '../../../hooks/useApiQuery';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion';
import { setQueryData } from '../../../services/queryStore';
import { cn } from '../../../utils/cn';
import { rules, validate } from '../../../utils/validation';
import { QueryState, Skeleton } from '../../ui/AsyncState';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { TextArea, TextField } from '../../ui/Field';
import { Section } from '../../ui/Section';
import { SectionHeader } from '../../ui/SectionHeader';
import { SegmentedControl } from '../../ui/SegmentedControl';
import { HomeBannerPreview, InstagramPreview, ListingPreview } from './Previews';


const PITCH_MAX = 90;

const PLACEMENTS = [
  { id: 'directory', label: 'Brand directory listing', tab: 'listing' },
  { id: 'instagram', label: 'Instagram post preview', tab: 'instagram' },
  { id: 'banner', label: 'Home banner', tab: 'banner' },
];

const TABS = [
  { value: 'instagram', label: 'Instagram post', heading: 'Instagram post preview', meta: 'Feed format · 1:1', placement: 'instagram' },
  { value: 'listing', label: 'Website listing', heading: 'Website listing preview', meta: 'Brand Directory', placement: 'directory' },
  { value: 'banner', label: 'Home banner', heading: 'Home banner preview', meta: 'Home · Featured', placement: 'banner' },
];

const RULES = {
  name: rules.combine(rules.required('your brand name'), rules.maxLength('the brand name', 40)),
  pitch: rules.combine(rules.required('a one-line pitch'), rules.maxLength('the pitch', PITCH_MAX)),
  email: rules.email,
};

const STATUS_UI = {
  completed: { badge: 'done', label: 'Completed', icon: CheckCircle2, iconClass: 'text-mint-ink' },
  updating: { badge: 'iris', label: 'Updating', icon: Loader2, iconClass: 'text-accent animate-spin' },
  pending: { badge: 'pending', label: 'Pending', icon: Clock3, iconClass: 'text-gold' },
};

const sameBrand = (a, b) => a.name === b.name && a.pitch === b.pitch && a.email === b.email;

function BrandPanelForm({ profile }) {
  const { showToast } = useUI();
  const reduced = usePrefersReducedMotion();
  const initial = { name: profile.name ?? '', pitch: profile.pitch ?? '', email: profile.email ?? '' };
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState({});
  const [published, setPublished] = useState({ directory: profile, instagram: profile, banner: profile });
  const [status, setStatus] = useState({ directory: 'completed', instagram: 'pending', banner: 'pending' });
  const [lastSaved, setLastSaved] = useState(initial);
  const save = useApiMutation('saveBrandProfile'); // PUT /brand-profile
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('instagram');
  const timers = useRef([]);
  const fieldRefs = { name: useRef(null), pitch: useRef(null), email: useRef(null) };

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const update = (field) => (event) => {
    const value = event.target.value;
    setDraft((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: RULES[field](value) }));
  };

  const onBlur = (field) => () => {
    if (draft[field] !== lastSaved[field]) setErrors((current) => ({ ...current, [field]: RULES[field](draft[field]) }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const found = validate(draft, RULES);
    setErrors(found);
    const firstInvalid = Object.keys(RULES).find((field) => found[field]);
    if (firstInvalid) {
      fieldRefs[firstInvalid].current?.focus();
      return;
    }

    const payload = { name: draft.name.trim(), pitch: draft.pitch.trim(), email: draft.email.trim() };
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setDraft(payload);
    setSaving(true);
    const previousStatus = status;
    setStatus({ directory: 'pending', instagram: 'pending', banner: 'pending' });

    let saved;
    try {
      // The server's copy is the source of truth for what each placement shows.
      saved = { ...profile, ...payload, ...(await save.mutate(payload)) };
    } catch {
      setSaving(false);
      setStatus(previousStatus);
      return; // save.error is shown under the button
    }
    const snapshot = saved;
    setLastSaved({ name: saved.name, pitch: saved.pitch, email: saved.email });
    setQueryData('brandProfile', {}, saved);

    const step = reduced ? 350 : 1100;
    PLACEMENTS.forEach((placement, index) => {
      const startAt = index * step + 150;
      timers.current.push(
        window.setTimeout(() => {
          setStatus((current) => ({ ...current, [placement.id]: 'updating' }));
          setTab(placement.tab);
        }, startAt),
        window.setTimeout(() => {
          setPublished((current) => ({ ...current, [placement.id]: snapshot }));
          setStatus((current) => ({ ...current, [placement.id]: 'completed' }));
          if (index === PLACEMENTS.length - 1) {
            setSaving(false);
            showToast('Saved. All three placements now show your latest details.');
          }
        }, startAt + step - 250),
      );
    });
  };

  const completedCount = PLACEMENTS.filter((placement) => status[placement.id] === 'completed').length;
  const dirty = !sameBrand(draft, lastSaved);
  const activeTab = TABS.find((item) => item.value === tab);
  const activeStatus = status[activeTab.placement];
  const previewBrand = published[activeTab.placement];

  return (
    <>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] lg:items-stretch">
        <div className="min-w-0 border border-line bg-ink-800 p-5 sm:p-6">
          <form onSubmit={onSubmit} noValidate>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold tracking-[-0.01em] text-fg">Your brand details</h3>
                <p className="mt-1 text-[13px] text-fg-muted">One source for every brand placement.</p>
              </div>
              {dirty && !saving && (
                <Badge tone="pending" dot size="sm">
                  Unsaved changes
                </Badge>
              )}
            </div>
            <div className="mt-6 space-y-5">
              <TextField
                ref={fieldRefs.name}
                id="panel-name"
                label="Brand name"
                value={draft.name}
                onChange={update('name')}
                onBlur={onBlur('name')}
                error={errors.name}
                maxLength={48}
                autoComplete="organization"
              />
              <TextArea
                ref={fieldRefs.pitch}
                id="panel-pitch"
                label="One-line pitch"
                value={draft.pitch}
                onChange={update('pitch')}
                onBlur={onBlur('pitch')}
                error={errors.pitch}
                rows={3}
                counter={
                  <span className={cn('text-xs tabular-nums', draft.pitch.length > PITCH_MAX ? 'text-coral-ink' : 'text-fg-subtle')}>
                    {draft.pitch.length}/{PITCH_MAX}
                  </span>
                }
              />
              <TextField
                ref={fieldRefs.email}
                id="panel-email"
                type="email"
                label="Contact email"
                value={draft.email}
                onChange={update('email')}
                onBlur={onBlur('email')}
                error={errors.email}
                autoComplete="email"
              />
            </div>
            <Button type="submit" size="lg" className="mt-6 w-full" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Updating placements
                </>
              ) : (
                'Save and update everywhere'
              )}
            </Button>
            {save.error && (
              <p role="alert" className="mt-3 text-center text-sm font-semibold text-coral-ink">
                {save.error.message || 'Your changes could not be saved. Please try again.'}
              </p>
            )}
            <p className="mt-2.5 text-center text-xs text-fg-muted">Applies your details to all three placements.</p>
          </form>

          <div className="mt-8 border-t border-line pt-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-fg">Placement status</h4>
              <p className="text-xs text-fg-muted" aria-live="polite">
                {completedCount} of {PLACEMENTS.length} completed
              </p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2" aria-hidden="true">
              {PLACEMENTS.map((placement) => (
                <span
                  key={placement.id}
                  className={cn(
                    'h-1 transition-colors duration-300',
                    status[placement.id] === 'completed' && 'bg-mint/80',
                    status[placement.id] === 'updating' && 'animate-pulse bg-gold',
                    status[placement.id] === 'pending' && 'bg-line-strong',
                  )}
                />
              ))}
            </div>
            <ul className="mt-5 space-y-3">
              {PLACEMENTS.map((placement) => {
                const ui = STATUS_UI[status[placement.id]];
                const Icon = ui.icon;
                return (
                  <li key={placement.id}>
                    <button
                      type="button"
                      onClick={() => setTab(placement.tab)}
                      className="flex w-full items-center gap-3 rounded-lg py-1.5 text-left text-sm text-fg transition-colors hover:text-accent"
                    >
                      <Icon className={cn('h-[18px] w-[18px] shrink-0', ui.iconClass)} aria-hidden="true" />
                      <span className="flex-1">{placement.label}</span>
                      <Badge tone={ui.badge} size="sm">
                        {ui.label}
                      </Badge>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="flex min-w-0 flex-col border border-line bg-ink-800 p-3 sm:p-5">
          <SegmentedControl
            label="Preview placement"
            options={TABS}
            value={tab}
            onChange={setTab}
            mode="tabs"
            idPrefix="panel-preview"
            shape="rounded"
            stretch
            className="!border-transparent !bg-transparent p-0"
            itemClassName="h-10 min-w-0 whitespace-normal px-1.5 text-[11px] leading-tight sm:px-2 sm:text-[13px]"
          />
          <div className="mt-3 border-t border-line" />
          <div id="panel-preview-panel" role="tabpanel" aria-labelledby={`panel-preview-tab-${tab}`} className="flex flex-1 flex-col px-1 pt-5 sm:px-3">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[15px] font-bold text-fg">{activeTab.heading}</p>
              <p className="text-xs text-fg-muted">{activeTab.meta}</p>
            </div>
            <div className="relative">
              <div key={`${tab}-${previewBrand.name}-${previewBrand.pitch}-${previewBrand.email}`} className="animate-fade-in">
                {tab === 'instagram' && <InstagramPreview brand={previewBrand} />}
                {tab === 'listing' && <ListingPreview brand={previewBrand} />}
                {tab === 'banner' && <HomeBannerPreview brand={previewBrand} />}
              </div>
              {activeStatus === 'updating' && (
                <div className="absolute inset-0 flex animate-fade-in items-center justify-center bg-ink-800/60 backdrop-blur-[2px]">
                  <span className="inline-flex items-center gap-2 border border-line bg-ink-900 px-4 py-2 text-sm font-semibold text-fg">
                    <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden="true" />
                    Updating {activeTab.label.toLowerCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
          <p className="mt-6 flex items-center justify-center gap-1.5 border-t border-line pt-4 text-center text-xs text-fg-muted">
            <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Example creative only · Not published or connected to a live account
          </p>
        </div>
      </div>
    </>
  );
}

export function BrandPanel() {
  // GET /brand-profile
  const profileQuery = useApiQuery('brandProfile');
  return (
    <Section id="banner-panel" tone={800} aria-labelledby="panel-title">
      <SectionHeader
        eyebrow="Brand panel"
        title="Edit once, update everywhere"
        accent="update everywhere"
        titleId="panel-title"
        description="Change your details here. Save, and watch each place your brand appears update in turn."
      />
      <QueryState
        query={profileQuery}
        errorTitle="Couldn’t load your brand details."
        skeleton={
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)]">
            <Skeleton className="h-[640px] rounded-sm" />
            <Skeleton className="h-[640px] rounded-sm" />
          </div>
        }
      >
        {(profile) => <BrandPanelForm profile={profile} />}
      </QueryState>
    </Section>
  );
}
