// 게시물 카테고리-키워드 매칭용 데이터. UI 문구가 아니라 한국어 콘텐츠 매칭 규칙이다.
import type { PostCategory } from '../store/appStore'

export const CATEGORY_KEYWORDS: Record<PostCategory, string[]> = {
  habit: ['기상', '운동', '스트레칭', '명상', '걷기', '러닝', '달리기', '요가', '샤워', '산책', '독서', '습관'],
  diet: ['식사', '단백질', '물', '영양제', '샐러드', '아침', '점심', '저녁식사', '식단', '칼로리', '다이어트'],
  reflection: ['오늘', '루틴', '내일', '돌아보', '반성', '회고', '느낀', '생각'],
  routine: ['루틴', '공유', '그룹', '함께', '팀', '챌린지'],
}
