import { 
  User, InsertUser, 
  Project, InsertProject, 
  Experience, InsertExperience, 
  Education, InsertEducation,
  Skill, InsertSkill,
  Article, InsertArticle,
  Message, InsertMessage,
  SiteInfo, InsertSiteInfo,
  users, projects, experiences, education, skills, articles, messages, siteInfo
} from '@shared/schema';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { eq, desc, asc, and, isNull, isNotNull, sql } from 'drizzle-orm';

// Define the structure for import/export data
export interface PortfolioData {
  projects: Project[];
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  articles: Article[];
  siteInfo?: SiteInfo;
}

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;

  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getFeaturedProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Experience
  getExperiences(): Promise<Experience[]>;
  getExperience(id: number): Promise<Experience | undefined>;
  createExperience(experience: InsertExperience): Promise<Experience>;
  updateExperience(id: number, experience: Partial<InsertExperience>): Promise<Experience | undefined>;
  deleteExperience(id: number): Promise<boolean>;

  // Education
  getEducation(): Promise<Education[]>;
  getEducationItem(id: number): Promise<Education | undefined>;
  createEducation(education: InsertEducation): Promise<Education>;
  updateEducation(id: number, education: Partial<InsertEducation>): Promise<Education | undefined>;
  deleteEducation(id: number): Promise<boolean>;

  // Skills
  getSkills(): Promise<Skill[]>;
  getSkill(id: number): Promise<Skill | undefined>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<boolean>;

  // Articles
  getArticles(published?: boolean): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined>;
  publishArticle(id: number): Promise<Article | undefined>;
  unpublishArticle(id: number): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;

  // Messages
  getMessages(): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  deleteMessage(id: number): Promise<boolean>;

  // Site Info
  getSiteInfo(): Promise<SiteInfo | undefined>;
  updateSiteInfo(info: Partial<InsertSiteInfo>): Promise<SiteInfo | undefined>;
  
  // Import/Export
  exportAllData(): Promise<PortfolioData>;
  importAllData(data: PortfolioData): Promise<{ success: boolean; message: string }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private experiences: Map<number, Experience>;
  private education: Map<number, Education>;
  private skills: Map<number, Skill>;
  private articles: Map<number, Article>;
  private messages: Map<number, Message>;
  private siteInfo: SiteInfo | undefined;
  
  private userId: number;
  private projectId: number;
  private experienceId: number;
  private educationId: number;
  private skillId: number;
  private articleId: number;
  private messageId: number;
  private siteInfoId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.experiences = new Map();
    this.education = new Map();
    this.skills = new Map();
    this.articles = new Map();
    this.messages = new Map();
    
    this.userId = 1;
    this.projectId = 1;
    this.experienceId = 1;
    this.educationId = 1;
    this.skillId = 1;
    this.articleId = 1;
    this.messageId = 1;
    this.siteInfoId = 1;

    // Seed initial admin user
    this.seedAdminUser();
    // Seed sample data
    this.seedInitialData();
  }

  private async seedAdminUser() {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin: User = {
      id: this.userId++,
      username: 'admin',
      password: hashedPassword,
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin'
    };
    
    this.users.set(admin.id, admin);
  }

  private seedInitialData() {
    // Seed site info
    this.siteInfo = {
      id: this.siteInfoId,
      about: "Creating digital experiences that combine beautiful design with powerful functionality.",
      contactEmail: "hello@alexmorgan.dev",
      contactPhone: "+1 (555) 123-4567",
      contactLocation: "San Francisco, CA",
      cvFileUrl: null, // Nuevo campo para el archivo CV
      heroImageUrl: null, // Nuevo campo para la imagen del Hero
      socialLinks: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
        dribbble: "https://dribbble.com"
      }
    };

    // Seed sample experiences
    const exp1: Experience = {
      id: this.experienceId++,
      title: "Senior Web Developer",
      company: "TechCorp Solutions",
      description: "Led development of enterprise SaaS applications. Implemented CI/CD pipelines and mentored junior developers. Reduced load times by 40% through code optimization.",
      startDate: "2021",
      endDate: null,
      isCurrent: true,
      order: 1
    };

    const exp2: Experience = {
      id: this.experienceId++,
      title: "Web Developer",
      company: "Digital Creations Agency",
      description: "Built responsive websites and web applications for diverse clients. Collaborated with design team to implement pixel-perfect UIs. Maintained and optimized existing codebases.",
      startDate: "2018",
      endDate: "2021",
      isCurrent: false,
      order: 2
    };

    this.experiences.set(exp1.id, exp1);
    this.experiences.set(exp2.id, exp2);

    // Seed sample education
    const edu1: Education = {
      id: this.educationId++,
      degree: "BSc Computer Science",
      institution: "University of Technology",
      description: "Specialized in web technologies and software engineering. Capstone project focused on building a real-time collaboration platform.",
      startDate: "2014",
      endDate: "2018",
      order: 1
    };

    this.education.set(edu1.id, edu1);

    // Seed sample skills
    const skillFrontend: Skill = {
      id: this.skillId++,
      category: "Frontend",
      items: ["HTML5/CSS3", "JavaScript (ES6+)", "React", "Vue.js", "Tailwind CSS", "TypeScript"],
      order: 1
    };

    const skillBackend: Skill = {
      id: this.skillId++,
      category: "Backend",
      items: ["Node.js", "Express", "MongoDB", "PostgreSQL", "RESTful APIs", "GraphQL"],
      order: 2
    };

    const skillTools: Skill = {
      id: this.skillId++,
      category: "Tools & Methods",
      items: ["Git/GitHub", "Docker", "CI/CD", "Agile/Scrum", "Jest/Testing"],
      order: 3
    };

    const skillDesign: Skill = {
      id: this.skillId++,
      category: "Design",
      items: ["Figma", "Adobe XD", "UI/UX Principles", "Responsive Design"],
      order: 4
    };

    this.skills.set(skillFrontend.id, skillFrontend);
    this.skills.set(skillBackend.id, skillBackend);
    this.skills.set(skillTools.id, skillTools);
    this.skills.set(skillDesign.id, skillDesign);

    // Seed sample projects
    const project1: Project = {
      id: this.projectId++,
      title: "E-commerce Platform",
      description: "A modern online store with integrated payment processing and inventory management.",
      imageUrl: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=800&auto=format&fit=crop",
      projectUrl: "#",
      technologies: ["React", "Node.js", "MongoDB"],
      featured: true,
      order: 1
    };

    const project2: Project = {
      id: this.projectId++,
      title: "SaaS Dashboard",
      description: "Analytics dashboard for a subscription-based software service with data visualization.",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop",
      projectUrl: "#",
      technologies: ["Vue.js", "Express", "PostgreSQL"],
      featured: true,
      order: 2
    };

    const project3: Project = {
      id: this.projectId++,
      title: "Mobile Application",
      description: "Cross-platform mobile app for event planning with location-based features.",
      imageUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=800&auto=format&fit=crop",
      projectUrl: "#",
      technologies: ["React Native", "Firebase", "Google Maps API"],
      featured: true,
      order: 3
    };

    this.projects.set(project1.id, project1);
    this.projects.set(project2.id, project2);
    this.projects.set(project3.id, project3);

    // Seed sample articles
    const now = new Date();
    
    const article1: Article = {
      id: this.articleId++,
      title: "Modern JavaScript Features Every Developer Should Know",
      slug: "modern-javascript-features",
      summary: "An overview of the most useful ES6+ features that will improve your code quality and developer experience.",
      content: "This is the full content of the article about Modern JavaScript Features.",
      imageUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=800&auto=format&fit=crop",
      category: "JavaScript",
      published: true,
      publishedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
      updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    };

    const article2: Article = {
      id: this.articleId++,
      title: "Mastering CSS Grid Layout for Complex Interfaces",
      slug: "mastering-css-grid-layout",
      summary: "Practical techniques for using CSS Grid to create responsive, complex layouts with minimal code.",
      content: "This is the full content of the article about CSS Grid Layout.",
      imageUrl: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=800&auto=format&fit=crop",
      category: "CSS",
      published: true,
      publishedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      createdAt: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000), // 22 days ago
      updatedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
    };

    const article3: Article = {
      id: this.articleId++,
      title: "React Performance Optimization Techniques",
      slug: "react-performance-optimization",
      summary: "Strategies for improving React application performance through memoization, code splitting, and render optimization.",
      content: "This is the full content of the article about React Performance Optimization.",
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
      category: "React",
      published: true,
      publishedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      createdAt: new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000), // 32 days ago
      updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    };

    // Draft articles
    const draft1: Article = {
      id: this.articleId++,
      title: "Understanding Web Accessibility",
      slug: "understanding-web-accessibility",
      summary: "A comprehensive guide to making your websites accessible to all users.",
      content: "This is the draft content about Web Accessibility.",
      imageUrl: "https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=800&auto=format&fit=crop",
      category: "Accessibility",
      published: false,
      publishedAt: null,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    };

    const draft2: Article = {
      id: this.articleId++,
      title: "The Future of Serverless Architecture",
      slug: "future-serverless-architecture",
      summary: "Exploring how serverless is changing the way we build and deploy applications.",
      content: "This is the draft content about Serverless Architecture.",
      imageUrl: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=800&auto=format&fit=crop",
      category: "Backend",
      published: false,
      publishedAt: null,
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    };

    this.articles.set(article1.id, article1);
    this.articles.set(article2.id, article2);
    this.articles.set(article3.id, article3);
    this.articles.set(draft1.id, draft1);
    this.articles.set(draft2.id, draft2);

    // Seed sample messages
    const message1: Message = {
      id: this.messageId++,
      name: "John Doe",
      email: "john@example.com",
      subject: "Project Inquiry",
      message: "I'm interested in working with you on our new e-commerce project. Would you be available for a call next week?",
      read: false,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
    };

    const message2: Message = {
      id: this.messageId++,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      subject: "Consulting Request",
      message: "Loved your article on React performance. Do you offer consulting services for optimizing existing applications?",
      read: false,
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000) // 1 day ago
    };

    const message3: Message = {
      id: this.messageId++,
      name: "Michael Robinson",
      email: "michael@example.com",
      subject: "Job Opportunity",
      message: "We're looking for a developer to join our team. Your portfolio caught our attention. Would you be interested in discussing?",
      read: false,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    };

    this.messages.set(message1.id, message1);
    this.messages.set(message2.id, message2);
    this.messages.set(message3.id, message3);
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser: User = { 
      ...user, 
      id: this.userId++,
      password: hashedPassword
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values())
      .sort((a, b) => a.order - b.order);
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getFeaturedProjects(): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.featured)
      .sort((a, b) => a.order - b.order);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const newProject: Project = {
      ...project,
      id: this.projectId++
    };
    this.projects.set(newProject.id, newProject);
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) return undefined;

    const updatedProject = { ...existingProject, ...project };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Experience
  async getExperiences(): Promise<Experience[]> {
    return Array.from(this.experiences.values())
      .sort((a, b) => a.order - b.order);
  }

  async getExperience(id: number): Promise<Experience | undefined> {
    return this.experiences.get(id);
  }

  async createExperience(experience: InsertExperience): Promise<Experience> {
    const newExperience: Experience = {
      ...experience,
      id: this.experienceId++
    };
    this.experiences.set(newExperience.id, newExperience);
    return newExperience;
  }

  async updateExperience(id: number, experience: Partial<InsertExperience>): Promise<Experience | undefined> {
    const existingExperience = this.experiences.get(id);
    if (!existingExperience) return undefined;

    const updatedExperience = { ...existingExperience, ...experience };
    this.experiences.set(id, updatedExperience);
    return updatedExperience;
  }

  async deleteExperience(id: number): Promise<boolean> {
    return this.experiences.delete(id);
  }

  // Education
  async getEducation(): Promise<Education[]> {
    return Array.from(this.education.values())
      .sort((a, b) => a.order - b.order);
  }

  async getEducationItem(id: number): Promise<Education | undefined> {
    return this.education.get(id);
  }

  async createEducation(education: InsertEducation): Promise<Education> {
    const newEducation: Education = {
      ...education,
      id: this.educationId++
    };
    this.education.set(newEducation.id, newEducation);
    return newEducation;
  }

  async updateEducation(id: number, education: Partial<InsertEducation>): Promise<Education | undefined> {
    const existingEducation = this.education.get(id);
    if (!existingEducation) return undefined;

    const updatedEducation = { ...existingEducation, ...education };
    this.education.set(id, updatedEducation);
    return updatedEducation;
  }

  async deleteEducation(id: number): Promise<boolean> {
    return this.education.delete(id);
  }

  // Skills
  async getSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values())
      .sort((a, b) => a.order - b.order);
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    return this.skills.get(id);
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const newSkill: Skill = {
      ...skill,
      id: this.skillId++
    };
    this.skills.set(newSkill.id, newSkill);
    return newSkill;
  }

  async updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill | undefined> {
    const existingSkill = this.skills.get(id);
    if (!existingSkill) return undefined;

    const updatedSkill = { ...existingSkill, ...skill };
    this.skills.set(id, updatedSkill);
    return updatedSkill;
  }

  async deleteSkill(id: number): Promise<boolean> {
    return this.skills.delete(id);
  }

  // Articles
  async getArticles(published?: boolean): Promise<Article[]> {
    let articles = Array.from(this.articles.values());
    
    if (published !== undefined) {
      articles = articles.filter(article => article.published === published);
    }
    
    return articles.sort((a, b) => {
      const dateA = a.publishedAt || a.updatedAt;
      const dateB = b.publishedAt || b.updatedAt;
      return dateB.getTime() - dateA.getTime();
    });
  }

  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find(
      (article) => article.slug === slug
    );
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const now = new Date();
    const newArticle: Article = {
      ...article,
      id: this.articleId++,
      publishedAt: article.published ? now : null,
      createdAt: now,
      updatedAt: now
    };
    this.articles.set(newArticle.id, newArticle);
    return newArticle;
  }

  async updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined> {
    const existingArticle = this.articles.get(id);
    if (!existingArticle) return undefined;

    const now = new Date();
    const updatedArticle: Article = { 
      ...existingArticle, 
      ...article,
      updatedAt: now
    };
    
    // If becoming published and wasn't before
    if (article.published && !existingArticle.published) {
      updatedArticle.publishedAt = now;
    }
    
    this.articles.set(id, updatedArticle);
    return updatedArticle;
  }

  async publishArticle(id: number): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;

    const now = new Date();
    const updatedArticle: Article = {
      ...article,
      published: true,
      publishedAt: now,
      updatedAt: now
    };
    
    this.articles.set(id, updatedArticle);
    return updatedArticle;
  }

  async unpublishArticle(id: number): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;

    const updatedArticle: Article = {
      ...article,
      published: false,
      updatedAt: new Date()
    };
    
    this.articles.set(id, updatedArticle);
    return updatedArticle;
  }

  async deleteArticle(id: number): Promise<boolean> {
    return this.articles.delete(id);
  }

  // Messages
  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const newMessage: Message = {
      ...message,
      id: this.messageId++,
      read: false,
      createdAt: new Date()
    };
    this.messages.set(newMessage.id, newMessage);
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;

    const updatedMessage: Message = {
      ...message,
      read: true
    };
    
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  async deleteMessage(id: number): Promise<boolean> {
    return this.messages.delete(id);
  }

  // Site Info
  async getSiteInfo(): Promise<SiteInfo | undefined> {
    return this.siteInfo;
  }

  async updateSiteInfo(info: Partial<InsertSiteInfo>): Promise<SiteInfo | undefined> {
    if (!this.siteInfo) {
      this.siteInfo = {
        id: this.siteInfoId,
        about: info.about || null,
        contactEmail: info.contactEmail || null,
        contactPhone: info.contactPhone || null,
        contactLocation: info.contactLocation || null,
        cvFileUrl: info.cvFileUrl || null,
        heroImageUrl: info.heroImageUrl || null,
        socialLinks: info.socialLinks || null
      };
      return this.siteInfo;
    }

    this.siteInfo = {
      ...this.siteInfo,
      ...info
    };
    
    return this.siteInfo;
  }

  // Import/Export
  async exportAllData(): Promise<PortfolioData> {
    return {
      projects: Array.from(this.projects.values()),
      experiences: Array.from(this.experiences.values()),
      education: Array.from(this.education.values()),
      skills: Array.from(this.skills.values()),
      articles: Array.from(this.articles.values()),
      siteInfo: this.siteInfo
    };
  }

  async importAllData(data: PortfolioData): Promise<{ success: boolean; message: string }> {
    try {
      // Clear existing data
      this.projects.clear();
      this.experiences.clear();
      this.education.clear();
      this.skills.clear();
      this.articles.clear();

      // Import projects
      if (data.projects && Array.isArray(data.projects)) {
        data.projects.forEach(project => {
          this.projects.set(project.id, project);
          if (project.id >= this.projectId) {
            this.projectId = project.id + 1;
          }
        });
      }

      // Import experiences
      if (data.experiences && Array.isArray(data.experiences)) {
        data.experiences.forEach(experience => {
          this.experiences.set(experience.id, experience);
          if (experience.id >= this.experienceId) {
            this.experienceId = experience.id + 1;
          }
        });
      }

      // Import education
      if (data.education && Array.isArray(data.education)) {
        data.education.forEach(edu => {
          this.education.set(edu.id, edu);
          if (edu.id >= this.educationId) {
            this.educationId = edu.id + 1;
          }
        });
      }

      // Import skills
      if (data.skills && Array.isArray(data.skills)) {
        data.skills.forEach(skill => {
          this.skills.set(skill.id, skill);
          if (skill.id >= this.skillId) {
            this.skillId = skill.id + 1;
          }
        });
      }

      // Import articles
      if (data.articles && Array.isArray(data.articles)) {
        data.articles.forEach(article => {
          this.articles.set(article.id, article);
          if (article.id >= this.articleId) {
            this.articleId = article.id + 1;
          }
        });
      }

      // Import site info
      if (data.siteInfo) {
        this.siteInfo = data.siteInfo;
      }

      return { success: true, message: 'Datos importados exitosamente' };
    } catch (error) {
      return { success: false, message: `Error al importar datos: ${(error as Error).message}` };
    }
  }
}

