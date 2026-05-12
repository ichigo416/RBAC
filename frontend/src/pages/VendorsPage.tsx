import { useEffect, useState } from "react";
import { vendorsApi, rolesApi } from "../api";
import { Vendor, Role, RoleNode } from "../types";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [vendorDetail, setVendorDetail] = useState<{ roles: Role[]; hierarchy: RoleNode[] } | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const [v, r] = await Promise.all([vendorsApi.list(), rolesApi.list()]);
      setVendors(v);
      setRoles(r);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vendor?")) return;
    try {
      await vendorsApi.delete(id);
      await load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleExpand = async (vendor: Vendor) => {
    if (expanded === vendor.id) { setExpanded(null); setVendorDetail(null); return; }
    setExpanded(vendor.id);
    try {
      const d = await vendorsApi.get(vendor.id);
      setVendorDetail({ roles: d.roles, hierarchy: d.hierarchy });
    } catch (e: any) {
      alert(e.message);
    }
  };

  const openCreate = () => { setEditing(null); setShowModal(true); };
  const openEdit = (v: Vendor) => { setEditing(v); setShowModal(true); };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Vendors</div>
          <div className="page-subtitle">Assign role packages to vendors/businesses</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Vendor</button>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          <div className="card"><div className="empty-state">Loading vendors…</div></div>
        ) : vendors.length === 0 ? (
          <div className="card"><div className="empty-state">No vendors yet.</div></div>
        ) : (
          vendors.map((v) => (
            <div key={v.id} className="card" style={{ padding: 0 }}>
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{v.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{v.description}</div>
                </div>
                <span className="badge badge-blue">{v.roleIds.length} roles</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleExpand(v)}>
                    {expanded === v.id ? "▲ Hide" : "▼ View Roles"}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(v)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id)}>Delete</button>
                </div>
              </div>

              {/* Expanded detail */}
              {expanded === v.id && vendorDetail && (
                <div style={{ borderTop: "1px solid var(--border)", padding: "16px 20px" }}>
                  <div style={{ marginBottom: 16, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
                    Assigned Roles &amp; Hierarchy
                  </div>
                  <HierarchyTree nodes={vendorDetail.hierarchy} />

                  {/* Flat role details */}
                  <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                    {vendorDetail.roles.map((r) => (
                      <RoleCard key={r.id} role={r} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showModal && (
        <VendorModal
          roles={roles}
          editing={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}

// ─── Hierarchy Tree ───────────────────────────────────────────────────────────
function HierarchyTree({ nodes, depth = 0 }: { nodes: RoleNode[]; depth?: number }) {
  return (
    <div style={{ paddingLeft: depth * 20 }}>
      {nodes.map((node) => (
        <div key={node.role.id}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
            {depth > 0 && <span style={{ color: "var(--text-muted)", fontSize: 12 }}>└─</span>}
            <span className="badge badge-gray" style={{ fontFamily: "var(--sans)", fontSize: 13 }}>
              {node.role.name}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>level {node.role.level}</span>
          </div>
          {node.children.length > 0 && <HierarchyTree nodes={node.children} depth={depth + 1} />}
        </div>
      ))}
    </div>
  );
}

// ─── Role Card ────────────────────────────────────────────────────────────────
function RoleCard({ role }: { role: Role }) {
  return (
    <div style={{ background: "var(--surface2)", borderRadius: 7, padding: "12px 14px", border: "1px solid var(--border)" }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{role.name}</div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Pages:</div>
      <div className="tag-list" style={{ marginBottom: 8 }}>
        {role.allowedPages.map((p) => (
          <span key={p} className="badge badge-blue" style={{ fontSize: 10 }}>{p}</span>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>API Scopes:</div>
      {role.allowedScopes.map((s, i) => (
        <div key={i} style={{ fontSize: 11, color: "var(--text-muted)" }}>
          <span style={{ color: "var(--text)" }}>{s.path}</span> — {s.methods.join(", ")}
        </div>
      ))}
    </div>
  );
}

// ─── Vendor Modal ─────────────────────────────────────────────────────────────
interface VendorModalProps {
  roles: Role[];
  editing: Vendor | null;
  onClose: () => void;
  onSaved: () => void;
}

function VendorModal({ roles, editing, onClose, onSaved }: VendorModalProps) {
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [roleIds, setRoleIds] = useState<string[]>(editing?.roleIds ?? []);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleRole = (id: string) => {
    setRoleIds((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (!name.trim()) return setError("Vendor name is required");
    if (roleIds.length === 0) return setError("Assign at least one role");
    setError("");
    setSaving(true);
    try {
      const payload = { name: name.trim(), description: description.trim(), roleIds };
      if (editing) {
        await vendorsApi.update(editing.id, payload);
      } else {
        await vendorsApi.create(payload);
      }
      onSaved();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const sortedRoles = [...roles].sort((a, b) => a.level - b.level);

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{editing ? "Edit Vendor" : "Create Vendor"}</div>
        {error && <div className="error-box">{error}</div>}

        <div className="field">
          <label>Vendor Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Corp" />
        </div>

        <div className="field">
          <label>Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description…" />
        </div>

        <div className="field">
          <label>Assign Roles ({roleIds.length} selected)</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sortedRoles.map((r) => (
              <label key={r.id} className="checkbox-item">
                <input type="checkbox" checked={roleIds.includes(r.id)} onChange={() => toggleRole(r.id)} />
                <div>
                  <span style={{ fontWeight: 500 }}>{r.name}</span>
                  <span className="badge badge-gray" style={{ marginLeft: 8 }}>level {r.level}</span>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>{r.description}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : editing ? "Save Changes" : "Create Vendor"}
          </button>
        </div>
      </div>
    </div>
  );
}
