import { useThemeStore } from '@/store/themeStore'

const LIGHT_PALETTE = {
  accent: 'rgb(79 70 229)',
  success: 'rgb(22 163 74)',
  warning: 'rgb(217 119 6)',
  danger: 'rgb(220 38 38)',
  info: 'rgb(8 145 178)',
  neutral: 'rgb(161 161 170)',
  grid: 'rgb(228 228 231)',
  text: 'rgb(82 82 91)',
}

const DARK_PALETTE = {
  accent: 'rgb(129 122 255)',
  success: 'rgb(74 222 128)',
  warning: 'rgb(250 176 5)',
  danger: 'rgb(248 113 113)',
  info: 'rgb(56 189 248)',
  neutral: 'rgb(113 113 122)',
  grid: 'rgb(54 54 58)',
  text: 'rgb(186 186 192)',
}

export function useChartPalette() {
  const theme = useThemeStore((s) => s.theme)
  return theme === 'dark' ? DARK_PALETTE : LIGHT_PALETTE
}
