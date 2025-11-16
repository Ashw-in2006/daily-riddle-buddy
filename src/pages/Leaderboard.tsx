import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy, Medal, Flame } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, current_streak, total_correct")
      .order("current_streak", { ascending: false })
      .order("total_correct", { ascending: false })
      .limit(50);

    if (!error && data) {
      setLeaders(data);
    }
    setLoading(false);
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-accent" />;
    if (index === 1) return <Medal className="w-5 h-5 text-muted-foreground" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b shadow-sm z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Leaderboard</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-accent" />
              Top Solvers
            </CardTitle>
            <CardDescription>See who's on fire with their riddle streaks!</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : leaders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No data yet. Be the first to solve riddles!
              </div>
            ) : (
              <div className="space-y-3">
                {leaders.map((leader, index) => (
                  <div
                    key={leader.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 text-center font-bold text-muted-foreground">
                      {index < 3 ? getMedalIcon(index) : `#${index + 1}`}
                    </div>
                    <Avatar>
                      <AvatarFallback className="gradient-primary text-white">
                        {leader.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{leader.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {leader.total_correct} solved
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-accent" />
                      <span className="font-bold text-lg">{leader.current_streak}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Leaderboard;
