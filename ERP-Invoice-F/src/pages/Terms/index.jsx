import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';

import useLanguage from '@/locale/useLanguage';

export default function Terms() {
    const translate = useLanguage();
    const entity = 'termsandconditions';
    const searchConfig = {
        displayLabels: ['title'],
        searchFields: 'title',
    };
    const deleteModalLabels = ['title'];

    const Labels = {
        PANEL_TITLE: translate('terms_and_conditions'),
        DATATABLE_TITLE: translate('terms_list'),
        ADD_NEW_ENTITY: translate('add_new_term'),
        ENTITY_NAME: translate('term'),
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
