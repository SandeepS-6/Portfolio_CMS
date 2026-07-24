export function EmptyState({ icon: Icon, title, detail }) {
  return (
    <div className="empty">
      {Icon ? (
        <span className="empty__icon" aria-hidden="true">
          <Icon size={20} strokeWidth={1.8} />
        </span>
      ) : null}
      <strong>{title}</strong>
      {detail ? <p>{detail}</p> : null}
    </div>
  );
}
