const ko = {
  logoAlt: 'welling',
  allTab: 'All',
  quietBanner: (n: number) => `${n}일째 기록이 없어요. 오늘 기록해볼까요?`,
}

const en: typeof ko = {
  logoAlt: 'welling',
  allTab: 'All',
  quietBanner: (n: number) => `No records for ${n} days. How about logging one today?`,
}

export const feed = { ko, en }
