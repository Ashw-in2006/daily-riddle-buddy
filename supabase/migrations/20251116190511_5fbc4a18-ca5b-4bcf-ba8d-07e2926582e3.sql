-- Create enum for language preferences
CREATE TYPE language_type AS ENUM ('en', 'ta', 'ta_en');

-- Create users/profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  zoho_id TEXT,
  language language_type NOT NULL DEFAULT 'en',
  preferred_time TIME NOT NULL DEFAULT '17:00:00',
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_answered_date DATE,
  last_riddle_id UUID,
  total_correct INTEGER NOT NULL DEFAULT 0,
  push_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create riddles table
CREATE TABLE public.riddles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text_en TEXT NOT NULL,
  text_ta TEXT NOT NULL,
  text_ta_en TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create facts table (rewards)
CREATE TABLE public.facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fact_text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'tech',
  source TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create followers table
CREATE TABLE public.followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  follow_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  earned_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_riddles table to track daily riddles per user
CREATE TABLE public.user_riddles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  riddle_id UUID NOT NULL REFERENCES public.riddles(id) ON DELETE CASCADE,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  answered_at TIMESTAMPTZ,
  is_correct BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, assigned_date)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riddles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_riddles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for riddles (read-only for users)
CREATE POLICY "Anyone can view active riddles"
  ON public.riddles FOR SELECT
  USING (active = true);

-- RLS Policies for facts (read-only for users)
CREATE POLICY "Anyone can view active facts"
  ON public.facts FOR SELECT
  USING (active = true);

-- RLS Policies for followers
CREATE POLICY "Users can view all followers"
  ON public.followers FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON public.followers FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.followers FOR DELETE
  USING (auth.uid() = follower_id);

-- RLS Policies for achievements
CREATE POLICY "Users can view all achievements"
  ON public.achievements FOR SELECT
  USING (true);

-- RLS Policies for user_riddles
CREATE POLICY "Users can view their own riddles"
  ON public.user_riddles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own riddles"
  ON public.user_riddles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, language, preferred_time)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'language')::language_type, 'en'),
    COALESCE((NEW.raw_user_meta_data->>'preferred_time')::TIME, '17:00:00')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key for last_riddle_id (after riddles table exists)
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_last_riddle
  FOREIGN KEY (last_riddle_id)
  REFERENCES public.riddles(id)
  ON DELETE SET NULL;

-- Insert some initial riddles
INSERT INTO public.riddles (text_en, text_ta, text_ta_en, answer, category) VALUES
('I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?', 'நான் வாய் இல்லாமல் பேசுகிறேன், காது இல்லாமல் கேட்கிறேன். எனக்கு உடல் இல்லை, ஆனால் காற்றுடன் உயிர் பெறுகிறேன். நான் யார்?', 'Naan vaai illaamal pesugireen, kaadhu illaamal ketkkireen. Enakku udal illai, aanaal kaatrudan uyir perukireen. Naan yaar?', 'Echo', 'tech'),
('The more you take, the more you leave behind. What am I?', 'நீங்கள் எடுக்க எடுக்க, அதிகமாக விட்டுச் செல்கிறீர்கள். நான் யார்?', 'Neengal edukka edukka, adhigamaaga vittu selgireergal. Naan yaar?', 'Footsteps', 'general'),
('I am not alive, but I grow. I do not have lungs, but I need air. What am I?', 'நான் உயிருடன் இல்லை, ஆனால் வளர்கிறேன். எனக்கு நுரையீரல் இல்லை, ஆனால் காற்று தேவை. நான் யார்?', 'Naan uyirudan illai, aanaal valargiren. Enakku nuraiyeeral illai, aanaal kaatru theevai. Naan yaar?', 'Fire', 'science'),
('What can travel around the world while staying in a corner?', 'ஒரு மூலையில் இருந்து உலகம் முழுவதும் பயணிக்க முடியும்?', 'Oru moolaiyil irundhu ulagam muzhuvathum payanikka mudiyum?', 'Stamp', 'general'),
('I have keys but no locks. I have space but no room. You can enter but cannot go inside. What am I?', 'எனக்கு விசைகள் உள்ளன ஆனால் பூட்டுகள் இல்லை. எனக்கு இடம் உள்ளது ஆனால் அறை இல்லை. நீங்கள் நுழையலாம் ஆனால் உள்ளே செல்ல முடியாது. நான் யார்?', 'Enakku visaigal ullana aanaal pootugal illai. Enakku idam ulladhu aanaal arai illai. Neengal nuzhayalaam aanaal ulle sella mudiyaadhu. Naan yaar?', 'Keyboard', 'tech');

-- Insert some initial facts
INSERT INTO public.facts (fact_text, category, source) VALUES
('The first computer virus was created in 1983 and was called "Elk Cloner". It infected Apple II computers via floppy disks.', 'tech', 'Computer History Museum'),
('Scientists have discovered that octopuses have three hearts and blue blood. Two hearts pump blood to the gills, while the third pumps it to the rest of the body.', 'science', 'Marine Biology Research'),
('In the movie "Blade Runner", the artificial beings are called "replicants" and have a built-in 4-year lifespan to prevent them from developing emotions.', 'sci-fi', 'Film Studies'),
('The term "byte" was coined by Werner Buchholz in 1956. It was deliberately spelled with a "y" to avoid confusion with "bit".', 'tech', 'IBM Archives'),
('If you could fold a piece of paper 42 times, it would reach the moon. Each fold doubles the thickness exponentially.', 'science', 'Mathematics Journal');