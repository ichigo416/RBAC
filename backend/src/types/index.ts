// ─── Core Types ───────────────────────────────────────────────────────────────

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiScope {
  path: string;       // e.g. "/api/orders"
  methods: HttpMethod[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  level: number;           // lower = higher authority (1 = top)
  parentRoleId: string | null;  // for hierarchy
  allowedPages: string[];  // e.g. ["/dashboard", "/orders"]
  allowedScopes: ApiScope[];
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  description: string;
  roleIds: string[];   // roles assigned to this vendor
  createdAt: string;
}

// ─── Request/Response bodies ──────────────────────────────────────────────────

export interface CreateRoleBody {
  name: string;
  description: string;
  level: number;
  parentRoleId?: string | null;
  allowedPages: string[];
  allowedScopes: ApiScope[];
}

export interface UpdateRoleBody extends Partial<CreateRoleBody> {}

export interface CreateVendorBody {
  name: string;
  description: string;
  roleIds: string[];
}

export interface UpdateVendorBody extends Partial<CreateVendorBody> {}

// ─── What other projects call to verify access ────────────────────────────────
export interface CheckAccessRequest {
  vendorId: string;
  roleId: string;
  page?: string;
  apiPath?: string;
  method?: HttpMethod;
}

export interface CheckAccessResponse {
  allowed: boolean;
  reason?: string;
}

export interface VendorRolesResponse {
  vendor: Vendor;
  roles: Role[];
  hierarchy: RoleNode[];
}

export interface RoleNode {
  role: Role;
  children: RoleNode[];
}
