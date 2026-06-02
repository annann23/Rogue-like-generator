import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/business')({
  component: BusinessPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '56px' }}>
      <p
        className="font-pixel"
        style={{
          fontSize: '16px',
          color: '#c0a0e8',
          letterSpacing: '3px',
          marginBottom: '24px',
          borderBottom: '2px solid #3a2460',
          paddingBottom: '10px',
        }}
      >
        ✦ {title} ✦
      </p>
      {children}
    </section>
  );
}

function Card({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div
      className="font-pixel"
      style={{
        background: '#120a1e',
        border: '2px solid #5a3d8a',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '22px' }}>{icon}</span>
        <span style={{ fontSize: '14px', color: '#e0c8f8' }}>{title}</span>
      </div>
      <p style={{ fontSize: '12px', color: '#b090d8', lineHeight: '1.8' }}>{desc}</p>
    </div>
  );
}


function BusinessPage() {
  return (
    <div
      style={{
        height: '100%',
        background: '#05020c',
        color: '#e8d0ff',
        overflowY: 'auto',
      }}
    >
      {/* 헤더 네비게이션 */}
      <nav
        style={{
          borderBottom: '2px solid #2a1a4a',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#080413',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <a
          href="/"
          className="font-pixel"
          style={{ fontSize: '14px', color: '#c8a8e8', textDecoration: 'none' }}
        >
          ← 게임으로 돌아가기
        </a>
        <p className="font-pixel" style={{ fontSize: '13px', color: '#9070c0' }}>
          for investors &amp; partners
        </p>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* 히어로 */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p className="font-pixel" style={{ fontSize: '13px', color: '#b090d8', letterSpacing: '4px', marginBottom: '16px' }}>
            AI × ROGUELIKE
          </p>
          <h1
            className="font-pixel"
            style={{
              fontSize: 'clamp(18px, 4vw, 28px)',
              color: '#f0c040',
              lineHeight: '1.6',
              marginBottom: '20px',
            }}
          >
            나만의 이야기,<br />매번 새로운 세계
          </h1>
          <p
            className="font-pixel"
            style={{
              fontSize: '14px',
              color: '#c8a8e8',
              lineHeight: '1.9',
              maxWidth: '560px',
              margin: '0 auto 32px',
            }}
          >
            AI가 매 방마다 던전·적·NPC·이벤트를 새롭게 만들어냅니다.<br />
            내 선택 하나하나가 세계에 실제로 반응하고,<br />
            오늘은 어떤 이야기가 펼쳐질지 매번 기대하게 됩니다.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {['🎮 지금 무료 플레이'].map((label, i) => (
              <a
                key={label}
                href='/'
                className="font-pixel"
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: i === 0 ? '#3a1f6e' : 'transparent',
                  border: `2px solid ${i === 0 ? '#6b4fa0' : '#4a2d7a'}`,
                  color: i === 0 ? '#f0c040' : '#9878c0',
                  fontSize: '13px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* 핵심 지표 */}
        <div
          style={{
            display: 'flex',
            gap: '2px',
            marginBottom: '64px',
            flexWrap: 'wrap',
          }}
        >
          {[
            { num: '∞', label: 'AI 생성 방 조합' },
            { num: '10+', label: '페르소나 유형' },
            { num: '20+', label: '도전과제' },
            { num: '6', label: '메타 보석' },
          ].map(({ num, label }) => (
            <div
              key={label}
              className="font-pixel"
              style={{
                flex: '1 1 120px',
                background: '#0a0612',
                border: '2px solid #2a1a4a',
                padding: '20px 16px',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '22px', color: '#f0c040', marginBottom: '6px' }}>{num}</p>
              <p style={{ fontSize: '12px', color: '#b090d8' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* 감정 포인트 */}
        <Section title="플레이어가 구독하는 이유">
          <p className="font-pixel" style={{ fontSize: '13px', color: '#b090d8', marginBottom: '20px', lineHeight: '1.8' }}>
            "결제 = 나만의 세계를 계속 이어가기, 끝없이 모험하기."<br />
            구독 동기는 기능이 아니라 감정입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            {[
              {
                icon: '🎯',
                label: '몰입감',
                desc: '선택 하나하나가 실제로 반응합니다. AI가 내 행동을 기억하고, 세계가 나를 중심으로 움직입니다.',
              },
              {
                icon: '👑',
                label: '주인공감',
                desc: '내 캐릭터, 내 이야기. 스크립트 없이 내가 결정한 대로 전개되는 나만의 영웅담입니다.',
              },
              {
                icon: '🤝',
                label: '유대감',
                desc: 'AI가 만든 동료·NPC와 함께 모험합니다. 재회할 때마다 관계가 이어지고 대사가 달라집니다.',
              },
              {
                icon: '🏆',
                label: '성취감',
                desc: '예상 못 한 사건을 해결하고, 희귀 보석을 모으고, 도전과제를 달성할 때마다 진짜 달성감이 옵니다.',
              },
            ].map(({ icon, label, desc }) => (
              <div
                key={label}
                className="font-pixel"
                style={{
                  background: '#0e0820',
                  border: '2px solid #4a2d7a',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{icon}</span>
                  <span style={{ fontSize: '14px', color: '#f0c040' }}>{label}</span>
                </div>
                <p style={{ fontSize: '12px', color: '#b090d8', lineHeight: '1.7' }}>{desc}</p>
              </div>
            ))}
          </div>
          <div
            style={{
              background: '#0a0612',
              border: '2px solid #2a1a4a',
              borderLeft: '4px solid #6b4fa0',
              padding: '14px 16px',
            }}
          >
            <p className="font-pixel" style={{ fontSize: '13px', color: '#c8a8e8', lineHeight: '1.9' }}>
              무료 플레이로 세계에 입문하고, 구독으로 그 세계를 <span style={{ color: '#f0c040' }}>끝없이 이어갑니다.</span><br />
              오늘 플레이한 선택이 내일의 던전과 NPC에 영향을 주는 경험 —<br />
              그 연속성이 구독을 유지하게 만드는 핵심 동기입니다.
            </p>
          </div>
        </Section>

        {/* 차별점 */}
        <Section title="핵심 차별점">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            <Card
              icon="🧠"
              title="AI 생성 콘텐츠"
              desc="방·적·NPC·대화가 매 회차 Claude API로 새롭게 생성됩니다. 스크립트 없이도 매번 다른 이야기를 경험합니다."
            />
            <Card
              icon="🎭"
              title="페르소나 시스템"
              desc="설문 응답이 캐릭터 성향(persona)을 결정하고, 선택지·NPC 반응·전투 대사가 그 성향에 따라 달라집니다."
            />
            <Card
              icon="👥"
              title="NPC 관계 기억"
              desc="NPC는 이전 만남을 기억합니다. 재회 시 AI가 과거 관계를 대사에 자연스럽게 녹여 연속성 있는 세계관을 만듭니다."
            />
            <Card
              icon="💬"
              title="저승 유언 메시지"
              desc="사망 시 남긴 유언이 다음 회차 다른 플레이어의 게임 속 유령 메시지로 등장합니다. 플레이어 간 간접 연결감을 만듭니다."
            />
            <Card
              icon="💎"
              title="보석 메타 진행"
              desc="런 간 달성 조건을 충족하면 보석을 수집합니다. 6개 완성이 최종 목표로, 단기 재미와 장기 목표를 동시에 제공합니다."
            />
            <Card
              icon="🎲"
              title="무한 재플레이성"
              desc="AI 생성 콘텐츠 + 로그라이크 구조 + 페르소나 변수의 조합으로 동일한 플레이 경험이 반복되지 않습니다."
            />
          </div>
        </Section>

        {/* 로드맵 */}
        <section style={{ marginBottom: '56px' }}>
          {/* 섹션 헤더 + 현재 단계 뱃지 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '2px solid #3a2460', paddingBottom: '12px', marginBottom: '28px' }}>
            <p className="font-pixel" style={{ fontSize: '16px', color: '#c0a0e8', letterSpacing: '3px' }}>
              ✦ 제품 로드맵 ✦
            </p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ width: '8px', height: '8px', background: '#80e080', display: 'inline-block', animation: 'none' }} />
              <span className="font-pixel" style={{ fontSize: '11px', color: '#80e080', background: '#0a1a0a', border: '2px solid #1a4a1a', padding: '4px 10px' }}>
                현재: PROTOTYPE
              </span>
            </div>
          </div>

          {/* 핵심 방향 */}
          <div style={{ background: '#0e0820', border: '3px solid #6b4fa0', padding: '20px', marginBottom: '24px' }}>
            <p className="font-pixel" style={{ fontSize: '13px', color: '#f0c040', marginBottom: '10px' }}>목표</p>
            <p className="font-pixel" style={{ fontSize: '13px', color: '#c8a8e8', lineHeight: '1.9' }}>
              Balatro가 중독적인 이유 — 단순한 규칙 위에서 <span style={{ color: '#f0c040' }}>플레이어가 직접 시너지를 발견</span>하는 경험.<br />
              이 게임의 목표: AI 서사 + 로그라이크 빌드 깊이의 결합으로 <span style={{ color: '#f0c040' }}>"한 판만 더"</span>를 만드는 것.
            </p>
          </div>

          {/* 페이즈 그리드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {[
              {
                phase: 'NOW',
                status: '진행 중',
                statusColor: '#80e080',
                statusBg: '#0a1a0a',
                borderColor: '#2a5a2a',
                color: '#80e080',
                title: '프로토타입',
                items: [
                  'AI 방·NPC·전투 생성',
                  '페르소나 + 보석 메타',
                  '유언 메시지 시스템',
                  'NPC 관계 기억',
                ],
              },
              {
                phase: 'PHASE 1',
                status: '다음 목표',
                statusColor: '#f0c040',
                statusBg: '#1a1200',
                borderColor: '#5a4a00',
                color: '#f0c040',
                title: '빌드 시너지',
                items: [
                  '아이템 조합 시 예상 외 효과 발생',
                  '스킬 숙련도 → 전설 기술 언락',
                  '보석 간 연계 시너지',
                  'AI 동료 파티원 (전투 참여)',
                ],
              },
              {
                phase: 'PHASE 2',
                status: '계획',
                statusColor: '#b090d8',
                statusBg: '#0e0820',
                borderColor: '#4a2d7a',
                color: '#b090d8',
                title: '소셜 & 기억',
                items: [
                  'AI 기억 — 선택이 다음 모험에 영향',
                  '멀티엔딩 분기',
                  '길드/파티 던전 공략',
                  '유언 → 유령으로 등장해 도움',
                ],
              },
              {
                phase: 'PHASE 3',
                status: '계획',
                statusColor: '#b090d8',
                statusBg: '#0e0820',
                borderColor: '#4a2d7a',
                color: '#b090d8',
                title: '시즌 & 커스터마이징',
                items: [
                  '캐릭터 외형·장비·스킬 커스터마이징',
                  '시즌 이벤트 + 한정 보상',
                  '일일 시드 런 글로벌 랭킹',
                  'AI 내레이터 — 실시간 영웅담 묘사',
                ],
              },
            ].map(({ phase, status, statusColor, statusBg, borderColor, color, title, items }) => (
              <div
                key={phase}
                className="font-pixel"
                style={{ background: '#0a0612', border: `2px solid ${borderColor}`, padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color, letterSpacing: '2px' }}>{phase}</span>
                  <span style={{ fontSize: '11px', color: statusColor, background: statusBg, border: `1px solid ${borderColor}`, padding: '2px 8px' }}>{status}</span>
                </div>
                <p style={{ fontSize: '15px', color: '#e8d0ff', margin: 0 }}>{title}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {items.map(item => (
                    <div key={item} style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ color, flexShrink: 0, fontSize: '12px' }}>▸</span>
                      <span style={{ fontSize: '12px', color: '#b090d8', lineHeight: '1.6' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 핵심 질문 */}
          <div style={{ background: '#080413', border: '2px solid #3a2460', borderLeft: '4px solid #f0c040', padding: '16px 20px' }}>
            <p className="font-pixel" style={{ fontSize: '12px', color: '#9070c0', marginBottom: '8px' }}>설계 원칙</p>
            <p className="font-pixel" style={{ fontSize: '13px', color: '#f0c040', lineHeight: '1.9' }}>
              "플레이어가 어떤 선택으로 게임을 스스로 부수는 경험을 할 수 있는가?"
            </p>
            <p className="font-pixel" style={{ fontSize: '12px', color: '#b090d8', lineHeight: '1.8', marginTop: '8px' }}>
              AI 서사는 배경. 빌드 시너지 발견이 중독의 핵심입니다.
            </p>
          </div>
        </section>

        {/* 수익 모델 */}
        <Section title="수익화 전략">

          {/* 핵심 메시지 */}
          <div style={{ background: '#0e0820', border: '3px solid #6b4fa0', padding: '20px', marginBottom: '28px', textAlign: 'center' }}>
            <p className="font-pixel" style={{ fontSize: '16px', color: '#f0c040', lineHeight: '2' }}>
              무료 체험 → 애정 → 과금
            </p>
            <p className="font-pixel" style={{ fontSize: '12px', color: '#b090d8', marginTop: '8px', lineHeight: '1.8' }}>
              처음부터 돈 내라가 아니라,<br />
              "내 캐릭터와 동료, 이 세계를 계속 이어가고 싶으면 선택"
            </p>
          </div>

          {/* 4단계 퍼널 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '28px' }}>
            {[
              {
                step: '1',
                color: '#5a8a5a',
                border: '#1a4a1a',
                label: '무료 시작',
                desc: '구독 없이 누구나 플레이. 던전·스토리·동료 상호작용 충분히 제공. 목표: "얘들이랑 계속 놀고 싶다"는 마음 만들기.',
              },
              {
                step: '2',
                color: '#5a7aaa',
                border: '#1a3a5a',
                label: '유대감 형성',
                desc: '동료가 플레이어를 기억하고 성장. "내가 이 NPC 살려야지" — 캐릭터에 애착이 생기는 순간.',
              },
              {
                step: '3',
                color: '#8a6aaa',
                border: '#3a1a5a',
                label: '자연스러운 과금 유도',
                desc: '애정이 생긴 시점에 유료 콘텐츠 소개. 동료 슬롯 확장 · 특수 시나리오 · AI 기억 강화 · 모험 저장. 부담 없음.',
              },
              {
                step: '4',
                color: '#aa8a3a',
                border: '#5a4a1a',
                label: '구독 유지',
                desc: '"더 즐기고 싶은 사람만 결제." 구독은 제한 해제가 아니라 세계를 깊게 이어가는 선택.',
              },
            ].map(({ step, color, border, label, desc }) => (
              <div
                key={step}
                className="font-pixel"
                style={{ background: '#0a0612', border: `2px solid ${border}`, borderLeft: `4px solid ${color}`, padding: '14px 16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}
              >
                <span style={{ fontSize: '18px', color, flexShrink: 0, minWidth: '20px' }}>{step}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <span style={{ fontSize: '13px', color }}>{label}</span>
                  <span style={{ fontSize: '12px', color: '#b090d8', lineHeight: '1.7' }}>{desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 플랜 */}
          <p className="font-pixel" style={{ fontSize: '13px', color: '#c8a8e8', marginBottom: '14px' }}>플랜 구성</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'flex-start' }}>
            {[
              {
                name: '무료',
                price: '₩0',
                priceColor: '#c8a8e8',
                borderColor: '#3a2460',
                bg: '#0a0612',
                points: ['무제한 플레이', '동료 상호작용 · 기본 서사', '보석 메타 진행', '사망 시 광고'],
              },
              {
                name: '구독',
                price: '₩7,900 / 월',
                tag: '애정이 생겼다면',
                priceColor: '#f0c040',
                borderColor: '#6b4fa0',
                bg: '#0e0820',
                points: ['동료 슬롯 확장', '특수 시나리오 · 이벤트', 'AI 기억 기능 강화', '모험 저장 · 유언 열람', '광고 없음 · 전체 페르소나'],
              },
            ].map(({ name, price, tag, priceColor, borderColor, bg, points }) => (
              <div key={name} className="font-pixel" style={{ flex: '1 1 220px', background: bg, border: `2px solid ${borderColor}`, padding: '18px', position: 'relative' }}>
                {tag && (
                  <div style={{ position: 'absolute', top: '-1px', right: '12px', background: '#6b4fa0', color: '#f0c040', fontSize: '11px', padding: '3px 8px' }}>{tag}</div>
                )}
                <p style={{ fontSize: '13px', color: '#9070c0', letterSpacing: '2px', marginBottom: '6px' }}>{name}</p>
                <p style={{ fontSize: '22px', color: priceColor, marginBottom: '16px' }}>{price}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {points.map(t => (
                    <div key={t} style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#80e080', flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: '12px', color: '#e0d0f8', lineHeight: '1.5' }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* API 비용 */}
          <div style={{ background: '#0a0612', border: '2px solid #2a1a4a', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <p className="font-pixel" style={{ fontSize: '12px', color: '#9070c0', marginBottom: '4px' }}>비용 구조</p>
            {[
              '🤖  무료 유저 → Claude Haiku 사용 (Sonnet 대비 ~25배 저렴)',
              '💰  구독 유저 → ₩7,900/월로 Sonnet 비용 충당 + 마진',
              '🏢  장기 → AI 스토리텔링 엔진 B2B 라이선스로 고정 수익 확보',
            ].map(t => (
              <p key={t} className="font-pixel" style={{ fontSize: '12px', color: '#b090d8', lineHeight: '1.7' }}>{t}</p>
            ))}
          </div>
        </Section>

        {/* 현실적 진단 */}
        <Section title="현실적 진단">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {[
              { icon: '⚠️', title: 'AI 비용 역설', text: '사용량↑ = 비용↑. Haiku로 25배 절감하지만, 구독 전환율이 낮으면 여전히 위험.' },
              { icon: '⚠️', title: '배포 채널 없음', text: '앱스토어·Steam 없이 링크 공유에만 의존. 초기 유저 유입이 가장 큰 병목.' },
              { icon: '⚠️', title: '타겟 좁음', text: 'AI 로그라이크 + 한국어 — 교집합이 아직 작다. 완성도가 높아질수록 확장 가능.' },
            ].map(({ icon, title, text }) => (
              <div key={title} className="font-pixel" style={{ background: '#0a0612', border: '2px solid #3a1a1a', padding: '14px 16px', display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <span style={{ fontSize: '13px', color: '#e89090' }}>{title}</span>
                  <span style={{ fontSize: '12px', color: '#c09090', lineHeight: '1.7' }}>{text}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="font-pixel" style={{ fontSize: '13px', color: '#c8a8e8', marginBottom: '14px' }}>대안 경로</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {[
              { icon: '🎮', title: 'itch.io 유료 출시', desc: '플레이어 API 키 방식으로 비용 해결. ₩2,900~4,900 일회성 판매.' },
              { icon: '💼', title: 'B2B / 포트폴리오', desc: '"AI 스토리텔링 엔진" 데모로 투자·채용·라이선스 연결.' },
              { icon: '📱', title: '모바일 전환', desc: 'Capacitor 래핑 → 앱스토어 유입 + 광고 CPM 10배 향상.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="font-pixel" style={{ background: '#0a1a0a', border: '2px solid #1a3a1a', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{icon}</span>
                <span style={{ fontSize: '13px', color: '#80e080' }}>{title}</span>
                <span style={{ fontSize: '12px', color: '#70b870', lineHeight: '1.7' }}>{desc}</span>
              </div>
            ))}
          </div>
        </Section>


        {/* 기술 스택 */}
        <Section title="기술 스택">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[
              'React 19', 'TypeScript', 'Vite', 'TanStack Router',
              'Zustand', 'Claude API', 'TailwindCSS', 'Vercel',
            ].map((tech) => (
              <span
                key={tech}
                className="font-pixel"
                style={{
                  background: '#120a1e',
                  border: '2px solid #4a2d7a',
                  padding: '6px 12px',
                  fontSize: '13px',
                  color: '#c8a8e8',
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
