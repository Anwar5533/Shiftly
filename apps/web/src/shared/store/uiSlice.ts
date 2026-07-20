import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
}

const initialState: UiState = {
  theme: (localStorage.getItem('theme') as 'light' | 'dark' | 'system') ?? 'system',
  sidebarCollapsed: localStorage.getItem('sidebar-collapsed') === 'true',
  sidebarMobileOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<'light' | 'dark' | 'system'>) {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('sidebar-collapsed', String(state.sidebarCollapsed));
    },
    setSidebarMobileOpen(state, action: PayloadAction<boolean>) {
      state.sidebarMobileOpen = action.payload;
    },
  },
});

export const { setTheme, toggleSidebar, setSidebarMobileOpen } = uiSlice.actions;
export default uiSlice.reducer;
