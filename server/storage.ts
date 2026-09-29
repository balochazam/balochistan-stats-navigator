import { eq, and, desc, asc, sql, count } from "drizzle-orm";
import { db, isDbConfigured } from "./db.js";
import { MemStorage } from "./memStorage.js";
import {
  profiles,
  departments,
  data_banks,
  data_bank_entries,
  forms,
  form_fields,
  field_groups,
  schedules,
  schedule_forms,
  form_submissions,
  schedule_form_completions,

  sdg_goals,
  sdg_targets,
  sdg_indicators,
  sdg_data_sources,
  sdg_indicator_values,
  sdg_progress_calculations,
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
  type FieldGroup,
  type InsertFieldGroup,
  type Schedule,
  type InsertSchedule,
  type ScheduleForm,
  type InsertScheduleForm,
  type FormSubmission,
  type InsertFormSubmission,
  type ScheduleFormCompletion,
  type InsertScheduleFormCompletion,

  type SdgGoal,
  type InsertSdgGoal,
  type SdgTarget,
  type InsertSdgTarget,
  type SdgIndicator,
  type InsertSdgIndicator,
  type SdgDataSource,
  type InsertSdgDataSource,
  type SdgIndicatorValue,
  type InsertSdgIndicatorValue,
  type SdgProgressCalculation,
  type InsertSdgProgressCalculation,
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

  // Field Group methods
  getFieldGroups(formId: string): Promise<FieldGroup[]>;
  createFieldGroup(group: InsertFieldGroup): Promise<FieldGroup>;
  updateFieldGroup(id: string, updates: Partial<FieldGroup>): Promise<FieldGroup | undefined>;
  deleteFieldGroup(id: string): Promise<boolean>;

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
  deleteFormSubmission(id: string): Promise<boolean>;

  // Schedule Form Completion methods
  getScheduleFormCompletions(scheduleFormId: string): Promise<ScheduleFormCompletion[]>;
  createScheduleFormCompletion(completion: InsertScheduleFormCompletion): Promise<ScheduleFormCompletion>;
  deleteScheduleFormCompletion(scheduleFormId: string, userId: string): Promise<boolean>;

  // SDG methods
  getSdgGoals(): Promise<SdgGoal[]>;
  createSdgGoal(goal: InsertSdgGoal): Promise<SdgGoal>;
  updateSdgGoal(id: number, updates: Partial<SdgGoal>): Promise<SdgGoal | undefined>;

  getSdgTargets(goalId?: number): Promise<SdgTarget[]>;
  getAllSdgTargets(): Promise<SdgTarget[]>;
  createSdgTarget(target: InsertSdgTarget): Promise<SdgTarget>;
  updateSdgTarget(id: string, updates: Partial<SdgTarget>): Promise<SdgTarget | undefined>;
  deleteSdgTarget(id: string): Promise<boolean>;

  getSdgIndicators(targetId?: string): Promise<SdgIndicator[]>;
  getAllSdgIndicators(): Promise<SdgIndicator[]>;
  getSdgIndicator(id: string): Promise<SdgIndicator | undefined>;
  createSdgIndicator(indicator: InsertSdgIndicator): Promise<SdgIndicator>;
  updateSdgIndicator(id: string, updates: Partial<SdgIndicator>): Promise<SdgIndicator | undefined>;
  deleteSdgIndicator(id: string): Promise<boolean>;

  getSdgDataSources(): Promise<SdgDataSource[]>;
  createSdgDataSource(source: InsertSdgDataSource): Promise<SdgDataSource>;
  updateSdgDataSource(id: string, updates: Partial<SdgDataSource>): Promise<SdgDataSource | undefined>;

  getSdgIndicatorValues(indicatorId: string): Promise<SdgIndicatorValue[]>;
  createSdgIndicatorValue(value: InsertSdgIndicatorValue): Promise<SdgIndicatorValue>;
  updateSdgIndicatorValue(id: string, updates: Partial<SdgIndicatorValue>): Promise<SdgIndicatorValue | undefined>;

  getSdgProgressCalculations(goalId?: number): Promise<SdgProgressCalculation[]>;
  createSdgProgressCalculation(calculation: InsertSdgProgressCalculation): Promise<SdgProgressCalculation>;
  updateSdgProgressCalculation(id: string, updates: Partial<SdgProgressCalculation>): Promise<SdgProgressCalculation | undefined>;


}

