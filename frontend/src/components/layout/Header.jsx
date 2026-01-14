import React from 'react';
import { Button } from '../ui/button';
import { Bell, Settings, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function Header({ title, subtitle, onRefresh, isRefreshing }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-white/10 glass-heavy">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-['Manrope']">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            data-testid="header-refresh-btn"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="header-notifications-btn">
              <Bell className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <span className="text-sm">Training completed</span>
                <span className="text-xs text-muted-foreground">Brain Tumor SSL - 2h ago</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <span className="text-sm">New dataset uploaded</span>
                <span className="text-xs text-muted-foreground">NIH Chest CT - 5h ago</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="header-settings-btn">
              <Settings className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Training Configuration</DropdownMenuItem>
            <DropdownMenuItem>Model Registry</DropdownMenuItem>
            <DropdownMenuItem>API Keys</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-2 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-medium">
          DR
        </div>
      </div>
    </header>
  );
}

export default Header;
