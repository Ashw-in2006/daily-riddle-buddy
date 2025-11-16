import { Card, CardContent } from "@/components/ui/card";
import { Flame, Trophy, Target } from "lucide-react";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  totalCorrect: number;
}

const StreakDisplay = ({ currentStreak, longestStreak, totalCorrect }: StreakDisplayProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="shadow-md">
        <CardContent className="pt-6 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center shadow-glow">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold animate-streak">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="pt-6 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full gradient-secondary flex items-center justify-center shadow-glow">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{longestStreak}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="pt-6 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-glow">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{totalCorrect}</p>
            <p className="text-xs text-muted-foreground">Solved</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreakDisplay;
