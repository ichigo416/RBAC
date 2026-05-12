import { useEffect, useState } from "react";
import { rolesApi, vendorsApi } from "../api";
import { Role, Vendor, HttpMethod } from "../types";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export default function AccessCheckPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [vendorId, setVendorId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [checkType, setCheckType] = useState<"page" | "api">("page");
  const [page, setPage] = useState("/dashboard");
  const [apiPath, setApiPath] = useState("/api/orders");
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [result, setResult] = useState<{ allowed: boolean; reason?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([vendorsApi.list(), rolesApi.list()]).then(([v, r]) => {
      setVendors(v);
      setRoles(r);
    });
  }, []);

  const selectedVendor = vendors.find((v) => v.id === vendorId);
  const availableRoles = selectedVendor
    ? roles.filter((r) => selectedVendor.roleIds.includes(r.id))
    : [];

  const handleCheck = async () => {
    if (!vendorId || !roleId) return alert("Select vendor and role");
    setLoading(true);
    setResult(null);
    try {
      const body: Record<string, string> = { vendorId, roleId };
      if (checkType === "page") {
        body.page = page;
      } else {
        body.apiPath = apiPath;
        body.method = method;
      }

      const res = await fetch("/api/access/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Access Checker</div>
          <div className="page-subtitle">
            Simulate the API call that other projects make to verify access
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Form */}
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Check Parameters</div>

          <div className="field">
            <label>Vendor</label>
            <select value={vendorId} onChange={(e) => { setVendorId(e.target.value); setRoleId(""); }}>
              <option value="">— Select vendor —</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Role</label>
            <select value={roleId} onChange={(e) => setRoleId(e.target.value)} disabled={!vendorId}>
              <option value="">— Select role —</option>
              {availableRoles.map((r) => <option key={r.id} value={r.id}>{r.name} (level {r.level})</option>)}
            </select>
          </div>

          <div className="field">
            <label>Check Type</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["page", "api"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setCheckType(t)}
                  className={`btn ${checkType === t ? "btn-primary" : "btn-ghost"}`}
                  style={{ flex: 1, textTransform: "capitalize" }}
                >
                  {t === "page" ? "🖥 Page Access" : "⚡ API Scope"}
                </button>
              ))}
            </div>
          </div>

          {checkType === "page" ? (
            <div className="field">
              <label>Page Path</label>
              <input value={page} onChange={(e) => setPage(e.target.value)} placeholder="/dashboard" />
            </div>
          ) : (
            <>
              <div className="field">
                <label>API Path</label>
                <input value={apiPath} onChange={(e) => setApiPath(e.target.value)} placeholder="/api/orders" />
              </div>
              <div className="field">
                <label>HTTP Method</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {METHODS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`badge ${method === m ? "badge-blue" : "badge-gray"}`}
                      style={{ cursor: "pointer", border: "none", padding: "6px 12px", fontSize: 12 }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleCheck} disabled={loading}>
            {loading ? "Checking…" : "Check Access"}
          </button>
        </div>

        {/* Result + Raw curl */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {result && (
            <div
              className="card"
              style={{ borderColor: result.allowed ? "var(--success)" : "var(--danger)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 32 }}>{result.allowed ? "✅" : "🚫"}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: result.allowed ? "var(--success)" : "var(--danger)" }}>
                    {result.allowed ? "ACCESS GRANTED" : "ACCESS DENIED"}
                  </div>
                  {result.reason && <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{result.reason}</div>}
                </div>
              </div>
              <pre style={{ fontFamily: "var(--mono)", fontSize: 11, background: "var(--surface2)", padding: 12, borderRadius: 6, overflow: "auto" }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 13 }}>
              cURL — How other projects call this
            </div>
            <pre style={{ fontFamily: "var(--mono)", fontSize: 11, background: "var(--surface2)", padding: 12, borderRadius: 6, overflow: "auto", lineHeight: 1.7 }}>
{`curl -X POST http://localhost:4000/api/access/check \\
  -H "Content-Type: application/json" \\
  -d '{
    "vendorId": "${vendorId || "<vendorId>"}",
    "roleId": "${roleId || "<roleId>"}",${
      checkType === "page"
        ? `\n    "page": "${page}"`
        : `\n    "apiPath": "${apiPath}",\n    "method": "${method}"`
    }
  }'`}
            </pre>

            <div style={{ marginTop: 16, fontWeight: 600, marginBottom: 10, fontSize: 13 }}>
              Or fetch all roles for a vendor on init:
            </div>
            <pre style={{ fontFamily: "var(--mono)", fontSize: 11, background: "var(--surface2)", padding: 12, borderRadius: 6, overflow: "auto" }}>
{`curl http://localhost:4000/api/vendors/${vendorId || "<vendorId>"}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
