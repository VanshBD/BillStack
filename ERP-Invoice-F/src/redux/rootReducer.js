import { combineReducers } from 'redux';

import { reducer as authReducer } from './auth';
import { reducer as crudReducer } from './crud';
import { reducer as erpReducer } from './erp';
import { reducer as adavancedCrudReducer } from './adavancedCrud';
import { reducer as settingsReducer } from './settings';

// Combine all reducers.

import bankAccountReducer from './bankAccount/bankAccountSlice';
import termsReducer from './terms/termsSlice';

// Combine all reducers.

const rootReducer = combineReducers({
  auth: authReducer,
  crud: crudReducer,
  erp: erpReducer,
  adavancedCrud: adavancedCrudReducer,
  settings: settingsReducer,
  bankAccount: bankAccountReducer,
  terms: termsReducer,
});

export default rootReducer;
