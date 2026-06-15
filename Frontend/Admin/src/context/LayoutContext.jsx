import { createContext, useContext } from "react";

export const LayoutContext = createContext({
  toggleSidebar: () => {},
  sidebarOpen: false,
  isLiveScoring: false,
});

export function useLayoutContext() {
  return useContext(LayoutContext);
}
