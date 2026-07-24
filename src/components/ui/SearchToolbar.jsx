import { Search } from "lucide-react";

export function SearchToolbar({ value, onChange, placeholder, countLabel }) {
  return (
    <div className="toolbar">
      <div className="toolbar__search">
        <Search size={15} aria-hidden="true" />
        <input
          type="search"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-label={placeholder || "Search"}
        />
      </div>
      {countLabel ? <span className="toolbar__count">{countLabel}</span> : null}
    </div>
  );
}
