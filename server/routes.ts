import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from 'jsonwebtoken';
import session from 'express-session';
import MemoryStore from 'memorystore';
import { 
  insertProjectSchema, 
  insertExperienceSchema, 
  insertEducationSchema, 
  insertSkillSchema, 
  insertArticleSchema, 
  insertMessageSchema, 
  insertSiteInfoSchema,
  insertUserSchema
} from '@shared/schema';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SESSION_SECRET = process.env.SESSION_SECRET || 'session-secret-key';

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

export async function registerRoutes(app: Express): Promise<Server> {
  const SessionStore = MemoryStore(session);
  
  // Set up session middleware
  app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const isValidPassword = await storage.verifyPassword(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      
      // Set session
      req.session.userId = user.id;
      req.session.isAuthenticated = true;
      
      res.json({ 
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
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
        role: user.role
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
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      res.json(project);
    } catch (error) {
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
        return res.status(400).json({ message: 'Invalid project data', errors: error.errors });
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
        return res.status(400).json({ message: 'Invalid project data', errors: error.errors });
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
        return res.status(400).json({ message: 'Invalid experience data', errors: error.errors });
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
        return res.status(400).json({ message: 'Invalid experience data', errors: error.errors });
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
        return res.status(400).json({ message: 'Invalid education data', errors: error.errors });
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
        return res.status(400).json({ message: 'Invalid education data', errors: error.errors });
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
        return res.status(400).json({ message: 'Invalid skill data', errors: error.errors });
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
        return res.status(400).json({ message: 'Invalid skill data', errors: error.errors });
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
      const published = req.query.published === 'true' ? true : 
                       req.query.published === 'false' ? false : 
                       undefined;
      
      // If not published filter is specified and not authenticated, only return published
      if (published === undefined && (!req.session || !req.session.isAuthenticated)) {
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
      if (!article.published && (!req.session || !req.session.isAuthenticated)) {
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
      if (!article.published && (!req.session || !req.session.isAuthenticated)) {
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
        return res.status(400).json({ message: 'Invalid article data', errors: error.errors });
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
        return res.status(400).json({ message: 'Invalid article data', errors: error.errors });
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
        return res.status(400).json({ message: 'Invalid message data', errors: error.errors });
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
        return res.status(400).json({ message: 'Invalid site info data', errors: error.errors });
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
      
      res.json({
        experiences,
        education,
        skills
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch CV data' });
    }
  });

  // Import/Export routes
  app.get('/api/export', authenticateJWT, async (req, res) => {
    try {
      const data = await storage.exportAllData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Error exporting data', error: (error as Error).message });
    }
  });

  app.post('/api/import', authenticateJWT, async (req, res) => {
    try {
      const importData = req.body;
      const result = await storage.importAllData(importData);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error importing data', error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
