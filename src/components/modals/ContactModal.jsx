import { Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { Avatar, initialsFrom } from '../ui/Avatar';
import { usesDemoData } from '../../config/api.config';
import { Button } from '../ui/Button';
import { CopyButton } from '../ui/CopyButton';
import { Modal } from '../ui/Modal';

/** Brand contact card, opened from banners ("See contact") across the page. */
export function ContactModal({ contact, onClose }) {
  const open = Boolean(contact);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={contact ? `Contact ${contact.brand}` : 'Contact'}
      description="Contact cards are kept current by the brand and update within 24 hours."
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {contact && (
            <Button as="a" href={`mailto:${contact.email}?subject=${encodeURIComponent(`Enquiry via Spot On Top`)}`}>
              <Mail className="h-4 w-4" aria-hidden="true" />
              Email {contact.name.split(' ')[0]}
            </Button>
          )}
        </div>
      }
    >
      {contact && (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar initials={initialsFrom(contact.name)} tone="gold" size="md" />
            <div>
              <p className="text-lg font-extrabold">{contact.name}</p>
              <p className="text-sm text-fg-muted">
                {contact.role}, {contact.brand}
              </p>
            </div>
          </div>
          <dl className="divide-y divide-line border border-line bg-ink-900">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <dt className="flex items-center gap-2 text-sm text-fg-muted">
                <Mail className="h-4 w-4" aria-hidden="true" /> Email
              </dt>
              <dd className="flex items-center gap-2">
                <a href={`mailto:${contact.email}`} className="text-sm font-semibold text-fg hover:text-accent">
                  {contact.email}
                </a>
                <CopyButton text={contact.email} />
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <dt className="flex items-center gap-2 text-sm text-fg-muted">
                <Phone className="h-4 w-4" aria-hidden="true" /> Phone
              </dt>
              <dd>
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="text-sm font-semibold text-fg hover:text-accent">
                  {contact.phone}
                </a>
              </dd>
            </div>
            {contact.city && (
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <dt className="flex items-center gap-2 text-sm text-fg-muted">
                  <MapPin className="h-4 w-4" aria-hidden="true" /> Based in
                </dt>
                <dd className="text-sm font-semibold text-fg">{contact.city}</dd>
              </div>
            )}
          </dl>
          {contact.pitch && <p className="text-sm leading-relaxed text-fg-muted">{contact.pitch}</p>}
          <p className="flex items-start gap-2 text-xs text-fg-subtle">
            <ShieldCheck className="mt-px h-4 w-4 shrink-0 text-mint-ink" aria-hidden="true" />
            {usesDemoData('brands') ? 'Verified demo brand. These are placeholder details and nothing is sent.' : 'Verified brand. Contact details are kept current by the brand.'}
          </p>
        </div>
      )}
    </Modal>
  );
}
