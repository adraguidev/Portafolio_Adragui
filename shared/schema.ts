import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for admin authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("admin"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Projects for the portfolio
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  projectUrl: text("project_url"),
  technologies: text("technologies").array(),
  featured: boolean("featured").default(false),
  order: integer("order").default(0),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
});

// Experience entries for CV
export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  description: text("description").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"), // null means "Present"
  isCurrent: boolean("is_current").default(false),
  order: integer("order").default(0),
});

export const insertExperienceSchema = createInsertSchema(experiences).omit({
  id: true,
});

// Education entries for CV
export const education = pgTable("education", {
  id: serial("id").primaryKey(),
  degree: text("degree").notNull(),
  institution: text("institution").notNull(),
  description: text("description").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  order: integer("order").default(0),
});

export const insertEducationSchema = createInsertSchema(education).omit({
  id: true,
});

// Skills for CV
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  items: text("items").array().notNull(),
  order: integer("order").default(0),
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
});

// Articles/blog posts
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  published: boolean("published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
});

// Contact messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  read: true,
  createdAt: true,
});

// Site information
export const siteInfo = pgTable("site_info", {
  id: serial("id").primaryKey(),
  about: text("about"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  contactLocation: text("contact_location"),
  cvFileUrl: text("cv_file_url"), // URL al archivo CV
  heroImageUrl: text("hero_image_url"), // URL a la imagen del Hero
  socialLinks: json("social_links").$type<{
    github?: string;
    linkedin?: string;
    twitter?: string;
    dribbble?: string;
  }>(),
});

export const insertSiteInfoSchema = createInsertSchema(siteInfo).omit({
  id: true,
});

// Export all types for use in the application
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Experience = typeof experiences.$inferSelect;
export type InsertExperience = z.infer<typeof insertExperienceSchema>;

export type Education = typeof education.$inferSelect;
export type InsertEducation = z.infer<typeof insertEducationSchema>;

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type SiteInfo = typeof siteInfo.$inferSelect;
export type InsertSiteInfo = z.infer<typeof insertSiteInfoSchema>;
