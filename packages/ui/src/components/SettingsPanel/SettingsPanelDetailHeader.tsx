import { ArrowLeft } from 'lucide-react';
import { FC } from 'react';

import { Button } from '../Button';

type SettingsPanelDetailHeaderProps = {
  title: string;
  backLabel: string;
  onBack: () => void;
};

export const SettingsPanelDetailHeader: FC<SettingsPanelDetailHeaderProps> = ({
  title,
  backLabel,
  onBack,
}) => (
  <header className="border-border flex h-16 shrink-0 items-center gap-2 border-b-(length:--border-width) pr-14 pl-2">
    <Button
      variant="text"
      size="icon"
      aria-label={backLabel}
      data-testid="settings-panel-back"
      onClick={onBack}
    >
      <ArrowLeft />
    </Button>
    <h2
      data-testid="settings-panel-detail-title"
      className="font-heading truncate text-xl font-extrabold"
    >
      {title}
    </h2>
  </header>
);
