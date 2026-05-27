const useAppSettings = () => {
  let settings = {};
  settings['billstack_app_email'] = 'noreply@billstackapp.com';
  settings['billstack_base_url'] = 'https://cloud.billstackapp.com';
  return settings;
};

module.exports = useAppSettings;
