import { PanelLeft, PanelRight } from 'lucide-react';
import { motion } from 'motion/react';
import { FC, ReactNode, useRef } from 'react';

import { useIsMobile } from '../../hooks/useIsMobile';
import { cn } from '../../utils';
import { Button } from '../Button';
import { SIDEBAR_CONFIG } from './constants';
import { useSidebarResize } from './hooks';

export type PlayerWorkspaceSidebarPropsBase = {
  children?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  persistentFooter?: ReactNode;
  isCollapsed: boolean;
  width: number;
  onWidthChange: (width: number) => void;
  onToggle: () => void;
  className?: string;
};

type PlayerWorkspaceSidebarProps = PlayerWorkspaceSidebarPropsBase & {
  side: 'left' | 'right';
};

export const PlayerWorkspaceSidebar: FC<PlayerWorkspaceSidebarProps> = ({
  children,
  headerActions,
  footer,
  persistentFooter,
  isCollapsed,
  width,
  onWidthChange,
  onToggle,
  side,
  className = '',
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isDrawer = useIsMobile();
  const { handleMouseDown, isResizingState } = useSidebarResize(
    width,
    onWidthChange,
    side,
    isCollapsed,
  );

  if (isDrawer && isCollapsed) {
    return null;
  }

  const expandedWidth = isDrawer ? SIDEBAR_CONFIG.DRAWER_WIDTH : width;
  const currentWidth = isCollapsed
    ? SIDEBAR_CONFIG.COLLAPSED_WIDTH
    : expandedWidth;

  return (
    <>
      {isDrawer && (
        <div
          data-testid={`sidebar-${side}-backdrop`}
          className="absolute inset-0 z-30 bg-black/40"
          onClick={onToggle}
        />
      )}
      <motion.div
        ref={sidebarRef}
        data-testid={`sidebar-${side}`}
        className={cn(
          'border-border relative flex flex-col overflow-hidden',
          {
            'surface-sidebar-left border-r-(length:--border-width)':
              side === 'left',
            'surface-sidebar-right border-l-(length:--border-width)':
              side === 'right',
            'absolute inset-y-0 z-40 max-w-[85vw] shadow-xl': isDrawer,
            'left-0': isDrawer && side === 'left',
            'right-0': isDrawer && side === 'right',
          },
          className,
        )}
        animate={{ width: currentWidth }}
        transition={
          isResizingState
            ? { duration: 0 }
            : {
                type: 'spring',
                stiffness: 300,
                damping: 30,
                mass: 0.8,
              }
        }
      >
        <span
          className={cn('mb-4 flex flex-row items-center', {
            'justify-end': side === 'left',
            'justify-start': side === 'right',
            'px-2 pt-2': !isCollapsed,
          })}
        >
          <Button
            data-testid={`sidebar-toggle-${side}`}
            className={cn('top-2 px-2', {
              'right-1': side === 'left',
              'left-1': side === 'right',
              'mx-1 mt-2': side === 'right' && isCollapsed,
            })}
            size="icon"
            onClick={onToggle}
          >
            {side === 'left' ? <PanelLeft /> : <PanelRight />}
          </Button>
          {!isCollapsed && headerActions && (
            <span className="flex flex-1 items-center justify-end gap-1">
              {headerActions}
            </span>
          )}
        </span>
        <div
          className={cn('flex flex-1 flex-col overflow-hidden', {
            'px-2 pb-2': !isCollapsed,
          })}
        >
          {children}
        </div>

        {!isCollapsed && footer}

        {persistentFooter && (
          <div className="mt-auto flex flex-col items-center gap-2 py-2">
            {persistentFooter}
          </div>
        )}

        {!isCollapsed && !isDrawer && (
          <div
            className={cn(
              'absolute top-0 bottom-0 w-1 cursor-col-resize transition-colors',
              side === 'left' ? 'right-0' : 'left-0',
            )}
            onMouseDown={handleMouseDown}
          />
        )}
      </motion.div>
    </>
  );
};
