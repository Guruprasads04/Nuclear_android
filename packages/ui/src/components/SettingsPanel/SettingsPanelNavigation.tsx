import { FC, ReactNode } from 'react';

import { ScrollableArea } from '../ScrollableArea/ScrollableArea';
import { SettingsNavigationSection } from './SettingsPanel';
import { SettingsPanelNavigationSection } from './SettingsPanelNavigationSection';

type SettingsPanelNavigationProps = {
  sections: SettingsNavigationSection[];
  footer?: ReactNode;
};

export const SettingsPanelNavigation: FC<SettingsPanelNavigationProps> = ({
  sections,
  footer,
}) => (
  <nav
    data-testid="settings-panel-navigation"
    className="border-border flex min-h-0 w-full flex-1 flex-col md:w-56 md:flex-none md:shrink-0 md:border-r-(length:--border-width)"
  >
    <ScrollableArea viewportClassName="gap-4 p-4">
      {sections.map((section) => (
        <SettingsPanelNavigationSection key={section.id} section={section} />
      ))}
      {footer && <div className="mt-auto">{footer}</div>}
    </ScrollableArea>
  </nav>
);
