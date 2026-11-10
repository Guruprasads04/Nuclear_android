import { render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC, useState } from 'react';

import { MOBILE_MEDIA_QUERY } from '../../hooks/useIsMobile';
import { SettingsNavigationSection, SettingsPanel } from './SettingsPanel';

const CONTENT: Record<string, string> = {
  general: 'General content',
  plugins: 'Plugins content',
};

const SettingsPanelHarness: FC = () => {
  const [activeItemId, setActiveItemId] = useState('general');
  const sections: SettingsNavigationSection[] = [
    {
      id: 'app',
      label: 'App',
      items: [
        { id: 'general', label: 'General' },
        { id: 'plugins', label: 'Plugins' },
      ],
      activeItemId,
      onSelect: setActiveItemId,
    },
  ];

  return (
    <SettingsPanel
      isOpen
      onClose={() => {}}
      sections={sections}
      backLabel="Back"
    >
      <div data-testid="settings-test-content">{CONTENT[activeItemId]}</div>
    </SettingsPanel>
  );
};

const setScreenWidth = (isPhone: boolean) => {
  window.matchMedia = vi.fn((query: string) => ({
    matches: isPhone && query === MOBILE_MEDIA_QUERY,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

export const SettingsPanelWrapper = {
  mountOnPhone(): RenderResult {
    setScreenWidth(true);
    return render(<SettingsPanelHarness />);
  },
  mountOnDesktop(): RenderResult {
    setScreenWidth(false);
    return render(<SettingsPanelHarness />);
  },

  get navigation() {
    return screen.queryByTestId('settings-panel-navigation');
  },
  get content() {
    return screen.queryByTestId('settings-test-content');
  },
  get detailTitle() {
    return screen.getByTestId('settings-panel-detail-title');
  },

  async openSection(label: string) {
    await userEvent.click(screen.getByRole('button', { name: label }));
  },

  backButton: {
    get element() {
      return screen.getByRole('button', { name: 'Back' });
    },
    async click() {
      await userEvent.click(this.element);
    },
  },
};
