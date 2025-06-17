import { pgTable, text, uuid, timestamp, boolean, integer, date, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Define enums
export const userRoleEnum = pgEnum("user_role", ["admin", "department_user", "data_entry_user"]);

// Departments table
export const departments = pgTable("departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Profiles table (users)
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  full_name: text("full_name"),
  role: userRoleEnum("role").notNull().default("data_entry_user"),
  department_id: uuid("department_id").references(() => departments.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Data banks table
export const data_banks = pgTable("data_banks", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  department_id: uuid("department_id").references(() => departments.id),
  created_by: uuid("created_by").notNull().references(() => profiles.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  is_active: boolean("is_active").notNull().default(true),
});

// Data bank entries table
export const data_bank_entries = pgTable("data_bank_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  data_bank_id: uuid("data_bank_id").notNull().references(() => data_banks.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  value: text("value").notNull(),
  metadata: jsonb("metadata"),
  created_by: uuid("created_by").notNull().references(() => profiles.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  is_active: boolean("is_active").notNull().default(true),
});

// Forms table
export const forms = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  department_id: uuid("department_id").references(() => departments.id),
  created_by: uuid("created_by").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  is_active: boolean("is_active").notNull().default(true),
});

// Field groups table for hierarchical organization
export const field_groups = pgTable("field_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  form_id: uuid("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  group_name: text("group_name").notNull(),
  group_label: text("group_label").notNull(),
  parent_group_id: uuid("parent_group_id"),
  group_type: text("group_type").notNull().default("section"), // 'section', 'category', 'sub_category'
  display_order: integer("display_order").notNull().default(0),
  is_repeatable: boolean("is_repeatable").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Form fields table
export const form_fields = pgTable("form_fields", {
  id: uuid("id").primaryKey().defaultRandom(),
  form_id: uuid("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  field_group_id: uuid("field_group_id").references(() => field_groups.id, { onDelete: "cascade" }),
  field_name: text("field_name").notNull(),
  field_label: text("field_label").notNull(),
  field_type: text("field_type").notNull(),
  is_required: boolean("is_required").notNull().default(false),
  is_primary_column: boolean("is_primary_column").notNull().default(false),
  is_secondary_column: boolean("is_secondary_column").notNull().default(false),
  reference_data_name: text("reference_data_name"),
  placeholder_text: text("placeholder_text"),
  aggregate_fields: jsonb("aggregate_fields"), // Array of field names to aggregate
  field_order: integer("field_order").notNull().default(0),
  has_sub_headers: boolean("has_sub_headers").notNull().default(false),
  sub_headers: jsonb("sub_headers"), // JSON array of sub-header objects
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Schedules table
export const schedules = pgTable("schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  start_date: date("start_date").notNull(),
  end_date: date("end_date").notNull(),
  status: text("status").notNull().default("open"),
  created_by: uuid("created_by").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Schedule forms junction table
export const schedule_forms = pgTable("schedule_forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  schedule_id: uuid("schedule_id").notNull().references(() => schedules.id, { onDelete: "cascade" }),
  form_id: uuid("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  is_required: boolean("is_required").notNull().default(true),
  due_date: date("due_date"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Form submissions table
export const form_submissions = pgTable("form_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  form_id: uuid("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  schedule_id: uuid("schedule_id").references(() => schedules.id),
  submitted_by: uuid("submitted_by").notNull(),
  submitted_at: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  data: jsonb("data").notNull().default({}),
});

// Schedule form completions table
export const schedule_form_completions = pgTable("schedule_form_completions", {
  id: uuid("id").primaryKey().defaultRandom(),
  schedule_form_id: uuid("schedule_form_id").notNull().references(() => schedule_forms.id, { onDelete: "cascade" }),
  user_id: uuid("user_id").notNull(),
  completed_at: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Define relations
export const departmentsRelations = relations(departments, ({ many }) => ({
  profiles: many(profiles),
  data_banks: many(data_banks),
  forms: many(forms),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  department: one(departments, {
    fields: [profiles.department_id],
    references: [departments.id],
  }),
  created_data_banks: many(data_banks),
  created_data_bank_entries: many(data_bank_entries),
}));

export const data_banksRelations = relations(data_banks, ({ one, many }) => ({
  department: one(departments, {
    fields: [data_banks.department_id],
    references: [departments.id],
  }),
  creator: one(profiles, {
    fields: [data_banks.created_by],
    references: [profiles.id],
  }),
  entries: many(data_bank_entries),
}));

export const data_bank_entriesRelations = relations(data_bank_entries, ({ one }) => ({
  data_bank: one(data_banks, {
    fields: [data_bank_entries.data_bank_id],
    references: [data_banks.id],
  }),
  creator: one(profiles, {
    fields: [data_bank_entries.created_by],
    references: [profiles.id],
  }),
}));

export const formsRelations = relations(forms, ({ one, many }) => ({
  department: one(departments, {
    fields: [forms.department_id],
    references: [departments.id],
  }),
  field_groups: many(field_groups),
  fields: many(form_fields),
  schedule_forms: many(schedule_forms),
  submissions: many(form_submissions),
}));

export const field_groupsRelations = relations(field_groups, ({ one, many }) => ({
  form: one(forms, {
    fields: [field_groups.form_id],
    references: [forms.id],
  }),
  parent_group: one(field_groups, {
    fields: [field_groups.parent_group_id],
    references: [field_groups.id],
  }),
  child_groups: many(field_groups),
  fields: many(form_fields),
}));

export const form_fieldsRelations = relations(form_fields, ({ one }) => ({
  form: one(forms, {
    fields: [form_fields.form_id],
    references: [forms.id],
  }),
  field_group: one(field_groups, {
    fields: [form_fields.field_group_id],
    references: [field_groups.id],
  }),
}));

export const schedulesRelations = relations(schedules, ({ many }) => ({
  schedule_forms: many(schedule_forms),
  submissions: many(form_submissions),
}));

export const schedule_formsRelations = relations(schedule_forms, ({ one, many }) => ({
  schedule: one(schedules, {
    fields: [schedule_forms.schedule_id],
    references: [schedules.id],
  }),
  form: one(forms, {
    fields: [schedule_forms.form_id],
    references: [forms.id],
  }),
  completions: many(schedule_form_completions),
}));

export const form_submissionsRelations = relations(form_submissions, ({ one }) => ({
  form: one(forms, {
    fields: [form_submissions.form_id],
    references: [forms.id],
  }),
  schedule: one(schedules, {
    fields: [form_submissions.schedule_id],
    references: [schedules.id],
  }),
}));

export const schedule_form_completionsRelations = relations(schedule_form_completions, ({ one }) => ({
  schedule_form: one(schedule_forms, {
    fields: [schedule_form_completions.schedule_form_id],
    references: [schedule_forms.id],
  }),
}));

// Insert schemas
export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  created_at: true,
  updated_at: true,
});

export const insertDataBankSchema = createInsertSchema(data_banks).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertDataBankEntrySchema = createInsertSchema(data_bank_entries).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertFormSchema = createInsertSchema(forms).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertFieldGroupSchema = createInsertSchema(field_groups).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertFormFieldSchema = createInsertSchema(form_fields).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertScheduleFormSchema = createInsertSchema(schedule_forms).omit({
  id: true,
  created_at: true,
});

export const insertFormSubmissionSchema = createInsertSchema(form_submissions).omit({
  id: true,
  submitted_at: true,
});

export const insertScheduleFormCompletionSchema = createInsertSchema(schedule_form_completions).omit({
  id: true,
  completed_at: true,
  created_at: true,
});

// Types
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type DataBank = typeof data_banks.$inferSelect;
export type InsertDataBank = z.infer<typeof insertDataBankSchema>;

export type DataBankEntry = typeof data_bank_entries.$inferSelect;
export type InsertDataBankEntry = z.infer<typeof insertDataBankEntrySchema>;

export type Form = typeof forms.$inferSelect;
export type InsertForm = z.infer<typeof insertFormSchema>;

export type FieldGroup = typeof field_groups.$inferSelect;
export type InsertFieldGroup = z.infer<typeof insertFieldGroupSchema>;

export type FormField = typeof form_fields.$inferSelect;
export type InsertFormField = z.infer<typeof insertFormFieldSchema>;

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;

export type ScheduleForm = typeof schedule_forms.$inferSelect;
export type InsertScheduleForm = z.infer<typeof insertScheduleFormSchema>;

export type FormSubmission = typeof form_submissions.$inferSelect;
export type InsertFormSubmission = z.infer<typeof insertFormSubmissionSchema>;

export type ScheduleFormCompletion = typeof schedule_form_completions.$inferSelect;
export type InsertScheduleFormCompletion = z.infer<typeof insertScheduleFormCompletionSchema>;

// Legacy types for compatibility
export type User = Profile;
export type InsertUser = InsertProfile;
