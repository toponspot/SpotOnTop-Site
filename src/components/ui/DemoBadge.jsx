import { Badge } from './Badge';

/**
 * "Sample data · demo". Shown next to every live widget while the API says mode = "demo".
 * A real API returns mode = "live" and the badge disappears, with no other change.
 * `data` is the API response that fed the widget.
 */
export function DemoBadge({ data, className }) {
    if (data?.mode !== 'demo') return null;
    return (
        <Badge tone="pending" size="sm" className={`normal-case tracking-normal ${className ?? ''}`}>
            {data.badge || 'Sample data · demo'}
        </Badge>
    );
}
