export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiScope {
  path: string;
  methods: HttpMethod[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  parentRoleId: string | null;
  allowedPages: string[];
  allowedScopes: ApiScope[];
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  description: string;
  roleIds: string[];
  createdAt: string;
}

export interface RoleNode {
  role: Role;
  children: RoleNode[];
}

export interface VendorRolesResponse {
  vendor: Vendor;
  roles: Role[];
  hierarchy: RoleNode[];
}
