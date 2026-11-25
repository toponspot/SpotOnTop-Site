import { Badge } from './Badge';
import { cn } from '../../utils/cn';

export const FOUNDING_BADGE_TEXT = 'Founding rate · limited places';

/** Yellow outlined eyebrow tag shown under a price while the founding offer is on (launch mode). */
export function FoundingBadge({ className }) {
  return (
    <Badge tone="pending" size="sm" className={cn('self-start', className)}>
      {FOUNDING_BADGE_TEXT}
    </Badge>
  );
}
