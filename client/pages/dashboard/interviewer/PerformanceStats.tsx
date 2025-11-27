import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Clock, Calendar, Download } from 'lucide-react';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { LineChart, BarChart} from '@tremor/react';
import { RadarChart} from '@/components/ui/animated-chart';

export default function PerformanceStats() {
  const [timeframe, setTimeframe] = useState('month');

  const performanceMetrics = [
    {
      title: 'Total Interviews',
      value: '124',
      change: '+8.5%',
      trend: 'up',
      icon: Users
    },
    {
      title: 'Avg. Duration',
      value: '52m',
      change: '-2.1%',
      trend: 'down',
      icon: Clock
    },
    {
      title: 'Success Rate',
      value: '92%',
      change: '+4.2%',
      trend: 'up',
      icon: TrendingUp
    },
    {
      title: 'This Month',
      value: '28',
      change: '+12.7%',
      trend: 'up',
      icon: Calendar
    }
  ];

  const interviewData = {
    data: [
      { date: 'Week 1', Technical: 8, Behavioral: 6 },
      { date: 'Week 2', Technical: 12, Behavioral: 8 },
      { date: 'Week 3', Technical: 10, Behavioral: 7 },
      { date: 'Week 4', Technical: 14, Behavioral: 9 },
    ],

  };

  const skillsData = {
    data: [
      { skill: 'Technical Knowledge', value: 4.5 },
      { skill: 'Communication', value: 4.8 },
      { skill: 'Problem Solving', value: 4.2 },
      { skill: 'Time Management', value: 4.6 },
      { skill: 'Candidate Experience', value: 4.9 },
      { skill: 'Documentation', value: 4.3 },
    ],

  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Performance Statistics</h1>
          <p className="text-muted-foreground">Track your interviewing metrics and impact</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last quarter</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric) => (
          <EnhancedCard key={metric.title} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <h3 className="text-2xl font-bold mt-1">{metric.value}</h3>
              </div>
              <metric.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className={`text-sm mt-2 ${
              metric.trend === 'up' ? 'text-success' : 'text-destructive'
            }`}>
              {metric.change} from last period
            </div>
          </EnhancedCard>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <EnhancedCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Interview Activity</h3>
          <LineChart title="Interview Activity" data={interviewData.data} index="date" categories={["Technical", "Behavioral"]} />
        </EnhancedCard>

        <EnhancedCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Skills Assessment</h3>
          <RadarChart className="w-full flex justify-center items-center w-[100%] h-[80%]" data={skillsData.data} />
        </EnhancedCard>
      </div>

      <EnhancedCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Performance Breakdown</h3>
        <BarChart
          data={[
              { metric: 'Technical Skills', Score: 4.8 },
              { metric: 'Communication', Score: 4.6 },
              { metric: 'Timeliness', Score: 4.9 },
              { metric: 'Feedback Quality', Score: 4.7 },
              { metric: 'Candidate Satisfaction', Score: 4.8 },
            ]}
            index="metric"
            categories={['Score']}
        />
      </EnhancedCard>
    </div>
  );
}