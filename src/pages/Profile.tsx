import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Trophy, UserPlus, UserMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    const { data: followersData } = await supabase
      .from("followers")
      .select("follower_id, profiles!followers_follower_id_fkey(name)")
      .eq("following_id", user.id);

    const { data: followingData } = await supabase
      .from("followers")
      .select("following_id, profiles!followers_following_id_fkey(name)")
      .eq("follower_id", user.id);

    const { data: achievementsData } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", user.id)
      .order("earned_date", { ascending: false });

    setFollowers(followersData || []);
    setFollowing(followingData || []);
    setAchievements(achievementsData || []);
    setLoading(false);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b shadow-sm z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="gradient-primary text-white text-3xl">
                  {profile.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
              <div className="flex gap-8 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{followers.length}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-secondary">{following.length}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              Achievements
            </CardTitle>
            <CardDescription>Your earned badges and milestones</CardDescription>
          </CardHeader>
          <CardContent>
            {achievements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No achievements yet. Keep solving riddles!
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="text-4xl mb-2">{achievement.badge_icon}</div>
                    <p className="font-medium text-sm">{achievement.badge_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(achievement.earned_date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Language</span>
              <Badge variant="secondary">
                {profile.language === "en" ? "English" : profile.language === "ta" ? "Tamil" : "Tanglish"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Preferred Time</span>
              <Badge variant="secondary">{profile.preferred_time}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Current Streak</span>
              <Badge variant="default">{profile.current_streak} days</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Longest Streak</span>
              <Badge variant="default">{profile.longest_streak} days</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Solved</span>
              <Badge variant="default">{profile.total_correct}</Badge>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