export class DatabaseStorage implements IStorage {
  // User Management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const [newUser] = await db.insert(users)
      .values({ ...user, password: hashedPassword })
      .returning();
    return newUser;
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return db.select().from(projects).orderBy(asc(projects.order));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getFeaturedProjects(): Promise<Project[]> {
    return db.select().from(projects)
      .where(eq(projects.featured, true))
      .orderBy(asc(projects.order));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db.update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    try {
      // Primero verificamos si el proyecto existe
      const project = await this.getProject(id);
      if (!project) {
        return false;
      }
      
      // Luego eliminamos el proyecto
      await db.delete(projects).where(eq(projects.id, id));
      return true;
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      return false;
    }
  }

  // Experience
  async getExperiences(): Promise<Experience[]> {
    return db.select().from(experiences).orderBy(asc(experiences.order));
  }

  async getExperience(id: number): Promise<Experience | undefined> {
    const [experience] = await db.select().from(experiences).where(eq(experiences.id, id));
    return experience;
  }

  async createExperience(experience: InsertExperience): Promise<Experience> {
    const [newExperience] = await db.insert(experiences).values(experience).returning();
    return newExperience;
  }

  async updateExperience(id: number, experience: Partial<InsertExperience>): Promise<Experience | undefined> {
    const [updatedExperience] = await db.update(experiences)
      .set(experience)
      .where(eq(experiences.id, id))
      .returning();
    return updatedExperience;
  }

