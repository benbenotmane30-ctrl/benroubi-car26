import { useSeasonContext } from '../contexts/SeasonContext';
import { SEASON_LABELS } from '../hooks/useSeason';

/** Bannière saisonnière — structure HTML identique au legacy. */
export function SeasonBar() {
  const { season, setSeason } = useSeasonContext();
  return (
    <div className="season-bar">
      <span>💰 Tarifs :</span>
      <div className="season-toggle">
        <button
          className={`season-btn ${season === 'haut' ? 'active' : ''}`}
          onClick={() => setSeason('haut')}
        >
          Haute saison
        </button>
        <button
          className={`season-btn ${season === 'bas' ? 'active' : ''}`}
          onClick={() => setSeason('bas')}
        >
          Basse saison
        </button>
      </div>
      <span style={{ opacity: 0.7 }}>{SEASON_LABELS[season]}</span>
    </div>
  );
}
