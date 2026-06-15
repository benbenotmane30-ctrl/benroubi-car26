import { useState } from 'react';

interface FaqItem {
  q: string;
  a: React.ReactNode;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Quel est le prix final de ma location ?',
    a: (
      <>
        Le tarif affiché est exprimé en <strong>MAD/jour TTC</strong> et inclut l'assurance tous risques de base.
        Aucun frais caché — le total exact vous est confirmé par notre équipe sous <strong>2 heures</strong> après votre demande.
      </>
    ),
  },
  {
    q: 'Le prix peut-il changer après ma réservation ?',
    a: (
      <>
        Non. Le tarif appliqué est celui en vigueur au moment de votre demande. Une fois votre réservation confirmée,
        il reste <strong>fixe</strong>, quelle que soit l'évolution des saisons (haute / basse).
      </>
    ),
  },
  {
    q: 'Quel est l\'âge minimum pour louer ?',
    a: (
      <>
        <strong>21 ans révolus</strong> avec un permis de conduire valide depuis au moins 2 ans.
        Une pièce d'identité (CIN ou passeport) vous sera demandée à la remise du véhicule.
      </>
    ),
  },
  {
    q: 'Quels documents dois-je fournir ?',
    a: (
      <>
        Votre <strong>permis de conduire</strong> (recto + verso) et une <strong>pièce d'identité</strong> (CIN ou passeport).
        Pour les clients étrangers, le permis international est accepté.
      </>
    ),
  },
  {
    q: 'Puis-je récupérer la voiture à l\'aéroport d\'Oujda ?',
    a: (
      <>
        Oui. Nous proposons une <strong>livraison gratuite</strong> à l'aéroport Oujda-Angad, à votre hôtel ou
        à toute adresse sur Oujda. Précisez votre lieu de prise en charge lors de la réservation.
      </>
    ),
  },
  {
    q: 'Que se passe-t-il en cas d\'accident ?',
    a: (
      <>
        Tous nos véhicules sont assurés tous risques. En cas d'accident, contactez immédiatement notre numéro
        d'urgence (<strong>+212 6 62 11 43 21</strong>). Une déclaration sera établie sur place.
      </>
    ),
  },
  {
    q: 'Puis-je annuler ma réservation ?',
    a: (
      <>
        Oui, <strong>gratuitement jusqu'à 48 h</strong> avant la date de prise en charge.
        Pour toute annulation tardive, contactez-nous par WhatsApp ou téléphone — nous étudions chaque cas individuellement.
      </>
    ),
  },
];

export function AgencySection() {
  const [openIdx, setOpenIdx] = useState<number>(0); // première question ouverte par défaut

  const toggle = (i: number) => setOpenIdx(prev => (prev === i ? -1 : i));

  return (
    <section id="agences">
      <div className="inner">
        <div className="agences-grid">
          <div className="fade-in visible">
            <p className="section-label">Foire aux questions</p>
            <h2>Vos questions sur la location</h2>

            <div className="faq-list">
              {FAQ_ITEMS.map((item, i) => {
                const isOpen = openIdx === i;
                return (
                  <div key={i} className={`faq-item ${isOpen ? 'open' : ''}`}>
                    <button
                      type="button"
                      className="faq-q"
                      onClick={() => toggle(i)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${i}`}
                    >
                      <span className="faq-q-text">{item.q}</span>
                      <span className="faq-icon" aria-hidden="true" />
                    </button>
                    <div
                      id={`faq-a-${i}`}
                      className="faq-a"
                      role="region"
                    >
                      <div className="faq-a-inner">{item.a}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="fade-in visible">
            <p className="section-label">Localisation</p>
            <h2>Notre agence</h2>
            <div className="map-container" style={{ marginTop: '1.8rem' }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.141748695994!2d-1.943205525155004!3d34.67637178451934!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd7864d01f94ae55%3A0xf2c7619eafcb0db9!2sBenroubi%20Car!5e0!3m2!1sfr!2sma!4v1780575230599!5m2!1sfr!2sma"
                title="Localisation Benroubi Car — Oujda"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
