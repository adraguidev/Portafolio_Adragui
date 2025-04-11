import express, {
  type Express,
  Request,
  Response,
  NextFunction,
} from 'express';
import { createServer, type Server } from 'http';
import { storage } from './storage';
import jwt from 'jsonwebtoken';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;
import {
  insertProjectSchema,
  insertExperienceSchema,
  insertEducationSchema,
  insertSkillSchema,
  insertArticleSchema,
  insertMessageSchema,
  insertSiteInfoSchema,
  insertUserSchema,
} from '@shared/schema';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

// Configuración de directorios de carga
const setupUploadDirectory = () => {
  const uploadDir = 'uploads';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Configurar almacenamiento para archivos CV
const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Asegurarse de que el directorio de uploads existe
    const uploadDir = setupUploadDirectory();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar un nombre de archivo único basado en la fecha y el nombre original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'cv-' + uniqueSuffix + ext);
  },
});

// Configurar almacenamiento para imágenes del hero
const heroImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = setupUploadDirectory();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'hero-' + uniqueSuffix + ext);
  },
});

// Filtro para permitir solo ciertos tipos de archivos CV
const cvFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Aceptar solo archivos PDF, DOC y DOCX
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword' ||
    file.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
    return cb(new Error('Solo se permiten archivos PDF, DOC y DOCX'));
  }
};

// Filtro para permitir solo imágenes
const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Aceptar solo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false);
    return cb(new Error('Solo se permiten archivos de imagen'));
  }
};

// Inicializar multer para CV
const cvUpload = multer({
  storage: cvStorage,
  fileFilter: cvFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limitar tamaño a 5MB
  },
});

// Inicializar multer para imágenes del hero
const heroImageUpload = multer({
  storage: heroImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limitar tamaño a 5MB
  },
});

// Configuración de claves secretas
let JWT_SECRET: string;
let SESSION_SECRET: string;

// Verificar que las claves secretas estén configuradas en producción
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || !process.env.SESSION_SECRET) {
    throw new Error('JWT_SECRET and SESSION_SECRET must be set in production environment');
  }
  JWT_SECRET = process.env.JWT_SECRET;
  SESSION_SECRET = process.env.SESSION_SECRET;
} else {
  // En desarrollo, usar claves generadas dinámicamente si no están configuradas
  JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-' + Math.random().toString(36).substring(2);
  SESSION_SECRET = process.env.SESSION_SECRET || 'dev-session-secret-' + Math.random().toString(36).substring(2);
  
  if (!process.env.JWT_SECRET || !process.env.SESSION_SECRET) {
    console.warn('Warning: Using development keys. This is not secure for production.');
  }
}

// Extend Request type to include user property
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    isAuthenticated?: boolean;
  }
}

// Middleware to authenticate JWT
const authenticateJWT = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }

      req.session.userId = (user as any).id;
      req.session.isAuthenticated = true;
      next();
    });
  } else if (req.session && req.session.isAuthenticated) {
    // Also check session authentication
    next();
  } else {
    res.status(401).json({ message: 'Authentication required' });
  }
};