  async deleteExperience(id: number): Promise<boolean> {
    try {
      // Primero verificamos si la experiencia existe
      const experience = await this.getExperience(id);
      if (!experience) {
        return false;
      }
      
      // Luego eliminamos la experiencia
      await db.delete(experiences).where(eq(experiences.id, id));
      return true;
    } catch (error) {
      console.error('Error al eliminar experiencia:', error);
      return false;
    }
  }

  // Education
  async getEducation(): Promise<Education[]> {
    return db.select().from(education).orderBy(asc(education.order));
  }

  async getEducationItem(id: number): Promise<Education | undefined> {
    const [educationItem] = await db.select().from(education).where(eq(education.id, id));
    return educationItem;
  }

  async createEducation(educationItem: InsertEducation): Promise<Education> {
    const [newEducation] = await db.insert(education).values(educationItem).returning();
    return newEducation;
  }

  async updateEducation(id: number, educationItem: Partial<InsertEducation>): Promise<Education | undefined> {
    const [updatedEducation] = await db.update(education)
      .set(educationItem)
      .where(eq(education.id, id))
      .returning();
    return updatedEducation;
  }

  async deleteEducation(id: number): Promise<boolean> {
    try {
      // Primero verificamos si el ítem de educación existe
      const educationItem = await this.getEducationItem(id);
      if (!educationItem) {
        return false;
      }
      
      // Luego eliminamos el ítem de educación
      await db.delete(education).where(eq(education.id, id));
      return true;
    } catch (error) {
      console.error('Error al eliminar educación:', error);
      return false;
    }
  }

