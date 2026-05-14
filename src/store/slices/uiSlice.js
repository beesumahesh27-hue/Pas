import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  sidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { setLoading, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
