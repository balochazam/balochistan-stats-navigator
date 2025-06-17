# Hierarchical Form Builder User Guide

## Overview
The hierarchical form builder allows you to create complex data collection forms with nested structures, perfect for organizing data like your Health Department requirements (Province → Doctors/Specialists → Medical/Dental → Total/Male/Female).

## Key Features
- **Multi-level organization**: Create sections, categories, and sub-categories
- **Field templates**: Pre-built field groups (Gender Breakdown, Basic Count)
- **Drag & drop interface**: Easy organization of form structure
- **Aggregate calculations**: Automatic summation of selected fields
- **Visual hierarchy**: Clear tree structure with expand/collapse

## Getting Started

### 1. Accessing the Form Builder
- Navigate to the Forms page in your dashboard
- Click "Create New Form" button
- The new hierarchical form builder will open with three tabs

### 2. Understanding the Three Tabs

#### Tab 1: Basic Info
- **Form Name**: Enter a descriptive name (e.g., "Health Institutions Survey")
- **Description**: Add context about the form's purpose
- **Department**: Select the owning department

#### Tab 2: Hierarchical Structure
This is where you build your nested data organization:

**Group Types:**
- **Section**: Main categories (e.g., "Doctors", "Specialists", "Dentists")
- **Category**: Sub-categories (e.g., "Medical", "Dental", "Emergency")
- **Sub-Category**: Detailed groupings (e.g., "Male", "Female", "Pediatric")

#### Tab 3: Simple Fields
For basic forms without hierarchy - use the traditional field builder

## Building Your Hierarchical Structure

### Step 1: Create Your Main Sections
1. Click "Add Section" in the Hierarchical Structure tab
2. Enter section details:
   - **Group Name**: Technical identifier (e.g., "doctors")
   - **Group Label**: Display name (e.g., "Medical Doctors")
   - **Group Type**: Select "Section"

### Step 2: Add Sub-Categories
1. Find your section in the tree
2. Click "Sub-Group" next to the section
3. Configure the sub-category:
   - **Group Name**: "medical_specialists"
   - **Group Label**: "Medical Specialists"
   - **Group Type**: "Category"

### Step 3: Add Fields to Groups
Use the dropdown next to any group to add fields:

**Field Templates:**
- **Gender Breakdown**: Adds Total, Male, Female fields automatically
- **Basic Count**: Adds a single count field
- **Single Field**: Add individual custom fields

**Example Structure:**
```
Province (Primary Column)
├── Doctors (Section)
│   ├── Medical (Category)
│   │   ├── Total (Number field)
│   │   ├── Male (Number field)
│   │   └── Female (Number field)
│   └── Dental (Category)
│       ├── Total (Number field)
│       ├── Male (Number field)
│       └── Female (Number field)
└── Specialists (Section)
    ├── Emergency Medicine (Category)
    └── Pediatrics (Category)
```

## Field Types Available

### Basic Field Types
- **Text Input**: Single-line text
- **Text Area**: Multi-line text
- **Number**: Numeric values
- **Email**: Email addresses
- **Date**: Date picker
- **Select**: Dropdown with options
- **Radio**: Single choice options

### Advanced Field Type
- **Aggregate**: Automatically sums selected number fields

## Using Aggregate Fields

### What are Aggregate Fields?
Aggregate fields automatically calculate the sum of other number fields during data entry.

### Setting Up Aggregates
1. Add a number field to your form
2. Set the field type to "Aggregate"
3. Select which number fields to include in the calculation
4. During data entry, this field will auto-update as users enter values

### Example Use Case
Create a "Total Doctors" aggregate field that sums:
- Medical Male
- Medical Female  
- Dental Male
- Dental Female

## Best Practices

### 1. Plan Your Structure First
Before building, sketch out your data hierarchy:
- What are your main categories?
- What sub-categories exist?
- What specific data points do you need?

### 2. Use Consistent Naming
- **Group Names**: Use lowercase with underscores (doctors_medical)
- **Group Labels**: Use proper case (Medical Doctors)
- **Field Names**: Be descriptive (total_male_doctors)

### 3. Logical Field Grouping
Group related fields together:
- Demographics: Age, Gender, Location
- Counts: Total, Male, Female
- Qualifications: Degree, Specialization, Years

### 4. Primary Column Setup
Always designate one field as the primary column for data display:
- Usually a location or identifier field
- Helps organize data in reports
- Makes data navigation easier

## Real-World Examples

### Example 1: Health Institutions Survey
```
Province (Primary)
├── Government Hospitals (Section)
│   ├── Teaching Hospitals (Category)
│   │   ├── Total Beds (Number)
│   │   ├── ICU Beds (Number)
│   │   └── Emergency Beds (Number)
│   └── District Hospitals (Category)
│       ├── Total Beds (Number)
│       └── Emergency Beds (Number)
└── Private Hospitals (Section)
    ├── General Hospitals (Category)
    └── Specialty Clinics (Category)
```

### Example 2: Staff Survey
```
Institution Name (Primary)
├── Medical Staff (Section)
│   ├── Doctors (Category)
│   │   ├── Total (Aggregate of Male + Female)
│   │   ├── Male (Number)
│   │   └── Female (Number)
│   └── Nurses (Category)
│       ├── Total (Aggregate)
│       ├── Male (Number)
│       └── Female (Number)
└── Administrative Staff (Section)
    ├── Management (Category)
    └── Support Staff (Category)
```

## Troubleshooting Common Issues

### Issue: Fields Not Saving
- Ensure all required fields have values
- Check that group names are unique
- Verify field types are correctly selected

### Issue: Aggregate Not Calculating
- Confirm target fields are number type
- Check that aggregate field list includes correct fields
- Ensure fields are in the same form

### Issue: Structure Too Complex
- Break down into smaller, logical groups
- Use fewer nesting levels (max 3-4 recommended)
- Consider splitting into multiple forms

## Data Collection Benefits

### For Data Entry Users
- **Logical Flow**: Fields are organized intuitively
- **Reduced Errors**: Related fields are grouped together
- **Auto-calculations**: Aggregates reduce manual math
- **Clear Labels**: Hierarchical context makes fields clear

### For Administrators
- **Structured Data**: Clean, organized data collection
- **Easy Analysis**: Hierarchical data enables better reporting
- **Scalable Design**: Easy to add new categories/fields
- **Quality Control**: Built-in validation and calculations

## Advanced Tips

### 1. Using Reference Data
Link dropdown fields to your reference data sets:
- Districts → Use "Districts" reference data
- Institutions → Use "Institution" reference data
- Controls → Use "Under Controls" reference data

### 2. Field Ordering
Fields within groups are automatically ordered by creation time. Plan your field creation sequence for logical flow.

### 3. Form Cloning
Create template forms with your standard structure, then clone and modify for specific surveys.

### 4. Testing Your Structure
Before deploying:
1. Create a test form with your structure
2. Enter sample data to verify flow
3. Check aggregate calculations work correctly
4. Review the data display in reports

## Getting Help

If you encounter issues:
1. Review this guide for common solutions
2. Check that your browser supports modern JavaScript
3. Ensure you have appropriate permissions for form creation
4. Contact your system administrator for technical support

## Next Steps

Now that you understand the hierarchical form builder:
1. Create your first structured form
2. Test with sample data
3. Deploy to your data collection team
4. Monitor and refine based on user feedback

The hierarchical system provides powerful organization capabilities while maintaining the simplicity needed for effective data collection.