import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { 
  LayoutDashboard, 
  Database, 
  FlaskConical, 
  Settings2, 
  BarChart3, 
  Cpu,
  Activity,
  FolderKanban
} from 'lucide-react';

const navItems = [
  { 
    path: '/', 
    label: 'Dashboard', 
    icon: LayoutDashboard,
    description: 'Overview & metrics'
  },
  { 
    path: '/datasets', 
    label: 'Datasets', 
    icon: Database,
    description: 'Manage imaging data'
  },
  { 
    path: '/models', 
    label: 'Models', 
    icon: Cpu,
    description: 'Architecture configs'
  },
  { 
    path: '/experiments', 
    label: 'Experiments', 
    icon: FlaskConical,
    description: 'SSL pretraining'
  },
  { 
    path: '/training', 
    label: 'Training', 
    icon: Activity,
    description: 'Monitor progress'
  },
  { 
    path: '/results', 
    label: 'Results', 
    icon: BarChart3,
    description: 'Evaluation & comparison'
  },
];

export function Sidebar() {
  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col border-r border-white/10 bg-card/50 backdrop-blur-sm">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight font-['Manrope']">MedVision</h1>
            <p className="text-xs text-muted-foreground">SSL Framework</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
              "hover:bg-white/5 group",
              isActive && "bg-primary/10 border-l-2 border-primary"
            )}
            data-testid={`nav-${item.label.toLowerCase()}`}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <div className="flex-1">
                  <span className={cn(
                    "text-sm font-medium",
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    {item.label}
                  </span>
                  <p className="text-xs text-muted-foreground/70 hidden group-hover:block">
                    {item.description}
                  </p>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="px-3 py-2 rounded-md bg-secondary/50">
          <p className="text-xs text-muted-foreground">
            <span className="text-primary font-mono">DEMO MODE</span>
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Simulated training metrics
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
