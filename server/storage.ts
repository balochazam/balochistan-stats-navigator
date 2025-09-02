import { eq, and, desc, asc } from "drizzle-orm";
import { db } from "./db";
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
    
    console.log('Raw DB result:', result.map(r => ({
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

    // Import Balochistan data for progress calculations
    const { balochistandIndicatorData } = await import('@shared/balochistandIndicatorData');
    
    // Add has_data and progress fields based on Balochistan data
    const indicatorsWithProgress = baseQuery.map(indicator => {
      const balochistandData = balochistandIndicatorData.find(
        data => data.indicator_code === indicator.indicator_code
      );
      
      let progress = 0;
      let has_data = false;
      
      if (balochistandData) {
        has_data = true;
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

    // Import Balochistan data for progress calculations
    const { balochistandIndicatorData } = await import('@shared/balochistandIndicatorData');
    
    // Add has_data and progress fields based on Balochistan data
    const indicatorsWithProgress = baseQuery.map(indicator => {
      const balochistandData = balochistandIndicatorData.find(
        data => data.indicator_code === indicator.indicator_code
      );
      
      let progress = 0;
      let has_data = false;
      
      if (balochistandData) {
        has_data = true;
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

export const storage = new DatabaseStorage();
