'use client';

import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useAchievements } from '@/hooks/useAchievements';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuickAddTask from '@/components/QuickAddTask';
import TaskCard from '@/components/TaskCard';
import AchievementBadge from '@/components/AchievementBadge';
import ProductivityChart from '@/components/ProductivityChart';

export default function Dashboard() {
  const { state } = useApp();
  const { getTodayTasks, getProductivityStats } = useTasks();
  const { getUnlockedAchievements } = useAchievements();
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const todayTasks = getTodayTasks();
  const stats = getProductivityStats();
  const unlockedAchievements = getUnlockedAchievements();
  const recentAchievements = unlockedAchievements
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, 3);

  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return 'Bonjour';
    if (currentHour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const motivationalQuote = [
    "La productivité n'est jamais un accident. C'est toujours le résultat d'un engagement envers l'excellence.",
    "Chaque petit progrès compte. Continuez !",
    "Votre seule limite est votre mental. Repoussez-la !",
    "Le succès, c'est la somme de petits efforts répétés jour après jour.",
    "Transformez vos rêves en objectifs, et vos objectifs en réalité."
  ][Math.floor(Math.random() * 5)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                DayPlanner Pro
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200">
                {state.userStats.totalPoints} points
              </Badge>
              <Badge variant="secondary" className="bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border-orange-200">
                🔥 {state.userStats.currentStreak} jours
              </Badge>
              <Button 
                onClick={() => setShowQuickAdd(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                + Nouvelle tâche
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {getGreeting()} ! 👋
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {motivationalQuote}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-800">Tâches du jour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {stats.completedTasks}/{stats.totalTasks}
              </div>
              <Progress value={stats.completionRate} className="mt-2" />
              <p className="text-xs text-blue-700 mt-1">
                {Math.round(stats.completionRate)}% complété
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-800">Points gagnés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {stats.points}
              </div>
              <div className="text-xs text-green-700 mt-1">
                Total: {state.userStats.totalPoints}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-800">Temps focus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {Math.round(stats.completedDuration / 60)}h
              </div>
              <div className="text-xs text-purple-700 mt-1">
                {stats.completedDuration} minutes
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-yellow-100 border-orange-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-800">Série actuelle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">
                {state.userStats.currentStreak}
              </div>
              <div className="text-xs text-orange-700 mt-1">
                Record: {state.userStats.longestStreak} jours
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tasks Section */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="today" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/70 backdrop-blur-sm">
                <TabsTrigger value="today" className="data-[state=active]:bg-white">
                  Aujourd'hui ({todayTasks.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-white">
                  En attente ({todayTasks.filter(t => !t.completed).length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-white">
                  Complétées ({todayTasks.filter(t => t.completed).length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="mt-6">
                <div className="space-y-4">
                  {todayTasks.length === 0 ? (
                    <Card className="bg-white/70 backdrop-blur-sm">
                      <CardContent className="p-8 text-center">
                        <div className="text-6xl mb-4">🎯</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Aucune tâche pour aujourd'hui
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Commencez votre journée productive en ajoutant votre première tâche !
                        </p>
                        <Button 
                          onClick={() => setShowQuickAdd(true)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          Ajouter une tâche
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    todayTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="pending" className="mt-6">
                <div className="space-y-4">
                  {todayTasks.filter(t => !t.completed).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <div className="space-y-4">
                  {todayTasks.filter(t => t.completed).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Achievements */}
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  🏆 Succès récents
                </CardTitle>
                <CardDescription>
                  Vos derniers accomplissements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentAchievements.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Complétez des tâches pour débloquer vos premiers succès !
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentAchievements.map((achievement) => (
                      <AchievementBadge key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Productivity Chart */}
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  📊 Productivité
                </CardTitle>
                <CardDescription>
                  Votre performance cette semaine
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductivityChart />
              </CardContent>
            </Card>

            {/* Focus Mode */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-indigo-900">
                  🎯 Mode Focus
                </CardTitle>
                <CardDescription className="text-indigo-700">
                  Concentrez-vous sur vos tâches importantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                  disabled
                >
                  Démarrer une session Pomodoro
                </Button>
                <p className="text-xs text-indigo-600 mt-2 text-center">
                  Fonctionnalité à venir
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddTask onClose={() => setShowQuickAdd(false)} />
      )}
    </div>
  );
}