
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReferenceDataSelect } from '@/components/reference-data/ReferenceDataSelect';
import { useToast } from '@/hooks/use-toast';
import { FileText } from 'lucide-react';

export const ExampleForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    district: '',
    country: '',
    hospital: '',
    school: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data:', formData);
    toast({
      title: "Form Submitted",
      description: "Check the console for form data",
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Example Form with Reference Data
        </CardTitle>
        <CardDescription>
          This demonstrates how to use reference data in forms with dropdown selects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="district">District</Label>
            <ReferenceDataSelect
              referenceDataName="Districts"
              value={formData.district}
              onValueChange={(value) => setFormData(prev => ({ ...prev, district: value }))}
              placeholder="Select a district"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <ReferenceDataSelect
              referenceDataName="Countries"
              value={formData.country}
              onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
              placeholder="Select a country"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hospital">Hospital</Label>
            <ReferenceDataSelect
              referenceDataName="Hospitals"
              value={formData.hospital}
              onValueChange={(value) => setFormData(prev => ({ ...prev, hospital: value }))}
              placeholder="Select a hospital"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="school">School</Label>
            <ReferenceDataSelect
              referenceDataName="Schools"
              value={formData.school}
              onValueChange={(value) => setFormData(prev => ({ ...prev, school: value }))}
              placeholder="Select a school"
            />
          </div>

          <Button type="submit" className="w-full">
            Submit Form
          </Button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">How to use Reference Data:</h4>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Create reference data sets (e.g., "Districts", "Countries") in the admin panel</li>
            <li>Add options to each set (e.g., "NYC" → "New York City")</li>
            <li>Use the `ReferenceDataSelect` component in your forms</li>
            <li>Pass the reference data name as a prop</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
