import { IHistory } from '../../../../../models/IHistory';
import { formatDayLabel } from '../../../../../utils/date';

export type TimelineRow =
  | { key: string; type: 'header'; label: string }
  | { key: string; type: 'item'; history: IHistory };

export const buildTimelineRows = (items: IHistory[]): TimelineRow[] => {
  if (!items.length) return [];

  const groupedByDate = new Map<string, IHistory[]>();
  
  items.forEach(item => {
    const label = formatDayLabel(item.createdAt);
    if (!groupedByDate.has(label)) {
      groupedByDate.set(label, []);
    }
    groupedByDate.get(label)!.push(item);
  });

  const rows: TimelineRow[] = [];
  
  for (const [label, entries] of groupedByDate.entries()) {
    rows.push({ key: `header-${label}`, type: 'header', label });
    entries.forEach(entry => {
      rows.push({ key: `item-${entry.id}`, type: 'item', history: entry });
    });
  }

  return rows;
};