  // Skills
  async getSkills(): Promise<Skill[]> {
    return db.select().from(skills).orderBy(asc(skills.order));
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill;
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db.insert(skills).values(skill).returning();
    return newSkill;
  }

  async updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill | undefined> {
    const [updatedSkill] = await db.update(skills)
      .set(skill)
      .where(eq(skills.id, id))
      .returning();
    return updatedSkill;
  }

  async deleteSkill(id: number): Promise<boolean> {
    try {
      // Primero verificamos si la habilidad existe
      const skill = await this.getSkill(id);
      if (!skill) {
        return false;
      }
      
      // Luego eliminamos la habilidad
      await db.delete(skills).where(eq(skills.id, id));
      return true;
    } catch (error) {
      console.error('Error al eliminar habilidad:', error);
      return false;
    }
  }

  // Articles
  async getArticles(published?: boolean): Promise<Article[]> {
    if (published === undefined) {
      return db.select().from(articles).orderBy(desc(articles.createdAt));
    }
    return db.select().from(articles)
      .where(eq(articles.published, published))
      .orderBy(desc(articles.createdAt));
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.slug, slug));
    return article;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [newArticle] = await db.insert(articles).values(article).returning();
    return newArticle;
  }

  async updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined> {
    const [updatedArticle] = await db.update(articles)
      .set(article)
      .where(eq(articles.id, id))
      .returning();
    return updatedArticle;
  }

  async publishArticle(id: number): Promise<Article | undefined> {
    const now = new Date();
    const [publishedArticle] = await db.update(articles)
      .set({ 
        published: true,
        publishedAt: now,
        updatedAt: now
      })
      .where(eq(articles.id, id))
      .returning();
    return publishedArticle;
  }

  async unpublishArticle(id: number): Promise<Article | undefined> {
    const [unpublishedArticle] = await db.update(articles)
      .set({
        published: false,
        publishedAt: null,
        updatedAt: new Date()
      })
      .where(eq(articles.id, id))
      .returning();
    return unpublishedArticle;
  }

  async deleteArticle(id: number): Promise<boolean> {
    try {
      // Primero verificamos si el artículo existe
      const article = await this.getArticle(id);
      if (!article) {
        return false;
      }
      
      // Luego eliminamos el artículo
      await db.delete(articles).where(eq(articles.id, id));
      return true;
    } catch (error) {
      console.error('Error al eliminar artículo:', error);
      return false;
    }
  }

  // Messages
  async getMessages(): Promise<Message[]> {
    return db.select().from(messages).orderBy(desc(messages.createdAt));
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const [updatedMessage] = await db.update(messages)
      .set({ read: true })
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage;
  }

  async deleteMessage(id: number): Promise<boolean> {
    try {
      // Primero verificamos si el mensaje existe
      const message = await this.getMessage(id);
      if (!message) {
        return false;
      }
      
      // Luego eliminamos el mensaje
      await db.delete(messages).where(eq(messages.id, id));
      return true;
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      return false;
    }
  }

  // Site Info
  async getSiteInfo(): Promise<SiteInfo | undefined> {
    const [info] = await db.select().from(siteInfo);
    return info;
  }

  async updateSiteInfo(info: Partial<InsertSiteInfo>): Promise<SiteInfo | undefined> {
    // Check if any site info exists
    const existingSiteInfo = await this.getSiteInfo();
    
    if (existingSiteInfo) {
      const [updatedInfo] = await db.update(siteInfo)
        .set(info)
        .where(eq(siteInfo.id, existingSiteInfo.id))
        .returning();
      return updatedInfo;
    } else {
      const [newInfo] = await db.insert(siteInfo)
        .values(info)
        .returning();
      return newInfo;
    }
  }

  // Import/Export
  async exportAllData(): Promise<PortfolioData> {
    const projectsList = await db.select().from(projects);
    const experiencesList = await db.select().from(experiences);
    const educationList = await db.select().from(education);
    const skillsList = await db.select().from(skills);
    const articlesList = await db.select().from(articles);
    const siteInfoData = await this.getSiteInfo();

    return {
      projects: projectsList,
      experiences: experiencesList,
      education: educationList,
      skills: skillsList,
      articles: articlesList,
      siteInfo: siteInfoData
    };
  }

  async importAllData(data: PortfolioData): Promise<{ success: boolean; message: string }> {
    try {
      // Utilizamos una transacción para asegurar que todas las operaciones se realizan o ninguna
      return await db.transaction(async (tx) => {
        // Limpiar datos existentes (excepto usuarios)
        await tx.delete(projects);
        await tx.delete(experiences);
        await tx.delete(education);
        await tx.delete(skills);
        await tx.delete(articles);
        await tx.delete(siteInfo);

        // Importar proyectos
        if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
          await tx.insert(projects).values(data.projects);
        }

        // Importar experiencias
        if (data.experiences && Array.isArray(data.experiences) && data.experiences.length > 0) {
          await tx.insert(experiences).values(data.experiences);
        }

        // Importar educación
        if (data.education && Array.isArray(data.education) && data.education.length > 0) {
          await tx.insert(education).values(data.education);
        }

        // Importar habilidades
        if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
          await tx.insert(skills).values(data.skills);
        }

        // Importar artículos
        if (data.articles && Array.isArray(data.articles) && data.articles.length > 0) {
          await tx.insert(articles).values(data.articles);
        }

        // Importar información del sitio
        if (data.siteInfo) {
          await tx.insert(siteInfo).values(data.siteInfo);
        }

        return { success: true, message: 'Datos importados exitosamente' };
      });
    } catch (error) {
      console.error('Error al importar datos:', error);
      return { success: false, message: `Error al importar datos: ${(error as Error).message}` };
    }
  }
}

