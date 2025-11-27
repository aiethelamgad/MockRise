import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Calendar, Download } from 'lucide-react';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { LineChart, BarChart } from '@tremor/react';
import { Progress } from '@/components/ui/progress';

export default function AdminAnalytics() {
  const [timeframe, setTimeframe] = useState('month');
  
  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: Users
    },
    {
      title: 'Interviews Conducted',
      value: '15,634',
      change: '+23.1%',
      trend: 'up',
      icon: Calendar
    },
    {
      title: 'Success Rate',
      value: '87%',
      change: '+5.2%',
      trend: 'up',
      icon: TrendingUp
    },
    {
      title: 'Revenue',
      value: '$45,680',
      change: '+18.7%',
      trend: 'up',
      icon: BarChart3
    }
  ];

  const interviewData = {
    data: [156, 178, 198, 167, 189, 201, 234, 256, 278, 289, 301, 312].map((value, index) => ({
      date: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index],
      Interviews: value,
    })),
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };

  const userGrowthData = {
    data: [1200, 1350, 1500, 1750, 1900, 2100, 2300, 2500, 2650, 2750, 2847].map((value, index) => ({
      date: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index],
      Users: value,
    })),
    labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };

  // User Growth breakdown (from dashboard Analytics category)
  const userGrowthBreakdown = [
    { label: "New Users", value: 234, color: "bg-primary" },
    { label: "Active Users", value: 1923, color: "bg-accent" },
    { label: "Returning Users", value: 1456, color: "bg-secondary" },
    { label: "Churned Users", value: 89, color: "bg-destructive" },
  ];

  // Platform Performance metrics (from dashboard Analytics category)
  const platformPerformance = [
    { label: "System Uptime", value: "99.9%" },
    { label: "Average Response Time", value: "245ms" },
    { label: "Error Rate", value: "0.1%" },
    { label: "User Satisfaction", value: "4.6/5" },
  ];

  return (
    <div className="space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
            <p className="text-muted-foreground">
              Comprehensive platform analytics and performance metrics
            </p>
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
            <EnhancedButton variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </EnhancedButton>
          </div>
        </div>
      </motion.div>

      {/* Key Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <EnhancedCard key={stat.title} className="p-4" variant="elevated">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className={`text-sm mt-2 ${
              stat.trend === 'up' ? 'text-success' : 'text-destructive'
            }`}>
              {stat.change} from last period
            </div>
          </EnhancedCard>
        ))}
      </motion.div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <EnhancedCard className="p-6" variant="elevated">
          <h3 className="text-lg font-semibold mb-4">Interview Activity</h3>
          <LineChart 
            data={interviewData.data} 
            index="date" 
            categories={["Interviews"]}
            colors={["blue"]}
            yAxisWidth={40}
          />
        </EnhancedCard>

        <EnhancedCard className="p-6" variant="elevated">
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          <BarChart 
            data={userGrowthData.data} 
            index="date" 
            categories={["Users"]}
            colors={["green"]}
            yAxisWidth={40}
          />
        </EnhancedCard>
      </div>

      {/* User Growth Breakdown and Platform Performance */}
      <div className="grid lg:grid-cols-2 gap-6">
        <EnhancedCard className="p-6" variant="elevated">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            User Growth Breakdown
          </h3>
          <div className="space-y-4">
            {userGrowthBreakdown.map((item, index) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span>{item.value.toLocaleString()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${item.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / 2000) * 100}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </EnhancedCard>

        <EnhancedCard className="p-6" variant="elevated">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Platform Performance
          </h3>
          <div className="space-y-4">
            {platformPerformance.map((metric) => (
              <div key={metric.label} className="flex items-center justify-between">
                <span className="text-sm">{metric.label}</span>
                <span className="font-medium">{metric.value}</span>
              </div>
            ))}
          </div>
        </EnhancedCard>
      </div>
    </div>
  );
}