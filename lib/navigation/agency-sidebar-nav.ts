/** Agency app left sidebar — MVP modules only (see agent-setup/modules/list.md). */
export const AGENCY_SIDEBAR_NAV = [
  { id: "dashboard", href: "/dashboard", label: "Dashboard", icon: "layout-grid" },
  { id: "requests", href: "/staffing-requests", label: "Staffing Requests", icon: "clipboard-list" },
  {
    id: "routed",
    href: "/staffing-requests/routed",
    label: "Routed requests",
    icon: "inbox",
    badge: "routed",
  },
  { id: "workforce", href: "/workforce", label: "Workforce", icon: "users" },
  { id: "facilities", href: "/facilities", label: "Facilities", icon: "building-2" },
  { id: "shifts", href: "/shifts", label: "Shifts", icon: "calendar-range" },
  { id: "compliance", href: "/compliance", label: "Compliance", icon: "shield-check" },
  { id: "notifications", href: "/notifications", label: "Notifications", icon: "bell" },
  { id: "settings", href: "/settings", label: "Settings", icon: "settings-2" },
] as const;

export type AgencySidebarNavId = (typeof AGENCY_SIDEBAR_NAV)[number]["id"];
