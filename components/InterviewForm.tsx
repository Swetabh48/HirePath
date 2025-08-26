'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface InterviewFormProps {
  userId?: string;
}

export const InterviewForm = ({ userId }: InterviewFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    level: 'Junior',
    type: 'Mixed',
    techstack: '',
    amount: 5
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.role || !formData.techstack) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/generate-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Interview created successfully!');
        router.push(`/interview/${result.interviewId}`);
      } else {
        toast.error('Failed to create interview');
      }
    } catch (error) {
      console.error('Error creating interview:', error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseInt(value) : value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Generate New Interview</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="role">Job Role *</Label>
          <Input
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            placeholder="e.g., Frontend Developer, Data Scientist"
            required
          />
        </div>

        <div>
          <Label htmlFor="level">Experience Level</Label>
          <select
            id="level"
            name="level"
            value={formData.level}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md bg-dark-200 text-white"
          >
            <option value="Junior">Junior (0-2 years)</option>
            <option value="Mid-level">Mid-level (2-5 years)</option>
            <option value="Senior">Senior (5+ years)</option>
          </select>
        </div>

        <div>
          <Label htmlFor="type">Interview Type</Label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md bg-dark-200 text-white"
          >
            <option value="Technical">Technical</option>
            <option value="Behavioral">Behavioral</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>

        <div>
          <Label htmlFor="techstack">Tech Stack *</Label>
          <Input
            id="techstack"
            name="techstack"
            value={formData.techstack}
            onChange={handleInputChange}
            placeholder="e.g., React, Node.js, Python, AWS"
            required
          />
          <p className="text-sm text-gray-400 mt-1">
            Separate technologies with commas
          </p>
        </div>

        <div>
          <Label htmlFor="amount">Number of Questions</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min="3"
            max="15"
            value={formData.amount}
            onChange={handleInputChange}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full btn-primary"
        >
          {isLoading ? 'Generating...' : 'Generate Interview'}
        </Button>
      </form>
    </div>
  );
};