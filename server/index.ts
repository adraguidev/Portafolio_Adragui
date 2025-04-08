import express, { type Request, Response, NextFunction } from 'express';
import { registerRoutes } from './routes';
import { log } from './vite/log'; // ✅ seguro de importar en cualquier entorno
import { autoTranslateMiddleware } from './middleware/autoTranslate';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Aplicar middleware de traducción automática a todas las rutas GET de la API
app.use((req, res, next) => {
  if (req.method === 'GET' && req.path.startsWith('/api')) {
    return autoTranslateMiddleware(req, res, next);
  }
  next();
});

// 🪵 Logging de todas las API
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: any;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + '…';
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // 🧩 Import dinámico oculto a esbuild → Heroku feliz 🎉
  if (process.env.NODE_ENV !== 'production') {
    const modulePath = new URL('./vite/setupVite.js', import.meta.url).pathname;
    const { setupVite } = await import(modulePath);
    await setupVite(app, server);
  } else {
    const modulePath = new URL('./vite/serveStatic.js', import.meta.url)
      .pathname;
    const { serveStatic } = await import(modulePath);
    serveStatic(app);
  }

  // ⚠️ Middleware de errores
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    res
      .status(status)
      .json({ message: err.message || 'Internal Server Error' });
    throw err;
  });

  const port = process.env.PORT || 5000;
  server.listen({ port, host: '0.0.0.0', reusePort: true }, () => {
    log(`serving on port ${port}`);
  });
})();
