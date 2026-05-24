type BottomNavProps = {
  active: 'home' | 'stats' | 'settings' | 'guide';
  onHome: () => void;
  onStats: () => void;
  onSettings: () => void;
  onGuide: () => void;
};

export const BottomNav = ({ active, onHome, onStats, onSettings, onGuide }: BottomNavProps) => {
  const items = [
    { id: 'home', label: 'Home', icon: '⌂', onClick: onHome },
    { id: 'stats', label: 'Statistiche', icon: '▥', onClick: onStats },
    { id: 'settings', label: 'Impostazioni', icon: '⚙', onClick: onSettings },
    { id: 'guide', label: 'Guida', icon: '?', onClick: onGuide },
  ] as const;

  return (
    <nav className="bottom-nav" aria-label="Navigazione principale">
      {items.map((item) => (
        <button
          key={item.id}
          className={active === item.id ? 'active' : ''}
          type="button"
          onClick={item.onClick}
        >
          <span aria-hidden="true">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
};
