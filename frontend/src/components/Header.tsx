import { useState } from 'react';

/** Header fidèle au legacy (logo + nav-desk + burger + nav-mob). */
export function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <header id="hdr">
        <a href="#accueil" className="logo">Benroubi<span> Car</span></a>
        <nav className="nav-desk">
          <a href="#accueil">Accueil</a>
          <a href="#catalogue">Catalogue</a>
          <a href="#agences">Agence</a>
          <a href="#contact">Contact</a>
          <a href="#catalogue" className="nav-cta">Voir les véhicules</a>
        </nav>
        <button
          className={`burger ${open ? 'open' : ''}`}
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          <span></span><span></span><span></span>
        </button>
      </header>

      <div className={`nav-mob ${open ? 'open' : ''}`}>
        <a href="#accueil"   className="mob-link" onClick={close}>Accueil</a>
        <a href="#catalogue" className="mob-link" onClick={close}>Catalogue</a>
        <a href="#agences"   className="mob-link" onClick={close}>Agence</a>
        <a href="#contact"   className="mob-link" onClick={close}>Contact</a>
        <a href="#catalogue" className="mob-cta mob-link" onClick={close}>Voir les véhicules</a>
      </div>
    </>
  );
}
