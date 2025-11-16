import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, CheckCircle2, XCircle, Lightbulb } from "lucide-react";

interface RiddleCardProps {
  userId: string;
  language: string;
  onStreakUpdate: (userId: string) => void;
}

const RiddleCard = ({ userId, language, onStreakUpdate }: RiddleCardProps) => {
  const { toast } = useToast();
  const [riddle, setRiddle] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [fact, setFact] = useState<any>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    fetchTodaysRiddle();
  }, [userId]);

  const fetchTodaysRiddle = async () => {
    const { data, error } = await supabase.functions.invoke("get-riddle", {
      body: { userId },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error fetching riddle",
        description: error.message,
      });
      return;
    }

    if (data?.riddle) {
      setRiddle(data.riddle);
      setAnswered(data.answered || false);
      if (data.answered) {
        setIsCorrect(data.isCorrect);
        if (data.isCorrect && data.fact) {
          setFact(data.fact);
        }
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;

    setLoading(true);
    const { data, error } = await supabase.functions.invoke("submit-answer", {
      body: {
        userId,
        riddleId: riddle.id,
        answer: answer.trim(),
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error submitting answer",
        description: error.message,
      });
      setLoading(false);
      return;
    }

    setAnswered(true);
    setIsCorrect(data.isCorrect);
    
    if (data.isCorrect) {
      setFact(data.fact);
      toast({
        title: "Correct! 🎉",
        description: "Your streak continues!",
      });
      onStreakUpdate(userId);
    } else {
      toast({
        variant: "destructive",
        title: "Not quite right",
        description: "Don't worry, you can try again tomorrow!",
      });
    }
    
    setLoading(false);
  };

  const getRiddleText = () => {
    if (!riddle) return "";
    switch (language) {
      case "ta":
        return riddle.text_ta;
      case "ta_en":
        return riddle.text_ta_en;
      default:
        return riddle.text_en;
    }
  };

  if (!riddle) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Today's Riddle
          </CardTitle>
          <CardDescription>Loading your daily challenge...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Today's Riddle
          </CardTitle>
          <CardDescription className="capitalize">{riddle.category}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">{getRiddleText()}</p>
        </CardContent>
        {!answered && (
          <CardFooter className="flex flex-col gap-4">
            <div className="w-full space-y-2">
              <Label htmlFor="answer">Your Answer</Label>
              <Input
                id="answer"
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
              />
            </div>
            <Button
              onClick={handleSubmitAnswer}
              disabled={loading || !answer.trim()}
              className="w-full gradient-primary"
            >
              {loading ? "Checking..." : "Submit Answer"}
            </Button>
          </CardFooter>
        )}
        {answered && (
          <CardFooter>
            <div className="w-full space-y-2">
              {isCorrect ? (
                <div className="flex items-center gap-2 text-success p-3 rounded-lg bg-success/10">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Correct! The answer is: {riddle.answer}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-destructive p-3 rounded-lg bg-destructive/10">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">The correct answer was: {riddle.answer}</span>
                </div>
              )}
            </div>
          </CardFooter>
        )}
      </Card>

      {answered && isCorrect && fact && (
        <Card className="shadow-md border-accent/50 animate-celebrate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent" />
              Your Reward: Fun Fact!
            </CardTitle>
            <CardDescription className="capitalize">{fact.category}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed">{fact.fact_text}</p>
            {fact.source && (
              <p className="text-xs text-muted-foreground mt-2">Source: {fact.source}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RiddleCard;
