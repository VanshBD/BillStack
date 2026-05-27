import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { termsRequest } from '@/request/termsRequest';

const initialState = {
  list: [],
  defaultTerms: null,
  loading: false,
  error: null,
};

export const list = createAsyncThunk('terms/list', async (params) => {
  const response = await termsRequest.list(params);
  return response.result;
});

export const termsSlice = createSlice({
  name: 'terms',
  initialState,
  reducers: {
    setTerms: (state, action) => {
      state.list = action.payload;
    },
    setDefaultTerms: (state, action) => {
      state.defaultTerms = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
     setError: (state, action) => {
      state.error = action.payload;
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

export const { setTerms, setDefaultTerms, setLoading, setError } = termsSlice.actions;

export default termsSlice.reducer;
