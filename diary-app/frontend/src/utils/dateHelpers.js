export function formatDate(date, style = 'medium') {
  const d = typeof date === 'string' ? new Date(date + 'T12:00:00') : date;
  if (isNaN(d.getTime())) return 'Unknown date';

  if (style === 'long') {
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  if (style === 'medium') {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  if (style === 'short') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return d.toISOString().slice(0, 10);
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning.';
  if (h < 17) return 'Good afternoon.';
  return 'Good evening.';
}

export function toInputDate(dateStr) {
  if (!dateStr) return '';
  return dateStr.slice(0, 10);
}
