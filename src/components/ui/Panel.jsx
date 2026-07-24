export function Panel({ title, meta, actions, children, flush = false }) {
  return (
    <div className="panel">
      {(title || meta || actions) && (
        <div className="panel__header">
          <div>
            {title ? <h2 className="panel__title">{title}</h2> : null}
            {meta ? <p className="panel__meta">{meta}</p> : null}
          </div>
          {actions || null}
        </div>
      )}
      <div className={flush ? "panel__body panel__body--flush" : "panel__body"}>
        {children}
      </div>
    </div>
  );
}
