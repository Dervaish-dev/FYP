import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Target,
  Zap,
  Heart,
  Activity,
  Moon,
  BarChart3,
  Calendar,
  Lightbulb
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import DashboardCard from '../components/DashboardCard';

const InsightsPage = () => {
  const { currentTheme, animations } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const insights = [
    {
      title: "Emotion Recognition",
      value: "Calm & Focused",
      subtitle: "current state",
      icon: Brain,
      color: "primary",
      description: "Your emotional state shows stability and positive mood patterns.",
      trend: "+12%",
      trendLabel: "vs last week"
    },
    {
      title: "Stress Patterns",
      value: "Low Stress",
      subtitle: "23% detected",
      icon: Heart,
      color: "success",
      description: "Stress levels are well-managed with effective coping strategies.",
      trend: "-8%",
      trendLabel: "vs last week"
    },
    {
      title: "Focus Sessions",
      value: "3.2h",
      subtitle: "daily average",
      icon: Target,
      color: "secondary",
      description: "Consistent focus sessions with improving concentration levels.",
      trend: "+15%",
      trendLabel: "vs last week"
    },
    {
      title: "Energy Levels",
      value: "High",
      subtitle: "68% optimal",
      icon: Zap,
      color: "warning",
      description: "Energy levels are good with room for optimization through better sleep.",
      trend: "+5%",
      trendLabel: "vs last week"
    }
  ];

  const weeklyPatterns = [
    { day: 'Mon', emotion: 85, stress: 15, focus: 80, energy: 75 },
    { day: 'Tue', emotion: 88, stress: 20, focus: 85, energy: 80 },
    { day: 'Wed', emotion: 82, stress: 25, focus: 75, energy: 70 },
    { day: 'Thu', emotion: 90, stress: 18, focus: 88, energy: 85 },
    { day: 'Fri', emotion: 92, stress: 12, focus: 90, energy: 88 },
    { day: 'Sat', emotion: 95, stress: 8, focus: 85, energy: 90 },
    { day: 'Sun', emotion: 88, stress: 10, focus: 80, energy: 85 },
  ];

  const maxValue = Math.max(...weeklyPatterns.map(d => Math.max(d.emotion, d.stress, d.focus, d.energy)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <motion.div 
        className="gradient-bg text-white py-8"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="h-8 w-8" />
            <h1 className="text-3xl font-bold">AI Insights</h1>
          </div>
          <p className="text-primary-100">
            Personalized insights powered by artificial intelligence
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Current State Overview */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Current State Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {insights.map((insight, index) => (
                <DashboardCard
                  key={insight.title}
                  title={insight.title}
                  value={insight.value}
                  subtitle={insight.subtitle}
                  icon={insight.icon}
                  color={insight.color}
                >
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Trend</span>
                      <span className={`text-xs font-medium ${
                        insight.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {insight.trend}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{insight.trendLabel}</p>
                  </div>
                </DashboardCard>
              ))}
            </div>
          </motion.div>

          {/* Weekly Patterns */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Weekly Pattern Analysis</h2>
            <DashboardCard
              title="7-Day Wellness Trends"
              value="+8%"
              subtitle="overall improvement"
              icon={TrendingUp}
              color="primary"
              className="h-96"
            >
              <div className="mt-6 h-64 flex items-end justify-between space-x-1">
                {weeklyPatterns.map((day, index) => (
                  <motion.div
                    key={day.day}
                    className="flex flex-col items-center space-y-2"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="text-xs text-gray-500">{day.emotion}%</div>
                    <div className="flex flex-col space-y-1">
                      <div
                        className="w-4 bg-primary-500 rounded-t"
                        style={{ 
                          height: `${(day.emotion / maxValue) * 80}px`,
                          minHeight: '8px'
                        }}
                        title={`Emotion: ${day.emotion}%`}
                      />
                      <div
                        className="w-4 bg-red-500 rounded-t"
                        style={{ 
                          height: `${(day.stress / maxValue) * 80}px`,
                          minHeight: '8px'
                        }}
                        title={`Stress: ${day.stress}%`}
                      />
                      <div
                        className="w-4 bg-purple-500 rounded-t"
                        style={{ 
                          height: `${(day.focus / maxValue) * 80}px`,
                          minHeight: '8px'
                        }}
                        title={`Focus: ${day.focus}%`}
                      />
                      <div
                        className="w-4 bg-yellow-500 rounded-t"
                        style={{ 
                          height: `${(day.energy / maxValue) * 80}px`,
                          minHeight: '8px'
                        }}
                        title={`Energy: ${day.energy}%`}
                      />
                    </div>
                    <div className="text-xs font-medium text-gray-700">{day.day}</div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 flex justify-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary-500 rounded-full" />
                  <span className="text-xs text-gray-600">Emotion</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-xs text-gray-600">Stress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  <span className="text-xs text-gray-600">Focus</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-xs text-gray-600">Energy</span>
                </div>
              </div>
            </DashboardCard>
          </motion.div>

          {/* Detailed Insights */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Insights</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {insights.map((insight, index) => (
                <DashboardCard
                  key={insight.title}
                  title={insight.title}
                  value={insight.value}
                  subtitle={insight.subtitle}
                  icon={insight.icon}
                  color={insight.color}
                >
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Weekly Trend</span>
                      <span className={`text-sm font-medium ${
                        insight.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {insight.trend}
                      </span>
                    </div>
                  </div>
                </DashboardCard>
              ))}
            </div>
          </motion.div>

          {/* AI Recommendations */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Recommendations</h2>
            <DashboardCard
              title="Personalized Suggestions"
              value="5"
              subtitle="recommendations"
              icon={Lightbulb}
              color="primary"
            >
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-start space-x-3">
                    <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Emotion Management</h4>
                      <p className="text-sm text-blue-700">
                        Your emotional state is stable. Consider practicing gratitude journaling to maintain positive patterns.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <div className="flex items-start space-x-3">
                    <Heart className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 mb-1">Stress Reduction</h4>
                      <p className="text-sm text-green-700">
                        Excellent stress management! Your breathing exercises and meditation are working effectively.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                  <div className="flex items-start space-x-3">
                    <Target className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-900 mb-1">Focus Optimization</h4>
                      <p className="text-sm text-purple-700">
                        Your focus sessions are improving. Try the Pomodoro technique for even better concentration.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <div className="flex items-start space-x-3">
                    <Zap className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900 mb-1">Energy Enhancement</h4>
                      <p className="text-sm text-yellow-700">
                        Your energy levels are good. Consider adding a 10-minute walk to boost afternoon energy.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400">
                  <div className="flex items-start space-x-3">
                    <Moon className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-indigo-900 mb-1">Sleep Optimization</h4>
                      <p className="text-sm text-indigo-700">
                        Maintain consistent sleep schedule. Your current routine is supporting good sleep quality.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </motion.div>

          {/* Predictive Analytics */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Predictive Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <DashboardCard
                title="Tomorrow's Forecast"
                value="Positive"
                subtitle="high confidence"
                icon={Calendar}
                color="success"
              >
                <div className="mt-4 space-y-2">
                  <div className="text-sm text-gray-600">Expected mood: Calm & Focused</div>
                  <div className="text-sm text-gray-600">Stress level: Low (15-20%)</div>
                  <div className="text-sm text-gray-600">Energy: High (75-80%)</div>
                  <div className="text-sm text-gray-600">Focus potential: Excellent</div>
                </div>
              </DashboardCard>

              <DashboardCard
                title="Weekly Outlook"
                value="Improving"
                subtitle="trending up"
                icon={TrendingUp}
                color="primary"
              >
                <div className="mt-4 space-y-2">
                  <div className="text-sm text-gray-600">Overall wellness: +8%</div>
                  <div className="text-sm text-gray-600">Stress reduction: -12%</div>
                  <div className="text-sm text-gray-600">Focus improvement: +15%</div>
                  <div className="text-sm text-gray-600">Energy stability: +5%</div>
                </div>
              </DashboardCard>

              <DashboardCard
                title="Risk Factors"
                value="Minimal"
                subtitle="low risk"
                icon={Activity}
                color="warning"
              >
                <div className="mt-4 space-y-2">
                  <div className="text-sm text-gray-600">Burnout risk: Low</div>
                  <div className="text-sm text-gray-600">Stress accumulation: Minimal</div>
                  <div className="text-sm text-gray-600">Sleep disruption: None</div>
                  <div className="text-sm text-gray-600">Focus decline: Unlikely</div>
                </div>
              </DashboardCard>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default InsightsPage;
