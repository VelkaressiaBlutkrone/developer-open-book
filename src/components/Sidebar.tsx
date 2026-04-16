import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { routes, type RouteConfig } from '../routes';

interface Props {
  onNavigate?: () => void;
  shelf?: string;
}

function groupByCategory(items: RouteConfig[]) {
  const groups: Record<string, RouteConfig[]> = {};
  items.forEach((r) => {
    const cat = r.category || 'General';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(r);
  });
  return groups;
}

export function Sidebar({ onNavigate, shelf }: Props) {
  const filteredRoutes = shelf
    ? routes.filter(r => r.shelf === shelf)
    : routes.filter(r => r.path !== '/');
  const groups = groupByCategory(filteredRoutes);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleGroup = (cat: string) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <nav className="sidebar-nav">
      {Object.entries(groups).map(([category, items]) => (
        <div key={category} className="sidebar-group">
          <button className="sidebar-category" onClick={() => toggleGroup(category)}>
            <span>{category}</span>
            <span className={`chevron ${collapsed[category] ? '' : 'open'}`}>&#9654;</span>
          </button>
          {!collapsed[category] && (
            <ul className="sidebar-links">
              {items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    onClick={onNavigate}
                  >
                    {item.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </nav>
  );
}
