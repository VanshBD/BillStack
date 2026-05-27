import request, { includeToken } from './request';
import axios from 'axios';

export const termsRequest = {
  list: (params) => request.list({ entity: 'termsandconditions', options: params }),
  getDefault: async (type) => {
    includeToken();
    const response = await axios.get(`termsandconditions/getDefault?type=${type}`);
    return response.data;
  },
  read: (id) => request.read({ entity: 'termsandconditions', id }),
  create: (data) => request.create({ entity: 'termsandconditions', jsonData: data }),
  update: (id, data) => request.update({ entity: 'termsandconditions', id, jsonData: data }),
  delete: (id) => request.delete({ entity: 'termsandconditions', id }),
  search: (params) => request.search({ entity: 'termsandconditions', options: params }),
  filter: (params) => request.filter({ entity: 'termsandconditions', options: params }),
  summary: (params) => request.summary({ entity: 'termsandconditions', options: params }),
  listAll: (params) => request.listAll({ entity: 'termsandconditions', options: params }),
};
