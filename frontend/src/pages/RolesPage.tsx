import { useEffect, useState } from "react";
import { rolesApi } from "../api";
import { Role, ApiScope, HttpMethod } from "../types";

const PAGES = ["/dashboard", "/orders", "/users", "/settings", "/reports", "/vendors", "/profile"];
const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "badge-green",
  POST: "badge-blue",
  PUT: "badge-gray",
  PATCH: "badge-gray",
  DELETE: "badge-red",
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setRoles(await rolesApi.list());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this role? It will be removed from all vendors.")) return;
    try {
      await rolesApi.delete(id);
      await load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const openCreate = () => { setEditing(null); setShowModal(true); };
  const openEdit = (r: Role) => { setEditing(r); setShowModal(true); };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Roles</div>
          <div className="page-subtitle">Define roles and their access permissions</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Role</button>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="card">
        {loading ? (
          <div className="empty-state">Loading roles…</div>
        ) : roles.length === 0 ? (
          <div className="empty-state">No roles yet. Create one to get started.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Level</th>
                  <th>Parent</th>
                  <th>Pages</th>
                  <th>API Scopes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{r.description}</div>
                    </td>
                    <td>
                      <span className="badge badge-gray">{r.level}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {r.parentRoleId ? roles.find((x) => x.id === r.parentRoleId)?.name ?? r.parentRoleId : "—"}
                      </span>
                    </td>
                    <td>
                      <div className="tag-list">
                        {r.allowedPages.map((p) => (
                          <span key={p} className="badge badge-blue">{p}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="tag-list">
                        {r.allowedScopes.map((s, i) => (
                          <span key={i} className="badge badge-gray">
                            {s.path} [{s.methods.join(",")}]
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <RoleModal
          roles={roles}
          editing={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}

// ─── Role Modal ───────────────────────────────────────────────────────────────

interface RoleModalProps {
  roles: Role[];
  editing: Role | null;
  onClose: () => void;
  onSaved: () => void;
}

interface ScopeEntry {
  path: string;
  methods: HttpMethod[];
}

function RoleModal({ roles, editing, onClose, onSaved }: RoleModalProps) {
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [level, setLevel] = useState(editing?.level ?? 1);
  const [parentRoleId, setParentRoleId] = useState<string>(editing?.parentRoleId ?? "");
  const [allowedPages, setAllowedPages] = useState<string[]>(editing?.allowedPages ?? []);
  const [scopes, setScopes] = useState<ScopeEntry[]>(
    editing?.allowedScopes ?? [{ path: "/api/", methods: ["GET"] }]
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const togglePage = (page: string) => {
    setAllowedPages((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]
    );
  };

  const updateScope = (i: number, field: keyof ScopeEntry, value: any) => {
    setScopes((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  const toggleMethod = (i: number, method: HttpMethod) => {
    setScopes((prev) =>
      prev.map((s, idx) =>
        idx === i
          ? { ...s, methods: s.methods.includes(method) ? s.methods.filter((m) => m !== method) : [...s.methods, method] }
          : s
      )
    );
  };

  const addScope = () => setScopes((prev) => [...prev, { path: "/api/", methods: ["GET"] }]);
  const removeScope = (i: number) => setScopes((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!name.trim()) return setError("Role name is required");
    if (allowedPages.length === 0) return setError("Select at least one allowed page");
    setError("");
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        level,
        parentRoleId: parentRoleId || null,
        allowedPages,
        allowedScopes: scopes as ApiScope[],
      };
      if (editing) {
        await rolesApi.update(editing.id, payload);
      } else {
        await rolesApi.create(payload);
      }
      onSaved();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const otherRoles = roles.filter((r) => r.id !== editing?.id);

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{editing ? "Edit Role" : "Create Role"}</div>
        {error && <div className="error-box">{error}</div>}

        <div className="field">
          <label>Role Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Manager" />
        </div>

        <div className="field">
          <label>Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description…" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field">
            <label>Level (1 = highest)</label>
            <input type="number" min={1} value={level} onChange={(e) => setLevel(Number(e.target.value))} />
          </div>
          <div className="field">
            <label>Parent Role (Hierarchy)</label>
            <select value={parentRoleId} onChange={(e) => setParentRoleId(e.target.value)}>
              <option value="">— None (top-level) —</option>
              {otherRoles.map((r) => (
                <option key={r.id} value={r.id}>{r.name} (level {r.level})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label>Allowed Pages</label>
          <div className="checkbox-grid">
            {PAGES.map((page) => (
              <label key={page} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={allowedPages.includes(page)}
                  onChange={() => togglePage(page)}
                />
                {page}
              </label>
            ))}
          </div>
        </div>

        <div className="field">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <label style={{ margin: 0 }}>API Scopes</label>
            <button className="btn btn-ghost btn-sm" onClick={addScope}>+ Add Scope</button>
          </div>
          {scopes.map((scope, i) => (
            <div key={i} style={{ background: "var(--surface2)", borderRadius: 7, padding: "12px", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  value={scope.path}
                  onChange={(e) => updateScope(i, "path", e.target.value)}
                  placeholder="/api/resource"
                  style={{ flex: 1 }}
                />
                <button className="btn btn-danger btn-sm" onClick={() => removeScope(i)}>✕</button>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {METHODS.map((m) => (
                  <button
                    key={m}
                    onClick={() => toggleMethod(i, m)}
                    className={`badge ${scope.methods.includes(m) ? METHOD_COLORS[m] : "badge-gray"}`}
                    style={{ cursor: "pointer", border: "none" }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : editing ? "Save Changes" : "Create Role"}
          </button>
        </div>
      </div>
    </div>
  );
}
