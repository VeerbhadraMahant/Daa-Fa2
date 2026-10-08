// Channel identity is data, not decoration: soft marker-pen fills, always drawn
// with charcoal outlines/text and paired with a "CHn" label (never color alone).
export const CHANNEL_COLORS = ['#ffb48a', '#f6d86b', '#b9d9a3', '#a8cfe6', '#d9bdee', '#f4a9bd', '#93d6c6', '#e3c9a2']
export const channelColor = (ch: number | null | undefined) =>
  ch ? CHANNEL_COLORS[(ch - 1) % CHANNEL_COLORS.length] : '#f7efe9'
