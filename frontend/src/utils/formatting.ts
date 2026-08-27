export function formatRelativeTime(dateString: string): string {
  if (!dateString) return 'Just now';
  const now = new Date().getTime();
  const past = new Date(dateString).getTime();
  const diffSec = Math.max(0, Math.floor((now - past) / 1000));

  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}

export function formatTimeHHMM(dateString: string): string {
  if (!dateString) return '--:--';
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function getStatusColor(status: string): { bg: string; text: string; border: string } {
  switch (status.toLowerCase()) {
    case 'active':
    case 'safe':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'at risk':
    case 'at_risk':
    case 'medium':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'breach':
    case 'critical':
    case 'high':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
    case 'offline':
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' };
  }
}
