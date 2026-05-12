import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import RolesPage from "./pages/RolesPage";
import VendorsPage from "./pages/VendorsPage";
import AccessCheckPage from "./pages/AccessCheckPage";

export default function App() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "auto", padding: "32px 36px" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/roles" replace />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/access-check" element={<AccessCheckPage />} />
        </Routes>
      </main>
    </div>
  );
}

function Sidebar() {
  const navStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px 14px",
    borderRadius: "7px",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 500,
    color: isActive ? "var(--accent)" : "var(--text-muted)",
    background: isActive ? "var(--accent-dim)" : "transparent",
    transition: "all 0.15s",
  });

  return (
    <aside
      style={{
        width: 220,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        flexShrink: 0,
      }}
    >
      <div style={{ marginBottom: "28px", padding: "0 6px" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          RBAC Manager
        </div>
        <div style={{ fontSize: "18px", fontWeight: 600, marginTop: "4px" }}>
          Access Control
        </div>
      </div>

      <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", padding: "0 6px", marginBottom: "6px" }}>
        Configuration
      </div>

      <NavLink to="/roles" style={navStyle}>
        <span>⬡</span> Roles
      </NavLink>
      <NavLink to="/vendors" style={navStyle}>
        <span>◈</span> Vendors
      </NavLink>

      <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", padding: "0 6px", marginBottom: "6px", marginTop: "20px" }}>
        Tools
      </div>

      <NavLink to="/access-check" style={navStyle}>
        <span>⊕</span> Access Checker
      </NavLink>
    </aside>
  );
}
