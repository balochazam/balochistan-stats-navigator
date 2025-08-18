import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, insertDepartmentSchema, insertDataBankSchema, insertDataBankEntrySchema, insertFormSchema, insertFormFieldSchema, insertFieldGroupSchema, insertScheduleSchema, insertScheduleFormSchema, insertFormSubmissionSchema, insertScheduleFormCompletionSchema, insertSdgGoalSchema, insertSdgTargetSchema, insertSdgIndicatorSchema, insertSdgDataSourceSchema, insertSdgIndicatorValueSchema, insertSdgProgressCalculationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple authentication routes for demo purposes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, full_name } = req.body;
      
      // Check if user already exists
      const existingProfile = await storage.getProfileByEmail(email);
      if (existingProfile) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Create a simple user ID (in production, use proper auth service)
      const userId = crypto.randomUUID();
      
      const profile = await storage.createProfile({
        id: userId,
        email,
        full_name: full_name || '',
        role: 'data_entry_user'
      });

      // Store user ID in session
      (req as any).session.userId = profile.id;

      res.status(201).json({ 
        user: { id: profile.id, email: profile.email },
        profile,
        session: { access_token: userId, user: { id: profile.id, email: profile.email } }
      });
    } catch (error) {
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/create-user', async (req, res) => {
    try {
      const { email, password, full_name, role, department_id } = req.body;
      
      // Check if user already exists
      const existingProfile = await storage.getProfileByEmail(email);
      if (existingProfile) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Create user ID
      const userId = crypto.randomUUID();
      
      const profile = await storage.createProfile({
        id: userId,
        email,
        full_name: full_name || '',
        role: role || 'data_entry_user',
        department_id: department_id || null
      });

      res.status(201).json({ 
        user: { id: profile.id, email: profile.email },
        profile
      });
    } catch (error) {
      console.error('User creation failed:', error);
      res.status(500).json({ error: 'User creation failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const profile = await storage.getProfileByEmail(email);
      if (!profile) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Store user ID in session
      (req as any).session.userId = profile.id;

      res.json({
        user: { id: profile.id, email: profile.email },
        profile,
        session: { access_token: profile.id, user: { id: profile.id, email: profile.email } }
      });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    (req as any).session.destroy(() => {
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/user', async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(401).json({ error: 'User not found' });
      }

      res.json({
        user: { id: profile.id, email: profile.email },
        profile,
        session: { access_token: userId, user: { id: profile.id, email: profile.email } }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  // Authentication middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    const userId = (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    try {
      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(401).json({ error: 'User not found' });
      }
      req.userId = userId;
      req.userProfile = profile; // Attach user profile for department filtering
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };

  // Profile routes
  app.get('/api/profiles', requireAuth, async (req, res) => {
    try {
      const { department_id } = req.query;
      
      if (department_id) {
        // Filter profiles by department
        const allProfiles = await storage.getAllProfiles();
        const filteredProfiles = allProfiles.filter(profile => profile.department_id === department_id);
        res.json(filteredProfiles);
      } else {
        const profiles = await storage.getAllProfiles();
        res.json(profiles);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch profiles' });
    }
  });

  app.get('/api/profiles/:id', requireAuth, async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  app.patch('/api/profiles/:id', requireAuth, async (req, res) => {
    try {
      const profile = await storage.updateProfile(req.params.id, req.body);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  app.post('/api/profiles', requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      res.status(400).json({ error: 'Invalid profile data' });
    }
  });

  app.patch('/api/profiles/:id', requireAuth, async (req, res) => {
    try {
      const profile = await storage.updateProfile(req.params.id, req.body);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Department routes
  app.get('/api/departments', requireAuth, async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch departments' });
    }
  });

  app.post('/api/departments', requireAuth, async (req, res) => {
    try {
      const validatedData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(validatedData);
      res.status(201).json(department);
    } catch (error) {
      res.status(400).json({ error: 'Invalid department data' });
    }
  });

  app.patch('/api/departments/:id', requireAuth, async (req, res) => {
    try {
      const department = await storage.updateDepartment(req.params.id, req.body);
      if (!department) {
        return res.status(404).json({ error: 'Department not found' });
      }
      res.json(department);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update department' });
    }
  });

  app.delete('/api/departments/:id', requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteDepartment(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Department not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete department' });
    }
  });

  // Data Bank routes
  app.get('/api/data-banks', requireAuth, async (req, res) => {
    try {
      const dataBanks = await storage.getDataBanks();
      res.json(dataBanks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch data banks' });
    }
  });

  app.get('/api/data-banks/:id', requireAuth, async (req, res) => {
    try {
      const dataBank = await storage.getDataBank(req.params.id);
      if (!dataBank) {
        return res.status(404).json({ error: 'Data bank not found' });
      }
      res.json(dataBank);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch data bank' });
    }
  });

  app.post('/api/data-banks', requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertDataBankSchema.parse({
        ...req.body,
        created_by: req.userId
      });
      const dataBank = await storage.createDataBank(validatedData);
      res.status(201).json(dataBank);
    } catch (error) {
      res.status(400).json({ error: 'Invalid data bank data' });
    }
  });

  app.patch('/api/data-banks/:id', requireAuth, async (req, res) => {
    try {
      const dataBank = await storage.updateDataBank(req.params.id, req.body);
      if (!dataBank) {
        return res.status(404).json({ error: 'Data bank not found' });
      }
      res.json(dataBank);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update data bank' });
    }
  });

  app.delete('/api/data-banks/:id', requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteDataBank(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Data bank not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete data bank' });
    }
  });

  // Data Bank Entry routes
  app.get('/api/data-banks/:dataBankId/entries', requireAuth, async (req, res) => {
    try {
      const { dataBankId } = req.params;
      
      // Check if dataBankId is actually a name (for reference data lookups)
      let actualDataBankId = dataBankId;
      
      // If it doesn't look like a UUID, treat it as a name and resolve to ID
      if (!dataBankId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        const dataBanks = await storage.getDataBanks();
        const dataBank = dataBanks.find(db => db.name === dataBankId);
        if (!dataBank) {
          return res.status(404).json({ error: `Data bank '${dataBankId}' not found` });
        }
        actualDataBankId = dataBank.id;
      }
      
      const entries = await storage.getDataBankEntries(actualDataBankId);
      res.json(entries);
    } catch (error) {
      console.error('Error fetching data bank entries:', error);
      res.status(500).json({ error: 'Failed to fetch data bank entries' });
    }
  });

  app.post('/api/data-banks/:dataBankId/entries', requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertDataBankEntrySchema.parse({
        ...req.body,
        data_bank_id: req.params.dataBankId,
        created_by: req.userId
      });
      const entry = await storage.createDataBankEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      res.status(400).json({ error: 'Invalid data bank entry data' });
    }
  });

  app.put('/api/data-banks/:dataBankId/entries/:entryId', requireAuth, async (req, res) => {
    try {
      console.log('Updating entry:', req.params.entryId, 'with data:', req.body);
      const entry = await storage.updateDataBankEntry(req.params.entryId, req.body);
      if (!entry) {
        return res.status(404).json({ error: 'Data bank entry not found' });
      }
      res.json(entry);
    } catch (error) {
      console.error('Error updating data bank entry:', error);
      res.status(400).json({ error: 'Failed to update data bank entry' });
    }
  });

  app.delete('/api/data-banks/:dataBankId/entries/:entryId', requireAuth, async (req, res) => {
    try {
      console.log('Deleting entry:', req.params.entryId);
      const success = await storage.deleteDataBankEntry(req.params.entryId);
      console.log('Delete success:', success);
      if (!success) {
        return res.status(404).json({ error: 'Data bank entry not found' });
      }
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting data bank entry:', error);
      return res.status(500).json({ error: 'Failed to delete data bank entry' });
    }
  });

  app.patch('/api/data-bank-entries/:id', requireAuth, async (req, res) => {
    try {
      const entry = await storage.updateDataBankEntry(req.params.id, req.body);
      if (!entry) {
        return res.status(404).json({ error: 'Data bank entry not found' });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update data bank entry' });
    }
  });

  app.delete('/api/data-bank-entries/:id', requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteDataBankEntry(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Data bank entry not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete data bank entry' });
    }
  });

  // Form routes
  app.get('/api/forms', requireAuth, async (req: any, res) => {
    try {
      const forms = await storage.getForms();
      
      // Filter forms based on user department (non-admin users only see their department's forms)
      if (req.userProfile.role !== 'admin') {
        const filteredForms = forms.filter(form => 
          form.department_id === req.userProfile.department_id
        );
        res.json(filteredForms);
      } else {
        res.json(forms);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch forms' });
    }
  });

  app.get('/api/forms/:id', requireAuth, async (req, res) => {
    try {
      const form = await storage.getForm(req.params.id);
      if (!form) {
        return res.status(404).json({ error: 'Form not found' });
      }
      res.json(form);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch form' });
    }
  });

  app.post('/api/forms', requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertFormSchema.parse({
        ...req.body,
        created_by: req.userId
      });
      const form = await storage.createForm(validatedData);
      res.status(201).json(form);
    } catch (error) {
      res.status(400).json({ error: 'Invalid form data' });
    }
  });

  app.patch('/api/forms/:id', requireAuth, async (req, res) => {
    try {
      const form = await storage.updateForm(req.params.id, req.body);
      if (!form) {
        return res.status(404).json({ error: 'Form not found' });
      }
      res.json(form);
    } catch (error) {
      console.error('Error updating form via PATCH:', error);
      res.status(500).json({ error: 'Failed to update form', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.put('/api/forms/:id', requireAuth, async (req, res) => {
    try {
      const form = await storage.updateForm(req.params.id, req.body);
      if (!form) {
        return res.status(404).json({ error: 'Form not found' });
      }
      res.json(form);
    } catch (error) {
      console.error('Error updating form via PUT:', error);
      res.status(500).json({ error: 'Failed to update form', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.delete('/api/forms/:id', requireAuth, async (req, res) => {
    try {
      console.log('Attempting to delete form:', req.params.id);
      const success = await storage.deleteForm(req.params.id);
      console.log('Delete form result:', success);
      if (!success) {
        return res.status(404).json({ error: 'Form not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting form:', error);
      res.status(500).json({ error: 'Failed to delete form', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Field Group routes
  app.get('/api/forms/:formId/groups', requireAuth, async (req, res) => {
    try {
      const groups = await storage.getFieldGroups(req.params.formId);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch field groups' });
    }
  });

  app.post('/api/field-groups', requireAuth, async (req, res) => {
    try {
      if (Array.isArray(req.body)) {
        const createdGroups = [];
        for (const groupData of req.body) {
          const validatedData = insertFieldGroupSchema.parse(groupData);
          const group = await storage.createFieldGroup(validatedData);
          createdGroups.push(group);
        }
        res.status(201).json(createdGroups);
      } else {
        const validatedData = insertFieldGroupSchema.parse(req.body);
        const group = await storage.createFieldGroup(validatedData);
        res.status(201).json(group);
      }
    } catch (error) {
      console.error('Error creating field groups:', error);
      res.status(400).json({ error: 'Invalid field group data' });
    }
  });

  app.patch('/api/field-groups/:id', requireAuth, async (req, res) => {
    try {
      const group = await storage.updateFieldGroup(req.params.id, req.body);
      if (!group) {
        return res.status(404).json({ error: 'Field group not found' });
      }
      res.json(group);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update field group' });
    }
  });

  app.delete('/api/field-groups/:id', requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteFieldGroup(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Field group not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete field group' });
    }
  });

  // Form Field routes
  app.get('/api/forms/:formId/fields', requireAuth, async (req, res) => {
    try {
      const fields = await storage.getFormFields(req.params.formId);
      res.json(fields);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch form fields' });
    }
  });

  // Alternative route for form fields (used by client)
  app.get('/api/form-fields/:formId', requireAuth, async (req, res) => {
    try {
      const fields = await storage.getFormFields(req.params.formId);
      res.json(fields);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch form fields' });
    }
  });

  app.post('/api/forms/:formId/fields', requireAuth, async (req, res) => {
    try {
      const validatedData = insertFormFieldSchema.parse({
        ...req.body,
        form_id: req.params.formId
      });
      const field = await storage.createFormField(validatedData);
      res.status(201).json(field);
    } catch (error) {
      res.status(400).json({ error: 'Invalid form field data' });
    }
  });

  // Bulk form fields creation
  app.post('/api/form-fields', requireAuth, async (req, res) => {
    try {
      if (!Array.isArray(req.body)) {
        return res.status(400).json({ error: 'Request body must be an array of form fields' });
      }

      console.log('Creating form fields, received data:', JSON.stringify(req.body, null, 2));

      const createdFields = [];
      for (const fieldData of req.body) {
        // Handle null aggregate_fields by converting to empty array
        if (fieldData.aggregate_fields === null) {
          fieldData.aggregate_fields = [];
        }
        
        // Handle null sub_headers by converting to empty array
        if (fieldData.sub_headers === null) {
          fieldData.sub_headers = [];
        }
        
        console.log('Processing field:', fieldData.field_label);
        try {
          const validatedData = insertFormFieldSchema.parse(fieldData);
          const field = await storage.createFormField(validatedData);
          createdFields.push(field);
          console.log('Successfully created field:', field.field_label);
        } catch (fieldError) {
          console.error(`Error creating field ${fieldData.field_label}:`, fieldError);
          throw fieldError;
        }
      }
      
      res.status(201).json(createdFields);
    } catch (error) {
      console.error('Error creating form fields:', error);
      res.status(400).json({ 
        error: 'Invalid form field data', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  });

  app.patch('/api/form-fields/:id', requireAuth, async (req, res) => {
    try {
      const field = await storage.updateFormField(req.params.id, req.body);
      if (!field) {
        return res.status(404).json({ error: 'Form field not found' });
      }
      res.json(field);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update form field' });
    }
  });

  // Bulk delete all fields for a form
  app.delete('/api/forms/:formId/fields', requireAuth, async (req, res) => {
    try {
      const formId = req.params.formId;
      const existingFields = await storage.getFormFields(formId);
      
      // Delete all existing fields for this form
      for (const field of existingFields) {
        await storage.deleteFormField(field.id);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error bulk deleting form fields:', error);
      res.status(500).json({ error: 'Failed to delete form fields' });
    }
  });

  app.delete('/api/form-fields/:id', requireAuth, async (req, res) => {
    try {
      // Check if this is a bulk delete by form ID or individual field delete
      const id = req.params.id;
      
      // If this looks like a form deletion (bulk delete all fields for a form)
      const existingFields = await storage.getFormFields(id);
      if (existingFields && existingFields.length > 0) {
        // Bulk delete all fields for this form
        for (const field of existingFields) {
          await storage.deleteFormField(field.id);
        }
        res.status(204).send();
        return;
      }
      
      // Individual field delete
      const success = await storage.deleteFormField(id);
      if (!success) {
        return res.status(404).json({ error: 'Form field not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting form field(s):', error);
      res.status(500).json({ error: 'Failed to delete form field' });
    }
  });

  // Schedule routes
  app.get('/api/schedules', requireAuth, async (req: any, res) => {
    try {
      const schedules = await storage.getSchedules();
      
      // Filter schedules based on user department (non-admin users only see schedules with their department's forms)
      if (req.userProfile.role !== 'admin') {
        const userDepartmentId = req.userProfile.department_id;
        
        if (!userDepartmentId) {
          return res.json([]); // Users without departments see no schedules
        }
        
        // Get all forms for user's department
        const allForms = await storage.getForms();
        const departmentForms = allForms.filter(form => form.department_id === userDepartmentId);
        const departmentFormIds = departmentForms.map(form => form.id);
        
        // Filter schedules that have forms assigned to user's department
        const filteredSchedules = [];
        for (const schedule of schedules) {
          const scheduleForms = await storage.getScheduleForms(schedule.id);
          const hasUserDepartmentForms = scheduleForms.some(sf => 
            departmentFormIds.includes(sf.form_id)
          );
          
          if (hasUserDepartmentForms) {
            filteredSchedules.push(schedule);
          }
        }
        res.json(filteredSchedules);
      } else {
        res.json(schedules);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schedules' });
    }
  });

  app.get('/api/schedules/:id', requireAuth, async (req, res) => {
    try {
      const schedule = await storage.getSchedule(req.params.id);
      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schedule' });
    }
  });

  app.post('/api/schedules', requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertScheduleSchema.parse({
        ...req.body,
        created_by: req.userId
      });
      const schedule = await storage.createSchedule(validatedData);
      res.status(201).json(schedule);
    } catch (error) {
      res.status(400).json({ error: 'Invalid schedule data' });
    }
  });

  app.patch('/api/schedules/:id', requireAuth, async (req, res) => {
    try {
      const schedule = await storage.updateSchedule(req.params.id, req.body);
      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update schedule' });
    }
  });

  app.put('/api/schedules/:id', requireAuth, async (req, res) => {
    try {
      // Remove updated_at from request body as it should be handled by the database
      const { updated_at, ...updateData } = req.body;
      const schedule = await storage.updateSchedule(req.params.id, {
        ...updateData,
        updated_at: new Date()
      });
      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      res.json(schedule);
    } catch (error) {
      console.error('Schedule update error:', error);
      res.status(500).json({ error: 'Failed to update schedule' });
    }
  });

  app.delete('/api/schedules/:id', requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteSchedule(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete schedule' });
    }
  });

  // Check if schedule can be published (all forms completed)
  app.get('/api/schedules/:id/completion-status', requireAuth, async (req, res) => {
    try {
      const scheduleId = req.params.id;
      const scheduleForms = await storage.getScheduleForms(scheduleId);
      
      if (scheduleForms.length === 0) {
        return res.json({ canPublish: false, reason: 'No forms in schedule' });
      }

      let allFormsCompleted = true;
      const formStatuses = [];

      for (const scheduleForm of scheduleForms) {
        // Get all users who submitted data for this form
        const submissions = await storage.getFormSubmissions(scheduleForm.form_id, scheduleId);
        const uniqueSubmitters = [...new Set(submissions.map(sub => sub.submitted_by))];
        
        // Get all completions for this form
        const completions = await storage.getScheduleFormCompletions(scheduleForm.id);
        const completedByUsers = new Set(completions.map(comp => comp.user_id));
        
        // Check if all users who submitted data have marked the form as complete
        const isCompleted = uniqueSubmitters.length > 0 && uniqueSubmitters.every(userId => completedByUsers.has(userId));
        
        formStatuses.push({
          formId: scheduleForm.form_id,
          formName: scheduleForm.form?.name || 'Unknown Form',
          isCompleted,
          submitters: uniqueSubmitters.length,
          completedBy: completions.length
        });

        if (!isCompleted) {
          allFormsCompleted = false;
        }
      }

      res.json({ 
        canPublish: allFormsCompleted, 
        formStatuses,
        reason: allFormsCompleted ? 'All forms completed by all users' : 'Some forms not completed by all users'
      });
    } catch (error) {
      console.error('Error checking completion status:', error);
      res.status(500).json({ error: 'Failed to check completion status' });
    }
  });

  // Schedule Form routes
  app.get('/api/schedule-forms', requireAuth, async (req: any, res) => {
    try {
      // Get all schedule forms with form details for department filtering
      const allSchedules = await storage.getSchedules();
      let allScheduleForms = [];
      
      for (const schedule of allSchedules) {
        const scheduleForms = await storage.getScheduleForms(schedule.id);
        allScheduleForms.push(...scheduleForms);
      }

      // Filter by department for non-admin users
      if (req.userProfile?.role !== 'admin' && req.userProfile?.department_id) {
        const userDepartmentId = req.userProfile.department_id;
        const allForms = await storage.getForms();
        const departmentFormIds = allForms
          .filter(form => form.department_id === userDepartmentId)
          .map(form => form.id);
        
        allScheduleForms = allScheduleForms.filter(sf => 
          departmentFormIds.includes(sf.form_id)
        );
      }

      res.json(allScheduleForms);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schedule forms' });
    }
  });

  app.get('/api/schedules/:scheduleId/forms', requireAuth, async (req, res) => {
    try {
      const scheduleForms = await storage.getScheduleForms(req.params.scheduleId);
      res.json(scheduleForms);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schedule forms' });
    }
  });

  app.post('/api/schedules/:scheduleId/forms', requireAuth, async (req, res) => {
    try {
      const validatedData = insertScheduleFormSchema.parse({
        ...req.body,
        schedule_id: req.params.scheduleId
      });
      const scheduleForm = await storage.createScheduleForm(validatedData);
      res.status(201).json(scheduleForm);
    } catch (error) {
      res.status(400).json({ error: 'Invalid schedule form data' });
    }
  });

  app.post('/api/schedule-forms', requireAuth, async (req, res) => {
    try {
      const validatedData = insertScheduleFormSchema.parse(req.body);
      const scheduleForm = await storage.createScheduleForm(validatedData);
      res.status(201).json(scheduleForm);
    } catch (error) {
      res.status(400).json({ error: 'Invalid schedule form data' });
    }
  });

  app.delete('/api/schedule-forms/:id', requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteScheduleForm(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Schedule form not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete schedule form' });
    }
  });

  app.put('/api/schedule-forms/:id', requireAuth, async (req, res) => {
    try {
      const scheduleForm = await storage.updateScheduleForm(req.params.id, req.body);
      if (!scheduleForm) {
        return res.status(404).json({ error: 'Schedule form not found' });
      }
      res.json(scheduleForm);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update schedule form' });
    }
  });

  // Form Submission routes
  app.get('/api/form-submissions', requireAuth, async (req: any, res) => {
    try {
      const { formId, scheduleId } = req.query;
      const submissions = await storage.getFormSubmissions(
        formId as string,
        scheduleId as string
      );
      
      // Filter submissions based on user department (non-admin users only see their department's data)
      if (req.userProfile.role !== 'admin') {
        const userDepartmentId = req.userProfile.department_id;
        if (!userDepartmentId) {
          return res.json([]); // Users without departments see no submissions
        }
        
        // Get all forms for user's department
        const allForms = await storage.getForms();
        const departmentForms = allForms.filter(form => form.department_id === userDepartmentId);
        const departmentFormIds = departmentForms.map(form => form.id);
        
        // Filter submissions that belong to user's department forms
        const filteredSubmissions = submissions.filter(submission => 
          departmentFormIds.includes(submission.form_id)
        );
        res.json(filteredSubmissions);
      } else {
        res.json(submissions);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch form submissions' });
    }
  });

  app.post('/api/form-submissions', requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertFormSubmissionSchema.parse({
        ...req.body,
        submitted_by: req.userId
      });
      const submission = await storage.createFormSubmission(validatedData);
      res.status(201).json(submission);
    } catch (error) {
      res.status(400).json({ error: 'Invalid form submission data' });
    }
  });

  app.delete('/api/form-submissions/:id', requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteFormSubmission(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Form submission not found' });
      }
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting form submission:', error);
      res.status(500).json({ error: 'Failed to delete form submission' });
    }
  });

  // Schedule Form Completion routes
  app.get('/api/schedule-forms/:scheduleFormId/completions', requireAuth, async (req, res) => {
    try {
      const completions = await storage.getScheduleFormCompletions(req.params.scheduleFormId);
      res.json(completions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schedule form completions' });
    }
  });

  app.get('/api/schedule-form-completions', requireAuth, async (req, res) => {
    try {
      const { scheduleFormId, userId } = req.query;
      if (scheduleFormId && userId) {
        const completions = await storage.getScheduleFormCompletions(scheduleFormId as string);
        const userCompletions = completions.filter(c => c.user_id === userId);
        res.json(userCompletions);
      } else {
        res.status(400).json({ error: 'scheduleFormId and userId are required' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schedule form completions' });
    }
  });

  app.post('/api/schedule-forms/:scheduleFormId/completions', requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertScheduleFormCompletionSchema.parse({
        schedule_form_id: req.params.scheduleFormId,
        user_id: req.userId
      });
      const completion = await storage.createScheduleFormCompletion(validatedData);
      res.status(201).json(completion);
    } catch (error) {
      res.status(400).json({ error: 'Invalid schedule form completion data' });
    }
  });

  app.post('/api/schedule-form-completions', requireAuth, async (req, res) => {
    try {
      const validatedData = insertScheduleFormCompletionSchema.parse(req.body);
      const completion = await storage.createScheduleFormCompletion(validatedData);
      res.status(201).json(completion);
    } catch (error) {
      res.status(400).json({ error: 'Invalid schedule form completion data' });
    }
  });

  // SDG Routes
  app.get('/api/sdg-goals', requireAuth, async (req, res) => {
    try {
      const goals = await storage.getSdgGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch SDG goals' });
    }
  });

  app.get('/api/sdg-targets/:goalId', requireAuth, async (req, res) => {
    try {
      const goalId = parseInt(req.params.goalId);
      const targets = await storage.getSdgTargets(goalId);
      res.json(targets);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch SDG targets' });
    }
  });

  app.get('/api/sdg-indicators/:targetId', requireAuth, async (req, res) => {
    try {
      const targetId = req.params.targetId;
      const indicators = await storage.getSdgIndicators(targetId);
      res.json(indicators);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch SDG indicators' });
    }
  });

  app.get('/api/sdg-data-sources', requireAuth, async (req, res) => {
    try {
      const dataSources = await storage.getSdgDataSources();
      res.json(dataSources);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch SDG data sources' });
    }
  });

  app.get('/api/sdg-indicator-values/:indicatorId', requireAuth, async (req, res) => {
    try {
      const indicatorId = req.params.indicatorId;
      const values = await storage.getSdgIndicatorValues(indicatorId);
      res.json(values);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch SDG indicator values' });
    }
  });

  app.post('/api/sdg-indicator-values', requireAuth, async (req, res) => {
    try {
      const validatedData = insertSdgIndicatorValueSchema.parse(req.body);
      const value = await storage.createSdgIndicatorValue(validatedData);
      res.status(201).json(value);
    } catch (error) {
      res.status(400).json({ error: 'Invalid SDG indicator value data' });
    }
  });

  const server = createServer(app);
  return server;
}

