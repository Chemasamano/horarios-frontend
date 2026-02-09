import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  BookOpen, 
  UsersRound, 
  Building2, 
  CalendarDays,
  Clock
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/docentes', icon: Users, label: 'Docentes' },
    { path: '/materias', icon: BookOpen, label: 'Materias' },
    { path: '/grupos', icon: UsersRound, label: 'Grupos' },
    { path: '/aulas', icon: Building2, label: 'Aulas' },
    { path: '/horarios', icon: CalendarDays, label: 'Horarios' }
  ];

  return (
    <aside className="sidebar">
      <nav>
        <ul className="sidebar-nav">
          {navItems.map((item) => (
            <li key={item.path} className="sidebar-item">
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => 
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
