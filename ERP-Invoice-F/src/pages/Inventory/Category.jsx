import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import useLanguage from '@/locale/useLanguage';

const fields = {
    name: {
        type: 'string',
    },
    description: {
        type: 'textarea',
    },
};

export default function InventoryCategory() {
    const translate = useLanguage();
    const entity = 'category';

    const searchConfig = {
        displayLabels: ['name'],
        searchFields: 'name,description',
    };

    const deleteModalLabels = ['name'];

    const Labels = {
        PANEL_TITLE: translate('product category'),
        DATATABLE_TITLE: translate('product category'),
        ADD_NEW_ENTITY: translate('add_new_category') || 'Add new category',
        ENTITY_NAME: translate('product category'),
    };

    const configPage = {
        entity,
        ...Labels,
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
            updateForm={<DynamicForm fields={fields} />}
            config={config}
        />
    );
}
