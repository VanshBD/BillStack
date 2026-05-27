import SetingsSection from '../components/SetingsSection';
import UpdateSettingModule from '../components/UpdateSettingModule';
import PdfThemeSettingsForm from './SettingsForm';
import useLanguage from '@/locale/useLanguage';

export default function PdfThemeSettingsModule({ config }) {
  const translate = useLanguage();
  return (
    <UpdateSettingModule config={config}>
      <SetingsSection
        title={translate('PDF Theme Settings')}
        description={translate('Customize colors, fonts, and layout options for generated PDF documents')}
      >
        <PdfThemeSettingsForm />
      </SetingsSection>
    </UpdateSettingModule>
  );
}
