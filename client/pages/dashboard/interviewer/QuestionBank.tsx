import { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Question } from '@/types/dashboard';
import { Badge } from '@/components/ui/badge';

export default function QuestionBank() {
  const [questions] = useState<Question[]>([
    {
      id: '1',
      text: 'Explain the concept of dependency injection',
      category: 'Software Design',
      difficulty: 'Intermediate',
      tags: ['Design Patterns', 'Architecture']
    },
    // ... more mock data
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Question Bank</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search questions..."
            className="w-full"
            // prefix={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {questions.map((question) => (
          <EnhancedCard key={question.id} className="p-4">
            <div className="space-y-4">
              <h3 className="font-medium">{question.text}</h3>
              <div className="flex gap-2">
                <Badge>{question.category}</Badge>
                <Badge variant="outline">{question.difficulty}</Badge>
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          </EnhancedCard>
        ))}
      </div>
    </div>
  );
}