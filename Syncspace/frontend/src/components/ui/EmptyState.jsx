import Icon from './Icon';

export default function EmptyState({ icon = 'layers', title, description, action }) {
  return (
    <div className="state-block">
      <div className="state-icon">
        <Icon name={icon} size={24} />
      </div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
