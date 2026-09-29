import {
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
import { type IStorage } from "./storage.js";
import { sdgGoalsData, sdgTargetsData, sdgDataSourcesData } from "./seedData.js";
import { balochistandIndicatorData } from "@shared/balochistandIndicatorData";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export class MemStorage implements IStorage {
  private profiles = new Map<string, Profile>();
  private departments = new Map<string, Department>();
  private dataBanks = new Map<string, DataBank>();
  private dataBankEntries = new Map<string, DataBankEntry>();
  private forms = new Map<string, Form>();
  private formFields = new Map<string, FormField>();
  private fieldGroups = new Map<string, FieldGroup>();
  private schedules = new Map<string, Schedule>();
  private scheduleForms = new Map<string, ScheduleForm>();
  private formSubmissions = new Map<string, FormSubmission>();
  private scheduleFormCompletions = new Map<string, ScheduleFormCompletion>();
  private sdgGoals = new Map<number, SdgGoal>();
  private sdgTargets = new Map<string, SdgTarget>();
  private sdgIndicators = new Map<string, SdgIndicator>();
  private sdgDataSources = new Map<string, SdgDataSource>();
  private sdgIndicatorValues = new Map<string, SdgIndicatorValue>();
  private sdgProgressCalculations = new Map<string, SdgProgressCalculation>();

  constructor() {
    this.initSeedData();
  }

  private initSeedData() {
    // 1. Seed default admin users
    const defaultPasswordHash = bcrypt.hashSync("admin123", 10);
    const adminUser: Profile = {
      id: "bbb55fbb-dc8d-44a4-9389-584261e031bc",
      email: "admin@bbos.gob.pk",
      password_hash: defaultPasswordHash,
      full_name: "BBoS Administrator",
      role: "admin",
      department_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.profiles.set(adminUser.id, adminUser);

    const userAzam: Profile = {
      id: "azam-bbos-1",
      email: "syedazambaloch@gmail.com",
      password_hash: defaultPasswordHash,
      full_name: "Syed Azam Baloch",
      role: "admin",
      department_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.profiles.set(userAzam.id, userAzam);

    // 2. Seed departments
    const deptList: Department[] = [
      {
        id: "dept-bbos",
        name: "Balochistan Bureau of Statistics",
        description: "Provincial statistical organization responsible for data collection and reporting",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "dept-pnd",
        name: "Planning & Development Department",
        description: "Provincial planning, development projects, and SDG monitoring",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "dept-health",
        name: "Health Department Balochistan",
        description: "Healthcare provision, maternal health, child nutrition and disease prevention",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "dept-edu",
        name: "Secondary Education Department",
        description: "School education, literacy programs, and educational facilities",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "dept-agri",
        name: "Agriculture & Cooperatives Department",
        description: "Agricultural development, crop statistics, food security",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    deptList.forEach((d) => this.departments.set(d.id, d));

    // 3. Seed Data Banks & Districts
    const districtBank: DataBank = {
      id: "db-districts",
      name: "Districts of Balochistan",
      description: "Official administrative districts of Balochistan province",
      department_id: "dept-bbos",
      is_active: true,
      created_by: adminUser.id,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.dataBanks.set(districtBank.id, districtBank);

    const districts = [
      "Quetta", "Pishin", "Killa Abdullah", "Chaman", "Ziarat", "Harnai",
      "Sibi", "Kohlu", "Dera Bugti", "Barkhan", "Musakhel", "Loralai",
      "Duki", "Zhob", "Sherani", "Killa Saifullah", "Kalat", "Mastung",
      "Khuzdar", "Awaran", "Kharan", "Washuk", "Surab", "Nushki", "Chagai",
      "Gwadar", "Kech (Turbat)", "Panjgur", "Lasbela", "Hub", "Jaffarabad",
      "Nasirabad", "Sohbatpur", "Jhal Magsi", "Usta Muhammad"
    ];

    districts.forEach((name, idx) => {
      const entryId = `dist-${idx + 1}`;
      this.dataBankEntries.set(entryId, {
        id: entryId,
        data_bank_id: districtBank.id,
        key: name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
        value: name,
        metadata: { province: "Balochistan", division: "Administrative District" },
        created_by: adminUser.id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
    });

    // 4. Seed SDG Goals
    sdgGoalsData.forEach((goal) => {
      this.sdgGoals.set(goal.id, {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        color: goal.color,
        icon_path: null,
        created_at: new Date(),
        updated_at: new Date(),
      });
    });

    // 5. Seed SDG Targets
    const targetCodeToId = new Map<string, string>();
    sdgTargetsData.forEach((target) => {
      const id = `target-${target.target_number.replace('.', '_')}`;
      targetCodeToId.set(target.target_number, id);
      this.sdgTargets.set(id, {
        id,
        sdg_goal_id: target.sdg_goal_id,
        target_number: target.target_number,
        title: target.title,
        description: target.description,
        created_at: new Date(),
        updated_at: new Date(),
      });
    });

    // 6. Seed SDG Data Sources
    sdgDataSourcesData.forEach((source, idx) => {
      const id = `ds-${idx + 1}`;
      this.sdgDataSources.set(id, {
        id,
        name: source.name,
        full_name: source.full_name,
        source_type: source.source_type as any,
        description: source.description,
        website_url: null,
        contact_info: null,
        is_active: true,
        created_at: new Date(),
      });
    });

    // 7. Seed SDG Indicators and initial indicator values from authentic Balochistan dataset
    balochistandIndicatorData.forEach((data, _idx) => {
      const parts = data.indicator_code.split('.');
      const goalId = parseInt(parts[0], 10) || 1;
      const targetNumber = `${parts[0]}.${parts[1]}`;
      const targetId = targetCodeToId.get(targetNumber) || `target-${targetNumber.replace('.', '_')}`;

      if (!this.sdgTargets.has(targetId)) {
        this.sdgTargets.set(targetId, {
          id: targetId,
          sdg_goal_id: goalId,
          target_number: targetNumber,
          title: `Target ${targetNumber}`,
          description: `SDG Target ${targetNumber} for Goal ${goalId}`,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      const indicatorId = `ind-${data.indicator_code.replace(/\./g, '_')}`;
      const baselineVal = parseFloat(String(data.baseline.value).replace(/[%,]/g, '')) || 0;
      const progressVal = parseFloat(String(data.progress.value).replace(/[%,]/g, '')) || 0;
      let calculatedProgress = 0;
      if (goalId === 1) {
        if (baselineVal > 0 && progressVal > 0 && baselineVal > progressVal) {
          calculatedProgress = Math.min(100, Math.round(((baselineVal - progressVal) / baselineVal) * 100));
        }
      } else {
        if (baselineVal > 0 && progressVal > baselineVal) {
          calculatedProgress = Math.min(100, Math.round(((progressVal - baselineVal) / baselineVal) * 100));
        } else if (progressVal > 0) {
          calculatedProgress = Math.min(100, Math.round(progressVal));
        }
      }

      this.sdgIndicators.set(indicatorId, {
        id: indicatorId,
        sdg_target_id: targetId,
        indicator_code: data.indicator_code,
        title: data.title,
        description: data.trend_analysis || data.title,
        indicator_type: "percentage" as any,
        unit: data.unit,
        methodology: `Official Balochistan SDG calculation based on ${data.baseline.source} and ${data.progress.source}`,
        data_collection_frequency: "Every 3-5 years",
        improvement_direction: goalId === 1 ? "decrease" : "increase",
        responsible_departments: ["dept-bbos", "dept-pnd"],
        data_structure: null,
        validation_rules: null,
        aggregation_methods: null,
        disaggregation_categories: null,
        data_quality_requirements: null,
        is_active: true,
        created_by: adminUser.id,
        created_at: new Date(),
        updated_at: new Date(),
        has_data: true,
        progress: calculatedProgress,
      } as any);

      // Add baseline value
      const baseValId = `val-${indicatorId}-base`;
      this.sdgIndicatorValues.set(baseValId, {
        id: baseValId,
        indicator_id: indicatorId,
        data_source_id: "ds-1",
        year: parseInt(data.baseline.year.split('-')[0], 10) || 2015,
        value: String(data.baseline.value),
        value_numeric: Math.round(baselineVal),
        breakdown_data: data.baseline.breakdown || {},
        baseline_indicator: true,
        progress_indicator: false,
        notes: data.baseline.notes || `Baseline from ${data.baseline.source}`,
        reference_document: data.baseline.source,
        data_quality_score: 5,
        department_id: "dept-bbos",
        submitted_by: adminUser.id,
        verified_by: null,
        verified_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Add progress value
      const progValId = `val-${indicatorId}-prog`;
      this.sdgIndicatorValues.set(progValId, {
        id: progValId,
        indicator_id: indicatorId,
        data_source_id: "ds-2",
        year: parseInt(data.progress.year.split('-')[0], 10) || 2020,
        value: String(data.progress.value),
        value_numeric: Math.round(progressVal),
        breakdown_data: data.progress.breakdown || {},
        baseline_indicator: false,
        progress_indicator: true,
        notes: data.progress.notes || `Progress update from ${data.progress.source}`,
        reference_document: data.progress.source,
        data_quality_score: 5,
        department_id: "dept-bbos",
        submitted_by: adminUser.id,
        verified_by: null,
        verified_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      });
    });

    // 8. Seed sample Form and Schedule
    const sampleForm: Form = {
      id: "form-sdg-poverty",
      name: "SDG 1.2.2 Multidimensional Poverty Data Entry Form",
      description: "Collection form for poverty dimensions across Balochistan districts",
      category: "sdg",
      department_id: "dept-bbos",
      is_active: true,
      created_by: adminUser.id,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.forms.set(sampleForm.id, sampleForm);

    const f1: FormField = {
      id: "ff-1",
      form_id: sampleForm.id,
      field_group_id: null,
      field_name: "district",
      field_label: "District",
      field_type: "select",
      field_order: 1,
      is_required: true,
      is_primary_column: true,
      is_secondary_column: false,
      reference_data_name: null,
      placeholder_text: "Select District",
      aggregate_fields: null,
      has_sub_headers: false,
      sub_headers: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const f2: FormField = {
      id: "ff-2",
      form_id: sampleForm.id,
      field_group_id: null,
      field_name: "year",
      field_label: "Survey Year",
      field_type: "number",
      field_order: 2,
      is_required: true,
      is_primary_column: false,
      is_secondary_column: false,
      reference_data_name: null,
      placeholder_text: "Enter Year",
      aggregate_fields: null,
      has_sub_headers: false,
      sub_headers: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const f3: FormField = {
      id: "ff-3",
      form_id: sampleForm.id,
      field_group_id: null,
      field_name: "poverty_headcount_ratio",
      field_label: "MPI Headcount Ratio (%)",
      field_type: "number",
      field_order: 3,
      is_required: true,
      is_primary_column: false,
      is_secondary_column: false,
      reference_data_name: null,
      placeholder_text: "Percentage",
      aggregate_fields: null,
      has_sub_headers: false,
      sub_headers: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.formFields.set(f1.id, f1);
    this.formFields.set(f2.id, f2);
    this.formFields.set(f3.id, f3);

    const sampleSchedule: Schedule = {
      id: "sched-2025-annual",
      name: "Annual Balochistan SDG Progress Survey 2025",
      description: "Mandatory provincial data compilation cycle for UN SDG tracking",
      status: "open",
      start_date: "2025-01-01",
      end_date: "2025-12-31",
      created_by: adminUser.id,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.schedules.set(sampleSchedule.id, sampleSchedule);

    const schedForm: ScheduleForm = {
      id: "sf-1",
      schedule_id: sampleSchedule.id,
      form_id: sampleForm.id,
      is_required: true,
      due_date: "2025-11-30",
      created_at: new Date(),
    };
    this.scheduleForms.set(schedForm.id, schedForm);

    console.log(
      `[MemStorage] Initialized with ${this.profiles.size} users, ${this.sdgGoals.size} goals, ${this.sdgTargets.size} targets, ${this.sdgIndicators.size} indicators, ${this.sdgIndicatorValues.size} values.`
    );
  }

  // Profile methods
  async getProfile(id: string): Promise<Profile | undefined> {
    return this.profiles.get(id);
  }

  async getProfileByEmail(email: string): Promise<Profile | undefined> {
    const lower = email.toLowerCase().trim();
    for (const p of this.profiles.values()) {
      if (p.email.toLowerCase().trim() === lower) return p;
    }
    return undefined;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const id = profile.id || crypto.randomUUID();
    const newProfile: Profile = {
      id,
      email: profile.email,
      password_hash: profile.password_hash || null,
      full_name: profile.full_name || null,
      role: profile.role || "data_entry_user",
      department_id: profile.department_id || null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.profiles.set(id, newProfile);
    return newProfile;
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | undefined> {
    const existing = this.profiles.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updated_at: new Date() };
    this.profiles.set(id, updated);
    return updated;
  }

  async getAllProfiles(): Promise<Profile[]> {
    return Array.from(this.profiles.values()).sort((a, b) => {
      const aTime = a.created_at ? a.created_at.getTime() : 0;
      const bTime = b.created_at ? b.created_at.getTime() : 0;
      return bTime - aTime;
    });
  }

  // Department methods
  async getDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const id = crypto.randomUUID();
    const newDept: Department = {
      id,
      name: department.name,
      description: department.description ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.departments.set(id, newDept);
    return newDept;
  }

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department | undefined> {
    const existing = this.departments.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updated_at: new Date() };
    this.departments.set(id, updated);
    return updated;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    return this.departments.delete(id);
  }

  // Data Bank methods
  async getDataBanks(): Promise<DataBank[]> {
    return Array.from(this.dataBanks.values())
      .filter((d) => d.is_active)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async getDataBank(id: string): Promise<DataBank | undefined> {
    return this.dataBanks.get(id);
  }

  async createDataBank(dataBank: InsertDataBank): Promise<DataBank> {
    const id = crypto.randomUUID();
    const newDb: DataBank = {
      id,
      name: dataBank.name,
      description: dataBank.description ?? null,
      department_id: dataBank.department_id ?? null,
      is_active: dataBank.is_active ?? true,
      created_by: dataBank.created_by,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.dataBanks.set(id, newDb);
    return newDb;
  }

  async updateDataBank(id: string, updates: Partial<DataBank>): Promise<DataBank | undefined> {
    const existing = this.dataBanks.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updated_at: new Date() };
    this.dataBanks.set(id, updated);
    return updated;
  }

  async deleteDataBank(id: string): Promise<boolean> {
    const existing = this.dataBanks.get(id);
    if (!existing) return false;
    existing.is_active = false;
    existing.updated_at = new Date();
    return true;
  }

  // Data Bank Entry methods
  async getDataBankEntries(dataBankId: string): Promise<DataBankEntry[]> {
    return Array.from(this.dataBankEntries.values())
      .filter((e) => e.data_bank_id === dataBankId && e.is_active)
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  async createDataBankEntry(entry: InsertDataBankEntry): Promise<DataBankEntry> {
    const id = crypto.randomUUID();
    const newEntry: DataBankEntry = {
      id,
      data_bank_id: entry.data_bank_id,
      key: entry.key,
      value: entry.value,
      metadata: entry.metadata || {},
      created_by: entry.created_by,
      is_active: entry.is_active ?? true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.dataBankEntries.set(id, newEntry);
    return newEntry;
  }

  async updateDataBankEntry(id: string, updates: Partial<DataBankEntry>): Promise<DataBankEntry | undefined> {
    const existing = this.dataBankEntries.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updated_at: new Date() };
    this.dataBankEntries.set(id, updated);
    return updated;
  }

  async deleteDataBankEntry(id: string): Promise<boolean> {
    const existing = this.dataBankEntries.get(id);
    if (!existing) return false;
    existing.is_active = false;
    existing.updated_at = new Date();
    return true;
  }

  // Form methods
  async getForms(): Promise<Form[]> {
    return Array.from(this.forms.values())
      .filter((f) => f.is_active)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async getForm(id: string): Promise<Form | undefined> {
    return this.forms.get(id);
  }

  async createForm(form: InsertForm): Promise<Form> {
    const id = crypto.randomUUID();
    const newForm: Form = {
      id,
      name: form.name,
      description: form.description ?? null,
      department_id: form.department_id ?? null,
      category: form.category === "sdg" ? "sdg" : "bbos",
      is_active: form.is_active ?? true,
      created_by: form.created_by,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.forms.set(id, newForm);
    return newForm;
  }

  async updateForm(id: string, updates: Partial<Form>): Promise<Form | undefined> {
    const existing = this.forms.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updated_at: new Date() };
    this.forms.set(id, updated);
    return updated;
  }

  async deleteForm(id: string): Promise<boolean> {
    const existing = this.forms.get(id);
    if (!existing) return false;
    existing.is_active = false;
    existing.updated_at = new Date();
    return true;
  }

  // Field Group methods
  async getFieldGroups(formId: string): Promise<FieldGroup[]> {
    return Array.from(this.fieldGroups.values())
      .filter((g) => g.form_id === formId)
      .sort((a, b) => a.display_order - b.display_order);
  }

  async createFieldGroup(group: InsertFieldGroup): Promise<FieldGroup> {
    const id = crypto.randomUUID();
    const newGroup: FieldGroup = {
      id,
      form_id: group.form_id,
      group_name: group.group_name,
      group_label: group.group_label,
      parent_group_id: group.parent_group_id ?? null,
      group_type: group.group_type ?? "section",
      display_order: group.display_order ?? 0,
      is_repeatable: group.is_repeatable ?? false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.fieldGroups.set(id, newGroup);
    return newGroup;
  }

  async updateFieldGroup(id: string, updates: Partial<FieldGroup>): Promise<FieldGroup | undefined> {
    const existing = this.fieldGroups.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updated_at: new Date() };
    this.fieldGroups.set(id, updated);
    return updated;
  }

  async deleteFieldGroup(id: string): Promise<boolean> {
    return this.fieldGroups.delete(id);
  }

  // Form Field methods
  async getFormFields(formId: string): Promise<FormField[]> {
    return Array.from(this.formFields.values())
      .filter((f) => f.form_id === formId)
      .sort((a, b) => a.field_order - b.field_order);
  }

  async createFormField(field: InsertFormField): Promise<FormField> {
    const id = crypto.randomUUID();
    const newField: FormField = {
      id,
      form_id: field.form_id,
      field_name: field.field_name,
      field_label: field.field_label,
      field_type: field.field_type,
      field_group_id: field.field_group_id ?? null,
      field_order: field.field_order ?? 0,
      is_required: field.is_required ?? false,
      is_primary_column: field.is_primary_column ?? false,
      is_secondary_column: field.is_secondary_column ?? false,
      reference_data_name: field.reference_data_name ?? null,
      placeholder_text: field.placeholder_text ?? null,
      aggregate_fields: field.aggregate_fields ?? null,
      has_sub_headers: field.has_sub_headers ?? false,
      sub_headers: field.sub_headers ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.formFields.set(id, newField);
    return newField;
  }

  async updateFormField(id: string, updates: Partial<FormField>): Promise<FormField | undefined> {
    const existing = this.formFields.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updated_at: new Date() };
    this.formFields.set(id, updated);
    return updated;
  }

  async deleteFormField(id: string): Promise<boolean> {
    return this.formFields.delete(id);
  }

  // Schedule methods
  async getSchedules(): Promise<Schedule[]> {
    return Array.from(this.schedules.values()).sort(
      (a, b) => b.created_at.getTime() - a.created_at.getTime()
    );
  }

  async getSchedule(id: string): Promise<Schedule | undefined> {
    return this.schedules.get(id);
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const id = crypto.randomUUID();
    const newSchedule: Schedule = {
      id,
      name: schedule.name,
      description: schedule.description ?? null,
      status: schedule.status ?? "open",
      start_date: schedule.start_date,
      end_date: schedule.end_date,
      created_by: schedule.created_by,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.schedules.set(id, newSchedule);
    return newSchedule;
  }

  async updateSchedule(id: string, updates: Partial<Schedule>): Promise<Schedule | undefined> {
    const existing = this.schedules.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updated_at: new Date() };
    this.schedules.set(id, updated);
    return updated;
  }

  async deleteSchedule(id: string): Promise<boolean> {
    return this.schedules.delete(id);
  }

  // Schedule Form methods
  async getScheduleForms(scheduleId: string): Promise<any[]> {
    const items = Array.from(this.scheduleForms.values())
      .filter((sf) => sf.schedule_id === scheduleId)
      .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());

    return items.map((row) => {
      const form = this.forms.get(row.form_id);
      return {
        id: row.id,
        schedule_id: row.schedule_id,
        form_id: row.form_id,
        is_required: row.is_required,
        due_date: row.due_date,
        created_at: row.created_at,
        form: form
          ? {
              id: form.id,
              name: form.name,
              description: form.description,
              department_id: form.department_id,
            }
          : undefined,
      };
    });
  }

  async createScheduleForm(scheduleForm: InsertScheduleForm): Promise<ScheduleForm> {
    const id = crypto.randomUUID();
    const newSf: ScheduleForm = {
      id,
      schedule_id: scheduleForm.schedule_id,
      form_id: scheduleForm.form_id,
      is_required: scheduleForm.is_required ?? true,
      due_date: scheduleForm.due_date ?? null,
      created_at: new Date(),
    };
    this.scheduleForms.set(id, newSf);
    return newSf;
  }

  async updateScheduleForm(id: string, updates: Partial<ScheduleForm>): Promise<ScheduleForm | undefined> {
    const existing = this.scheduleForms.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.scheduleForms.set(id, updated);
    return updated;
  }

  async deleteScheduleForm(id: string): Promise<boolean> {
    return this.scheduleForms.delete(id);
  }

  // Form Submission methods
  async getFormSubmissions(formId?: string, scheduleId?: string): Promise<FormSubmission[]> {
    let items = Array.from(this.formSubmissions.values());
    if (formId && scheduleId) {
      items = items.filter((s) => s.form_id === formId && s.schedule_id === scheduleId);
    } else if (formId) {
      items = items.filter((s) => s.form_id === formId);
    } else if (scheduleId) {
      items = items.filter((s) => s.schedule_id === scheduleId);
    }
    return items.sort((a, b) => b.submitted_at.getTime() - a.submitted_at.getTime());
  }

  async createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission> {
    const id = crypto.randomUUID();
    const newSub: FormSubmission = {
      id,
      form_id: submission.form_id,
      schedule_id: submission.schedule_id ?? null,
      submitted_by: submission.submitted_by,
      data: submission.data ?? {},
      submitted_at: new Date(),
    };
    this.formSubmissions.set(id, newSub);
    return newSub;
  }

  async deleteFormSubmission(id: string): Promise<boolean> {
    return this.formSubmissions.delete(id);
  }

  // Schedule Form Completion methods
  async getScheduleFormCompletions(scheduleFormId: string): Promise<ScheduleFormCompletion[]> {
    return Array.from(this.scheduleFormCompletions.values())
      .filter((c) => c.schedule_form_id === scheduleFormId)
      .sort((a, b) => b.completed_at.getTime() - a.completed_at.getTime());
  }

  async createScheduleFormCompletion(completion: InsertScheduleFormCompletion): Promise<ScheduleFormCompletion> {
    const id = crypto.randomUUID();
    const newComp: ScheduleFormCompletion = {
      id,
      schedule_form_id: completion.schedule_form_id,
      user_id: completion.user_id,
      completed_at: new Date(),
      created_at: new Date(),
    };
    this.scheduleFormCompletions.set(id, newComp);
    return newComp;
  }

  async deleteScheduleFormCompletion(scheduleFormId: string, userId: string): Promise<boolean> {
    for (const [id, c] of this.scheduleFormCompletions.entries()) {
      if (c.schedule_form_id === scheduleFormId && c.user_id === userId) {
        this.scheduleFormCompletions.delete(id);
        return true;
      }
    }
    return false;
  }

  // SDG methods
  async getSdgGoals(): Promise<SdgGoal[]> {
    return Array.from(this.sdgGoals.values()).sort((a, b) => a.id - b.id);
  }

  async createSdgGoal(goal: InsertSdgGoal): Promise<SdgGoal> {
    const newGoal: SdgGoal = {
      id: goal.id,
      title: goal.title,
      description: goal.description ?? null,
      color: goal.color,
      icon_path: goal.icon_path ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.sdgGoals.set(newGoal.id, newGoal);
    return newGoal;
  }

  async updateSdgGoal(id: number, updates: Partial<SdgGoal>): Promise<SdgGoal | undefined> {
    const existing = this.sdgGoals.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updated_at: new Date() };
    this.sdgGoals.set(id, updated);
    return updated;
  }

  async getSdgTargets(goalId?: number): Promise<SdgTarget[]> {
    let items = Array.from(this.sdgTargets.values());
    if (goalId) {
      items = items.filter((t) => t.sdg_goal_id === goalId);
    }
    return items.sort((a, b) => a.target_number.localeCompare(b.target_number));
  }

  async getAllSdgTargets(): Promise<SdgTarget[]> {
    return this.getSdgTargets();
  }

  async createSdgTarget(target: InsertSdgTarget): Promise<SdgTarget> {
    const id = crypto.randomUUID();
    const newTarget: SdgTarget = {
      id,
      sdg_goal_id: target.sdg_goal_id,
      target_number: target.target_number,
      title: target.title,
      description: target.description ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.sdgTargets.set(id, newTarget);
    return newTarget;
  }

  async updateSdgTarget(id: string, updates: Partial<SdgTarget>): Promise<SdgTarget | undefined> {
    const existing = this.sdgTargets.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updated_at: new Date() };
    this.sdgTargets.set(id, updated);
    return updated;
  }

  async deleteSdgTarget(id: string): Promise<boolean> {
    return this.sdgTargets.delete(id);
  }

  async getSdgIndicators(targetId?: string): Promise<SdgIndicator[]> {
    let items = Array.from(this.sdgIndicators.values()).filter((i) => i.is_active);
    if (targetId) {
      items = items.filter((i) => i.sdg_target_id === targetId);
    }
    return items.sort((a, b) => a.indicator_code.localeCompare(b.indicator_code));
  }

  async getAllSdgIndicators(): Promise<SdgIndicator[]> {
    return this.getSdgIndicators();
  }

  async getSdgIndicator(id: string): Promise<SdgIndicator | undefined> {
    return this.sdgIndicators.get(id);
  }

  async createSdgIndicator(indicator: InsertSdgIndicator): Promise<SdgIndicator> {
    const id = crypto.randomUUID();
    const newInd: SdgIndicator = {
      id,
      sdg_target_id: indicator.sdg_target_id,
      indicator_code: indicator.indicator_code,
      title: indicator.title,
      description: indicator.description ?? null,
      indicator_type: indicator.indicator_type,
      unit: indicator.unit ?? null,
      methodology: indicator.methodology ?? null,
      data_collection_frequency: indicator.data_collection_frequency ?? null,
      improvement_direction: indicator.improvement_direction ?? "decrease",
      responsible_departments: indicator.responsible_departments ?? [],
      data_structure: indicator.data_structure ?? null,
      validation_rules: indicator.validation_rules ?? null,
      aggregation_methods: indicator.aggregation_methods ?? null,
      disaggregation_categories: indicator.disaggregation_categories ?? null,
      data_quality_requirements: indicator.data_quality_requirements ?? null,
      is_active: indicator.is_active ?? true,
      created_by: indicator.created_by,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.sdgIndicators.set(id, newInd);
    return newInd;
  }

  async updateSdgIndicator(id: string, updates: Partial<SdgIndicator>): Promise<SdgIndicator | undefined> {
    const existing = this.sdgIndicators.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updated_at: new Date() };
    this.sdgIndicators.set(id, updated);
    return updated;
  }

  async deleteSdgIndicator(id: string): Promise<boolean> {
    const existing = this.sdgIndicators.get(id);
    if (!existing) return false;
    existing.is_active = false;
    existing.updated_at = new Date();
    return true;
  }

  // SDG Data Sources
  async getSdgDataSources(): Promise<SdgDataSource[]> {
    return Array.from(this.sdgDataSources.values())
      .filter((s) => s.is_active)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async createSdgDataSource(source: InsertSdgDataSource): Promise<SdgDataSource> {
    const id = crypto.randomUUID();
    const newDs: SdgDataSource = {
      id,
      name: source.name,
      full_name: source.full_name ?? null,
      source_type: source.source_type,
      description: source.description ?? null,
      website_url: source.website_url ?? null,
      contact_info: source.contact_info ?? null,
      is_active: source.is_active ?? true,
      created_at: new Date(),
    };
    this.sdgDataSources.set(id, newDs);
    return newDs;
  }

  async updateSdgDataSource(id: string, updates: Partial<SdgDataSource>): Promise<SdgDataSource | undefined> {
    const existing = this.sdgDataSources.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.sdgDataSources.set(id, updated);
    return updated;
  }

  // SDG Indicator Values
  async getSdgIndicatorValues(indicatorId: string): Promise<SdgIndicatorValue[]> {
    return Array.from(this.sdgIndicatorValues.values())
      .filter((v) => v.indicator_id === indicatorId)
      .sort((a, b) => b.year - a.year);
  }

  async createSdgIndicatorValue(value: InsertSdgIndicatorValue): Promise<SdgIndicatorValue> {
    const id = crypto.randomUUID();
    const newVal: SdgIndicatorValue = {
      id,
      indicator_id: value.indicator_id,
      data_source_id: value.data_source_id ?? null,
      year: value.year,
      value: value.value,
      value_numeric: value.value_numeric ?? null,
      breakdown_data: value.breakdown_data ?? {},
      baseline_indicator: value.baseline_indicator ?? false,
      progress_indicator: value.progress_indicator ?? false,
      notes: value.notes ?? null,
      reference_document: value.reference_document ?? null,
      data_quality_score: value.data_quality_score ?? 3,
      department_id: value.department_id ?? null,
      submitted_by: value.submitted_by,
      verified_by: value.verified_by ?? null,
      verified_at: value.verified_at ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.sdgIndicatorValues.set(id, newVal);
    return newVal;
  }

  async updateSdgIndicatorValue(id: string, updates: Partial<SdgIndicatorValue>): Promise<SdgIndicatorValue | undefined> {
    const existing = this.sdgIndicatorValues.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updated_at: new Date() };
    this.sdgIndicatorValues.set(id, updated);
    return updated;
  }

  // SDG Progress Calculations
  async getSdgProgressCalculations(goalId?: number): Promise<SdgProgressCalculation[]> {
    let items = Array.from(this.sdgProgressCalculations.values());
    if (goalId) {
      items = items.filter((c) => c.sdg_goal_id === goalId);
    }
    return items.sort((a, b) => {
      const bTime = b.last_calculation_date ? b.last_calculation_date.getTime() : 0;
      const aTime = a.last_calculation_date ? a.last_calculation_date.getTime() : 0;
      return bTime - aTime;
    });
  }

  async createSdgProgressCalculation(calculation: InsertSdgProgressCalculation): Promise<SdgProgressCalculation> {
    const id = crypto.randomUUID();
    const newCalc: SdgProgressCalculation = {
      id,
      sdg_goal_id: calculation.sdg_goal_id,
      indicator_id: calculation.indicator_id ?? null,
      progress_percentage: calculation.progress_percentage ?? null,
      trend_direction: calculation.trend_direction ?? null,
      last_calculation_date: calculation.last_calculation_date ?? new Date(),
      calculation_method: calculation.calculation_method ?? null,
      notes: calculation.notes ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.sdgProgressCalculations.set(id, newCalc);
    return newCalc;
  }

  async updateSdgProgressCalculation(id: string, updates: Partial<SdgProgressCalculation>): Promise<SdgProgressCalculation | undefined> {
    const existing = this.sdgProgressCalculations.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updated_at: new Date() };
    this.sdgProgressCalculations.set(id, updated);
    return updated;
  }
}
