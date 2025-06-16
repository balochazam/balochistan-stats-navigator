import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, insertDepartmentSchema, insertDataBankSchema, insertDataBankEntrySchema, insertFormSchema, insertFormFieldSchema, insertScheduleSchema, insertScheduleFormSchema, insertFormSubmissionSchema, insertScheduleFormCompletionSchema } from "@shared/schema";

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

      res.status(201).json({ 
        user: { id: profile.id, email: profile.email },
        profile,
        session: { access_token: userId, user: { id: profile.id, email: profile.email } }
      });
    } catch (error) {
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const profile = await storage.getProfileByEmail(email);
      if (!profile) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // In production, verify password properly
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
    res.json({ message: 'Logged out successfully' });
  });

  app.get('/api/auth/user', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.substring(7);
      const profile = await storage.getProfile(token);
      
      if (!profile) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      res.json({
        user: { id: profile.id, email: profile.email },
        profile,
        session: { access_token: token, user: { id: profile.id, email: profile.email } }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.substring(7);
    req.userId = token; // In production, verify and decode the token properly
    next();
  };

  // Profile routes
  app.get('/api/profiles', requireAuth, async (req, res) => {
    try {
      const profiles = await storage.getAllProfiles();
      res.json(profiles);
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

  app.post('/api/profiles', requireAuth, async (req, res) => {
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

  app.post('/api/data-banks', requireAuth, async (req, res) => {
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
      const entries = await storage.getDataBankEntries(req.params.dataBankId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch data bank entries' });
    }
  });

  app.post('/api/data-banks/:dataBankId/entries', requireAuth, async (req, res) => {
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
      if (!success) {
        return res.status(404).json({ error: 'Data bank entry not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting data bank entry:', error);
      res.status(500).json({ error: 'Failed to delete data bank entry' });
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
  app.get('/api/forms', requireAuth, async (req, res) => {
    try {
      const forms = await storage.getForms();
      res.json(forms);
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

  app.post('/api/forms', requireAuth, async (req, res) => {
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
      res.status(500).json({ error: 'Failed to update form' });
    }
  });

  app.delete('/api/forms/:id', requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteForm(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Form not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete form' });
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

  app.delete('/api/form-fields/:id', requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteFormField(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Form field not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete form field' });
    }
  });

  // Schedule routes
  app.get('/api/schedules', requireAuth, async (req, res) => {
    try {
      const schedules = await storage.getSchedules();
      res.json(schedules);
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

  app.post('/api/schedules', requireAuth, async (req, res) => {
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

  // Schedule Form routes
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

  // Form Submission routes
  app.get('/api/form-submissions', requireAuth, async (req, res) => {
    try {
      const { formId, scheduleId } = req.query;
      const submissions = await storage.getFormSubmissions(
        formId as string,
        scheduleId as string
      );
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch form submissions' });
    }
  });

  app.post('/api/form-submissions', requireAuth, async (req, res) => {
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

  // Schedule Form Completion routes
  app.get('/api/schedule-forms/:scheduleFormId/completions', requireAuth, async (req, res) => {
    try {
      const completions = await storage.getScheduleFormCompletions(req.params.scheduleFormId);
      res.json(completions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schedule form completions' });
    }
  });

  app.post('/api/schedule-forms/:scheduleFormId/completions', requireAuth, async (req, res) => {
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

  app.delete('/api/schedule-forms/:scheduleFormId/completions/:userId', requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteScheduleFormCompletion(
        req.params.scheduleFormId,
        req.params.userId
      );
      if (!success) {
        return res.status(404).json({ error: 'Schedule form completion not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete schedule form completion' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
