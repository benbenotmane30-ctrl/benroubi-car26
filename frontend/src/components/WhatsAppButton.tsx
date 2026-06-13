import { useState, useEffect } from 'react';

/** Bouton WhatsApp flottant identique au legacy : .wa-float + .wa-tooltip + .wa-invite. */
export function WhatsAppButton() {
  const [showInvite, setShowInvite] = useState(false);
  const [dismissed, setDismissed] = useState(
    typeof window !== 'undefined' && sessionStorage.getItem('bc_wa_invite_dismissed') === '1',
  );

  useEffect(() => {
    if (dismissed) return;
    const t  = setTimeout(() => setShowInvite(true),  8000);
    const t2 = setTimeout(() => setShowInvite(false), 15000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [dismissed]);

  const close = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setShowInvite(false); setDismissed(true);
    sessionStorage.setItem('bc_wa_invite_dismissed', '1');
  };

  return (
    <a
      className="wa-float"
      href="https://wa.me/212662114321?text=Bonjour%2C%20je%20souhaite%20des%20informations%20sur%20la%20location%20d%27une%20voiture."
      target="_blank"
      rel="noopener"
      aria-label="Contactez-nous sur WhatsApp"
    >
      <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <path d="M16.003 0C7.166 0 .005 7.16.005 16c0 2.821.74 5.572 2.144 8.001L0 32l8.226-2.154A15.92 15.92 0 0 0 16.003 32C24.84 32 32 24.84 32 16S24.84 0 16.003 0zm0 29.232a13.21 13.21 0 0 1-6.737-1.842l-.483-.287-4.882 1.278 1.305-4.757-.315-.49A13.235 13.235 0 0 1 2.766 16C2.766 8.687 8.69 2.768 16.003 2.768c3.541 0 6.87 1.378 9.378 3.886 2.508 2.508 3.886 5.837 3.886 9.378 0 7.314-5.924 13.232-13.264 13.232zm7.247-9.91c-.396-.198-2.343-1.157-2.706-1.29-.363-.132-.627-.198-.891.198-.264.396-1.024 1.29-1.255 1.554-.231.264-.462.297-.858.099-.396-.198-1.673-.617-3.187-1.967-1.178-1.051-1.973-2.349-2.205-2.745-.231-.396-.025-.61.174-.808.178-.177.396-.462.594-.694.198-.231.264-.396.396-.66.132-.264.066-.495-.033-.693-.099-.198-.891-2.151-1.221-2.947-.322-.774-.65-.668-.891-.68-.231-.012-.495-.014-.759-.014-.264 0-.694.099-1.057.495-.363.396-1.387 1.354-1.387 3.305s1.42 3.836 1.618 4.1c.198.264 2.798 4.272 6.78 5.99.948.409 1.687.654 2.263.836.951.302 1.816.26 2.5.158.762-.114 2.343-.957 2.674-1.881.33-.924.33-1.716.231-1.881-.099-.165-.363-.264-.759-.462z" />
      </svg>
      <span className="wa-tooltip">Besoin d'aide ? Discutons sur WhatsApp</span>
      {showInvite && (
        <div className="wa-invite show">
          <button className="wa-invite-close" onClick={close} aria-label="Fermer">✕</button>
          <strong>👋 Besoin d'aide ?</strong>
          <span>Réponse rapide sur WhatsApp</span>
        </div>
      )}
    </a>
  );
}
