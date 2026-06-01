export interface SurveyQuestionTemplate {
  id: number;
  text: string;
  type: 'number' | 'text';
}

export const NUMBER_QUESTIONS: SurveyQuestionTemplate[] = [
  { id: 101, text: '네 신발의 크기는 얼마인가?', type: 'number' },
  { id: 102, text: '네가 가장 좋아하는 숫자를 고하라.', type: 'number' },
  { id: 103, text: '오늘 네가 걸은 걸음 수는 얼마인가?', type: 'number' },
  { id: 104, text: '지금 이 순간 네 지갑 속 현금은 얼마인가?', type: 'number' },
  { id: 105, text: '네 형제자매는 몇이나 되는가?', type: 'number' },
  { id: 106, text: '마지막으로 입에 넣은 음식의 칼로리를 짐작해 고하라.', type: 'number' },
  { id: 107, text: '지금 창밖의 기온은 몇 도인가?', type: 'number' },
  { id: 108, text: '최근 읽은 책이나 웹툰의 페이지 수를 고하라.', type: 'number' },
  { id: 109, text: '네가 가장 최근에 구입한 물건의 가격은 얼마인가?', type: 'number' },
  { id: 110, text: '지금 이 순간 네 기기의 배터리 잔량은 몇 퍼센트인가?', type: 'number' },
  { id: 111, text: '지금 네가 있는 방에 의자는 몇 개 있는가?', type: 'number' },
  { id: 112, text: '오늘 네가 마신 물의 양은 몇 밀리리터인가?', type: 'number' },
  { id: 113, text: '네가 가장 오래 플레이한 게임의 시간은 몇 시간인가?', type: 'number' },
  { id: 114, text: '네 지갑 속에 카드는 몇 장인가?', type: 'number' },
  { id: 115, text: '네 집에 식물이 몇 그루 있는가?', type: 'number' },
  { id: 116, text: '지금 냉장고 안에 달걀이 몇 개 남아있는가?', type: 'number' },
  { id: 117, text: '마지막으로 운동한 게 며칠 전인가?', type: 'number' },
  { id: 118, text: '지금 이 순간 열린 탭은 몇 개인가?', type: 'number' },
  { id: 119, text: '네 책상 위에 물건이 몇 개나 있는가?', type: 'number' },
  { id: 120, text: '지금 입은 옷에 주머니가 몇 개인가?', type: 'number' },
  { id: 121, text: '지금 네 화면 밝기는 몇 퍼센트인가?', type: 'number' },
  { id: 122, text: '지금 이 순간의 시각에서 분(分)은 몇인가?', type: 'number' },
  { id: 123, text: '네가 마지막으로 산 식료품 영수증 금액은 얼마인가?', type: 'number' },
  { id: 124, text: '네가 가장 자주 가는 편의점까지 걸음 수를 고하라.', type: 'number' },
  { id: 125, text: '지금 네 집에 있는 방의 수는 몇인가?', type: 'number' },
];

export const TEXT_QUESTIONS: SurveyQuestionTemplate[] = [
  { id: 201, text: '네가 가장 싫어하는 색깔은 무엇인가?', type: 'text' },
  { id: 202, text: '어릴 적 네가 품었던 꿈을 고하라.', type: 'text' },
  { id: 203, text: '마지막으로 입에 담은 거짓말의 내용을 고하라.', type: 'text' },
  { id: 204, text: '네가 가장 두려워하는 것을 고하라.', type: 'text' },
  { id: 205, text: '지금 네 기분을 날씨로 표현하라.', type: 'text' },
  { id: 206, text: '네 기억 중 가장 오래된 것을 고하라.', type: 'text' },
  { id: 207, text: '버리지 못하고 간직하는 물건이 있는가? 고하라.', type: 'text' },
  { id: 208, text: '죽기 전 반드시 하고 싶은 일을 고하라.', type: 'text' },
  { id: 209, text: '지금 당장 가장 먹고 싶은 것을 고하라.', type: 'text' },
  { id: 210, text: '살면서 가장 후회되는 선택을 고하라.', type: 'text' },
  { id: 211, text: '살면서 가장 운이 좋았다고 느낀 순간을 고하라.', type: 'text' },
  { id: 212, text: '지금 이 순간 가장 갖고 싶은 것을 고하라.', type: 'text' },
  { id: 213, text: '어린 시절 네가 가장 무서워한 것을 고하라.', type: 'text' },
  { id: 214, text: '누군가에게 말하지 못한 비밀 하나를 고하라.', type: 'text' },
  { id: 215, text: '다시 태어난다면 바꾸고 싶은 것 하나를 고하라.', type: 'text' },
  { id: 216, text: '지금 가장 피하고 싶은 사람의 특징을 고하라.', type: 'text' },
  { id: 217, text: '마지막으로 눈물을 흘렸던 이유를 고하라.', type: 'text' },
  { id: 218, text: '자신을 동물에 비유한다면 무엇인가?', type: 'text' },
  { id: 219, text: '지금 이 순간 머릿속에 떠오르는 단어 하나를 고하라.', type: 'text' },
  { id: 220, text: '가장 자주 꾸는 꿈의 내용을 간략히 고하라.', type: 'text' },
  { id: 221, text: '가장 소중한 물건을 잃어버린 경험이 있다면 고하라.', type: 'text' },
  { id: 222, text: '지금 당장 사라지고 싶은 곳이 있다면 어디인가?', type: 'text' },
  { id: 223, text: '네 가장 나쁜 습관은 무엇인가?', type: 'text' },
  { id: 224, text: '지금 이 순간 곁에 있었으면 하는 것을 고하라.', type: 'text' },
  { id: 225, text: '살면서 가장 창피했던 순간을 고하라.', type: 'text' },
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickSurveyQuestions(): SurveyQuestionTemplate[] {
  const numbers = shuffle(NUMBER_QUESTIONS).slice(0, 3);
  const texts = shuffle(TEXT_QUESTIONS).slice(0, 2);
  // 숫자 2개 → 텍스트 1개 → 숫자 1개 → 텍스트 1개 순서로 배치
  return [numbers[0], numbers[1], texts[0], numbers[2], texts[1]].map((q, i) => ({
    ...q,
    id: i + 1,
  }));
}
