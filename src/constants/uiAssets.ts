// UI Pack Pixel Adventure 에셋 경로
// public/sprites/ui/Tiles/ 하위 파일들

const UI_BASE = '/sprites/ui/Tiles';

export const UI_ASSETS = {
  // 패널/창 프레임 (Large tiles)
  panelBlue:    `${UI_BASE}/Large tiles/panel_blue.png`,
  panelBrown:   `${UI_BASE}/Large tiles/panel_brown.png`,

  // 버튼 (Small tiles)
  btnGrey:      `${UI_BASE}/Small tiles/buttonLong_grey.png`,
  btnGreyHover: `${UI_BASE}/Small tiles/buttonLong_grey_pressed.png`,
  btnBlue:      `${UI_BASE}/Small tiles/buttonLong_blue.png`,
  btnBlueHover: `${UI_BASE}/Small tiles/buttonLong_blue_pressed.png`,
  btnRed:       `${UI_BASE}/Small tiles/buttonLong_red.png`,
  btnRedHover:  `${UI_BASE}/Small tiles/buttonLong_red_pressed.png`,

  // 게이지 바
  barBlue:      `${UI_BASE}/Small tiles/barBlue.png`,
  barRed:       `${UI_BASE}/Small tiles/barRed.png`,
  barGreen:     `${UI_BASE}/Small tiles/barGreen.png`,
  barYellow:    `${UI_BASE}/Small tiles/barYellow.png`,
  barBack:      `${UI_BASE}/Small tiles/barBack.png`,

  // 슬롯/아이콘 배경
  iconBg:       `${UI_BASE}/Small tiles/iconBg.png`,
} as const;

export type UIAssetKey = keyof typeof UI_ASSETS;
