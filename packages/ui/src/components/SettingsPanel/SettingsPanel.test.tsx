import { render } from '@testing-library/react';
import { BlocksIcon, PaletteIcon } from 'lucide-react';

import { SettingsNavigationSection, SettingsPanel } from './SettingsPanel';
import { SettingsPanelWrapper } from './SettingsPanel.test-wrapper';

const sections: SettingsNavigationSection[] = [
  {
    id: 'general',
    label: 'Settings',
    items: [
      { id: 'general', label: 'General' },
      { id: 'plugins', label: 'Plugins' },
    ],
    activeItemId: 'general',
    onSelect: () => {},
  },
  {
    id: 'app',
    label: 'App',
    items: [
      { id: 'plugins', label: 'Plugins', icon: <BlocksIcon /> },
      { id: 'themes', label: 'Themes', icon: <PaletteIcon /> },
    ],
    activeItemId: null,
    onSelect: () => {},
  },
];

describe('SettingsPanel', () => {
  it('(Snapshot) renders when open', () => {
    const { asFragment } = render(
      <SettingsPanel isOpen onClose={() => {}} sections={sections}>
        <div>General content</div>
      </SettingsPanel>,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  describe('on a phone', () => {
    it('opens on the full-screen list of sections', () => {
      SettingsPanelWrapper.mountOnPhone();

      expect(SettingsPanelWrapper.navigation).toBeInTheDocument();
      expect(SettingsPanelWrapper.content).not.toBeInTheDocument();
    });

    it('shows the chosen section on its own page with its title', async () => {
      SettingsPanelWrapper.mountOnPhone();

      await SettingsPanelWrapper.openSection('Plugins');

      expect(SettingsPanelWrapper.navigation).not.toBeInTheDocument();
      expect(SettingsPanelWrapper.content).toHaveTextContent('Plugins content');
      expect(SettingsPanelWrapper.detailTitle).toHaveTextContent('Plugins');
    });

    it('goes back to the list of sections', async () => {
      SettingsPanelWrapper.mountOnPhone();
      await SettingsPanelWrapper.openSection('Plugins');

      await SettingsPanelWrapper.backButton.click();

      expect(SettingsPanelWrapper.navigation).toBeInTheDocument();
      expect(SettingsPanelWrapper.content).not.toBeInTheDocument();
    });
  });

  describe('on desktop', () => {
    it('shows the sections and the content side by side', async () => {
      SettingsPanelWrapper.mountOnDesktop();

      await SettingsPanelWrapper.openSection('Plugins');

      expect(SettingsPanelWrapper.navigation).toBeInTheDocument();
      expect(SettingsPanelWrapper.content).toHaveTextContent('Plugins content');
    });
  });
});
