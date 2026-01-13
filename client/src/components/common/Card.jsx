const Card = ({ title, children, icon, action, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      {(title || icon || action) && (
        <div className="card-header">
          <div className="card-title-wrapper">
            {icon && <span className="card-icon">{icon}</span>}
            {title && <h3 className="card-title">{title}</h3>}
          </div>
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;
