export type NavIconKey =
  | "dashboard"
  | "users"
  | "access"
  | "presence"
  | "lighting"
  | "heating"
  | "reports";

export type NavItemConfig = {
  id: string;
  href: string;
  /** Etichetă exactă din Figma SideNavBar */
  label: string;
  iconKey: NavIconKey;
  adminOnly?: boolean;
};

/** Meniu lateral — texte EN ca în Figma 102:2714 */
export const SIDE_NAV_ITEMS: NavItemConfig[] = [
  { id: "dashboard", href: "/dashboard", label: "Dashboard", iconKey: "dashboard" },
  {
    id: "users",
    href: "/admin/users",
    label: "Users",
    iconKey: "users",
  },
  { id: "access", href: "/access-log", label: "Access", iconKey: "access" },
  {
    id: "presence",
    href: "/reports/presence",
    label: "Presence",
    iconKey: "presence",
  },
  { id: "lights", href: "/lights", label: "Lighting", iconKey: "lighting" },
  { id: "heating", href: "/heating", label: "Heating", iconKey: "heating" },
  { id: "reports", href: "/reports", label: "Reports", iconKey: "reports" },
];

export type PageMeta = {
  /** H2 TopAppBar — 24px bold */
  title: string;
  crumbs: { label: string; href?: string }[];
};

/** Titluri EN aliniate la Header TopAppBar din Figma */
export function getPageMeta(pathname: string): PageMeta {
  if (pathname === "/dashboard") {
    return { title: "Overview", crumbs: [{ label: "Dashboard" }] };
  }
  if (pathname.startsWith("/admin/users")) {
    if (pathname.endsWith("/new")) {
      return {
        title: "Create User",
        crumbs: [
          { label: "Users", href: "/admin/users" },
          { label: "Create New User" },
        ],
      };
    }
    if (pathname.includes("/device")) {
      return {
        title: "Binding",
        crumbs: [
          { label: "Users", href: "/admin/users" },
          { label: "Binding" },
        ],
      };
    }
    if (pathname.match(/\/admin\/users\/\d+$/)) {
      return {
        title: "Edit User",
        crumbs: [
          { label: "Users", href: "/admin/users" },
          { label: "Edit" },
        ],
      };
    }
    return {
      title: "Overview",
      crumbs: [{ label: "Users", href: "/admin/users" }],
    };
  }
  if (pathname === "/access-log") {
    return { title: "Access", crumbs: [{ label: "Access" }] };
  }
  if (pathname.startsWith("/reports/presence")) {
    return {
      title: "Presence",
      crumbs: [{ label: "Reports", href: "/reports" }, { label: "Presence" }],
    };
  }
  if (pathname.startsWith("/reports")) {
    return { title: "Reports", crumbs: [{ label: "Reports" }] };
  }
  if (pathname.startsWith("/lights")) {
    return { title: "Lighting", crumbs: [{ label: "Lighting" }] };
  }
  if (pathname.startsWith("/heating")) {
    return { title: "Heating", crumbs: [{ label: "Heating" }] };
  }
  if (pathname === "/profile") {
    return { title: "Profile", crumbs: [{ label: "Account" }] };
  }

  return { title: "Overview", crumbs: [{ label: "Home" }] };
}
