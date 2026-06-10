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

  label: string;

  iconKey: NavIconKey;

  adminOnly?: boolean;
};

export const SIDE_NAV_ITEMS: NavItemConfig[] = [
  {
    id: "dashboard",
    href: "/dashboard",
    label: "MiauDașbord",
    iconKey: "dashboard",
  },

  {
    id: "users",

    href: "/admin/users",

    label: "Utilizatori",

    iconKey: "users",
  },

  { id: "access", href: "/access-log", label: "Acces", iconKey: "access" },

  {
    id: "presence",

    href: "/presence",

    label: "Prezență",

    iconKey: "presence",
  },

  { id: "lights", href: "/lights", label: "Iluminat", iconKey: "lighting" },

  { id: "heating", href: "/heating", label: "Încălzire", iconKey: "heating" },

  { id: "reports", href: "/reports", label: "Rapoarte", iconKey: "reports" },
];

/** Sub-rute /reports cu item dedicat în meniu — Reports nu le marchează active */

const REPORTS_OWNED_BY_OTHER_NAV: readonly string[] = [];

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";

  if (href === "/reports") {
    if (pathname === "/reports") return true;

    if (!pathname.startsWith("/reports/")) return false;

    return !REPORTS_OWNED_BY_OTHER_NAV.some(
      (owned) => pathname === owned || pathname.startsWith(`${owned}/`),
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export type PageMeta = {
  title: string;

  crumbs: { label: string; href?: string }[];
};

export function getPageMeta(pathname: string): PageMeta {
  if (pathname === "/dashboard") {
    return { title: "Prezentare generală", crumbs: [{ label: "Prezentare" }] };
  }

  if (pathname.startsWith("/admin/users")) {
    if (pathname.endsWith("/new")) {
      return {
        title: "Utilizator nou",

        crumbs: [
          { label: "Utilizatori", href: "/admin/users" },

          { label: "Creare" },
        ],
      };
    }

    if (pathname.match(/\/admin\/users\/\d+$/)) {
      return {
        title: "Editare utilizator",

        crumbs: [
          { label: "Utilizatori", href: "/admin/users" },

          { label: "Editare" },
        ],
      };
    }

    return {
      title: "Prezentare",

      crumbs: [{ label: "Utilizatori", href: "/admin/users" }],
    };
  }

  if (pathname === "/access-log") {
    return { title: "Acces", crumbs: [{ label: "Acces" }] };
  }

  if (pathname === "/presence" || pathname.startsWith("/presence/")) {
    return { title: "Prezență", crumbs: [{ label: "Prezență" }] };
  }

  if (pathname.startsWith("/reports/presence")) {
    return {
      title: "Raport prezență",
      crumbs: [{ label: "Rapoarte", href: "/reports" }, { label: "Prezență" }],
    };
  }

  if (pathname.startsWith("/reports")) {
    return { title: "Rapoarte", crumbs: [{ label: "Rapoarte" }] };
  }

  if (pathname.startsWith("/lights")) {
    return { title: "Iluminat", crumbs: [{ label: "Iluminat" }] };
  }

  if (pathname.startsWith("/heating/charts")) {
    return {
      title: "Încălzire",
      crumbs: [
        { label: "Rapoarte", href: "/reports" },
        { label: "Temperaturi" },
      ],
    };
  }

  if (pathname.startsWith("/heating/programs")) {
    return {
      title: "Încălzire",

      crumbs: [{ label: "Încălzire", href: "/heating" }, { label: "Programe" }],
    };
  }

  if (pathname.match(/\/heating\/\d+\/settings/)) {
    return {
      title: "Încălzire",

      crumbs: [
        { label: "Încălzire", href: "/heating" },

        { label: "Setări cameră" },
      ],
    };
  }

  if (pathname.startsWith("/heating")) {
    return { title: "Încălzire", crumbs: [{ label: "Încălzire" }] };
  }

  if (pathname === "/profile") {
    return { title: "Profil", crumbs: [{ label: "Utilizatori" }, { label: "Profil" }] };
  }

  return { title: "Prezentare", crumbs: [{ label: "Acasă" }] };
}
