import { eq, and, desc, asc } from "drizzle-orm";
import { db } from "./db";
import {
  profiles,
  departments,
  data_banks,
  data_bank_entries,
  forms,
  form_fields,
  schedules,
  schedule_forms,
  form_submissions,
  schedule_form_completions,
  type Profile,
  type InsertProfile,
  type Department,
  type InsertDepartment,
  type DataBank,
  type InsertDataBank,
  type DataBankEntry,
  type InsertDataBankEntry,
  type Form,
  type InsertForm,
  type FormField,
  type InsertFormField,
  type Schedule,
  type InsertSchedule,
  type ScheduleForm,
  type InsertScheduleForm,
  type FormSubmission,
  type InsertFormSubmission,
  type ScheduleFormCompletion,
  type InsertScheduleFormCompletion,
} from "@shared/schema";

export interface IStorage {
  // Profile/User methods
  getProfile(id: string): Promise<Profile | undefined>;
  getProfileByEmail(email: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | undefined>;
  getAllProfiles(): Promise<Profile[]>;

  // Department methods
  getDepartments(): Promise<Department[]>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: string, updates: Partial<Department>): Promise<Department | undefined>;
  deleteDepartment(id: string): Promise<boolean>;

  // Data Bank methods
  getDataBanks(): Promise<DataBank[]>;
  getDataBank(id: string): Promise<DataBank | undefined>;
  createDataBank(dataBank: InsertDataBank): Promise<DataBank>;
  updateDataBank(id: string, updates: Partial<DataBank>): Promise<DataBank | undefined>;
  deleteDataBank(id: string): Promise<boolean>;

  // Data Bank Entry methods
  getDataBankEntries(dataBankId: string): Promise<DataBankEntry[]>;
  createDataBankEntry(entry: InsertDataBankEntry): Promise<DataBankEntry>;
  updateDataBankEntry(id: string, updates: Partial<DataBankEntry>): Promise<DataBankEntry | undefined>;
  deleteDataBankEntry(id: string): Promise<boolean>;

  // Form methods
  getForms(): Promise<Form[]>;
  getForm(id: string): Promise<Form | undefined>;
  createForm(form: InsertForm): Promise<Form>;
  updateForm(id: string, updates: Partial<Form>): Promise<Form | undefined>;
  deleteForm(id: string): Promise<boolean>;

  // Form Field methods
  getFormFields(formId: string): Promise<FormField[]>;
  createFormField(field: InsertFormField): Promise<FormField>;
  updateFormField(id: string, updates: Partial<FormField>): Promise<FormField | undefined>;
  deleteFormField(id: string): Promise<boolean>;

