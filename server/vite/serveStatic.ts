import express, { type Express } from "express";
import path from "path";
import fs from "fs";

export function serveStatic(app: Express) {
  const distPath = path.resolve(
    import.meta.dirname,
    "..",
    "..",
    "dist",
    "public",
  );

  if (!fs.existsSync(distPath)) {
    throw new Error(`Missing build directory at ${distPath}`);
  }

  app.use(express.static(distPath));

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
