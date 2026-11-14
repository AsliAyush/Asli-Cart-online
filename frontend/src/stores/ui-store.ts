import { create } from "zustand";

interface UiState {
  isMobileMenuOpen: boolean;
  isSidebarCollapsed: boolean;
  isStaffMobileSidebarOpen: boolean;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleStaffMobileSidebar: () => void;
  setStaffMobileSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isMobileMenuOpen: false,
  isSidebarCollapsed: false,
  isStaffMobileSidebarOpen: false,
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  toggleStaffMobileSidebar: () =>
    set((state) => ({
      isStaffMobileSidebarOpen: !state.isStaffMobileSidebarOpen,
    })),
  setStaffMobileSidebarOpen: (open) =>
    set({ isStaffMobileSidebarOpen: open }),
}));
