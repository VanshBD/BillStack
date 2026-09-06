import { useState, useEffect } from 'react';
import { Switch } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';

export default function InteractiveSwitch({ record, entity, fieldKey, dispatch }) {
  const [checked, setChecked] = useState(record[fieldKey]);

  useEffect(() => {
    setChecked(record[fieldKey]);
  }, [record[fieldKey]]);

  const handleChange = async (val) => {
    setChecked(val);
    if (entity && dispatch) {
      try {
        const { request } = await import('@/request');
        const { crud } = await import('@/redux/crud/actions');
        await request.update({
          entity: entity,
          id: record._id,
          jsonData: { [fieldKey]: val },
        });
        dispatch(crud.list({ entity }));
      } catch (err) {
        console.error('Failed to toggle switch:', err);
        setChecked(!val); // revert on error
      }
    }
  };

  return (
    <Switch
      checked={checked}
      onChange={handleChange}
      checkedChildren={<CheckOutlined />}
      unCheckedChildren={<CloseOutlined />}
    />
  );
}
