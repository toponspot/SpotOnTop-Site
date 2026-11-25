import { useRef, useState } from 'react';
import { ArrowRight, Check, CheckCircle2, Loader2 } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useApiMutation } from '../../hooks/useApiMutation';
import { useApiQuery } from '../../hooks/useApiQuery';
import { usesDemoData } from '../../config/api.config';
import { rules, validate } from '../../utils/validation';
import { Button } from '../ui/Button';
import { SelectField, TextField } from '../ui/Field';
import { Container } from '../ui/Container';

const EMPTY = { firstName: '', lastName: '', email: '', role: '' };

const RULES = {
  firstName: rules.required('your first name'),
  lastName: rules.required('your last name'),
  email: rules.email,
  role: (value) => (value ? '' : 'Choose how you are joining.'),
};

export function JoinWaitlist() {
  const { showToast } = useUI();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(null);
  const refs = { firstName: useRef(null), lastName: useRef(null), email: useRef(null), role: useRef(null) };

  const onChange = (field) => (event) => {
    const value = event.target.value;
    setValues((current) => ({ ...current, [field]: value }));
    if (touched[field]) setErrors((current) => ({ ...current, [field]: RULES[field](value) }));
  };

  const onBlur = (field) => () => {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors((current) => ({ ...current, [field]: RULES[field](values[field]) }));
  };

  // GET /waitlist/options → { roles, perks }  ·  POST /waitlist
  const optionsQuery = useApiQuery('waitlistOptions');
  const roles = optionsQuery.data?.roles ?? [];
  const perks = optionsQuery.data?.perks ?? [];
  const join = useApiMutation('joinWaitlist');

  const onSubmit = async (event) => {
    event.preventDefault();
    const found = validate(values, RULES);
    setErrors(found);
    setTouched({ firstName: true, lastName: true, email: true, role: true });
    const firstInvalid = Object.keys(RULES).find((field) => found[field]);
    if (firstInvalid) {
      refs[firstInvalid].current?.focus();
      return;
    }
    const payload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      role: values.role,
    };
    try {
      await join.mutate(payload);
    } catch {
      return; // join.error is shown above the submit button
    }
    const role = roles.find((item) => item.value === values.role);
    setSubmitted({ firstName: payload.firstName, role: (role?.label ?? values.role).toLowerCase() });
    showToast(`You're on the demo waitlist, ${payload.firstName}.`);
  };

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    setTouched({});
    setSubmitted(null);
    join.reset();
  };

  return (
    <section id="join" aria-labelledby="join-title" className="bg-gradient-to-br from-gold-hover to-gold-deep py-20 text-navy sm:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,660px)]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy/80 sm:text-[13px]">Join Spot On Top</p>
          <h2 id="join-title" className="mt-4 text-[40px] font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-[56px] lg:text-[64px]">
            Make your next
            <br />
            move visible.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-navy/85 sm:text-lg">
            Join the demo waitlist as a brand, creator or advertising partner and explore what the marketplace could become.
          </p>
          <ul className="mt-8 space-y-4">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-[15px] font-medium">
                <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <div className="force-dark bg-ink-900 p-6 text-fg sm:p-7">
          {submitted ? (
            <div className="flex min-h-[360px] animate-scale-in flex-col items-center justify-center text-center" role="status">
              <CheckCircle2 className="h-12 w-12 text-mint-ink" aria-hidden="true" />
              <h3 className="mt-5 text-2xl font-extrabold">You’re on the demo waitlist, {submitted.firstName}.</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-fg-muted">
                We noted you’re joining as {submitted.role}. {usesDemoData('joinWaitlist') ? 'This is a prototype, so nothing was stored or sent.' : 'We’ll be in touch soon.'}
              </p>
              <Button variant="outline" className="mt-7" onClick={reset}>
                Add another person
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate aria-describedby="join-note">
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  ref={refs.firstName}
                  id="join-first"
                  label="First name"
                  placeholder="First name"
                  autoComplete="given-name"
                  value={values.firstName}
                  onChange={onChange('firstName')}
                  onBlur={onBlur('firstName')}
                  error={errors.firstName}
                  surface="raised"
                />
                <TextField
                  ref={refs.lastName}
                  id="join-last"
                  label="Last name"
                  placeholder="Last name"
                  autoComplete="family-name"
                  value={values.lastName}
                  onChange={onChange('lastName')}
                  onBlur={onBlur('lastName')}
                  error={errors.lastName}
                  surface="raised"
                />
              </div>
              <TextField
                ref={refs.email}
                id="join-email"
                className="mt-5"
                type="email"
                label="Work email"
                placeholder="you@company.com"
                autoComplete="email"
                value={values.email}
                onChange={onChange('email')}
                onBlur={onBlur('email')}
                error={errors.email}
                surface="raised"
              />
              <SelectField
                ref={refs.role}
                id="join-role"
                className="mt-5"
                label="I’m joining as"
                placeholder="Select a role"
                options={roles}
                disabled={roles.length === 0}
                value={values.role}
                onChange={onChange('role')}
                onBlur={onBlur('role')}
                error={errors.role}
                surface="raised" inputClassName="text-base"
              />
              {join.error && (
                <p role="alert" className="mt-5 text-sm font-semibold text-coral-ink">
                  {join.error.message || 'Something went wrong. Please try again.'}
                </p>
              )}
              <Button type="submit" variant="light" size="md" className="mt-7 w-full" disabled={join.isLoading}>
                {join.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Joining…
                  </>
                ) : (
                  <>
                    Join the demo waitlist <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </Button>
              <p id="join-note" className="mt-5 text-[11px] text-fg-muted">
                {usesDemoData('joinWaitlist')
                  ? 'Prototype only. This form does not store or send your information.'
                  : 'We only use your details to contact you about Spot On Top.'}
              </p>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
