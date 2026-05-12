import { Role, Vendor, VendorRolesResponse } from "../types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json() as Promise<T>;
}

// ─── Roles ────────────────────────────────────────────────────────────────────
export const rolesApi = {
  list: () => request<Role[]>("/roles"),
  get: (id: string) => request<Role>(`/roles/${id}`),
  create: (data: Omit<Role, "id" | "createdAt">) =>
    request<Role>("/roles", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Role>) =>
    request<Role>(`/roles/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => request<{ message: string }>(`/roles/${id}`, { method: "DELETE" }),
};

// ─── Vendors ──────────────────────────────────────────────────────────────────
export const vendorsApi = {
  list: () => request<Vendor[]>("/vendors"),
  get: (id: string) => request<VendorRolesResponse>(`/vendors/${id}`),
  create: (data: Omit<Vendor, "id" | "createdAt">) =>
    request<Vendor>("/vendors", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Vendor>) =>
    request<Vendor>(`/vendors/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => request<{ message: string }>(`/vendors/${id}`, { method: "DELETE" }),
};
