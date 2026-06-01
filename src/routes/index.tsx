import { createFileRoute } from '@tanstack/react-router';
import { useGameState } from '@/hooks/useGameState';
import TitleScreen from '@/components/game/TitleScreen';
import SurveyScreen from '@/components/game/SurveyScreen';
import StatReveal from '@/components/game/StatReveal';
import CharacterSelect from '@/components/game/CharacterSelect';
import GameScreen from '@/components/game/GameScreen';
import DeathScreen from '@/components/game/DeathScreen';
import MetaScreen from '@/components/game/MetaScreen';
import BGMController from '@/components/game/BGMController';

export const Route = createFileRoute('/')({
  component: GameRouter,
});

function GameRouter() {
  const screen = useGameState((s) => s.screen);

  return (
    <>
      <BGMController />
      {(() => {
        switch (screen) {
          case 'title':         return <TitleScreen />;
          case 'survey':        return <SurveyScreen />;
          case 'stat-reveal':   return <StatReveal />;
          case 'character-select': return <CharacterSelect />;
          case 'game':          return <GameScreen />;
          case 'death':
          case 'clear':         return <DeathScreen />;
          case 'meta':          return <MetaScreen />;
          default:              return <TitleScreen />;
        }
      })()}
    </>
  );
}
