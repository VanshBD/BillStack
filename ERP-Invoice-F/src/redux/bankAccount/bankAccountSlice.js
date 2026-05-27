import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bankAccountRequest } from '@/request/bankAccountRequest';

const initialState = {
  list: [],
  loading: false,
  error: null,
};

export const list = createAsyncThunk('bankAccount/list', async () => {
  const response = await bankAccountRequest.list();
  return response.result;
});

export const bankAccountSlice = createSlice({
  name: 'bankAccount',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setBankAccounts: (state, action) => {
      state.list = action.payload;
    },
    addBankAccount: (state, action) => {
      state.list.push(action.payload);
    },
    updateBankAccount: (state, action) => {
      const index = state.list.findIndex((acc) => acc._id === action.payload._id);
      if (index !== -1) state.list[index] = action.payload;
    },
    removeBankAccount: (state, action) => {
      state.list = state.list.filter((acc) => acc._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(list.pending, (state) => {
        state.loading = true;
      })
      .addCase(list.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(list.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  setLoading,
  setError,
  setBankAccounts,
  addBankAccount,
  updateBankAccount,
  removeBankAccount,
} = bankAccountSlice.actions;

export default bankAccountSlice.reducer;
