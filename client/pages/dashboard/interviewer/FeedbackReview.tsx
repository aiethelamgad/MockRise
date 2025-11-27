import { useState } from 'react';
import { MessageSquare, Search, Filter, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function FeedbackReview() {
  const [feedbacks] = useState([
    {
      id: '1',
      candidate: {
        name: 'Sarah Chen',
        avatar: '/avatars/sarah.jpg',
        role: 'Frontend Developer'
      },
      date: '2025-11-02',
      rating: 4.5,
      strengths: ['Technical Knowledge', 'Problem Solving'],
      improvements: ['Communication'],
      status: 'pending',
      comment: 'Demonstrated strong React knowledge and system design principles. Could improve on explaining thought process.'
    },
    // ... more mock data
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Feedback Review</h1>
          <p className="text-muted-foreground">Review and manage interview feedback</p>
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Feedback</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search feedback..."
            // prefix={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>

      <div className="grid gap-4">
        {feedbacks.map((feedback) => (
          <EnhancedCard key={feedback.id} className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={feedback.candidate.avatar} alt={feedback.candidate.name} />
                    <AvatarFallback>{feedback.candidate.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{feedback.candidate.name}</h3>
                    <p className="text-sm text-muted-foreground">{feedback.candidate.role}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span>{feedback.rating}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(feedback.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant={feedback.status === 'pending' ? 'secondary' : 'default'} className={feedback.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80' : 'bg-green-100 text-green-800 hover:bg-green-100/80'}>
                  {feedback.status === 'pending' ? 'Pending Review' : 'Reviewed'}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm leading-relaxed">{feedback.comment}</p>
                <div className="flex gap-4 mt-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-green-500" />
                      Strengths
                    </h4>
                    <div className="flex gap-2">
                      {feedback.strengths.map((strength) => (
                        <Badge key={strength} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <ThumbsDown className="h-4 w-4 text-yellow-500" />
                      Areas for Improvement
                    </h4>
                    <div className="flex gap-2">
                      {feedback.improvements.map((improvement) => (
                        <Badge key={improvement} variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          {improvement}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm">Edit Feedback</Button>
                <Button size="sm">Submit Review</Button>
              </div>
            </div>
          </EnhancedCard>
        ))}
      </div>
    </div>
  );
}