// Inicialización de la base de datos con un usuario admin
async function initializeDatabase() {
  try {
    // Comprobar si ya existe un usuario
    const userCount = await db.select({ count: sql`count(*)::int` }).from(users);
    if (Number(userCount[0].count) === 0) {
    // Crear usuario admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.insert(users).values({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin'
    });
    
    // Seed de datos de prueba
    const now = new Date();
    
    // Experiencias
    await db.insert(experiences).values([
      {
        title: "Senior Web Developer",
        company: "TechCorp Solutions",
        description: "Led development of enterprise SaaS applications. Implemented CI/CD pipelines and mentored junior developers. Reduced load times by 40% through code optimization.",
        startDate: "2021",
        endDate: null,
        isCurrent: true,
        order: 1
      },
      {
        title: "Web Developer",
        company: "Digital Creations Agency",
        description: "Built responsive websites and web applications for diverse clients. Collaborated with design team to implement pixel-perfect UIs. Maintained and optimized existing codebases.",
        startDate: "2018",
        endDate: "2021",
        isCurrent: false,
        order: 2
      }
    ]);
    
    // Educación
    await db.insert(education).values({
      degree: "BSc Computer Science",
      institution: "University of Technology",
      description: "Specialized in web technologies and software engineering. Capstone project focused on building a real-time collaboration platform.",
      startDate: "2014",
      endDate: "2018",
      order: 1
    });
    
    // Habilidades
    await db.insert(skills).values([
      {
        category: "Frontend",
        items: ["HTML5/CSS3", "JavaScript (ES6+)", "React", "Vue.js", "Tailwind CSS", "TypeScript"],
        order: 1
      },
      {
        category: "Backend",
        items: ["Node.js", "Express", "MongoDB", "PostgreSQL", "RESTful APIs", "GraphQL"],
        order: 2
      },
      {
        category: "Tools & Methods",
        items: ["Git/GitHub", "Docker", "CI/CD", "Agile/Scrum", "Jest/Testing"],
        order: 3
      },
      {
        category: "Design",
        items: ["Figma", "Adobe XD", "UI/UX Principles", "Responsive Design"],
        order: 4
      }
    ]);
    
    // Proyectos
    await db.insert(projects).values([
      {
        title: "E-commerce Platform",
        description: "A modern online store with integrated payment processing and inventory management.",
        imageUrl: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=800&auto=format&fit=crop",
        projectUrl: "#",
        technologies: ["React", "Node.js", "MongoDB"],
        featured: true,
        order: 1
      },
      {
        title: "SaaS Dashboard",
        description: "Analytics dashboard for a subscription-based software service with data visualization.",
        imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop",
        projectUrl: "#",
        technologies: ["Vue.js", "Express", "PostgreSQL"],
        featured: true,
        order: 2
      },
      {
        title: "Mobile Application",
        description: "Cross-platform mobile app for event planning with location-based features.",
        imageUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=800&auto=format&fit=crop",
        projectUrl: "#",
        technologies: ["React Native", "Firebase", "Google Maps API"],
        featured: true,
        order: 3
      }
    ]);
    
    // Artículos
    await db.insert(articles).values([
      {
        title: "Modern JavaScript Features Every Developer Should Know",
        slug: "modern-javascript-features",
        summary: "An overview of the most useful ES6+ features that will improve your code quality and developer experience.",
        content: "This is the full content of the article about Modern JavaScript Features.",
        imageUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=800&auto=format&fit=crop",
        category: "JavaScript",
        published: true,
        publishedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
        updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      },
      {
        title: "Mastering CSS Grid Layout for Complex Interfaces",
        slug: "mastering-css-grid-layout",
        summary: "Practical techniques for using CSS Grid to create responsive, complex layouts with minimal code.",
        content: "This is the full content of the article about CSS Grid Layout.",
        imageUrl: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=800&auto=format&fit=crop",
        category: "CSS",
        published: true,
        publishedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        createdAt: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000), // 22 days ago
        updatedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
      },
      {
        title: "React Performance Optimization Techniques",
        slug: "react-performance-optimization",
        summary: "Strategies for improving React application performance through memoization, code splitting, and render optimization.",
        content: "This is the full content of the article about React Performance Optimization.",
        imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
        category: "React",
        published: true,
        publishedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        createdAt: new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000), // 32 days ago
        updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      },
      {
        title: "Understanding Web Accessibility",
        slug: "understanding-web-accessibility",
        summary: "A comprehensive guide to making your websites accessible to all users.",
        content: "This is the draft content about Web Accessibility.",
        imageUrl: "https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=800&auto=format&fit=crop",
        category: "Accessibility",
        published: false,
        publishedAt: null,
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        title: "The Future of Serverless Architecture",
        slug: "future-serverless-architecture",
        summary: "Exploring how serverless is changing the way we build and deploy applications.",
        content: "This is the draft content about Serverless Architecture.",
        imageUrl: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=800&auto=format&fit=crop",
        category: "Backend",
        published: false,
        publishedAt: null,
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      }
    ]);
    
    // Mensajes
    await db.insert(messages).values([
      {
        name: "John Doe",
        email: "john@example.com",
        subject: "Project Inquiry",
        message: "I'm interested in working with you on our new e-commerce project. Would you be available for a call next week?",
        read: false,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        name: "Sarah Johnson",
        email: "sarah@example.com",
        subject: "Consulting Request",
        message: "Loved your article on React performance. Do you offer consulting services for optimizing existing applications?",
        read: false,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        name: "Michael Robinson",
        email: "michael@example.com",
        subject: "Job Opportunity",
        message: "We're looking for a developer to join our team. Your portfolio caught our attention. Would you be interested in discussing?",
        read: false,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ]);
    
    // SiteInfo
    await db.insert(siteInfo).values({
      about: "Creating digital experiences that combine beautiful design with powerful functionality.",
      contactEmail: "hello@alexmorgan.dev",
      contactPhone: "+1 (555) 123-4567",
      contactLocation: "San Francisco, CA",
      socialLinks: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
        dribbble: "https://dribbble.com"
      }
    });
  }
  } catch (error) {
    console.error('Error in initializeDatabase:', error);
  }
}

// Función para crear un usuario admin con credenciales específicas
async function createAdminUser() {
  try {
    // Verificar si el usuario ya existe
    const existingUser = await db.select().from(users).where(eq(users.email, 'aaguirreb16@gmail.com'));
    
    if (existingUser.length === 0) {
      // Crear usuario admin con las credenciales específicas
      const hashedPassword = await bcrypt.hash('Ka260314!', 10);
      await db.insert(users).values({
        username: 'aaguirreb16',
        password: hashedPassword,
        email: 'aaguirreb16@gmail.com',
        name: 'Admin User',
        role: 'admin'
      });
      console.log('Admin user created successfully with email: aaguirreb16@gmail.com');
    } else {
      console.log('Admin user already exists with email: aaguirreb16@gmail.com');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Inicializar y exportar la base de datos
initializeDatabase()
  .then(() => {
    console.log('Database initialized with admin user and test data');
    // Crear el usuario admin con credenciales específicas
    return createAdminUser();
  })
  .catch(error => console.error('Error initializing database:', error));

// Usar DatabaseStorage en lugar de MemStorage
export const storage = new DatabaseStorage();
