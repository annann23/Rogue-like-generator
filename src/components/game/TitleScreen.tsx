import { useGameState } from '@/hooks/useGameState';
import {
  PixelPanel,
  PixelButton,
  PixelBar,
  PixelSlot,
  PixelBadge,
  PixelDivider,
  PixelHUD,
} from './UIFrame';

export default function TitleScreen() {
  const { setScreen, meta } = useGameState();

  return (
    <div className="flex flex-col w-full h-full dungeon-bg overflow-y-auto">
      {/* HUD 데모 */}
      <PixelHUD
        hp={75}
        maxHp={100}
        gold={42}
        atk={12}
        def={5}
        depth={3}
        skills={{ intelligence: 2, negotiation: 1, lockpick: 3, stealth: 0, strength: 1, arcane: 0 }}
      />

      <div className="flex flex-col lg:flex-row gap-6 p-6 flex-1">
        {/* 왼쪽: 타이틀 + 버튼 */}
        <div className="flex flex-col gap-6 flex-1">
          <PixelPanel variant="dark" className="p-6">
            <div className="text-center space-y-6">
              <div>
                <h1
                  className="font-pixel text-xl leading-relaxed"
                  style={{ color: '#f0c040', textShadow: '3px 3px 0 #7a3c00' }}
                >
                  AI 로그라이크
                </h1>
                <h2
                  className="font-pixel text-lg leading-relaxed mt-2"
                  style={{ color: '#f0c040', textShadow: '3px 3px 0 #7a3c00' }}
                >
                  던전 RPG
                </h2>
                <p className="font-pixel text-xs mt-3" style={{ color: '#9878c0', fontSize: '12px' }}>
                  ─ 던전의 신이 기다린다 ─
                </p>
              </div>

              {meta.totalRuns > 0 && (
                <div className="font-pixel space-y-1" style={{ fontSize: '12px', color: '#6b4fa0' }}>
                  <p>총 {meta.totalRuns}회 도전 · 최대 {meta.bestDepth}층</p>
                  <p>유산 포인트: {meta.legacyPoints}pt</p>
                </div>
              )}

              <PixelDivider label="선택" />

              <div className="flex flex-col items-center gap-3">
                <PixelButton size="lg" variant="primary" onClick={() => setScreen('survey')}>
                  ⚔️ 던전에 도전하라
                </PixelButton>

                {meta.totalRuns > 0 && (
                  <PixelButton size="md" variant="secondary" onClick={() => setScreen('meta')}>
                    🏆 유산 업그레이드
                  </PixelButton>
                )}

                <PixelButton size="sm" variant="ghost" onClick={() => setScreen('survey')}>
                  📖 처음 시작하기
                </PixelButton>
              </div>
            </div>
          </PixelPanel>

          {/* HP / 게이지 바 데모 */}
          <PixelPanel variant="dark" title="게이지 미리보기" className="p-4 space-y-3">
            <PixelBar value={75} max={100} variant="hp" label="❤️" />
            <PixelBar value={14} max={20} variant="mana" label="💙" />
            <PixelBar value={42} max={100} variant="familiarity" label="🤝" />
            <PixelBar value={230} max={500} variant="xp" label="⭐" />
          </PixelPanel>
        </div>

        {/* 오른쪽: 컴포넌트 데모 */}
        <div className="flex flex-col gap-6" style={{ width: '320px' }}>
          {/* 스킬 뱃지 */}
          <PixelPanel variant="dark" title="스킬" className="p-4">
            <div className="flex flex-wrap gap-3 justify-center">
              <PixelBadge icon="🧠" label="지능" value={2} />
              <PixelBadge icon="🗣️" label="협상력" value={1} />
              <PixelBadge icon="🔓" label="자물쇠" value={3} />
              <PixelBadge icon="👁️" label="은신" value={0} />
              <PixelBadge icon="💪" label="완력" value={1} />
              <PixelBadge icon="✨" label="마법감지" value={0} />
            </div>
          </PixelPanel>

          {/* 버튼 종류 */}
          <PixelPanel variant="brown" title="버튼" className="p-4 space-y-3">
            <PixelButton variant="primary" className="w-full">▶ 일반 선택지</PixelButton>
            <PixelButton variant="secondary" className="w-full">🧠 지능 3 필요</PixelButton>
            <PixelButton variant="primary" locked lockReason="자물쇠 2레벨 필요" className="w-full">
              🔒 잠긴 선택지
            </PixelButton>
            <PixelButton variant="danger" className="w-full">⚠️ 위험한 선택</PixelButton>
            <PixelButton variant="ghost" className="w-full">👋 작별인사</PixelButton>
          </PixelPanel>

          {/* 슬롯 */}
          <PixelPanel variant="dark" title="유물 슬롯" className="p-4">
            <div className="flex gap-3 flex-wrap">
              <PixelSlot active>🗡️</PixelSlot>
              <PixelSlot cursed>🗿</PixelSlot>
              <PixelSlot>🔮</PixelSlot>
              <PixelSlot size="sm" />
              <PixelSlot size="sm" />
              <PixelSlot size="lg">⚗️</PixelSlot>
            </div>
          </PixelPanel>
        </div>
      </div>

      <p
        className="font-pixel text-center pb-4"
        style={{ fontSize: '11px', color: '#3d2860' }}
      >
        Claude API · Supabase · Kenney CC0 Assets
      </p>
    </div>
  );
}