  // Schedule methods
  getSchedules(): Promise<Schedule[]>;
  getSchedule(id: string): Promise<Schedule | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: string, updates: Partial<Schedule>): Promise<Schedule | undefined>;
  deleteSchedule(id: string): Promise<boolean>;

  // Schedule Form methods
  getScheduleForms(scheduleId: string): Promise<ScheduleForm[]>;
  createScheduleForm(scheduleForm: InsertScheduleForm): Promise<ScheduleForm>;
  updateScheduleForm(id: string, updates: Partial<ScheduleForm>): Promise<ScheduleForm | undefined>;
  deleteScheduleForm(id: string): Promise<boolean>;

  // Form Submission methods
  getFormSubmissions(formId?: string, scheduleId?: string): Promise<FormSubmission[]>;
  createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission>;

  // Schedule Form Completion methods
  getScheduleFormCompletions(scheduleFormId: string): Promise<ScheduleFormCompletion[]>;
  createScheduleFormCompletion(completion: InsertScheduleFormCompletion): Promise<ScheduleFormCompletion>;
  deleteScheduleFormCompletion(scheduleFormId: string, userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Profile/User methods
  async getProfile(id: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
    return result[0];
  }

  async getProfileByEmail(email: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
    return result[0];
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const result = await db.insert(profiles).values(profile).returning();
    return result[0];
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | undefined> {
    const result = await db.update(profiles).set(updates).where(eq(profiles.id, id)).returning();
    return result[0];
  }

  async getAllProfiles(): Promise<Profile[]> {
    return await db.select().from(profiles).orderBy(desc(profiles.created_at));
  }

  // Department methods
  async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments).orderBy(asc(departments.name));
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const result = await db.insert(departments).values(department).returning();
    return result[0];
  }

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department | undefined> {
    const result = await db.update(departments).set(updates).where(eq(departments.id, id)).returning();
    return result[0];
  }

  async deleteDepartment(id: string): Promise<boolean> {
    const result = await db.delete(departments).where(eq(departments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Data Bank methods
  async getDataBanks(): Promise<DataBank[]> {
    return await db.select().from(data_banks).where(eq(data_banks.is_active, true)).orderBy(desc(data_banks.created_at));
  }

  async getDataBank(id: string): Promise<DataBank | undefined> {
    const result = await db.select().from(data_banks).where(eq(data_banks.id, id)).limit(1);
    return result[0];
  }

  async createDataBank(dataBank: InsertDataBank): Promise<DataBank> {
    const result = await db.insert(data_banks).values(dataBank).returning();
    return result[0];
  }

  async updateDataBank(id: string, updates: Partial<DataBank>): Promise<DataBank | undefined> {
    const result = await db.update(data_banks).set(updates).where(eq(data_banks.id, id)).returning();
    return result[0];
  }

  async deleteDataBank(id: string): Promise<boolean> {
    const result = await db.update(data_banks).set({ is_active: false }).where(eq(data_banks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Data Bank Entry methods
  async getDataBankEntries(dataBankId: string): Promise<DataBankEntry[]> {
    const results = await db.select({
      id: data_bank_entries.id,
      data_bank_id: data_bank_entries.data_bank_id,
      key: data_bank_entries.key,
      value: data_bank_entries.value,
      created_at: data_bank_entries.created_at,
      updated_at: data_bank_entries.updated_at,
      created_by: data_bank_entries.created_by,
      is_active: data_bank_entries.is_active,
      metadata: data_bank_entries.metadata,
      creator: {
        full_name: profiles.full_name,
        email: profiles.email
      }
    })
    .from(data_bank_entries)
    .leftJoin(profiles, eq(data_bank_entries.created_by, profiles.id))
    .where(and(eq(data_bank_entries.data_bank_id, dataBankId), eq(data_bank_entries.is_active, true)))
    .orderBy(asc(data_bank_entries.key));
    
    return results as DataBankEntry[];
  }

  async createDataBankEntry(entry: InsertDataBankEntry): Promise<DataBankEntry> {
    const result = await db.insert(data_bank_entries).values(entry).returning();
    return result[0];
  }

  async updateDataBankEntry(id: string, updates: Partial<DataBankEntry>): Promise<DataBankEntry | undefined> {
    // Remove any read-only fields that shouldn't be updated
    const { id: _, created_at, creator, ...cleanUpdates } = updates as any;
    
    // Add updated_at timestamp
    const updateData = {
      ...cleanUpdates,
      updated_at: new Date()
    };
    
    const result = await db.update(data_bank_entries).set(updateData).where(eq(data_bank_entries.id, id)).returning();
    return result[0];
  }

  async deleteDataBankEntry(id: string): Promise<boolean> {
    const result = await db.update(data_bank_entries).set({ is_active: false }).where(eq(data_bank_entries.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Form methods
  async getForms(): Promise<Form[]> {
    return await db.select().from(forms).where(eq(forms.is_active, true)).orderBy(desc(forms.created_at));
  }

  async getForm(id: string): Promise<Form | undefined> {
    const result = await db.select().from(forms).where(eq(forms.id, id)).limit(1);
    return result[0];
  }

  async createForm(form: InsertForm): Promise<Form> {
    const result = await db.insert(forms).values(form).returning();
    return result[0];
  }

  async updateForm(id: string, updates: Partial<Form>): Promise<Form | undefined> {
    const result = await db.update(forms).set(updates).where(eq(forms.id, id)).returning();
    return result[0];
  }

  async deleteForm(id: string): Promise<boolean> {
    const result = await db.update(forms).set({ is_active: false }).where(eq(forms.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Form Field methods
  async getFormFields(formId: string): Promise<FormField[]> {
    return await db.select().from(form_fields)
      .where(eq(form_fields.form_id, formId))
      .orderBy(asc(form_fields.field_order));
  }

  async createFormField(field: InsertFormField): Promise<FormField> {
    const result = await db.insert(form_fields).values(field).returning();
    return result[0];
  }

  async updateFormField(id: string, updates: Partial<FormField>): Promise<FormField | undefined> {
    const result = await db.update(form_fields).set(updates).where(eq(form_fields.id, id)).returning();
    return result[0];
  }

  async deleteFormField(id: string): Promise<boolean> {
    const result = await db.delete(form_fields).where(eq(form_fields.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Schedule methods
  async getSchedules(): Promise<Schedule[]> {
    return await db.select().from(schedules).orderBy(desc(schedules.created_at));
  }

  async getSchedule(id: string): Promise<Schedule | undefined> {
    const result = await db.select().from(schedules).where(eq(schedules.id, id)).limit(1);
    return result[0];
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const result = await db.insert(schedules).values(schedule).returning();
    return result[0];
  }

  async updateSchedule(id: string, updates: Partial<Schedule>): Promise<Schedule | undefined> {
    const result = await db.update(schedules).set(updates).where(eq(schedules.id, id)).returning();
    return result[0];
  }

  async deleteSchedule(id: string): Promise<boolean> {
    const result = await db.delete(schedules).where(eq(schedules.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Schedule Form methods
  async getScheduleForms(scheduleId: string): Promise<any[]> {
    const results = await db.select({
      id: schedule_forms.id,
      schedule_id: schedule_forms.schedule_id,
      form_id: schedule_forms.form_id,
      is_required: schedule_forms.is_required,
      due_date: schedule_forms.due_date,
      created_at: schedule_forms.created_at,
      form_id_ref: forms.id,
      form_name: forms.name,
      form_description: forms.description,
      form_department_id: forms.department_id
    })
    .from(schedule_forms)
    .leftJoin(forms, eq(schedule_forms.form_id, forms.id))
    .where(eq(schedule_forms.schedule_id, scheduleId))
    .orderBy(asc(schedule_forms.created_at));

    // Transform the flat structure into the nested structure expected by frontend
    return results.map(row => ({
      id: row.id,
      schedule_id: row.schedule_id,
      form_id: row.form_id,
      is_required: row.is_required,
      due_date: row.due_date,
      created_at: row.created_at,
      form: {
        id: row.form_id_ref,
        name: row.form_name,
        description: row.form_description,
        department_id: row.form_department_id
      }
    }));
  }

  async createScheduleForm(scheduleForm: InsertScheduleForm): Promise<ScheduleForm> {
    const result = await db.insert(schedule_forms).values(scheduleForm).returning();
    return result[0];
  }

  async updateScheduleForm(id: string, updates: Partial<ScheduleForm>): Promise<ScheduleForm | undefined> {
    const result = await db.update(schedule_forms).set(updates).where(eq(schedule_forms.id, id)).returning();
    return result[0];
  }

  async deleteScheduleForm(id: string): Promise<boolean> {
    const result = await db.delete(schedule_forms).where(eq(schedule_forms.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Form Submission methods
  async getFormSubmissions(formId?: string, scheduleId?: string): Promise<FormSubmission[]> {
    let query = db.select().from(form_submissions);
    
    if (formId && scheduleId) {
      query = query.where(and(eq(form_submissions.form_id, formId), eq(form_submissions.schedule_id, scheduleId)));
    } else if (formId) {
      query = query.where(eq(form_submissions.form_id, formId));
    } else if (scheduleId) {
      query = query.where(eq(form_submissions.schedule_id, scheduleId));
    }
    
    return await query.orderBy(desc(form_submissions.submitted_at));
  }

  async createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission> {
    const result = await db.insert(form_submissions).values(submission).returning();
    return result[0];
  }

  // Schedule Form Completion methods
  async getScheduleFormCompletions(scheduleFormId: string): Promise<ScheduleFormCompletion[]> {
    return await db.select().from(schedule_form_completions)
      .where(eq(schedule_form_completions.schedule_form_id, scheduleFormId))
      .orderBy(desc(schedule_form_completions.completed_at));
  }

  async createScheduleFormCompletion(completion: InsertScheduleFormCompletion): Promise<ScheduleFormCompletion> {
    const result = await db.insert(schedule_form_completions).values(completion).returning();
    return result[0];
  }

  async deleteScheduleFormCompletion(scheduleFormId: string, userId: string): Promise<boolean> {
    const result = await db.delete(schedule_form_completions)
      .where(and(
        eq(schedule_form_completions.schedule_form_id, scheduleFormId),
        eq(schedule_form_completions.user_id, userId)
      ));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
