const ko = {
  logoAlt: 'welling',
  allTab: 'All',
  quietBanner: (n: number) => `${n}일째 기록이 없어요. 오늘 기록해볼까요?`,
  createGroupButton: '+ 그룹',
}

const en: typeof ko = {
  logoAlt: 'welling',
  allTab: 'All',
  quietBanner: (n: number) => `No records for ${n} days. How about logging one today?`,
  createGroupButton: '+ Group',
}

export const feed = { ko, en }
