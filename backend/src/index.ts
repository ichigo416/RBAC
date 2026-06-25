import express from "express";
import cors from "cors";
import rolesRouter from "./routes/roles";
import vendorsRouter from "./routes/vendors";
import accessRouter from "./routes/access";

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Request logger ───────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/roles", rolesRouter);
app.use("/api/vendors", vendorsRouter);
app.use("/api/access", accessRouter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n RBAC Service running on http://localhost:${PORT}`);
  console.log(`   Roles:   GET /api/roles`);
  console.log(`   Vendors: GET /api/vendors`);
  console.log(`   Access:  POST /api/access/check\n`);
});

export default app;
