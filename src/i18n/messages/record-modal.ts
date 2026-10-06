const ko = {
  // Quick post
  quickDiet: '🍽️ 먹었어',
    quickExercise: '💪 운동했어',
    quickPostContent: (category: 'diet' | 'exercise', time: string) => 
      category === 'diet' ? `점심 먹었어 · ${time}` : `운동했어 · ${time}`,
    recordingTo: (groupName: string) => `${groupName}에 기록`,
    
    // Buttons
    photo: '📷 사진',
    submit: '기록',
    uploading: '업로드 중...',
    
    // Toggle
    showMore: '▼ 더보기 (카테고리, 공개범위, 인스타그램 등)',
    showLess: '▲ 간단히',
    
  // Dropdowns
  noGroup: '그룹 없음',
}

export const recordModal = { ko, en: ko }
