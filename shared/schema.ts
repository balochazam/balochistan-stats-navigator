import { pgTable, text, uuid, timestamp, boolean, integer, date, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Define enums
export const userRoleEnum = pgEnum("user_role", ["admin", "data_entry_user"]);
export const sdgIndicatorTypeEnum = pgEnum("sdg_indicator_type", [
  "percentage", 
  "rate", 
  "count", 
  "index", 
  "ratio", 
  "currency", 
  "multi_dimensional",
  "budget",
  "binary",
  "composite_index",
  "time_series",
  "geographic_breakdown",
  "demographic_breakdown",
  "survey_based"
]);
export const dataSourceTypeEnum = pgEnum("data_source_type", ["MICS", "PDHS", "PSLM", "NNS", "NDMA", "PBS", "Custom"]);
export const formCategoryEnum = pgEnum("form_category", ["bbos", "sdg"]);
export const improvementDirectionEnum = pgEnum("improvement_direction", ["increase", "decrease"]);

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
  password_hash: text("password_hash").notNull(),
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
  category: formCategoryEnum("category").notNull().default("bbos"), // distinguish between BBOS and SDG forms
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
}).extend({
  sub_headers: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    label: z.string(),
    fields: z.array(z.object({
      id: z.string().optional(),
      field_name: z.string(),
      field_label: z.string(),
      field_type: z.string(),
      is_required: z.boolean(),
      field_order: z.number(),
      reference_data_name: z.string().optional(),
      placeholder_text: z.string().optional(),
      aggregate_fields: z.array(z.string()).nullable().optional().transform(val => val === null ? [] : val),
      is_secondary_column: z.boolean().optional(),
      has_sub_headers: z.boolean().optional(),
      sub_headers: z.array(z.any()).optional()
    }))
  })).optional(),
  aggregate_fields: z.array(z.string()).nullable().optional().transform(val => val === null ? [] : val)
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



