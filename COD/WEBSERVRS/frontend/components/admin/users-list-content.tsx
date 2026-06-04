"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { InfoBanner } from "@/components/admin/info-banner";
import { PageHeader } from "@/components/admin/page-header";
import { TablePagination } from "@/components/admin/table-pagination";
import { RoleBadge } from "@/components/admin/role-badge";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { formatLastAccessEvent } from "@/lib/format-access-event";
import { getApiClient, isAdmin, refreshSessionFromApi } from "@/lib/auth";
import { ApiError } from "@/lib/types/api";
import type { UserPresenceItem } from "@/lib/types/user-presence";

type RoleFilter = "all" | "admin" | "user";

export function UsersListContent() {
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserPresenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [actionUserId, setActionUserId] = useState<number | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getApiClient().getPresence();
      setUsers(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Nu s-a putut încărca lista utilizatorilor.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refreshSessionFromApi();
      setUserIsAdmin(isAdmin());
    })();
    void loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
      const matchesSearch =
        !q ||
        fullName.includes(q) ||
        u.phone.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "suspended" && u.is_suspended) ||
        (statusFilter === "active" && !u.is_suspended);
      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "admin" && u.is_admin) ||
        (roleFilter === "user" && !u.is_admin);
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, search, statusFilter, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, roleFilter, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  async function handleSuspend(internalUserId: number) {
    if (!userIsAdmin) {
      setError("Doar administratorii pot suspenda utilizatori.");
      return;
    }
    if (!window.confirm("Comuți starea de suspendare pentru acest utilizator?")) {
      return;
    }
    setActionUserId(internalUserId);
    try {
      await getApiClient().suspendUser(internalUserId);
      await loadUsers();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Nu s-a putut actualiza utilizatorul.",
      );
    } finally {
      setActionUserId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Utilizatori"
        subtitle="Gestionează accesul, rolurile și prezența în sistem."
        crumbs={[{ label: "Prezentare generală" }, { label: "Utilizatori" }]}
        actions={
          userIsAdmin ? (
            <Link href="/admin/users/new">
              <Button type="button" className="!bg-[#004ac6] !text-white hover:!opacity-90">
                + Utilizator nou
              </Button>
            </Link>
          ) : undefined
        }
      />

      {!userIsAdmin && (
        <InfoBanner
          variant="warning"
          title="Cont fără rol administrator"
          message="Poți vedea lista. Pentru creare, editare și suspendare: setează is_admin = true în baza de date, apoi logout și login."
        />
      )}

      {error && <ErrorBanner message={error} />}

      <div className="mb-4 flex flex-col gap-3 rounded-lg border border-[#c3c6d7] bg-[#faf8ff] p-4 lg:flex-row lg:items-center">
        <input
          type="search"
          placeholder="Caută după nume sau telefon…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded border border-[#c3c6d7] bg-white px-3 py-2 text-sm text-[#191b23] outline-none focus:border-[#004ac6]"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
          className="rounded border border-[#c3c6d7] bg-white px-3 py-2 text-sm"
          aria-label="Filtru rol"
        >
          <option value="all">Rol: toate</option>
          <option value="admin">Administrator</option>
          <option value="user">Utilizator</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded border border-[#c3c6d7] bg-white px-3 py-2 text-sm"
          aria-label="Filtru stare cont"
        >
          <option value="all">Stare: toate</option>
          <option value="active">Activ</option>
          <option value="suspended">Suspendat</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#c3c6d7] bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-[#c3c6d7] bg-[#faf8ff] text-xs font-semibold uppercase tracking-wide text-[#555f6d]">
            <tr>
              <th className="px-4 py-3">Nume</th>
              <th className="px-4 py-3">Telefon</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Stare cont</th>
              <th className="px-4 py-3">Ultim acces</th>
              <th className="px-4 py-3 text-right">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#555f6d]">
                  Se încarcă…
                </td>
              </tr>
            )}
            {!loading && pageItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#555f6d]">
                  Niciun utilizator găsit.
                </td>
              </tr>
            )}
            {!loading &&
              pageItems.map((user) => {
                const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
                return (
                  <tr key={user.id} className="border-b border-[#c3c6d7] last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[rgba(37,99,235,0.12)] text-xs font-semibold text-[#004ac6]">
                          {initials}
                        </span>
                        <p className="font-semibold text-[#191b23]">
                          {user.first_name} {user.last_name}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px] text-[#191b23]">
                      {user.phone}
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge isAdmin={user.is_admin} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        active={!user.is_suspended}
                        suspended={user.is_suspended}
                      />
                    </td>
                    <td className="px-4 py-3 text-[#555f6d]">
                      {formatLastAccessEvent(user.last_access_event)}
                      {user.is_home && (
                        <span className="mt-0.5 block text-xs text-[#004ac6]">Acasă acum</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {userIsAdmin ? (
                          <>
                            <Link href={`/admin/users/${user.id}`}>
                              <Button
                                type="button"
                                variant="secondary"
                                className="!py-1.5 !text-xs"
                              >
                                Editează
                              </Button>
                            </Link>
                            <Button
                              type="button"
                              variant="secondary"
                              className="!py-1.5 !text-xs"
                              disabled={actionUserId === user.id}
                              onClick={() => void handleSuspend(user.id)}
                            >
                              {user.is_suspended ? "Reactivează" : "Suspendă"}
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-[#737686]">Doar vizualizare</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        {!loading && (
          <TablePagination
            page={safePage}
            pageSize={pageSize}
            totalItems={filtered.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>
    </>
  );
}
