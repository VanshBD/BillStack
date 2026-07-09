import { useState, useEffect, useRef } from 'react';

import { request } from '@/request';
import useOnFetch from '@/hooks/useOnFetch';
import useDebounce from '@/hooks/useDebounce';
import { useNavigate } from 'react-router-dom';

import { Select, Empty } from 'antd';
import useLanguage from '@/locale/useLanguage';

export default function AutoCompleteAsync({
  entity,
  displayLabels,
  searchFields,
  outputValue = '_id',
  redirectLabel = 'Add New',
  withRedirect = false,
  urlToRedirect = '/',
  value, /// this is for update
  onChange, /// this is for update
  onAddNew, /// optional handler for add-new action instead of redirect
  placeholder,
}) {
  const translate = useLanguage();

  const addNewValue = { value: 'redirectURL', label: `+ ${translate(redirectLabel)}` };

  const [selectOptions, setOptions] = useState([]);
  const [currentValue, setCurrentValue] = useState(undefined);

  const isUpdating = useRef(true);
  const isSearching = useRef(false);

  const [searching, setSearching] = useState(false);

  const [valToSearch, setValToSearch] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');

  const navigate = useNavigate();

  const handleSelectChange = (newValue) => {
    isUpdating.current = false;

    // "Add New" option — open modal or navigate, but never select it
    if (newValue === 'redirectURL' && withRedirect) {
      // Reset to previous value so "Add New Client" doesn't appear selected
      setCurrentValue(undefined);
      if (onAddNew) {
        onAddNew();
      } else {
        navigate(urlToRedirect);
      }
      return;
    }

    // Clear
    if (!newValue) {
      setCurrentValue(undefined);
      if (onChange) onChange(null, null);
      return;
    }

    const option = selectOptions.find((x) => (x[outputValue] || x) === newValue);
    setCurrentValue(newValue);
    if (onChange) {
      onChange(newValue, option || null);
    }
  };

  const [, cancel] = useDebounce(
    () => {
      setDebouncedValue(valToSearch);
    },
    500,
    [valToSearch]
  );

  const asyncSearch = async (options) => {
    return await request.search({ entity, options });
  };

  let { onFetch, result, isSuccess, isLoading } = useOnFetch();

  const labels = (optionField) => {
    if (typeof optionField === 'object' && optionField !== null) {
      return displayLabels.map((x) => optionField[x]).join(' ');
    }
    return optionField;
  };

  useEffect(() => {
    const options = {
      q: debouncedValue,
      fields: searchFields,
    };
    const callback = asyncSearch(options);
    onFetch(callback);

    return () => {
      cancel();
    };
  }, [debouncedValue]);

  const onSearch = (searchText) => {
    isSearching.current = true;
    setSearching(true);
    setValToSearch(searchText);
  };

  useEffect(() => {
    if (isSuccess) {
      setOptions(result);
    } else {
      setSearching(false);
    }
  }, [isSuccess, result]);

  // Handle value prop — supports both object (edit mode) and plain ID string (after quick-create)
  useEffect(() => {
    if (!value) return;

    // Object passed (edit mode) — extract ID and add to options for display
    if (typeof value === 'object' && value !== null) {
      const id = value[outputValue] || value._id;
      if (id) {
        setOptions((prev) => {
          const exists = prev.find((x) => (x[outputValue] || x._id) === id);
          return exists ? prev : [value, ...prev];
        });
        setCurrentValue(id);
        if (isUpdating.current) {
          onChange && onChange(id, value);
          isUpdating.current = false;
        }
      }
      return;
    }

    // Plain ID string passed (after quick-create from modal)
    // Only fetch if it looks like a MongoDB ObjectId (24 hex chars)
    if (typeof value === 'string' && value !== 'redirectURL') {
      setCurrentValue(value);
      isUpdating.current = false;

      const isMongoId = /^[a-f\d]{24}$/i.test(value);
      if (isMongoId) {
        // Only fetch if this ID isn't already in options
        const alreadyInOptions = selectOptions.find((x) => (x[outputValue] || x._id) === value);
        if (!alreadyInOptions) {
          request.read({ entity, id: value })
            .then((res) => {
              if (res && res.result) {
                setOptions((prev) => {
                  const exists = prev.find((x) => (x[outputValue] || x._id) === value);
                  return exists ? prev : [res.result, ...prev];
                });
              }
            })
            .catch(() => {/* silent */});
        }
      } else {
        // Plain text value (e.g. itemName) — just show as-is without fetching
        const syntheticOption = { [outputValue]: value, [displayLabels[0]]: value };
        setOptions((prev) => {
          const exists = prev.find((x) => (x[outputValue] || x._id) === value);
          return exists ? prev : [syntheticOption, ...prev];
        });
      }
    }
  }, [value]);

  return (
    <Select
      loading={isLoading}
      showSearch
      allowClear
      placeholder={placeholder || translate('Search')}
      defaultActiveFirstOption={false}
      filterOption={false}
      notFoundContent={searching ? '... Searching' : <Empty />}
      value={currentValue}
      onSearch={onSearch}
      onClear={() => {
        setCurrentValue(undefined);
        setSearching(false);
        if (onChange) onChange(null, null);
      }}
      onChange={handleSelectChange}
      style={{ minWidth: '220px' }}
    >
      {selectOptions.map((optionField) => (
        <Select.Option
          key={optionField[outputValue] || optionField}
          value={optionField[outputValue] || optionField}
        >
          {labels(optionField)}
        </Select.Option>
      ))}
      {withRedirect && <Select.Option value={addNewValue.value}>{addNewValue.label}</Select.Option>}
    </Select>
  );
}
