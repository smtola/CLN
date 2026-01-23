export const formatCurrency = (amount?: number | null, currency: string = 'USD'): string => {
  if (amount == null || isNaN(amount)) return '-';
  const symbols: Record<string, string> = {
    USD: '$',
    KHR: '៛',
    THB: '฿',
    VND: '₫',
  };
  const symbol = symbols[currency] || '$';
  return `${symbol}${amount.toFixed(2)}`;
};

export const formatWeight = (weight?: number | null): string => {
  if (weight == null || isNaN(weight)) return '-';
  return `${weight.toFixed(2)} KGS`;
};

export const formatDistance = (distance?: number | null): string => {
  if (distance == null || isNaN(distance)) return '-';
  return `${distance.toFixed(2)} KM`;
};

export const formatDimensions = (dimensions?: number[]): string => {
  if (!dimensions || dimensions.length !== 3) return 'N/A';
  return `${dimensions[0]} × ${dimensions[1]} × ${dimensions[2]} cm`;
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const formatRelativeTime = (dateString?: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(dateString);
};

export const formatPercentage = (value?: number | null): string => {
  if (value == null || isNaN(value)) return '-';
  return `${value.toFixed(1)}%`;
};

export const capitalizeFirst = (str?: string): string => {
  if (!str) return '_';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateText = (text?: string, maxLength: number = 50): string => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
