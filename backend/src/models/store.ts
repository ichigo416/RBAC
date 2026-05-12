import { Role, Vendor } from "../types";

// In-memory store – replace with a real DB (Postgres, MongoDB, etc.) as needed

class Store {
  roles: Map<string, Role> = new Map();
  vendors: Map<string, Vendor> = new Map();

  constructor() {
    this._seed();
  }

  private _seed() {
    // Seed some default roles for demo purposes
    const superAdmin: Role = {
      id: "role-1",
      name: "Super Admin",
      description: "Full platform access",
      level: 1,
      parentRoleId: null,
      allowedPages: ["/dashboard", "/orders", "/users", "/settings", "/reports", "/vendors"],
      allowedScopes: [
        { path: "/api/*", methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
      ],
      createdAt: new Date().toISOString(),
    };

    const manager: Role = {
      id: "role-2",
      name: "Manager",
      description: "Manage orders and users",
      level: 2,
      parentRoleId: "role-1",
      allowedPages: ["/dashboard", "/orders", "/users", "/reports"],
      allowedScopes: [
        { path: "/api/orders", methods: ["GET", "POST", "PUT", "PATCH"] },
        { path: "/api/users", methods: ["GET", "POST"] },
        { path: "/api/reports", methods: ["GET"] },
      ],
      createdAt: new Date().toISOString(),
    };

    const staff: Role = {
      id: "role-3",
      name: "Staff",
      description: "View and create orders",
      level: 3,
      parentRoleId: "role-2",
      allowedPages: ["/dashboard", "/orders"],
      allowedScopes: [
        { path: "/api/orders", methods: ["GET", "POST"] },
      ],
      createdAt: new Date().toISOString(),
    };

    const viewer: Role = {
      id: "role-4",
      name: "Viewer",
      description: "Read-only access",
      level: 4,
      parentRoleId: "role-3",
      allowedPages: ["/dashboard"],
      allowedScopes: [
        { path: "/api/orders", methods: ["GET"] },
      ],
      createdAt: new Date().toISOString(),
    };

    [superAdmin, manager, staff, viewer].forEach((r) => this.roles.set(r.id, r));

    // Seed vendors
    const vendorA: Vendor = {
      id: "vendor-1",
      name: "Acme Corp",
      description: "Primary logistics vendor",
      roleIds: ["role-1", "role-2", "role-3", "role-4"],
      createdAt: new Date().toISOString(),
    };

    const vendorB: Vendor = {
      id: "vendor-2",
      name: "Beta Solutions",
      description: "Secondary fulfillment vendor",
      roleIds: ["role-2", "role-3"],
      createdAt: new Date().toISOString(),
    };

    [vendorA, vendorB].forEach((v) => this.vendors.set(v.id, v));
  }
}

export const store = new Store();
