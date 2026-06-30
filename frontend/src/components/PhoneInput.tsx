import { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { COUNTRY_CODES, flagUrl, type CountryCode } from '../data/countryCodes';

interface Props {
  code: string;
  number: string;
  onCodeChange: (code: string) => void;
  onNumberChange: (number: string) => void;
  placeholder?: string;
  required?: boolean;
  /** Variante stylistique : `floating` pour le modal réservation, `classic` pour le formulaire contact */
  variant?: 'floating' | 'classic';
  inputClassName?: string;
}

const DROPDOWN_WIDTH = 320;
const DROPDOWN_MAX_HEIGHT = 360;

/**
 * Sélecteur d'indicatif téléphonique pro :
 * - Dropdown custom (pas le <select> natif) avec vrais drapeaux SVG
 * - Recherche par nom de pays ou indicatif
 * - Rendu via React Portal pour s'affranchir des stacking contexts
 * - Fermeture au clic extérieur / ESC / scroll
 * - Source flags : https://flagcdn.com (CDN gratuit)
 */
export function PhoneInput({
  code, number, onCodeChange, onNumberChange,
  placeholder = '6 12 34 56 78',
  required = false,
  variant = 'floating',
  inputClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected: CountryCode = useMemo(
    () => COUNTRY_CODES.find(c => c.code === code) ?? COUNTRY_CODES[0],
    [code]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRY_CODES;
    return COUNTRY_CODES.filter(c =>
      c.name.toLowerCase().includes(q) || c.code.includes(q)
    );
  }, [search]);

  // Calcule la position du dropdown à partir du trigger
  const computePos = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Si pas assez de place en bas, on l'affiche au-dessus
    const spaceBelow = vh - rect.bottom;
    const showAbove = spaceBelow < DROPDOWN_MAX_HEIGHT + 20 && rect.top > DROPDOWN_MAX_HEIGHT;

    let left = rect.left;
    if (left + DROPDOWN_WIDTH > vw - 12) left = vw - DROPDOWN_WIDTH - 12;
    if (left < 12) left = 12;

    const top = showAbove ? rect.top - DROPDOWN_MAX_HEIGHT - 8 : rect.bottom + 6;
    setPos({ top, left });
  };

  useLayoutEffect(() => {
    if (open) computePos();
  }, [open]);

  // Fermeture au clic extérieur + ESC + scroll/resize → reposition ou close
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onScroll = () => setOpen(false);
    const onResize = () => computePos();

    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true); // capture: catch nested scrolls aussi
    window.addEventListener('resize', onResize);

    setTimeout(() => searchRef.current?.focus(), 50);

    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const select = (c: CountryCode) => {
    onCodeChange(c.code);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className={`phone-input phone-input-${variant}`}>
      <button
        ref={triggerRef}
        type="button"
        className={`phone-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Indicatif ${selected.name} ${selected.code}`}
      >
        <img
          src={flagUrl(selected.iso)}
          alt=""
          aria-hidden="true"
          className="phone-flag"
          width={22}
          height={16}
          loading="lazy"
        />
        <span className="phone-code-label">{selected.code}</span>
        <svg className="phone-caret" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <input
        type="tel"
        className={inputClassName ?? 'phone-number'}
        value={number}
        onChange={e => onNumberChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete="tel-national"
      />

      {open && createPortal(
        <div
          ref={dropdownRef}
          className="phone-dropdown"
          role="listbox"
          style={{ top: pos.top, left: pos.left, width: DROPDOWN_WIDTH, maxHeight: DROPDOWN_MAX_HEIGHT }}
        >
          <div className="phone-dropdown-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un pays…"
              aria-label="Rechercher un pays"
            />
          </div>
          <ul className="phone-dropdown-list">
            {filtered.length === 0 ? (
              <li className="phone-dropdown-empty">Aucun pays trouvé</li>
            ) : (
              filtered.map(c => (
                <li
                  key={c.code + c.iso}
                  className={`phone-dropdown-item ${c.code === code ? 'selected' : ''}`}
                  role="option"
                  aria-selected={c.code === code}
                  onClick={() => select(c)}
                >
                  <img
                    src={flagUrl(c.iso)}
                    alt=""
                    aria-hidden="true"
                    className="phone-flag"
                    width={22}
                    height={16}
                    loading="lazy"
                  />
                  <span className="phone-dropdown-name">{c.name}</span>
                  <span className="phone-dropdown-code">{c.code}</span>
                </li>
              ))
            )}
          </ul>
        </div>,
        document.body
      )}
    </div>
  );
}
