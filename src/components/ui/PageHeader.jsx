export function PageHeader({ eyebrow, title, lead, actions }) {
  return (
    <header className="page__header">
      <div className="page__header-text">
        {eyebrow ? <p className="page__eyebrow">{eyebrow}</p> : null}
        <h1 className="page__title">{title}</h1>
        {lead ? <p className="page__lead">{lead}</p> : null}
      </div>
      {actions ? <div className="page__actions">{actions}</div> : null}
    </header>
  );
}