export class DatabaseStorage implements IStorage {
  // Profile/User methods
  async getProfile(id: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
    return result[0];
  }

  async getProfileByEmail(email: string): Promise<Profile | undefined> {
    const normalized = (email || '').trim().toLowerCase();
    const result = await db.select().from(profiles)
      .where(sql`lower(${profiles.email}) = ${normalized}`)
      .limit(1);
    if (result.length > 0) return result[0];
    
    // Support alias for admin@bbs.gov.pk -> admin@bbos.gob.pk
    if (normalized === 'admin@bbs.gov.pk') {
      const aliasResult = await db.select().from(profiles)
        .where(sql`lower(${profiles.email}) = 'admin@bbos.gob.pk'`)
        .limit(1);
      return aliasResult[0];
    }
    return undefined;
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
    try {
      // Remove any read-only fields that shouldn't be updated
      const { id: _, created_at, created_by, ...cleanUpdates } = updates as any;
      
      // Add updated_at timestamp
      const updateData = {
        ...cleanUpdates,
        updated_at: new Date()
      };
      
      const result = await db.update(forms).set(updateData).where(eq(forms.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error('Error updating form:', error);
      throw error;
    }
  }

  async deleteForm(id: string): Promise<boolean> {
    try {
      console.log('Storage: Attempting to delete form with ID:', id);
      const result = await db.update(forms).set({ 
        is_active: false,
        updated_at: new Date()
      }).where(eq(forms.id, id));
      console.log('Storage: Delete result rowCount:', result.rowCount);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Storage: Error deleting form:', error);
      throw error;
    }
  }

  // Field Group methods
  async getFieldGroups(formId: string): Promise<FieldGroup[]> {
    return await db.select().from(field_groups)
      .where(eq(field_groups.form_id, formId))
      .orderBy(asc(field_groups.display_order));
  }

  async createFieldGroup(group: InsertFieldGroup): Promise<FieldGroup> {
    const result = await db.insert(field_groups).values(group).returning();
    return result[0];
  }

  async updateFieldGroup(id: string, updates: Partial<FieldGroup>): Promise<FieldGroup | undefined> {
    const result = await db.update(field_groups).set(updates).where(eq(field_groups.id, id)).returning();
    return result[0];
  }

  async deleteFieldGroup(id: string): Promise<boolean> {
    const result = await db.delete(field_groups).where(eq(field_groups.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Form Field methods
  async getFormFields(formId: string): Promise<FormField[]> {
    console.log('=== STORAGE getFormFields DEBUG ===');
    const result = await db.select().from(form_fields)
      .where(eq(form_fields.form_id, formId))
      .orderBy(asc(form_fields.field_order));
    
    console.log('Raw DB result:', result.map((r: any) => ({
      name: r.field_name,
      type: typeof r.sub_headers,
      sub_headers: r.sub_headers
    })));
    
    // Return fields as-is - Drizzle handles JSONB correctly
    return result;
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
    return results.map((row: any) => ({
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
    if (formId && scheduleId) {
      return await db.select().from(form_submissions)
        .where(and(eq(form_submissions.form_id, formId), eq(form_submissions.schedule_id, scheduleId)))
        .orderBy(desc(form_submissions.submitted_at));
    } else if (formId) {
      return await db.select().from(form_submissions)
        .where(eq(form_submissions.form_id, formId))
        .orderBy(desc(form_submissions.submitted_at));
    } else if (scheduleId) {
      return await db.select().from(form_submissions)
        .where(eq(form_submissions.schedule_id, scheduleId))
        .orderBy(desc(form_submissions.submitted_at));
    }
    
    return await db.select().from(form_submissions)
      .orderBy(desc(form_submissions.submitted_at));
  }

  async createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission> {
    const result = await db.insert(form_submissions).values(submission).returning();
    return result[0];
  }

  async deleteFormSubmission(id: string): Promise<boolean> {
    const result = await db.delete(form_submissions)
      .where(eq(form_submissions.id, id));
    return (result.rowCount ?? 0) > 0;
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

  // SDG methods implementation
  async getSdgGoals(): Promise<SdgGoal[]> {
    return await db.select().from(sdg_goals).orderBy(asc(sdg_goals.id));
  }

  async createSdgGoal(goal: InsertSdgGoal): Promise<SdgGoal> {
    const result = await db.insert(sdg_goals).values(goal).returning();
    return result[0];
  }

  async updateSdgGoal(id: number, updates: Partial<SdgGoal>): Promise<SdgGoal | undefined> {
    const result = await db.update(sdg_goals).set(updates).where(eq(sdg_goals.id, id)).returning();
    return result[0];
  }

  async getSdgTargets(goalId?: number): Promise<SdgTarget[]> {
    if (goalId) {
      return await db.select().from(sdg_targets)
        .where(eq(sdg_targets.sdg_goal_id, goalId))
        .orderBy(asc(sdg_targets.target_number));
    }
    return await db.select().from(sdg_targets)
      .orderBy(asc(sdg_targets.target_number));
  }

  async createSdgTarget(target: InsertSdgTarget): Promise<SdgTarget> {
    const result = await db.insert(sdg_targets).values(target).returning();
    return result[0];
  }

  async updateSdgTarget(id: string, updates: Partial<SdgTarget>): Promise<SdgTarget | undefined> {
    const result = await db.update(sdg_targets).set(updates).where(eq(sdg_targets.id, id)).returning();
    return result[0];
  }

  async deleteSdgTarget(id: string): Promise<boolean> {
    const result = await db.delete(sdg_targets).where(eq(sdg_targets.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getSdgIndicators(targetId?: string): Promise<SdgIndicator[]> {
    let baseQuery;
    if (targetId) {
      baseQuery = await db.select().from(sdg_indicators)
        .where(and(eq(sdg_indicators.sdg_target_id, targetId), eq(sdg_indicators.is_active, true)))
        .orderBy(asc(sdg_indicators.indicator_code));
    } else {
      baseQuery = await db.select().from(sdg_indicators)
        .where(eq(sdg_indicators.is_active, true))
        .orderBy(asc(sdg_indicators.indicator_code));
    }

    // Get all SDG forms with submissions
    const sdgFormsWithSubmissions = await db.select({
      form_name: forms.name,
      form_id: forms.id
    })
    .from(forms)
    .innerJoin(form_submissions, eq(forms.id, form_submissions.form_id))
    .where(eq(forms.category, 'sdg'))
    .groupBy(forms.id, forms.name);

    console.log('DEBUG: SDG forms with submissions:', sdgFormsWithSubmissions);

    // Import Balochistan data for progress calculations
    const { balochistandIndicatorData } = await import('@shared/balochistandIndicatorData');
    
    // Add has_data and progress fields based on Balochistan data AND form submissions
    const indicatorsWithProgress = baseQuery.map((indicator: any) => {
      const balochistandData = balochistandIndicatorData.find(
        data => data.indicator_code === indicator.indicator_code
      );
      
      // Check if there's a form with submissions for this indicator
      const hasFormData = sdgFormsWithSubmissions.some((form: any) => 
        form.form_name.includes(indicator.indicator_code)
      );
      
      let progress = 0;
      let has_data = false;
      
      // Set has_data to true if there's either Balochistan data OR form submissions
      if (balochistandData || hasFormData) {
        has_data = true;
      }
      
      if (balochistandData) {
        const baselineValue = parseFloat(String(balochistandData.baseline.value).replace(/[%,]/g, '')) || 0;
        const progressValue = parseFloat(String(balochistandData.progress.value).replace(/[%,]/g, '')) || 0;
        
        if (indicator.indicator_code.startsWith('1.')) {
          // For poverty indicators, reduction is improvement
          if (baselineValue > 0 && progressValue > 0 && baselineValue > progressValue) {
            progress = ((baselineValue - progressValue) / baselineValue) * 100;
          }
        } else if (indicator.indicator_code.startsWith('2.') || indicator.indicator_code.startsWith('3.')) {
          // For nutrition/health indicators, increase is improvement
          if (baselineValue > 0 && progressValue > baselineValue) {
            progress = ((progressValue - baselineValue) / baselineValue) * 100;
          } else if (progressValue > 0) {
            progress = (progressValue / 100) * 100; // Convert percentage to progress
          }
        } else if (indicator.indicator_code.startsWith('4.') || indicator.indicator_code.startsWith('5.')) {
          // For education/gender indicators, use direct progress calculation
          if (progressValue > baselineValue && baselineValue > 0) {
            progress = ((progressValue - baselineValue) / baselineValue) * 100;
          } else if (progressValue > 0) {
            progress = progressValue; // Direct percentage
          }
        } else {
          // Default calculation for other indicators
          if (progressValue > baselineValue && baselineValue > 0) {
            progress = ((progressValue - baselineValue) / baselineValue) * 100;
          } else if (progressValue > 0) {
            progress = progressValue;
          }
        }
      }

      return {
        ...indicator,
        has_data,
        progress: Math.min(progress, 100) // Cap at 100%
      };
    });

    return indicatorsWithProgress as SdgIndicator[];
  }

  async getAllSdgTargets(): Promise<SdgTarget[]> {
    return await db.select().from(sdg_targets)
      .orderBy(asc(sdg_targets.target_number));
  }

  async getAllSdgIndicators(): Promise<SdgIndicator[]> {
    const baseQuery = await db.select().from(sdg_indicators)
      .where(eq(sdg_indicators.is_active, true))
      .orderBy(asc(sdg_indicators.indicator_code));

    // Get all SDG forms with submissions
    const sdgFormsWithSubmissions = await db.select({
      form_name: forms.name,
      form_id: forms.id
    })
    .from(forms)
    .innerJoin(form_submissions, eq(forms.id, form_submissions.form_id))
    .where(eq(forms.category, 'sdg'))
    .groupBy(forms.id, forms.name);

    // Import Balochistan data for progress calculations
    const { balochistandIndicatorData } = await import('@shared/balochistandIndicatorData');
    
    // Add has_data and progress fields based on Balochistan data AND form submissions
    const indicatorsWithProgress = baseQuery.map((indicator: any) => {
      const balochistandData = balochistandIndicatorData.find(
        data => data.indicator_code === indicator.indicator_code
      );
      
      // Check if there's a form with submissions for this indicator
      const hasFormData = sdgFormsWithSubmissions.some((form: any) => 
        form.form_name.includes(indicator.indicator_code)
      );
      
      let progress = 0;
      let percent_change = 0;
      let trend_direction: 'improving' | 'declining' | 'stable' = 'stable';
      let status_label = 'No Data';
      let has_data = false;
      
      // Set has_data to true if there's either Balochistan data OR form submissions
      if (balochistandData || hasFormData) {
        has_data = true;
      }
      
      if (balochistandData) {
        const baselineValue = parseFloat(String(balochistandData.baseline?.value ?? '').replace(/[%,]/g, '')) || 0;
        const latestValue = parseFloat(String(balochistandData.progress?.value ?? '').replace(/[%,]/g, '')) || 0;
        
        if (baselineValue > 0) {
          const rawDiff = latestValue - baselineValue;
          const rawPercentChange = (rawDiff / baselineValue) * 100;
          percent_change = Math.round(rawPercentChange * 10) / 10;

          const isDecrease = indicator.improvement_direction === 'decrease';

          if (isDecrease) {
            // Lower value is better (e.g. poverty, child mortality, stunting, unemployment)
            if (latestValue < baselineValue) {
              trend_direction = 'improving';
              progress = Math.min(100, Math.round(((baselineValue - latestValue) / baselineValue) * 100));
              status_label = 'Improving';
            } else if (latestValue > baselineValue) {
              trend_direction = 'declining';
              progress = 0; // Regressed / Deteriorated
              status_label = 'Declining / Deteriorating';
            } else {
              trend_direction = 'stable';
              progress = 0;
              status_label = 'Stable';
            }
          } else {
            // Higher value is better (e.g. literacy, social protection, birth registration, forest cover)
            if (latestValue > baselineValue) {
              trend_direction = 'improving';
              progress = Math.min(100, Math.round(((latestValue - baselineValue) / baselineValue) * 100));
              status_label = 'Improving';
            } else if (latestValue < baselineValue) {
              trend_direction = 'declining';
              progress = 0; // Regressed
              status_label = 'Declining / Deteriorating';
            } else {
              trend_direction = 'stable';
              progress = 0;
              status_label = 'Stable';
            }
          }
        }
      }

      return {
        ...indicator,
        has_data,
        progress,
        percent_change,
        trend_direction,
        status_label,
        baseline_value: balochistandData?.baseline?.value || null,
        baseline_year: balochistandData?.baseline?.year || null,
        latest_value: balochistandData?.progress?.value || null,
        latest_year: balochistandData?.progress?.year || null
      };
    });

    return indicatorsWithProgress as SdgIndicator[];
  }

  async getSdgIndicator(id: string): Promise<SdgIndicator | undefined> {
    const result = await db.select().from(sdg_indicators).where(eq(sdg_indicators.id, id)).limit(1);
    return result[0];
  }

  async createSdgIndicator(indicator: InsertSdgIndicator): Promise<SdgIndicator> {
    const result = await db.insert(sdg_indicators).values(indicator).returning();
    return result[0];
  }

  async updateSdgIndicator(id: string, updates: Partial<SdgIndicator>): Promise<SdgIndicator | undefined> {
    const result = await db.update(sdg_indicators).set(updates).where(eq(sdg_indicators.id, id)).returning();
    return result[0];
  }

  async deleteSdgIndicator(id: string): Promise<boolean> {
    const result = await db.update(sdg_indicators).set({ is_active: false }).where(eq(sdg_indicators.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getSdgDataSources(): Promise<SdgDataSource[]> {
    return await db.select().from(sdg_data_sources).where(eq(sdg_data_sources.is_active, true)).orderBy(asc(sdg_data_sources.name));
  }

  async createSdgDataSource(source: InsertSdgDataSource): Promise<SdgDataSource> {
    const result = await db.insert(sdg_data_sources).values(source).returning();
    return result[0];
  }

  async updateSdgDataSource(id: string, updates: Partial<SdgDataSource>): Promise<SdgDataSource | undefined> {
    const result = await db.update(sdg_data_sources).set(updates).where(eq(sdg_data_sources.id, id)).returning();
    return result[0];
  }

  async getSdgIndicatorValues(indicatorId: string): Promise<SdgIndicatorValue[]> {
    return await db.select().from(sdg_indicator_values)
      .where(eq(sdg_indicator_values.indicator_id, indicatorId))
      .orderBy(desc(sdg_indicator_values.year));
  }

  async createSdgIndicatorValue(value: InsertSdgIndicatorValue): Promise<SdgIndicatorValue> {
    const result = await db.insert(sdg_indicator_values).values(value).returning();
    return result[0];
  }

  async updateSdgIndicatorValue(id: string, updates: Partial<SdgIndicatorValue>): Promise<SdgIndicatorValue | undefined> {
    const result = await db.update(sdg_indicator_values).set(updates).where(eq(sdg_indicator_values.id, id)).returning();
    return result[0];
  }

  async getSdgProgressCalculations(goalId?: number): Promise<SdgProgressCalculation[]> {
    if (goalId) {
      return await db.select().from(sdg_progress_calculations)
        .where(eq(sdg_progress_calculations.sdg_goal_id, goalId))
        .orderBy(desc(sdg_progress_calculations.last_calculation_date));
    }
    return await db.select().from(sdg_progress_calculations)
      .orderBy(desc(sdg_progress_calculations.last_calculation_date));
  }

  async createSdgProgressCalculation(calculation: InsertSdgProgressCalculation): Promise<SdgProgressCalculation> {
    const result = await db.insert(sdg_progress_calculations).values(calculation).returning();
    return result[0];
  }

  async updateSdgProgressCalculation(id: string, updates: Partial<SdgProgressCalculation>): Promise<SdgProgressCalculation | undefined> {
    const result = await db.update(sdg_progress_calculations).set(updates).where(eq(sdg_progress_calculations.id, id)).returning();
    return result[0];
  }
}

export class ResilientStorage implements IStorage {
  private mem = new MemStorage();
  private db = new DatabaseStorage();

  private async execute<T>(
    dbFn: () => Promise<T>,
    memFn: () => Promise<T>
  ): Promise<T> {
    if (!isDbConfigured) {
      return memFn();
    }
    try {
      return await dbFn();
    } catch (err: any) {
      console.warn(`[Storage Fallback] DB operation failed (${err?.message || err}), falling back to in-memory store`);
      return memFn();
    }
  }

  // Profile methods
  getProfile(id: string) {
    return this.execute(() => this.db.getProfile(id), () => this.mem.getProfile(id));
  }
  getProfileByEmail(email: string) {
    return this.execute(() => this.db.getProfileByEmail(email), () => this.mem.getProfileByEmail(email));
  }
  createProfile(profile: InsertProfile) {
    return this.execute(
      async () => {
        const p = await this.db.createProfile(profile);
        await this.mem.createProfile(profile);
        return p;
      },
      () => this.mem.createProfile(profile)
    );
  }
  updateProfile(id: string, updates: Partial<Profile>) {
    return this.execute(
      async () => {
        const p = await this.db.updateProfile(id, updates);
        await this.mem.updateProfile(id, updates);
        return p;
      },
      () => this.mem.updateProfile(id, updates)
    );
  }
  getAllProfiles() {
    return this.execute(() => this.db.getAllProfiles(), () => this.mem.getAllProfiles());
  }

  // Department methods
  getDepartments() {
    return this.execute(() => this.db.getDepartments(), () => this.mem.getDepartments());
  }
  createDepartment(dept: InsertDepartment) {
    return this.execute(
      async () => {
        const d = await this.db.createDepartment(dept);
        await this.mem.createDepartment(dept);
        return d;
      },
      () => this.mem.createDepartment(dept)
    );
  }
  updateDepartment(id: string, updates: Partial<Department>) {
    return this.execute(() => this.db.updateDepartment(id, updates), () => this.mem.updateDepartment(id, updates));
  }
  deleteDepartment(id: string) {
    return this.execute(() => this.db.deleteDepartment(id), () => this.mem.deleteDepartment(id));
  }

  // Data Bank methods
  getDataBanks() {
    return this.execute(() => this.db.getDataBanks(), () => this.mem.getDataBanks());
  }
  getDataBank(id: string) {
    return this.execute(() => this.db.getDataBank(id), () => this.mem.getDataBank(id));
  }
  createDataBank(dataBank: InsertDataBank) {
    return this.execute(() => this.db.createDataBank(dataBank), () => this.mem.createDataBank(dataBank));
  }
  updateDataBank(id: string, updates: Partial<DataBank>) {
    return this.execute(() => this.db.updateDataBank(id, updates), () => this.mem.updateDataBank(id, updates));
  }
  deleteDataBank(id: string) {
    return this.execute(() => this.db.deleteDataBank(id), () => this.mem.deleteDataBank(id));
  }

  // Data Bank Entry methods
  getDataBankEntries(dataBankId: string) {
    return this.execute(() => this.db.getDataBankEntries(dataBankId), () => this.mem.getDataBankEntries(dataBankId));
  }
  createDataBankEntry(entry: InsertDataBankEntry) {
    return this.execute(() => this.db.createDataBankEntry(entry), () => this.mem.createDataBankEntry(entry));
  }
  updateDataBankEntry(id: string, updates: Partial<DataBankEntry>) {
    return this.execute(() => this.db.updateDataBankEntry(id, updates), () => this.mem.updateDataBankEntry(id, updates));
  }
  deleteDataBankEntry(id: string) {
    return this.execute(() => this.db.deleteDataBankEntry(id), () => this.mem.deleteDataBankEntry(id));
  }

  // Form methods
  getForms() {
    return this.execute(() => this.db.getForms(), () => this.mem.getForms());
  }
  getForm(id: string) {
    return this.execute(() => this.db.getForm(id), () => this.mem.getForm(id));
  }
  createForm(form: InsertForm) {
    return this.execute(() => this.db.createForm(form), () => this.mem.createForm(form));
  }
  updateForm(id: string, updates: Partial<Form>) {
    return this.execute(() => this.db.updateForm(id, updates), () => this.mem.updateForm(id, updates));
  }
  deleteForm(id: string) {
    return this.execute(() => this.db.deleteForm(id), () => this.mem.deleteForm(id));
  }

  // Field Group methods
  getFieldGroups(formId: string) {
    return this.execute(() => this.db.getFieldGroups(formId), () => this.mem.getFieldGroups(formId));
  }
  createFieldGroup(group: InsertFieldGroup) {
    return this.execute(() => this.db.createFieldGroup(group), () => this.mem.createFieldGroup(group));
  }
  updateFieldGroup(id: string, updates: Partial<FieldGroup>) {
    return this.execute(() => this.db.updateFieldGroup(id, updates), () => this.mem.updateFieldGroup(id, updates));
  }
  deleteFieldGroup(id: string) {
    return this.execute(() => this.db.deleteFieldGroup(id), () => this.mem.deleteFieldGroup(id));
  }

  // Form Field methods
  getFormFields(formId: string) {
    return this.execute(() => this.db.getFormFields(formId), () => this.mem.getFormFields(formId));
  }
  createFormField(field: InsertFormField) {
    return this.execute(() => this.db.createFormField(field), () => this.mem.createFormField(field));
  }
  updateFormField(id: string, updates: Partial<FormField>) {
    return this.execute(() => this.db.updateFormField(id, updates), () => this.mem.updateFormField(id, updates));
  }
  deleteFormField(id: string) {
    return this.execute(() => this.db.deleteFormField(id), () => this.mem.deleteFormField(id));
  }

  // Schedule methods
  getSchedules() {
    return this.execute(() => this.db.getSchedules(), () => this.mem.getSchedules());
  }
  getSchedule(id: string) {
    return this.execute(() => this.db.getSchedule(id), () => this.mem.getSchedule(id));
  }
  createSchedule(schedule: InsertSchedule) {
    return this.execute(() => this.db.createSchedule(schedule), () => this.mem.createSchedule(schedule));
  }
  updateSchedule(id: string, updates: Partial<Schedule>) {
    return this.execute(() => this.db.updateSchedule(id, updates), () => this.mem.updateSchedule(id, updates));
  }
  deleteSchedule(id: string) {
    return this.execute(() => this.db.deleteSchedule(id), () => this.mem.deleteSchedule(id));
  }

  // Schedule Form methods
  getScheduleForms(scheduleId: string) {
    return this.execute(() => this.db.getScheduleForms(scheduleId), () => this.mem.getScheduleForms(scheduleId));
  }
  createScheduleForm(scheduleForm: InsertScheduleForm) {
    return this.execute(() => this.db.createScheduleForm(scheduleForm), () => this.mem.createScheduleForm(scheduleForm));
  }
  updateScheduleForm(id: string, updates: Partial<ScheduleForm>) {
    return this.execute(() => this.db.updateScheduleForm(id, updates), () => this.mem.updateScheduleForm(id, updates));
  }
  deleteScheduleForm(id: string) {
    return this.execute(() => this.db.deleteScheduleForm(id), () => this.mem.deleteScheduleForm(id));
  }

  // Form Submission methods
  getFormSubmissions(formId?: string, scheduleId?: string) {
    return this.execute(() => this.db.getFormSubmissions(formId, scheduleId), () => this.mem.getFormSubmissions(formId, scheduleId));
  }
  createFormSubmission(submission: InsertFormSubmission) {
    return this.execute(() => this.db.createFormSubmission(submission), () => this.mem.createFormSubmission(submission));
  }
  deleteFormSubmission(id: string) {
    return this.execute(() => this.db.deleteFormSubmission(id), () => this.mem.deleteFormSubmission(id));
  }

  // Schedule Form Completion methods
  getScheduleFormCompletions(scheduleFormId: string) {
    return this.execute(() => this.db.getScheduleFormCompletions(scheduleFormId), () => this.mem.getScheduleFormCompletions(scheduleFormId));
  }
  createScheduleFormCompletion(completion: InsertScheduleFormCompletion) {
    return this.execute(() => this.db.createScheduleFormCompletion(completion), () => this.mem.createScheduleFormCompletion(completion));
  }
  deleteScheduleFormCompletion(scheduleFormId: string, userId: string) {
    return this.execute(() => this.db.deleteScheduleFormCompletion(scheduleFormId, userId), () => this.mem.deleteScheduleFormCompletion(scheduleFormId, userId));
  }

  // SDG methods
  getSdgGoals() {
    return this.execute(() => this.db.getSdgGoals(), () => this.mem.getSdgGoals());
  }
  createSdgGoal(goal: InsertSdgGoal) {
    return this.execute(() => this.db.createSdgGoal(goal), () => this.mem.createSdgGoal(goal));
  }
  updateSdgGoal(id: number, updates: Partial<SdgGoal>) {
    return this.execute(() => this.db.updateSdgGoal(id, updates), () => this.mem.updateSdgGoal(id, updates));
  }

  getSdgTargets(goalId?: number) {
    return this.execute(() => this.db.getSdgTargets(goalId), () => this.mem.getSdgTargets(goalId));
  }
  getAllSdgTargets() {
    return this.execute(() => this.db.getAllSdgTargets(), () => this.mem.getAllSdgTargets());
  }
  createSdgTarget(target: InsertSdgTarget) {
    return this.execute(() => this.db.createSdgTarget(target), () => this.mem.createSdgTarget(target));
  }
  updateSdgTarget(id: string, updates: Partial<SdgTarget>) {
    return this.execute(() => this.db.updateSdgTarget(id, updates), () => this.mem.updateSdgTarget(id, updates));
  }
  deleteSdgTarget(id: string) {
    return this.execute(() => this.db.deleteSdgTarget(id), () => this.mem.deleteSdgTarget(id));
  }

  getSdgIndicators(targetId?: string) {
    return this.execute(() => this.db.getSdgIndicators(targetId), () => this.mem.getSdgIndicators(targetId));
  }
  getAllSdgIndicators() {
    return this.execute(() => this.db.getAllSdgIndicators(), () => this.mem.getAllSdgIndicators());
  }
  getSdgIndicator(id: string) {
    return this.execute(() => this.db.getSdgIndicator(id), () => this.mem.getSdgIndicator(id));
  }
  createSdgIndicator(indicator: InsertSdgIndicator) {
    return this.execute(() => this.db.createSdgIndicator(indicator), () => this.mem.createSdgIndicator(indicator));
  }
  updateSdgIndicator(id: string, updates: Partial<SdgIndicator>) {
    return this.execute(() => this.db.updateSdgIndicator(id, updates), () => this.mem.updateSdgIndicator(id, updates));
  }
  deleteSdgIndicator(id: string) {
    return this.execute(() => this.db.deleteSdgIndicator(id), () => this.mem.deleteSdgIndicator(id));
  }

  getSdgDataSources() {
    return this.execute(() => this.db.getSdgDataSources(), () => this.mem.getSdgDataSources());
  }
  createSdgDataSource(source: InsertSdgDataSource) {
    return this.execute(() => this.db.createSdgDataSource(source), () => this.mem.createSdgDataSource(source));
  }
  updateSdgDataSource(id: string, updates: Partial<SdgDataSource>) {
    return this.execute(() => this.db.updateSdgDataSource(id, updates), () => this.mem.updateSdgDataSource(id, updates));
  }

  getSdgIndicatorValues(indicatorId: string) {
    return this.execute(() => this.db.getSdgIndicatorValues(indicatorId), () => this.mem.getSdgIndicatorValues(indicatorId));
  }
  createSdgIndicatorValue(value: InsertSdgIndicatorValue) {
    return this.execute(() => this.db.createSdgIndicatorValue(value), () => this.mem.createSdgIndicatorValue(value));
  }
  updateSdgIndicatorValue(id: string, updates: Partial<SdgIndicatorValue>): Promise<SdgIndicatorValue | undefined> {
    return this.execute(() => this.db.updateSdgIndicatorValue(id, updates), () => this.mem.updateSdgIndicatorValue(id, updates));
  }

  getSdgProgressCalculations(goalId?: number) {
    return this.execute(() => this.db.getSdgProgressCalculations(goalId), () => this.mem.getSdgProgressCalculations(goalId));
  }
  createSdgProgressCalculation(calc: InsertSdgProgressCalculation) {
    return this.execute(() => this.db.createSdgProgressCalculation(calc), () => this.mem.createSdgProgressCalculation(calc));
  }
  updateSdgProgressCalculation(id: string, updates: Partial<SdgProgressCalculation>) {
    return this.execute(() => this.db.updateSdgProgressCalculation(id, updates), () => this.mem.updateSdgProgressCalculation(id, updates));
  }
}

export const storage = new ResilientStorage();

