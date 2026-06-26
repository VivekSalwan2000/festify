/** Shared formatting helpers used across app and organizer dashboards. */

export function formatTime(time) {
  if (!time) return '';
  const [hour, minute] = time.split(':');
  const hourNum = parseInt(hour, 10);
  const suffix = hourNum >= 12 ? 'PM' : 'AM';
  const formattedHour = hourNum % 12 || 12;
  return `${formattedHour}:${minute} ${suffix}`;
}

export function formatDate(dateString) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
}
