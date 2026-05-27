import CrudModule from '@/modules/CrudModule/CrudModule';
import ProductForm from '@/forms/ProductForm';
import useLanguage from '@/locale/useLanguage';

export default function Product() {
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
      label: 'Product Name',
    },
    sku: {
      type: 'string',
      required: true,
      disabled: true,
      disableForForm: true,
      label: 'SKU',
    },
    hsnCode: {
      type: 'string',
      label: 'HSN Code',
    },
    unit: {
      type: 'string',
      label: 'Unit',
    },
    taxCategory: {
      type: 'async',
      label: 'Tax Category',
      entity: 'taxes',
      displayLabels: ['taxName'],
      outputValue: '_id',
      required: true,
    },
    price: {
      type: 'currency',
      required: true,
      label: 'Price',
    },
    description: {
      type: 'textarea',
      label: 'Description',
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
      createForm={<ProductForm />}
      updateForm={<ProductForm isUpdateForm={true} />}
      config={config}
    />
  );
}
