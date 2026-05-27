import { useEffect, useRef } from 'react';
import useLanguage from '@/locale/useLanguage';
import PdfThemeSettingsModule from '@/modules/SettingModule/PdfThemeSettingsModule';
import request, { includeToken } from '@/request/request';

export default function PdfThemeSettings() {
  const translate = useLanguage();
  const seeded = useRef(false);

  // Auto-seed PDF theme settings for existing users on first visit
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    request.post({ entity: 'setting/seedPdfThemeSettings', jsonData: {} }).catch(() => {
      // silently ignore — settings may already exist
    });
  }, []);

  const configPage = {
    entity: 'setting',
    settingsCategory: 'pdf_theme_settings',
    PANEL_TITLE: translate('settings'),
    SETTINGS_TITLE: translate('PDF Theme Settings'),
  };

  return <PdfThemeSettingsModule config={configPage} />;
}
