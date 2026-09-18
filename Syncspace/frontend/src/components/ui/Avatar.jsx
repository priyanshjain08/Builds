function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ name, color = '#3654F4', size = 'md', online, className = '' }) {
  const sizeClass = { sm: 'avatar-sm', md: 'avatar-md', lg: 'avatar-lg' }[size] || 'avatar-md';
  const avatar = (
    <span className={`avatar ${sizeClass} ${className}`} style={{ background: color }} title={name}>
      {initials(name)}
    </span>
  );
  if (online === undefined) return avatar;
  return (
    <span className="avatar-wrap">
      {avatar}
      <span className={`presence-dot ${online ? 'online' : ''}`} />
    </span>
  );
}
