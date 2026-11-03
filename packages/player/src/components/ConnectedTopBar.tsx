import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { ChevronLeft, ListMusic, Menu } from 'lucide-react';
import { FC } from 'react';

import { useTranslation } from '@nuclearplayer/i18n';
import {
  Button,
  Tooltip,
  TopBar,
  TopBarLogo,
  TopBarNavigation,
  useIsMobile,
} from '@nuclearplayer/ui';

import { useAppVersion } from '../hooks/useAppVersion';
import { useCanGoForward } from '../hooks/useCanGoForward';
import { useCoreSetting } from '../hooks/useCoreSetting';
import { useFramelessWindow } from '../hooks/useFramelessWindow';
import { useMobileDrawerStore } from '../stores/mobileDrawerStore';
import { ConnectedThemeController } from './ConnectedThemeController';
import { JamQrCodeButton } from './JamQrCodeButton';
import { SearchBox } from './SearchBox';
import { UpdateBadge } from './UpdateBadge';

const MobileTopBar: FC = () => {
  const { t } = useTranslation('navigation');
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const toggleDrawer = useMobileDrawerStore((state) => state.toggle);

  return (
    <TopBar>
      <div className="flex flex-row items-center gap-2">
        <Button
          size="icon-sm"
          aria-label={t('openMenu')}
          data-testid="mobile-menu-button"
          onClick={() => toggleDrawer('navigation')}
        >
          <Menu size={16} />
        </Button>
        {canGoBack && (
          <Button
            size="icon-sm"
            data-testid="mobile-back-button"
            onClick={() => router.history.back()}
          >
            <ChevronLeft size={16} />
          </Button>
        )}
      </div>
      <SearchBox />
      <Button
        size="icon-sm"
        aria-label={t('openQueue')}
        data-testid="mobile-queue-button"
        onClick={() => toggleDrawer('queue')}
      >
        <ListMusic size={16} />
      </Button>
    </TopBar>
  );
};

const DesktopTopBar: FC = () => {
  const router = useRouter();
  const { version } = useAppVersion();
  const canGoBack = useCanGoBack();
  const canGoForward = useCanGoForward();
  const frameless = useFramelessWindow();
  const [isTitleBarEnabled] = useCoreSetting<boolean>(
    'appearance.customTitleBar',
  );

  return (
    <TopBar draggable={frameless}>
      <div className="flex flex-row items-center gap-4">
        {!isTitleBarEnabled && (
          <Tooltip
            content={`Nuclear ${version}`}
            side="bottom"
            wrapperClassName="flex items-center"
          >
            <TopBarLogo />
          </Tooltip>
        )}
        <TopBarNavigation
          onBack={() => router.history.back()}
          onForward={() => router.history.forward()}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
        />
        <UpdateBadge />
      </div>
      <SearchBox />
      <div className="flex flex-row items-center justify-end gap-2">
        <JamQrCodeButton />
        <ConnectedThemeController />
      </div>
    </TopBar>
  );
};

export const ConnectedTopBar: FC = () => {
  const isMobile = useIsMobile();

  return isMobile ? <MobileTopBar /> : <DesktopTopBar />;
};
