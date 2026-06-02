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

        {/* 수익 모델 */}
        <Section title="수익화 전략">
          {/* AI Dungeon 비교 */}
          <div
            style={{
              background: '#0a0a1a',
              border: '2px solid #2a1a4a',
              padding: '14px 16px',
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <p className="font-pixel" style={{ fontSize: '12px', color: '#9070c0', letterSpacing: '2px', marginBottom: '4px' }}>REFERENCE — AI DUNGEON</p>
            <p className="font-pixel" style={{ fontSize: '13px', color: '#b090d8', lineHeight: '1.8' }}>
              가장 유사한 선행 사례인 AI Dungeon은 에너지 시스템을 폐기하고
              <span style={{ color: '#c8a8e8' }}> "AI 모델 품질"로 무료/유료를 구분</span>하는 구독 방식으로 전환했습니다.
              무료 유저는 무제한 플레이 가능하지만 기본 모델만 사용,
              유료 구독($14.99~$99.99/월)은 강력한 모델과 더 넓은 컨텍스트를 제공합니다.
              이 구조는 유저 이탈 없이 자연스럽게 업그레이드를 유도합니다.
            </p>
          </div>

          <p className="font-pixel" style={{ fontSize: '13px', color: '#b090d8', marginBottom: '24px', lineHeight: '1.8' }}>
            같은 원리를 적용합니다. Claude Haiku(무료)와 Claude Sonnet(유료)의
            서사 품질 차이가 체감될 정도로 크기 때문에, 에너지 제한 없이도
            자연스러운 업그레이드 동기가 생깁니다. Haiku는 Sonnet 대비 약 25배 저렴해
            무료 유저 API 비용도 감당 가능합니다.
          </p>

          {/* 플랜 비교 */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'flex-start' }}>
            {[
              {
                name: 'WANDERER',
                price: '무료',
                priceColor: '#9878c0',
                borderColor: '#2a1a4a',
                bg: '#0a0612',
                features: [
                  { text: '무제한 플레이', ok: true },
                  { text: 'Claude Haiku (빠르지만 단순한 서사)', ok: true },
                  { text: '기본 페르소나 3종', ok: true },
                  { text: '보석 메타 진행', ok: true },
                  { text: '사망·클리어 시 광고 노출', ok: true },
                  { text: 'Claude Sonnet (깊은 서사)', ok: false },
                  { text: '프리미엄 페르소나 전체', ok: false },
                  { text: '유언 메시지 열람', ok: false },
                ],
              },
              {
                name: 'ADVENTURER',
                price: '₩7,900 / 월',
                tag: '추천',
                priceColor: '#f0c040',
                borderColor: '#6b4fa0',
                bg: '#0e0820',
                features: [
                  { text: '무제한 플레이', ok: true },
                  { text: 'Claude Sonnet (풍부한 서사·NPC 기억)', ok: true },
                  { text: '전체 페르소나 10종+', ok: true },
                  { text: '보석 메타 진행', ok: true },
                  { text: '광고 없음', ok: true },
                  { text: '다른 플레이어 유언 열람', ok: true },
                  { text: '시즌 한정 보석 스킨', ok: false },
                  { text: 'Discord 개발팀 채널', ok: false },
                ],
              },
              {
                name: 'LEGEND',
                price: '₩15,900 / 월',
                priceColor: '#e8d0ff',
                borderColor: '#4a2d7a',
                bg: '#0a0612',
                features: [
                  { text: '무제한 플레이', ok: true },
                  { text: 'Claude Sonnet (풍부한 서사·NPC 기억)', ok: true },
                  { text: '전체 페르소나 10종+', ok: true },
                  { text: '보석 메타 진행', ok: true },
                  { text: '광고 없음', ok: true },
                  { text: '다른 플레이어 유언 열람', ok: true },
                  { text: '시즌 한정 보석 스킨', ok: true },
                  { text: 'Discord 개발팀 채널', ok: true },
                ],
              },
            ].map(({ name, price, tag, priceColor, borderColor, bg, features }) => (
              <div
                key={name}
                className="font-pixel"
                style={{
                  flex: '1 1 200px',
                  minWidth: '190px',
                  background: bg,
                  border: `2px solid ${borderColor}`,
                  padding: '18px',
                  position: 'relative',
                }}
              >
                {tag && (
                  <div style={{
                    position: 'absolute', top: '-1px', right: '12px',
                    background: '#f0c040', color: '#080413',
                    fontSize: '14px', padding: '3px 8px',
                  }}>
                    {tag}
                  </div>
                )}
                <p style={{ fontSize: '12px', color: '#9070c0', letterSpacing: '2px', marginBottom: '6px' }}>{name}</p>
                <p style={{ fontSize: '18px', color: priceColor, marginBottom: '14px' }}>{price}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {features.map((f) => (
                    <div key={f.text} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '12px', color: f.ok ? '#80e080' : '#604880', flexShrink: 0 }}>{f.ok ? '✓' : '✗'}</span>
                      <span style={{ fontSize: '12px', color: f.ok ? '#e0d0f8' : '#705090', lineHeight: '1.5' }}>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 구독 핵심 메시지 */}
          <div
            style={{
              background: '#0e0820',
              border: '3px solid #6b4fa0',
              padding: '16px',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            <p className="font-pixel" style={{ fontSize: '14px', color: '#f0c040', lineHeight: '2' }}>
              무료: 세계에 입문, 하루 몇 번 생성, 기본 AI<br />
              구독: <span style={{ color: '#e8d0ff' }}>나만의 세계를 끝없이 이어가기</span><br />
              <span style={{ fontSize: '12px', color: '#b090d8' }}>무제한 생성 · 고급 AI · 동료와 시나리오 저장 · 특수 이벤트 참여</span>
            </p>
          </div>

          {/* 비용 방어 */}
          <div
            style={{
              background: '#0a0612',
              border: '2px solid #2a1a4a',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <p className="font-pixel" style={{ fontSize: '13px', color: '#c8a8e8' }}>API 비용 방어 구조</p>
            {[
              { icon: '🤖', text: '무료 유저 → Haiku 사용. Sonnet 대비 ~25배 저렴해 대규모 무료 유저도 감당 가능' },
              { icon: '💰', text: '유료 유저 → ₩7,900/월이 Sonnet 호출 비용을 충당하고 마진 남김' },
              { icon: '📈', text: '서사 품질 차이가 직접 체감되므로 에너지 제한 없이도 자연스러운 업그레이드 유도' },
              { icon: '🏢', text: 'B2B 라이선스 — AI 스토리텔링 엔진을 타 서비스에 제공해 고정 수익 추가 가능' },
            ].map(({ icon, text }) => (
              <div key={text} className="font-pixel" style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#b090d8' }}>
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* 현실적 진단 */}
        <Section title="현실적 진단">
          <p className="font-pixel" style={{ fontSize: '13px', color: '#b090d8', marginBottom: '20px', lineHeight: '1.8' }}>
            이 게임의 콘셉트는 진짜 차별점이 있습니다. 다만 수익화 구조에 아직 해결되지 않은 모순이 있습니다.
          </p>

          {/* 구조적 문제 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {[
              {
                label: '⚠️ AI 비용 역설',
                text: '사용량이 늘수록 비용이 비례해서 증가합니다. 일반 게임과 반대입니다. 무료 유저 1,000명이 하루 5런씩 하면 API 비용만 수십만 원이 나올 수 있고, 웹 광고 CPM(₩500~2,000)으로는 이를 보전하기 어렵습니다.',
              },
              {
                label: '⚠️ 에너지 시스템의 한계',
                text: '에너지 시스템은 하루에 여러 번 앱을 켜는 모바일 습관을 전제합니다. 웹 게임에서 "2시간 기다려"라는 메시지는 이탈로 이어질 가능성이 높습니다.',
              },
              {
                label: '⚠️ 배포·발견 채널 없음',
                text: '앱스토어나 Steam 같은 검색·추천 유입이 없습니다. 현재 구조로는 직접 링크를 공유해야만 유저가 유입됩니다.',
              },
              {
                label: '⚠️ 타겟 모호',
                text: 'AI 생성 로그라이크를 한국어로 즐기는 코어 게이머 — 교집합이 작습니다. 코어 로그라이크 팬은 Balatro 수준의 완성도를 기대하고, 캐주얼 유저는 텍스트 중심에 진입장벽을 느낍니다.',
              },
            ].map(({ label, text }) => (
              <div
                key={label}
                className="font-pixel"
                style={{
                  background: '#0a0612',
                  border: '2px solid #3a1a1a',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <span style={{ fontSize: '13px', color: '#e89090' }}>{label}</span>
                <span style={{ fontSize: '12px', color: '#c09090', lineHeight: '1.7' }}>{text}</span>
              </div>
            ))}
          </div>

          {/* 현실적 대안 */}
          <p className="font-pixel" style={{ fontSize: '13px', color: '#c8a8e8', marginBottom: '14px' }}>현실적인 대안 경로</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              {
                icon: '🎮',
                title: 'itch.io 유료 출시',
                desc: '플레이어가 자신의 Claude API 키를 입력하거나, 저렴한 모델(Haiku)로 전환하면 API 비용 문제가 해결됩니다. ₩2,900~4,900 일회성 판매. 인디 게임 커뮤니티 자연 유입 가능.',
              },
              {
                icon: '💼',
                title: '포트폴리오 / B2B Showcase',
                desc: '"AI 스토리텔링 엔진"을 증명하는 데모로 포지셔닝합니다. 직접 수익보다 투자·채용·기술 라이선스 계약으로 연결하는 경로입니다.',
              },
              {
                icon: '📱',
                title: '모바일 앱 전환',
                desc: '에너지 시스템과 세션 길이는 모바일에 더 적합합니다. React Native 또는 Capacitor로 래핑하면 앱스토어 광고 단가(CPM ₩5,000~20,000)와 IAP 생태계를 활용할 수 있습니다.',
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="font-pixel"
                style={{
                  background: '#0a1a0a',
                  border: '2px solid #1a3a1a',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '18px' }}>{icon}</span>
                <span style={{ fontSize: '13px', color: '#80e080' }}>{title}</span>
                <span style={{ fontSize: '12px', color: '#70b870', lineHeight: '1.7' }}>{desc}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* 목표 — Balatro처럼 */}
        <Section title="중독성 있는 게임이 되려면">
          <p className="font-pixel" style={{ fontSize: '13px', color: '#b090d8', marginBottom: '20px', lineHeight: '1.8' }}>
            Balatro가 중독적인 이유는 단순한 규칙 위에서 시너지를 직접 발견하는 경험입니다.
            이 게임이 그 수준에 가려면 "한 판만 더"를 유발하는 메커닉 깊이가 필요합니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            {[
              {
                phase: 'PHASE 1',
                color: '#9070c0',
                title: '빌드 시너지 시스템',
                items: [
                  '아이템 조합 시 예상치 못한 효과 발생 (ex. 독 + 도발 = 적이 스스로 공격)',
                  '스킬 숙련도가 10 이상 되면 "전설 기술" 언락 — 페르소나별 전용',
                  '보석 2개 이상 보유 시 조합 시너지 발동 (보석 간 연계 효과)',
                ],
              },
              {
                phase: 'PHASE 2',
                color: '#b090d8',
                title: '동료 & 소셜 시스템',
                items: [
                  'AI 동료 — 같이 싸우고 성장하는 파티원. 대화·관계도·전투 역할 분담',
                  '길드/파티 시스템 — 친구와 팀 만들어 함께 던전 공략 (비동기 or 실시간)',
                  '유언 메시지 확장 — 고인의 스탯·아이템이 다음 런 유령으로 등장해 도움 제공',
                ],
              },
              {
                phase: 'PHASE 3',
                color: '#c8a8e8',
                title: '세계 기억 & 멀티엔딩',
                items: [
                  'AI 기억 기능 — 내 선택·행동 누적 기억, 다음 모험의 세계관에 영향',
                  '멀티엔딩 — 선택 따라 세계가 달라지고 결말도 복수로 분기',
                  '스토리 아크 — NPC 3회 이상 재회 시 개인 서사 완결 이벤트',
                  '업적 도전 — "협상만으로 클리어", "골드 0원 클리어" 등 플레이 방식 제약',
                ],
              },
              {
                phase: 'PHASE 4',
                color: '#c8a8e8',
                title: '커스터마이징 & 시즌',
                items: [
                  '캐릭터 커스터마이징 — 외형·장비·스킬 자유롭게 설정, 구독자 전용 스킨',
                  '시즌 이벤트 — 시즌별 AI 시나리오, 한정 보상, 시즌 패스',
                  '일일 시드 런 — 전 세계 동일 조건 랭킹 경쟁',
                  'AI 내레이터 — 플레이어 행동을 실시간 영웅담으로 묘사',
                ],
              },
            ].map(({ phase, color, title, items }) => (
              <div
                key={phase}
                className="font-pixel"
                style={{
                  background: '#0a0612',
                  borderLeft: `4px solid ${color}`,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '14px', color, letterSpacing: '2px' }}>{phase}</span>
                  <span style={{ fontSize: '13px', color: '#c8a8e8' }}>{title}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {items.map((item) => (
                    <div key={item} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#b090d8', lineHeight: '1.6' }}>
                      <span style={{ color, flexShrink: 0 }}>▸</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: '#0e0820',
              border: '2px solid #4a2d7a',
              padding: '16px',
              fontFamily: 'monospace',
            }}
          >
            <p className="font-pixel" style={{ fontSize: '12px', color: '#9070c0', marginBottom: '10px' }}>핵심 질문</p>
            <p className="font-pixel" style={{ fontSize: '13px', color: '#c8a8e8', lineHeight: '1.9' }}>
              Balatro는 "조커 조합을 내가 발견했다"는 능동적 성취감을 줍니다.<br />
              이 게임이 중독성을 갖기 위해 답해야 할 질문은<br />
              <span style={{ color: '#f0c040' }}>
                "플레이어가 어떤 선택으로 게임을 스스로 부수는 경험을 할 수 있는가?"
              </span><br />
              입니다. AI가 이야기를 만들어 주는 것만으로는 충분하지 않습니다.<br />
              플레이어가 시스템을 이해하고, 조합을 발견하고, 의도적으로 깨는 재미가 있어야 합니다.
            </p>
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