// Configuración de rate limiting para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por IP
  message: { message: 'Demasiados intentos de login, por favor intente más tarde' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Configuración de la base de datos para sesiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

const pgStore = pgSession(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Asegurarse de que existe el directorio uploads
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads', { recursive: true });
  }

  // Servir archivos estáticos desde el directorio uploads
  app.use('/uploads', express.static(path.resolve('uploads')));

  // Set up session middleware
  app.use(
    session({
      store: new pgStore({
        pool,
        tableName: 'sessions',
        createTableIfMissing: true,
        pruneSessionInterval: 60 * 60 // Limpiar sesiones expiradas cada hora
      }),
      secret: process.env.SESSION_SECRET || 'dev-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        sameSite: 'lax',
        httpOnly: true
      }
    })
  );

  // Auth routes
  app.post('/api/auth/login', loginLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: 'Email and password are required' });
      }

      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await storage.verifyPassword(
        password,
        user.password
      );

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '24h',
      });

      // Set session
      req.session.userId = user.id;
      req.session.isAuthenticated = true;

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', authenticateJWT, async (req, res) => {
    try {
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.error('Auth check error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Projects routes
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ message: 'Failed to fetch projects' });
    }
  });

  app.get('/api/projects/featured', async (req, res) => {
    try {
      const projects = await storage.getFeaturedProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch featured projects' });
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid project ID' });
      }
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ message: 'Failed to fetch project' });
    }
  });

  app.post('/api/projects', authenticateJWT, async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Invalid project data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create project' });
    }
  });

  app.put('/api/projects/:id', authenticateJWT, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const projectData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, projectData);

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Invalid project data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update project' });
    }
  });

  app.delete('/api/projects/:id', authenticateJWT, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProject(id);

      if (!success) {
        return res.status(404).json({ message: 'Project not found' });
      }

      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete project' });
    }
  });

  // Experiences routes
  app.get('/api/experiences', async (req, res) => {
    try {
      const experiences = await storage.getExperiences();
      res.json(experiences);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch experiences' });
    }
  });

  app.get('/api/experiences/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const experience = await storage.getExperience(id);

      if (!experience) {
        return res.status(404).json({ message: 'Experience not found' });
      }

      res.json(experience);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch experience' });
    }
  });

  app.post('/api/experiences', authenticateJWT, async (req, res) => {
    try {
      const experienceData = insertExperienceSchema.parse(req.body);
      const experience = await storage.createExperience(experienceData);
      res.status(201).json(experience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Invalid experience data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create experience' });
    }
  });

  app.put('/api/experiences/:id', authenticateJWT, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const experienceData = insertExperienceSchema.partial().parse(req.body);
      const experience = await storage.updateExperience(id, experienceData);

      if (!experience) {
        return res.status(404).json({ message: 'Experience not found' });
      }

      res.json(experience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Invalid experience data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update experience' });
    }
  });

  app.delete('/api/experiences/:id', authenticateJWT, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteExperience(id);

      if (!success) {
        return res.status(404).json({ message: 'Experience not found' });
      }

      res.json({ message: 'Experience deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete experience' });
    }
  });

  // Education routes
  app.get('/api/education', async (req, res) => {
    try {
      const education = await storage.getEducation();
      res.json(education);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch education' });
    }
  });

  app.get('/api/education/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const educationItem = await storage.getEducationItem(id);

      if (!educationItem) {
        return res.status(404).json({ message: 'Education item not found' });
      }

      res.json(educationItem);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch education item' });
    }
  });

  app.post('/api/education', authenticateJWT, async (req, res) => {
    try {
      const educationData = insertEducationSchema.parse(req.body);
      const education = await storage.createEducation(educationData);
      res.status(201).json(education);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Invalid education data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create education item' });
    }
  });

  app.put('/api/education/:id', authenticateJWT, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const educationData = insertEducationSchema.partial().parse(req.body);
      const education = await storage.updateEducation(id, educationData);

      if (!education) {
        return res.status(404).json({ message: 'Education item not found' });
      }

      res.json(education);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Invalid education data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update education item' });
    }
  });

  app.delete('/api/education/:id', authenticateJWT, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEducation(id);

      if (!success) {
        return res.status(404).json({ message: 'Education item not found' });
      }

      res.json({ message: 'Education item deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete education item' });
    }
  });

  // Skills routes
  app.get('/api/skills', async (req, res) => {
    try {
      const skills = await storage.getSkills();
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch skills' });
    }
  });

  app.get('/api/skills/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const skill = await storage.getSkill(id);

      if (!skill) {
        return res.status(404).json({ message: 'Skill not found' });
      }

      res.json(skill);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch skill' });
    }
  });

  app.post('/api/skills', authenticateJWT, async (req, res) => {
    try {
      const skillData = insertSkillSchema.parse(req.body);
      const skill = await storage.createSkill(skillData);
      res.status(201).json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Invalid skill data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create skill' });
    }
  });

  app.put('/api/skills/:id', authenticateJWT, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const skillData = insertSkillSchema.partial().parse(req.body);
      const skill = await storage.updateSkill(id, skillData);

      if (!skill) {
        return res.status(404).json({ message: 'Skill not found' });
      }

      res.json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Invalid skill data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update skill' });
    }
  });

  app.delete('/api/skills/:id', authenticateJWT, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSkill(id);

      if (!success) {
        return res.status(404).json({ message: 'Skill not found' });
      }

      res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete skill' });
    }
  });

  // Articles routes
  app.get('/api/articles', async (req, res) => {
    try {
      // Only return published articles for public access
      const published =
        req.query.published === 'true'
          ? true
          : req.query.published === 'false'
          ? false
          : undefined;

      // If not published filter is specified and not authenticated, only return published
      if (
        published === undefined &&
        (!req.session || !req.session.isAuthenticated)
      ) {
        const articles = await storage.getArticles(true);
        return res.json(articles);
      }

      const articles = await storage.getArticles(published);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch articles' });
    }
  });

  app.get('/api/articles/slug/:slug', async (req, res) => {
    try {
      const slug = req.params.slug;
      const article = await storage.getArticleBySlug(slug);

      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }

      // Only allow access to published articles unless authenticated
      if (
        !article.published &&
        (!req.session || !req.session.isAuthenticated)
      ) {
        return res.status(404).json({ message: 'Article not found' });
      }

      res.json(article);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch article' });
    }
  });

  app.get('/api/articles/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticle(id);

      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }

      // Only allow access to published articles unless authenticated
      if (
        !article.published &&
        (!req.session || !req.session.isAuthenticated)
      ) {
        return res.status(404).json({ message: 'Article not found' });
      }

      res.json(article);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch article' });
    }
  });

  app.post('/api/articles', authenticateJWT, async (req, res) => {
    try {
      const articleData = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(articleData);
      res.status(201).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Invalid article data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create article' });
    }
  });

  app.put('/api/articles/:id', authenticateJWT, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const articleData = insertArticleSchema.partial().parse(req.body);
      const article = await storage.updateArticle(id, articleData);

      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }

      res.json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Invalid article data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update article' });
    }
  });

  app.post('/api/articles/:id/publish', authenticateJWT, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.publishArticle(id);

      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }

      res.json(article);
    } catch (error) {
      res.status(500).json({ message: 'Failed to publish article' });
    }
  });

  app.post('/api/articles/:id/unpublish', authenticateJWT, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.unpublishArticle(id);

      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }

      res.json(article);
    } catch (error) {
      res.status(500).json({ message: 'Failed to unpublish article' });
    }
  });

  app.delete('/api/articles/:id', authenticateJWT, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteArticle(id);

      if (!success) {
        return res.status(404).json({ message: 'Article not found' });
      }

      res.json({ message: 'Article deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete article' });
    }
  });

  // Messages routes
  app.get('/api/messages', authenticateJWT, async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  app.get('/api/messages/:id', authenticateJWT, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const message = await storage.getMessage(id);

      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      res.json(message);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch message' });
    }
  });

  app.post('/api/messages', async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Invalid message data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  app.post('/api/messages/:id/read', authenticateJWT, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const message = await storage.markMessageAsRead(id);

      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      res.json(message);
    } catch (error) {
      res.status(500).json({ message: 'Failed to mark message as read' });
    }
  });

  app.delete('/api/messages/:id', authenticateJWT, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMessage(id);

      if (!success) {
        return res.status(404).json({ message: 'Message not found' });
      }

      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete message' });
    }
  });

  // Site Info routes
  app.get('/api/site-info', async (req, res) => {
    try {
      const siteInfo = await storage.getSiteInfo();

      if (!siteInfo) {
        return res.status(404).json({ message: 'Site info not found' });
      }

      res.json(siteInfo);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch site info' });
    }
  });

  app.put('/api/site-info', authenticateJWT, async (req, res) => {
    try {
      const siteInfoData = insertSiteInfoSchema.partial().parse(req.body);
      const siteInfo = await storage.updateSiteInfo(siteInfoData);

      if (!siteInfo) {
        return res.status(500).json({ message: 'Failed to update site info' });
      }

      res.json(siteInfo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Invalid site info data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update site info' });
    }
  });

  // CV endpoints (combines experiences, education, and skills)
  app.get('/api/cv', async (req, res) => {
    try {
      const experiences = await storage.getExperiences();
      const education = await storage.getEducation();
      const skills = await storage.getSkills();
      const siteInfo = await storage.getSiteInfo();

      res.json({
        experiences,
        education,
        skills,
        cvFileUrl: siteInfo?.cvFileUrl || null,
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch CV data' });
    }
  });

  // Ruta para descargar el archivo CV
  app.get('/api/cv/download', async (req, res) => {
    try {
      const siteInfo = await storage.getSiteInfo();

      if (!siteInfo || !siteInfo.cvFileUrl) {
        return res.status(404).json({ message: 'CV file not found' });
      }

      // Verificar si es una URL externa
      if (siteInfo.cvFileUrl.startsWith('http')) {
        // Redireccionar a la URL externa
        return res.redirect(siteInfo.cvFileUrl);
      }

      // Eliminar el '/' inicial si existe para archivos locales
      const relativePath = siteInfo.cvFileUrl.startsWith('/') 
        ? siteInfo.cvFileUrl.substring(1) 
        : siteInfo.cvFileUrl;

      const filePath = path.resolve(relativePath);

      // Verificar si el archivo existe
      if (!fs.existsSync(filePath)) {
        console.error(`CV file not found at path: ${filePath}`);
        return res.status(404).json({ message: 'CV file not found' });
      }

      res.download(filePath);
    } catch (error) {
      console.error('Error downloading CV file:', error);
      res.status(500).json({ message: 'Failed to download CV file' });
    }
  });

  // Ruta para subir el archivo CV
  app.post(
    '/api/cv/upload',
    authenticateJWT,
    cvUpload.single('cvFile'),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
        }

        const file = req.file;
        // Guardar la ruta sin el slash inicial
        const filePath = req.file.path;

        // Actualizar la información del sitio con la URL del CV
        const siteInfo = await storage.getSiteInfo();

        if (!siteInfo) {
          return res.status(500).json({ message: 'Site info not found' });
        }

        // Si ya existía un archivo, eliminarlo (limpieza)
        if (siteInfo.cvFileUrl && !siteInfo.cvFileUrl.startsWith('http')) {
          const oldFilePath = siteInfo.cvFileUrl.startsWith('/')
            ? siteInfo.cvFileUrl.substring(1)
            : siteInfo.cvFileUrl;

          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath);
              console.log(`Previous CV file deleted: ${oldFilePath}`);
            } catch (err) {
              console.error('Error deleting previous CV file:', err);
            }
          }
        }

        // Actualizar la URL del archivo CV
        const updatedSiteInfo = await storage.updateSiteInfo({
          cvFileUrl: filePath,
        });

        console.log(`CV file uploaded successfully: ${filePath}`);

        res.status(200).json({
          message: 'CV file uploaded successfully',
          cvFileUrl: filePath,
          file: {
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
          },
        });
      } catch (error) {
        console.error('Error uploading CV file:', error);
        res.status(500).json({ message: 'Failed to upload CV file' });
      }
    }
  );

  // Ruta para establecer una URL para el CV
  app.post('/api/cv/url', authenticateJWT, async (req, res) => {
    try {
      const { cvUrl } = req.body;

      if (!cvUrl) {
        return res.status(400).json({ message: 'No CV URL provided' });
      }

      // Validar que la URL sea válida
      try {
        new URL(cvUrl);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid URL format' });
      }

      // Actualizar la información del sitio con la URL del CV
      const siteInfo = await storage.getSiteInfo();

      if (!siteInfo) {
        return res.status(500).json({ message: 'Site info not found' });
      }

      // Si ya existía un archivo local, eliminarlo (limpieza)
      if (siteInfo.cvFileUrl && !siteInfo.cvFileUrl.startsWith('http')) {
        const oldFilePath = siteInfo.cvFileUrl.startsWith('/')
          ? siteInfo.cvFileUrl.substring(1)
          : siteInfo.cvFileUrl;

        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
            console.log(`Previous CV file deleted: ${oldFilePath}`);
          } catch (err) {
            console.error('Error deleting previous CV file:', err);
          }
        }
      }

      // Actualizar la URL del CV
      const updatedSiteInfo = await storage.updateSiteInfo({
        cvFileUrl: cvUrl,
      });

      console.log(`CV URL set successfully: ${cvUrl}`);

      res.status(200).json({
        message: 'CV URL set successfully',
        cvFileUrl: cvUrl,
      });
    } catch (error) {
      console.error('Error setting CV URL:', error);
      res.status(500).json({ message: 'Failed to set CV URL' });
    }
  });

  // Ruta para restaurar el CV por defecto (eliminar)
  app.post('/api/cv/reset', authenticateJWT, async (req, res) => {
    try {
      // Obtener la información actual del sitio
      const siteInfo = await storage.getSiteInfo();

      if (!siteInfo) {
        return res.status(500).json({ message: 'Site info not found' });
      }

      // Si hay un CV personalizado, borrarlo (solo si es local)
      if (siteInfo.cvFileUrl && !siteInfo.cvFileUrl.startsWith('http')) {
        const oldFilePath = siteInfo.cvFileUrl.startsWith('/')
          ? siteInfo.cvFileUrl.substring(1)
          : siteInfo.cvFileUrl;

        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
            console.log(`CV file deleted: ${oldFilePath}`);
          } catch (err) {
            console.error('Error deleting CV file:', err);
          }
        }
      }

      // Establecer el cvFileUrl a null para indicar que no hay CV
      const updatedSiteInfo = await storage.updateSiteInfo({
        cvFileUrl: null,
      });

      console.log('CV reset to default (removed)');

      res.status(200).json({
        message: 'CV reset successfully',
        siteInfo: updatedSiteInfo,
      });
    } catch (error) {
      console.error('Error resetting CV:', error);
      res.status(500).json({ message: 'Failed to reset CV' });
    }
  });

  // Ruta para subir la imagen del hero
  app.post(
    '/api/hero-image/upload',
    authenticateJWT,
    heroImageUpload.single('heroImage'),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: 'No image uploaded' });
        }

        const file = req.file;
        // Guardar la ruta sin el slash inicial
        const filePath = req.file.path;

        // Actualizar la información del sitio con la URL de la imagen del hero
        const siteInfo = await storage.getSiteInfo();

        if (!siteInfo) {
          return res.status(500).json({ message: 'Site info not found' });
        }

        // Si ya existía una imagen local, eliminarla (limpieza)
        if (
          siteInfo.heroImageUrl &&
          !siteInfo.heroImageUrl.startsWith('http')
        ) {
          const oldFilePath = siteInfo.heroImageUrl.startsWith('/')
            ? siteInfo.heroImageUrl.substring(1)
            : siteInfo.heroImageUrl;

          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath);
              console.log(`Previous hero image deleted: ${oldFilePath}`);
            } catch (err) {
              console.error('Error deleting previous hero image:', err);
            }
          }
        }

        // Actualizar la URL de la imagen del hero
        const updatedSiteInfo = await storage.updateSiteInfo({
          heroImageUrl: filePath,
        });

        console.log(`Hero image uploaded successfully: ${filePath}`);

        res.status(200).json({
          message: 'Hero image uploaded successfully',
          heroImageUrl: filePath,
          file: {
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
          },
        });
      } catch (error) {
        console.error('Error uploading hero image:', error);
        res.status(500).json({ message: 'Failed to upload hero image' });
      }
    }
  );

  // Ruta para establecer una URL de imagen para el hero
  app.post('/api/hero-image/url', authenticateJWT, async (req, res) => {
    try {
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ message: 'No image URL provided' });
      }

      // Validar que la URL sea válida
      try {
        new URL(imageUrl);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid URL format' });
      }

      // Actualizar la información del sitio con la URL de la imagen del hero
      const siteInfo = await storage.getSiteInfo();

      if (!siteInfo) {
        return res.status(500).json({ message: 'Site info not found' });
      }

      // Si ya existía una imagen local, eliminarla (limpieza)
      if (siteInfo.heroImageUrl && !siteInfo.heroImageUrl.startsWith('http')) {
        const oldFilePath = siteInfo.heroImageUrl.startsWith('/')
          ? siteInfo.heroImageUrl.substring(1)
          : siteInfo.heroImageUrl;

        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
            console.log(`Previous hero image deleted: ${oldFilePath}`);
          } catch (err) {
            console.error('Error deleting previous hero image:', err);
          }
        }
      }

      // Actualizar la URL de la imagen del hero
      const updatedSiteInfo = await storage.updateSiteInfo({
        heroImageUrl: imageUrl,
      });

      console.log(`Hero image URL set successfully: ${imageUrl}`);

      res.status(200).json({
        message: 'Hero image URL set successfully',
        heroImageUrl: imageUrl,
      });
    } catch (error) {
      console.error('Error setting hero image URL:', error);
      res.status(500).json({ message: 'Failed to set hero image URL' });
    }
  });

  // Ruta para restaurar la imagen por defecto del hero
  app.post('/api/hero-image/reset', authenticateJWT, async (req, res) => {
    try {
      // Obtener la información actual del sitio
      const siteInfo = await storage.getSiteInfo();

      if (!siteInfo) {
        return res.status(500).json({ message: 'Site info not found' });
      }

      // Si hay una imagen personalizada, borrarla (solo si es local)
      if (siteInfo.heroImageUrl && !siteInfo.heroImageUrl.startsWith('http')) {
        const oldFilePath = siteInfo.heroImageUrl.startsWith('/')
          ? siteInfo.heroImageUrl.substring(1)
          : siteInfo.heroImageUrl;

        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
            console.log(`Hero image deleted: ${oldFilePath}`);
          } catch (err) {
            console.error('Error deleting hero image:', err);
          }
        }
      }

      // Establecer el heroImageUrl a null para usar la imagen por defecto
      const updatedSiteInfo = await storage.updateSiteInfo({
        heroImageUrl: null,
      });

      console.log('Hero image reset to default');

      res.status(200).json({
        message: 'Hero image reset to default',
        siteInfo: updatedSiteInfo,
      });
    } catch (error) {
      console.error('Error resetting hero image:', error);
      res.status(500).json({ message: 'Failed to reset hero image' });
    }
  });

  // Import/Export routes
  app.get('/api/export', authenticateJWT, async (req, res) => {
    try {
      const data = await storage.exportAllData();
      res.json(data);
    } catch (error) {
      res.status(500).json({
        message: 'Error exporting data',
        error: (error as Error).message,
      });
    }
  });

  app.post('/api/import', authenticateJWT, async (req, res) => {
    try {
      const importData = req.body;
      const result = await storage.importAllData(importData);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        message: 'Error importing data',
        error: (error as Error).message,
      });
    }
  });

  // Ruta para obtener las configuraciones públicas incluyendo las API keys seguras
  app.get('/api/config', (req, res) => {
    res.json({
      tinymceApiKey: process.env.TINYMCE_API_KEY || '',
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
