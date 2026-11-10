import { FC, ReactNode, useEffect, useState } from 'react';

import { useIsMobile } from '../../hooks/useIsMobile';
import { DialogRoot } from '../Dialog/DialogRoot';
import { SettingsPanelContent } from './SettingsPanelContent';
import { SettingsPanelDetailHeader } from './SettingsPanelDetailHeader';
import { SettingsPanelNavigation } from './SettingsPanelNavigation';

export type SettingsNavigationItem = {
  id: string;
  label: string;
  icon?: ReactNode;
};

export type SettingsNavigationSection = {
  id: string;
  label: string;
  items: SettingsNavigationItem[];
  activeItemId: string | null;
  onSelect: (itemId: string) => void;
};

type SettingsPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  sections: SettingsNavigationSection[];
  navigationFooter?: ReactNode;
  backLabel?: string;
  children: ReactNode;
};

const findActiveItemLabel = (sections: SettingsNavigationSection[]) =>
  sections
    .flatMap((section) =>
      section.items.filter((item) => item.id === section.activeItemId),
    )
    .at(0)?.label ?? '';

export const SettingsPanel: FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  sections,
  navigationFooter,
  backLabel = 'Back',
  children,
}) => {
  const isMobile = useIsMobile();
  const [isShowingSection, setIsShowingSection] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsShowingSection(false);
    }
  }, [isOpen]);

  const mobileSections = sections.map((section) => ({
    ...section,
    activeItemId: null,
    onSelect: (itemId: string) => {
      section.onSelect(itemId);
      setIsShowingSection(true);
    },
  }));

  return (
    <DialogRoot
      isOpen={isOpen}
      onClose={onClose}
      className="narrow:inset-0 narrow:rounded-none narrow:border-0 fixed inset-8 flex w-auto max-w-none flex-col p-0 md:flex-row"
    >
      {!isMobile && (
        <>
          <SettingsPanelNavigation
            sections={sections}
            footer={navigationFooter}
          />
          <SettingsPanelContent>{children}</SettingsPanelContent>
        </>
      )}
      {isMobile && !isShowingSection && (
        <SettingsPanelNavigation
          sections={mobileSections}
          footer={navigationFooter}
        />
      )}
      {isMobile && isShowingSection && (
        <>
          <SettingsPanelDetailHeader
            title={findActiveItemLabel(sections)}
            backLabel={backLabel}
            onBack={() => setIsShowingSection(false)}
          />
          <SettingsPanelContent>{children}</SettingsPanelContent>
        </>
      )}
    </DialogRoot>
  );
};
