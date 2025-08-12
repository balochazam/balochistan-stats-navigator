import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Database, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getSDGIcon } from '@/assets/sdg-icons';


// SDG Dashboard data with progress tracking and official UN icon URLs
const defaultSDGData = [
  { 
    id: 1, 
    title: "No Poverty", 
    progress: 52, 
    color: "#e5243b", 
    target: 71, 
    description: "End poverty in all its forms everywhere",
    iconUrl: getSDGIcon(1)
  },
  { 
    id: 2, 
    title: "Zero Hunger", 
    progress: 65, 
    color: "#dda63a", 
    target: 32, 
    description: "End hunger, achieve food security and improved nutrition",
    iconUrl: getSDGIcon(2)
  },
  { 
    id: 3, 
    title: "Good Health", 
    progress: 71, 
    color: "#4c9f38", 
    target: 38, 
    description: "Ensure healthy lives and promote well-being for all at all ages",
    iconUrl: getSDGIcon(3)
  },
  { 
    id: 4, 
    title: "Quality Education", 
    progress: 92, 
    color: "#c5192d", 
    target: 78, 
    description: "Ensure inclusive and equitable quality education",
    iconUrl: getSDGIcon(4)
  },
  { 
    id: 5, 
    title: "Gender Equality", 
    progress: 60, 
    color: "#ff3a21", 
    target: 45, 
    description: "Achieve gender equality and empower all women and girls",
    iconUrl: getSDGIcon(5)
  },
  { 
    id: 6, 
    title: "Clean Water", 
    progress: 78, 
    color: "#26bde2", 
    target: 62, 
    description: "Ensure availability and sustainable management of water",
    iconUrl: getSDGIcon(6)
  },
  { 
    id: 7, 
    title: "Clean Energy", 
    progress: 45, 
    color: "#fcc30b", 
    target: 28, 
    description: "Ensure access to affordable, reliable, sustainable energy",
    iconUrl: getSDGIcon(7)
  },
  { 
    id: 8, 
    title: "Economic Growth", 
    progress: 67, 
    color: "#a21942", 
    target: 52, 
    description: "Promote sustained, inclusive economic growth",
    iconUrl: getSDGIcon(8)
  },
  { 
    id: 9, 
    title: "Innovation", 
    progress: 73, 
    color: "#fd6925", 
    target: 38, 
    description: "Build resilient infrastructure, promote innovation",
    iconUrl: getSDGIcon(9)
  },
  { 
    id: 10, 
    title: "Reduced Inequalities", 
    progress: 58, 
    color: "#dd1367", 
    target: 42, 
    description: "Reduce inequality within and among countries",
    iconUrl: getSDGIcon(10)
  },
  { 
    id: 11, 
    title: "Sustainable Cities", 
    progress: 54, 
    color: "#fd9d24", 
    target: 35, 
    description: "Make cities and human settlements sustainable",
    iconUrl: getSDGIcon(11)
  },
  { 
    id: 12, 
    title: "Responsible Consumption", 
    progress: 61, 
    color: "#bf8b2e", 
    target: 48, 
    description: "Ensure sustainable consumption and production patterns",
    iconUrl: getSDGIcon(12)
  },
  { 
    id: 13, 
    title: "Climate Action", 
    progress: 42, 
    color: "#3f7e44", 
    target: 25, 
    description: "Take urgent action to combat climate change",
    iconUrl: getSDGIcon(13)
  },
  { 
    id: 14, 
    title: "Life Below Water", 
    progress: 48, 
    color: "#0a97d9", 
    target: 31, 
    description: "Conserve and sustainably use marine resources",
    iconUrl: getSDGIcon(14)
  },
  { 
    id: 15, 
    title: "Life on Land", 
    progress: 55, 
    color: "#56c02b", 
    target: 38, 
    description: "Protect and restore terrestrial ecosystems",
    iconUrl: getSDGIcon(15)
  },
  { 
    id: 16, 
    title: "Peace & Justice", 
    progress: 63, 
    color: "#00689d", 
    target: 45, 
    description: "Promote peaceful and inclusive societies",
    iconUrl: getSDGIcon(16)
  },
  { 
    id: 17, 
    title: "Partnerships", 
    progress: 71, 
    color: "#19486a", 
    target: 58, 
    description: "Strengthen means of implementation and partnerships",
    iconUrl: getSDGIcon(17)
  },
];