// SDG Goals table (17 UN Sustainable Development Goals)
export const sdg_goals = pgTable("sdg_goals", {
  id: integer("id").primaryKey(), // 1-17 for the 17 SDGs
  title: text("title").notNull(),
  description: text("description"),
  color: text("color").notNull(), // Official UN SDG colors
  icon_path: text("icon_path"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// SDG Targets table (sub-goals under each SDG)
export const sdg_targets = pgTable("sdg_targets", {
  id: uuid("id").primaryKey().defaultRandom(),
  sdg_goal_id: integer("sdg_goal_id").notNull().references(() => sdg_goals.id),
  target_number: text("target_number").notNull(), // e.g., "1.1", "1.2", etc.
  title: text("title").notNull(),
  description: text("description"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// SDG Indicators table (specific measurable indicators)
export const sdg_indicators = pgTable("sdg_indicators", {
  id: uuid("id").primaryKey().defaultRandom(),
  sdg_target_id: uuid("sdg_target_id").notNull().references(() => sdg_targets.id),
  indicator_code: text("indicator_code").notNull().unique(), // e.g., "1.2.2"
  title: text("title").notNull(),
  description: text("description"),
  indicator_type: sdgIndicatorTypeEnum("indicator_type").notNull(),
  unit: text("unit"), // e.g., "percentage", "per 100,000", "PKR million"
  methodology: text("methodology"), // How the indicator is measured
  data_collection_frequency: text("data_collection_frequency"), // Annual, quarterly, etc.
  improvement_direction: improvementDirectionEnum("improvement_direction").notNull().default("decrease"), // Whether higher values are better (increase) or lower values are better (decrease)
  responsible_departments: jsonb("responsible_departments"), // Array of department IDs
  // Enhanced fields for complex indicators
  data_structure: jsonb("data_structure"), // Schema for multi-dimensional data
  validation_rules: jsonb("validation_rules"), // Field validation requirements
  aggregation_methods: jsonb("aggregation_methods"), // How to aggregate data
  disaggregation_categories: jsonb("disaggregation_categories"), // Breakdown categories (gender, age, location)
  data_quality_requirements: jsonb("data_quality_requirements"), // Quality standards and checks
  is_active: boolean("is_active").notNull().default(true),
  created_by: uuid("created_by").notNull().references(() => profiles.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// SDG Data Sources table
export const sdg_data_sources = pgTable("sdg_data_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  full_name: text("full_name"),
  source_type: dataSourceTypeEnum("source_type").notNull(),
  description: text("description"),
  website_url: text("website_url"),
  contact_info: jsonb("contact_info"),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// SDG Indicator Values table (historical data points)
export const sdg_indicator_values = pgTable("sdg_indicator_values", {
  id: uuid("id").primaryKey().defaultRandom(),
  indicator_id: uuid("indicator_id").notNull().references(() => sdg_indicators.id),
  data_source_id: uuid("data_source_id").references(() => sdg_data_sources.id),
  year: integer("year").notNull(),
  value: text("value").notNull(), // Stored as text to handle different formats
  value_numeric: integer("value_numeric"), // For calculations when applicable
  breakdown_data: jsonb("breakdown_data"), // Urban/rural, male/female, age groups, etc.
  baseline_indicator: boolean("baseline_indicator").default(false),
  progress_indicator: boolean("progress_indicator").default(false),
  notes: text("notes"),
  reference_document: text("reference_document"),
  data_quality_score: integer("data_quality_score"), // 1-5 scale
  department_id: uuid("department_id").references(() => departments.id),
  submitted_by: uuid("submitted_by").notNull().references(() => profiles.id),
  verified_by: uuid("verified_by").references(() => profiles.id),
  verified_at: timestamp("verified_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// SDG Progress Calculations table (computed progress metrics)
export const sdg_progress_calculations = pgTable("sdg_progress_calculations", {
  id: uuid("id").primaryKey().defaultRandom(),
  sdg_goal_id: integer("sdg_goal_id").notNull().references(() => sdg_goals.id),
  indicator_id: uuid("indicator_id").references(() => sdg_indicators.id),
  progress_percentage: integer("progress_percentage"), // 0-100
  trend_direction: text("trend_direction"), // "improving", "declining", "stable"
  last_calculation_date: timestamp("last_calculation_date", { withTimezone: true }),
  calculation_method: text("calculation_method"),
  notes: text("notes"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Insert schemas for SDG tables
export const insertSdgGoalSchema = createInsertSchema(sdg_goals).omit({
  created_at: true,
  updated_at: true,
});

export const insertSdgTargetSchema = createInsertSchema(sdg_targets).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertSdgIndicatorSchema = createInsertSchema(sdg_indicators).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertSdgDataSourceSchema = createInsertSchema(sdg_data_sources).omit({
  id: true,
  created_at: true,
});

export const insertSdgIndicatorValueSchema = createInsertSchema(sdg_indicator_values).omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  // Make some fields optional to handle various form submissions
  data_source_id: z.string().optional(),
  value_numeric: z.number().optional(),
  breakdown_data: z.any().optional(),
  baseline_indicator: z.boolean().optional(),
  progress_indicator: z.boolean().optional(),
  notes: z.string().optional(),
  reference_document: z.string().optional(),
  data_quality_score: z.number().optional(),
  department_id: z.string().optional(),
  verified_by: z.string().optional(),
  verified_at: z.date().optional()
});

export const insertSdgProgressCalculationSchema = createInsertSchema(sdg_progress_calculations).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// SDG Types
export type SdgGoal = typeof sdg_goals.$inferSelect;
export type InsertSdgGoal = z.infer<typeof insertSdgGoalSchema>;

export type SdgTarget = typeof sdg_targets.$inferSelect;
export type InsertSdgTarget = z.infer<typeof insertSdgTargetSchema>;

export type SdgIndicator = typeof sdg_indicators.$inferSelect & {
  has_data?: boolean;
  progress?: number;
  custodian_agencies?: string[];
};
export type InsertSdgIndicator = z.infer<typeof insertSdgIndicatorSchema>;

export type SdgDataSource = typeof sdg_data_sources.$inferSelect;
export type InsertSdgDataSource = z.infer<typeof insertSdgDataSourceSchema>;

export type SdgIndicatorValue = typeof sdg_indicator_values.$inferSelect;
export type InsertSdgIndicatorValue = z.infer<typeof insertSdgIndicatorValueSchema>;

export type SdgProgressCalculation = typeof sdg_progress_calculations.$inferSelect;
export type InsertSdgProgressCalculation = z.infer<typeof insertSdgProgressCalculationSchema>;

// Legacy types for compatibility
export type User = Profile;
export type InsertUser = InsertProfile;
