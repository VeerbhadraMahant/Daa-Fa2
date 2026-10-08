export const CHANNEL_COLORS = ['#22d3ee', '#f472b6', '#a3e635', '#fbbf24', '#a78bfa', '#fb923c', '#2dd4bf', '#f87171']
export const channelColor = (ch: number | null | undefined) =>
  ch ? CHANNEL_COLORS[(ch - 1) % CHANNEL_COLORS.length] : '#64748b'
