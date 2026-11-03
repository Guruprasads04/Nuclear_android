import { FC, ReactNode } from 'react';

import { BottomBar } from '..';
import { cn } from '../../utils';

export type PlayerBarRootProps = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
};
export const PlayerBarRoot: FC<PlayerBarRootProps> = ({
  left,
  center,
  right,
  className = '',
}) => (
  <BottomBar className={cn('px-2 md:px-4', className)}>
    <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-4">
      {left && <div className="min-w-0">{left}</div>}
      {center && <div className="justify-self-center">{center}</div>}
      {right && <div className="hidden justify-self-end md:block">{right}</div>}
    </div>
  </BottomBar>
);
