type ModeCardProps = {
  title: string;
  subtitle: string;
  meta: string;
  icon: string;
  tone: 'green' | 'blue' | 'purple' | 'orange';
  onClick: () => void;
};

export const ModeCard = ({ title, subtitle, meta, icon, tone, onClick }: ModeCardProps) => (
  <button className={`mode-card ${tone}`} type="button" onClick={onClick}>
    <span className="mode-icon" aria-hidden="true">
      {icon}
    </span>
    <strong>{title}</strong>
    <small>{subtitle}</small>
    <em>{meta}</em>
  </button>
);
