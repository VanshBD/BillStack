import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import useLanguage from '@/locale/useLanguage';

export default function InventoryProduct() {
  const translate = useLanguage();
  const entity = 'product';

  const searchConfig = {
    displayLabels: ['name', 'sku', 'hsnCode'],
    searchFields: 'name,sku,description,hsnCode',
  };

  const deleteModalLabels = ['name'];

  const Labels = {
    PANEL_TITLE: translate('product'),
    DATATABLE_TITLE: translate('product_list'),
    ADD_NEW_ENTITY: translate('add_new_product'),
    ENTITY_NAME: translate('product'),
  };

  const configPage = {
    entity,
    ...Labels,
  };

  const fields = {
    name: {
      type: 'string',
      required: true,
    },
    sku: {
      type: 'string',
      required: true,
      disabled: true,
      disableForForm: true,
    },
    hsnCode: {
      type: 'string',
      label: 'HSN Code',
    },
    category: {
      type: 'async',
      label: 'category',
      entity: 'category',
      displayLabels: ['name'],
      outputValue: 'name',
    },
    price: {
      type: 'currency',
      required: true,
    },
    quantity: {
      type: 'number',
    },
    description: {
      type: 'textarea',
    },
  };

  const config = {
    ...configPage,
    fields,
    searchConfig,
    deleteModalLabels,
  };

  return (
    <CrudModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} isUpdateForm={true} />}
      config={config}
    />
  );
}
