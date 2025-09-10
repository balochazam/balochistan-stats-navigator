import { db } from "./db.js";
import { forms, form_fields, field_groups } from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';

interface FormField {
  field_name: string;
  field_label: string;
  field_type: string;
  is_required: boolean;
  is_primary_column?: boolean;
  is_secondary_column?: boolean;
  placeholder_text?: string;
  field_order: number;
}

interface FormGroup {
  group_name: string;
  group_label: string;
  group_type: string;
  display_order: number;
  fields: FormField[];
}

export async function createSDGForm(
  indicatorCode: string,
  title: string,
  description: string,
  groups: FormGroup[],
  createdBy: string
) {
  console.log(`Creating form for indicator ${indicatorCode}: ${title}`);
  
  try {
    // Create the form
    const [form] = await db.insert(forms).values({
      name: `${indicatorCode} Data Collection Form`,
      description: `Data collection form for ${title}`,
      category: 'sdg',
      created_by: createdBy,
    }).returning();

    console.log(`Created form: ${form.id}`);

    // Create field groups and fields
    for (const group of groups) {
      const [fieldGroup] = await db.insert(field_groups).values({
        form_id: form.id,
        group_name: group.group_name,
        group_label: group.group_label,
        group_type: group.group_type,
        display_order: group.display_order,
      }).returning();

      console.log(`Created field group: ${fieldGroup.id}`);

      // Create fields for this group
      for (const field of group.fields) {
        await db.insert(form_fields).values({
          form_id: form.id,
          field_group_id: fieldGroup.id,
          field_name: field.field_name,
          field_label: field.field_label,
          field_type: field.field_type,
          is_required: field.is_required,
          is_primary_column: field.is_primary_column || false,
          is_secondary_column: field.is_secondary_column || false,
          placeholder_text: field.placeholder_text,
          field_order: field.field_order,
        });
      }
    }

    console.log(`Successfully created form for ${indicatorCode}`);
    return form;
  } catch (error) {
    console.error(`Error creating form for ${indicatorCode}:`, error);
    throw error;
  }
}

// Standard demographic breakdown fields that many indicators use
export const standardDemographicFields: FormField[] = [
  {
    field_name: "year",
    field_label: "Data Year",
    field_type: "number",
    is_required: true,
    is_primary_column: true,
    placeholder_text: "e.g., 2024",
    field_order: 1
  },
  {
    field_name: "data_source",
    field_label: "Data Source",
    field_type: "select",
    is_required: true,
    is_secondary_column: true,
    placeholder_text: "Select data source",
    field_order: 2
  },
  {
    field_name: "geographic_area", 
    field_label: "Geographic Area",
    field_type: "select",
    is_required: true,
    placeholder_text: "Province/District",
    field_order: 3
  },
  {
    field_name: "urban_rural",
    field_label: "Urban/Rural",
    field_type: "select", 
    is_required: false,
    placeholder_text: "Urban, Rural, or Total",
    field_order: 4
  },
  {
    field_name: "sex",
    field_label: "Sex",
    field_type: "select",
    is_required: false, 
    placeholder_text: "Male, Female, or Total",
    field_order: 5
  }
];

// Standard value fields for percentage indicators
export const standardPercentageFields: FormField[] = [
  {
    field_name: "baseline_value",
    field_label: "Baseline Value (%)",
    field_type: "number",
    is_required: false,
    placeholder_text: "e.g., 25.5",
    field_order: 10
  },
  {
    field_name: "current_value", 
    field_label: "Current Value (%)",
    field_type: "number",
    is_required: true,
    placeholder_text: "e.g., 22.3",
    field_order: 11
  },
  {
    field_name: "target_value",
    field_label: "Target Value (%)",
    field_type: "number", 
    is_required: false,
    placeholder_text: "e.g., 15.0",
    field_order: 12
  }
];