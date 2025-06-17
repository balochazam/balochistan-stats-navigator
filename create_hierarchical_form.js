// Script to create the hierarchical medical personnel form
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Form data
const formData = {
  name: "NUMBER OF REGISTERED MEDICAL PERSONAL BY GENDER 2022",
  description: "Comprehensive data collection for medical personnel registration by gender across provinces",
  department_id: "18a6821b-32ef-4966-9e15-133695d56cd4", // Health Department
  created_by: "bbb55fbb-dc8d-44a4-9389-5842618fb3a4"
};

// Form fields with hierarchical structure
const formFields = [
  {
    field_name: "province",
    field_label: "Province",
    field_type: "select",
    is_required: true,
    is_primary_column: true,
    is_secondary_column: false,
    reference_data_name: "Provinces",
    placeholder_text: "Select Province",
    aggregate_fields: [],
    has_sub_headers: false,
    sub_headers: [],
    field_order: 0
  },
  {
    field_name: "medical_personnel",
    field_label: "Medical Personnel",
    field_type: "text",
    is_required: true,
    is_primary_column: false,
    is_secondary_column: true,
    reference_data_name: null,
    placeholder_text: "",
    aggregate_fields: [],
    has_sub_headers: true,
    sub_headers: [
      {
        name: "Doctors",
        label: "Doctors",
        fields: [
          {
            field_name: "doctors_total",
            field_label: "Total",
            field_type: "aggregate",
            is_required: true,
            field_order: 0,
            placeholder_text: "",
            aggregate_fields: ["doctors_male", "doctors_female"],
            is_secondary_column: false,
            has_sub_headers: false,
            sub_headers: []
          },
          {
            field_name: "doctors_male",
            field_label: "Male",
            field_type: "number",
            is_required: true,
            field_order: 1,
            placeholder_text: "Enter number of male doctors",
            aggregate_fields: [],
            is_secondary_column: false,
            has_sub_headers: false,
            sub_headers: []
          },
          {
            field_name: "doctors_female",
            field_label: "Female",
            field_type: "number",
            is_required: true,
            field_order: 2,
            placeholder_text: "Enter number of female doctors",
            aggregate_fields: [],
            is_secondary_column: false,
            has_sub_headers: false,
            sub_headers: []
          }
        ]
      },
      {
        name: "Dentists",
        label: "Dentists",
        fields: [
          {
            field_name: "dentists_total",
            field_label: "Total",
            field_type: "aggregate",
            is_required: true,
            field_order: 0,
            placeholder_text: "",
            aggregate_fields: ["dentists_male", "dentists_female"],
            is_secondary_column: false,
            has_sub_headers: false,
            sub_headers: []
          },
          {
            field_name: "dentists_male",
            field_label: "Male",
            field_type: "number",
            is_required: true,
            field_order: 1,
            placeholder_text: "Enter number of male dentists",
            aggregate_fields: [],
            is_secondary_column: false,
            has_sub_headers: false,
            sub_headers: []
          },
          {
            field_name: "dentists_female",
            field_label: "Female",
            field_type: "number",
            is_required: true,
            field_order: 2,
            placeholder_text: "Enter number of female dentists",
            aggregate_fields: [],
            is_secondary_column: false,
            has_sub_headers: false,
            sub_headers: []
          }
        ]
      },
      {
        name: "Specialists",
        label: "Specialists",
        fields: [
          {
            field_name: "specialist_type",
            field_label: "Specialist Type",
            field_type: "select",
            is_required: true,
            field_order: 0,
            placeholder_text: "Select specialist type",
            reference_data_name: "Specialists",
            aggregate_fields: [],
            is_secondary_column: false,
            has_sub_headers: true,
            sub_headers: [
              {
                name: "Medical",
                label: "Medical",
                fields: [
                  {
                    field_name: "medical_total",
                    field_label: "Total",
                    field_type: "aggregate",
                    is_required: true,
                    field_order: 0,
                    placeholder_text: "",
                    aggregate_fields: ["medical_male", "medical_female"],
                    is_secondary_column: false,
                    has_sub_headers: false,
                    sub_headers: []
                  },
                  {
                    field_name: "medical_male",
                    field_label: "Male",
                    field_type: "number",
                    is_required: true,
                    field_order: 1,
                    placeholder_text: "Enter number of male medical specialists",
                    aggregate_fields: [],
                    is_secondary_column: false,
                    has_sub_headers: false,
                    sub_headers: []
                  },
                  {
                    field_name: "medical_female",
                    field_label: "Female",
                    field_type: "number",
                    is_required: true,
                    field_order: 2,
                    placeholder_text: "Enter number of female medical specialists",
                    aggregate_fields: [],
                    is_secondary_column: false,
                    has_sub_headers: false,
                    sub_headers: []
                  }
                ]
              },
              {
                name: "Dental",
                label: "Dental",
                fields: [
                  {
                    field_name: "dental_total",
                    field_label: "Total",
                    field_type: "aggregate",
                    is_required: true,
                    field_order: 0,
                    placeholder_text: "",
                    aggregate_fields: ["dental_male", "dental_female"],
                    is_secondary_column: false,
                    has_sub_headers: false,
                    sub_headers: []
                  },
                  {
                    field_name: "dental_male",
                    field_label: "Male",
                    field_type: "number",
                    is_required: true,
                    field_order: 1,
                    placeholder_text: "Enter number of male dental specialists",
                    aggregate_fields: [],
                    is_secondary_column: false,
                    has_sub_headers: false,
                    sub_headers: []
                  },
                  {
                    field_name: "dental_female",
                    field_label: "Female",
                    field_type: "number",
                    is_required: true,
                    field_order: 2,
                    placeholder_text: "Enter number of female dental specialists",
                    aggregate_fields: [],
                    is_secondary_column: false,
                    has_sub_headers: false,
                    sub_headers: []
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    field_order: 1
  }
];

async function createForm() {
  try {
    console.log('Creating form...');
    // Create the form
    const formResponse = await axios.post(`${API_BASE}/forms`, formData);
    const formId = formResponse.data.id;
    console.log('Form created with ID:', formId);

    // Add form_id to each field
    const fieldsWithFormId = formFields.map(field => ({
      ...field,
      form_id: formId
    }));

    console.log('Creating form fields...');
    // Create the form fields
    const fieldsResponse = await axios.post(`${API_BASE}/form-fields`, fieldsWithFormId);
    console.log('Form fields created:', fieldsResponse.data.length);

    console.log('Hierarchical form created successfully!');
    console.log('Form ID:', formId);
    
  } catch (error) {
    console.error('Error creating form:', error.response?.data || error.message);
  }
}

createForm();