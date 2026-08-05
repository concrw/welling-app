const PALETTE = ['#374151', '#0984E3', '#00B894', '#6C5CE7', '#B45309', '#047857', '#0369A1', '#7C3AED']
export function getColor(name: string) { return PALETTE[name.charCodeAt(0) % PALETTE.length] }
export function getInitials(name: string) { return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() }