export const SDGGoalsManager = () => {
  const navigate = useNavigate();

  const { data: goalsWithProgress = [], isLoading, error } = useQuery({
    queryKey: ['/api/sdg/goals-with-progress'],
    retry: 1,
  });

  // Use real progress data if available, otherwise fall back to default data
  const goalsArray = Array.isArray(goalsWithProgress) ? goalsWithProgress : [];
  
  const sdgData = goalsArray.length > 0 ? goalsArray.map((goal: any) => {
    const defaultGoal = defaultSDGData.find(d => d.id === goal.id);
    
    return {
      ...goal,
      progress: goal.progress || defaultGoal?.progress || 0,
      target: defaultGoal?.target || 100,
      iconUrl: getSDGIcon(goal.id),
      color: defaultGoal?.color || '#3b82f6'
    };
  }) : defaultSDGData;

  const avgProgress = Math.round(sdgData.reduce((acc: number, sdg: any) => acc + sdg.progress, 0) / sdgData.length);
  const onTrackCount = sdgData.filter((sdg: any) => sdg.progress >= (sdg.target * 0.7)).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading SDG goals...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SDG Goals & Targets</h1>
          <p className="text-gray-600 mt-1">
            Sustainable Development Goals progress tracking for Balochistan
          </p>
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <Badge variant="destructive" className="py-2 px-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              API Unavailable
            </Badge>
          )}
          
          <Badge variant="outline" className="text-lg py-2 px-4">
            <Target className="h-5 w-5 mr-2" />
            17 Goals Active
          </Badge>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">17</div>
              <div className="text-sm text-gray-600">Total SDGs</div>
              <p className="text-xs text-gray-500 mt-1">UN Goals</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{onTrackCount}</div>
              <div className="text-sm text-gray-600">On Track</div>
              <p className="text-xs text-gray-500 mt-1">Making progress</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{avgProgress}%</div>
              <div className="text-sm text-gray-600">Avg Progress</div>
              <p className="text-xs text-gray-500 mt-1">Overall completion</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">2030</div>
              <div className="text-sm text-gray-600">Target Year</div>
              <p className="text-xs text-gray-500 mt-1">UN deadline</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            SDG Progress Overview
          </CardTitle>
          <p className="text-sm text-gray-600">
            Current progress across all 17 Sustainable Development Goals
            {error && " (using default data - API unavailable)"}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Main Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={sdgData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}

                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="id" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `${value}`}
                    interval={0}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value}%`, 
                      `SDG ${props.payload.id}: ${props.payload.title}`
                    ]}
                    labelFormatter={(label) => `SDG ${label}`}
                  />
                  <Bar 
                    dataKey="progress" 
                    stroke="#fff"
                    strokeWidth={1}
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                  >
                    {sdgData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* SDG Icons Legend */}
            <div className="grid grid-cols-17 gap-1 px-4">
              {sdgData.map((sdg) => (
                <div key={sdg.id} className="flex flex-col items-center">
                  <div 
                    className="w-12 h-12 rounded overflow-hidden mb-1 border border-gray-200 cursor-pointer hover:scale-105 transition-transform"
                    title={`SDG ${sdg.id}: ${sdg.title} - Click to view details`}
                    onClick={() => navigate(`/goals/${sdg.id}`)}
                  >
                    <img 
                      src={sdg.iconUrl}
                      alt={`SDG ${sdg.id}: ${sdg.title}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to colored square with number if image fails
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement;
                        if (parent) {
                          target.style.display = 'none';
                          parent.style.backgroundColor = sdg.color;
                          parent.className = parent.className.replace('border border-gray-200', '');
                          parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white text-xs font-bold">${sdg.id}</div>`;
                        }
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 text-center leading-tight">
                    {sdg.title.split(' ').slice(0, 2).join(' ')}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-xs text-gray-500 text-right">
              Reporting matters 2021 | 17
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SDG Goals Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Individual SDG Progress & Management
          </CardTitle>
          <p className="text-sm text-gray-600">
            Overview and management of each Sustainable Development Goal
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading SDG data...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sdgData.map((sdg: any) => (
                <Card 
                  key={sdg.id} 
                  className="border-2 cursor-pointer hover:shadow-lg transition-shadow" 
                  style={{ borderColor: sdg.color }}
                  onClick={() => navigate(`/goals/${sdg.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={sdg.iconUrl}
                          alt={`SDG ${sdg.id}: ${sdg.title}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to colored square with number if image fails
                            const target = e.target as HTMLImageElement;
                            const parent = target.parentElement;
                            if (parent) {
                              target.style.display = 'none';
                              parent.style.backgroundColor = sdg.color;
                              parent.className = parent.className.replace('border border-gray-200', '');
                              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white font-bold text-lg">${sdg.id}</div>`;
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm leading-tight">{sdg.title}</h3>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{sdg.progress}%</span>
                      </div>
                      <Progress value={sdg.progress} className="h-2" />
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Target: {sdg.target}%</span>
                        <span className={sdg.progress >= sdg.target ? 'text-green-600' : 'text-orange-600'}>
                          {sdg.progress >= sdg.target ? '✓ Achieved' : 'In Progress'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {sdg.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};