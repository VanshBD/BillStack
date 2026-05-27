import request from './request';

export const bankAccountRequest = {
  list: (params) => request.list({ entity: 'bankaccount', options: params }),
  read: (id) => request.read({ entity: 'bankaccount', id }),
  create: (data) => request.create({ entity: 'bankaccount', jsonData: data }),
  update: (id, data) => request.update({ entity: 'bankaccount', id, jsonData: data }),
  delete: (id) => request.delete({ entity: 'bankaccount', id }),
  search: (params) => request.search({ entity: 'bankaccount', options: params }),
  filter: (params) => request.filter({ entity: 'bankaccount', options: params }),
  summary: (params) => request.summary({ entity: 'bankaccount', options: params }),
  listAll: (params) => request.listAll({ entity: 'bankaccount', options: params }),
};
