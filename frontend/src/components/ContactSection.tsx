import { useState } from 'react';
import { submitContact } from '../services/bookings.service';

/** Section contact identique au legacy : #contact + .contact-grid + .contact-info + .contact-form-wrap. */
export function ContactSection() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('loading'); setErr('');
    try {
      const r = await submitContact({ nom, email, sujet, message });
      if (!r.success) throw new Error(r.message ?? 'Erreur');
      setState('success');
      setNom(''); setEmail(''); setSujet(''); setMessage('');
    } catch (e) { setErr((e as Error).message); setState('error'); }
  };

  return (
    <section id="contact">
      <div className="inner">
        <div className="contact-grid">
          <div className="contact-info fade-in visible">
            <p className="section-label">Nous joindre</p>
            <h2>Parlons-nous</h2>
            <p>Une question ? Notre équipe est disponible du lundi au samedi pour vous accompagner.</p>
            <div className="contact-links">
              <a href="tel:+212662114321" className="contact-link">
                <div className="contact-link-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <div className="contact-label">Téléphone</div>
                  +212 6 62 11 43 21
                </div>
              </a>
              <a href="https://wa.me/212662114321" target="_blank" rel="noopener" className="contact-link">
                <div className="contact-link-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                  </svg>
                </div>
                <div>
                  <div className="contact-label">WhatsApp</div>
                  +212 6 62 11 43 21
                </div>
              </a>
              <a href="mailto:benroubicar@yahoo.fr" className="contact-link">
                <div className="contact-link-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="contact-label">E-mail</div>
                  benroubicar@yahoo.fr
                </div>
              </a>
            </div>
          </div>

          <div className="contact-form-wrap fade-in visible">
            <h3>Envoyez-nous un message</h3>
            {state === 'success' ? (
              <p style={{ background: '#E8F5E9', border: '1px solid #4CAF50', padding: '1rem', color: '#2E7D32' }}>
                ✓ Message envoyé ! Nous vous répondrons sous 24h.
              </p>
            ) : (
              <form onSubmit={submit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nom</label>
                    <input type="text" value={nom} onChange={e => setNom(e.target.value)} placeholder="Votre nom" />
                  </div>
                  <div className="form-group">
                    <label>E-mail *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@example.com" required />
                  </div>
                  <div className="form-group full">
                    <label>Sujet</label>
                    <input type="text" value={sujet} onChange={e => setSujet(e.target.value)} placeholder="Question, devis…" />
                  </div>
                  <div className="form-group full">
                    <label>Message *</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Votre message…" required rows={4} />
                  </div>
                </div>
                {state === 'error' && (
                  <p style={{ color: '#DC2626', fontSize: '.85rem', marginTop: '.5rem' }}>
                    ❌ {err || 'Erreur, réessayez.'}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={state === 'loading'}
                  className="btn-primary"
                  style={{ marginTop: '1rem' }}
                >
                  {state === 'loading' ? 'Envoi…' : 'Envoyer le message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
