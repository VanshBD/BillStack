const useDate = ({ settings }) => {
  const { billstack_app_date_format } = settings;

  const dateFormat = billstack_app_date_format;

  return {
    dateFormat,
  };
};

module.exports = useDate;
