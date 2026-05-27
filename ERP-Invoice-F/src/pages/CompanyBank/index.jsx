import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';

import useLanguage from '@/locale/useLanguage';

export default function CompanyBank() {
    const translate = useLanguage();
    const entity = 'bankaccount';
    const searchConfig = {
        displayLabels: ['bankName', 'accountNumber'],
        searchFields: 'bankName,accountNumber',
    };
    const deleteModalLabels = ['bankName'];

    const Labels = {
        PANEL_TITLE: translate('companyBanks'),
        DATATABLE_TITLE: translate('bankAccountsList'),
        ADD_NEW_ENTITY: translate('addNewBank'),
        ENTITY_NAME: translate('bankAccount'),
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
