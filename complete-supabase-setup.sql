-- ==========================================
-- 🏆 LeetCode Contest Auto-Tracker Database
-- Complete Setup with Target Users
-- ==========================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS user_contest_results CASCADE;
DROP TABLE IF EXISTS contest_stats CASCADE;
DROP TABLE IF EXISTS contests CASCADE;
DROP TABLE IF EXISTS target_users CASCADE;

-- Create target_users table
CREATE TABLE target_users (
    id BIGSERIAL PRIMARY KEY,
    leetcode_id TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contests table  
CREATE TABLE contests (
    id BIGSERIAL PRIMARY KEY,
    contest_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    contest_type TEXT CHECK (contest_type IN ('weekly', 'biweekly')) NOT NULL,
    total_participants INTEGER,
    data_fetched BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_contest_results table
CREATE TABLE user_contest_results (
    id BIGSERIAL PRIMARY KEY,
    contest_id TEXT NOT NULL REFERENCES contests(contest_id) ON DELETE CASCADE,
    leetcode_id TEXT NOT NULL REFERENCES target_users(leetcode_id) ON DELETE CASCADE,
    rank INTEGER,
    score INTEGER,
    finish_time INTEGER, -- in seconds
    problems_solved INTEGER DEFAULT 0,
    matched_variation TEXT, -- if username was found with variations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(contest_id, leetcode_id)
);

-- Create contest_stats table
CREATE TABLE contest_stats (
    id BIGSERIAL PRIMARY KEY,
    contest_id TEXT UNIQUE NOT NULL REFERENCES contests(contest_id) ON DELETE CASCADE,
    target_users INTEGER NOT NULL DEFAULT 0,
    found_users INTEGER NOT NULL DEFAULT 0,
    not_found_users INTEGER NOT NULL DEFAULT 0,
    success_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    max_score INTEGER,
    min_score INTEGER,
    avg_score DECIMAL(8,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_contests_start_time ON contests(start_time);
CREATE INDEX idx_contests_type ON contests(contest_type);
CREATE INDEX idx_contests_data_fetched ON contests(data_fetched);
CREATE INDEX idx_user_contest_results_contest_id ON user_contest_results(contest_id);
CREATE INDEX idx_user_contest_results_leetcode_id ON user_contest_results(leetcode_id);
CREATE INDEX idx_user_contest_results_rank ON user_contest_results(rank);
CREATE INDEX idx_target_users_leetcode_id ON target_users(leetcode_id);

-- Create trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_target_users_updated_at BEFORE UPDATE ON target_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contests_updated_at BEFORE UPDATE ON contests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contest_stats_updated_at BEFORE UPDATE ON contest_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert all 61 target users
INSERT INTO target_users (leetcode_id, display_name) VALUES
('Abijith_U', 'ABIJITH U'),
('Abinav_Kishore', 'ABINAV KISHORE R S'),
('aditi_baskaran', 'ADITI BASKARAN'),
('Akila_Sriniddhi', 'AKILA SRINIDDHI N'),
('amoghvj', 'AMOGH VIJAY'),
('Ashwa_govi1', 'ASHWANTHIKA GOVINDARAJA'),
('balarathi_p', 'BALARATHI P'),
('Barkavi_010', 'BARKAVI R'),
('blessow', 'BLESSOW M'),
('VEDHADEVAREDDY', 'DEVAREDDY VEDHA'),
('Dhiva257', 'DHIVASHINI R'),
('GOKUL J', 'GOKUL J'),
('Gokul__0', 'GOKUL V'),
('Hemhalatha06', 'HEMHALATHA V R'),
('hemprasath80', 'HEMPRASATH SANKAR'),
('irfanullahbaig', 'IRFANULLAH BAIG N'),
('ISHANTHLEEMAN I', 'I ISHANTH LEEMAN'),
('MRIDINIJ', 'J MRIDINI'),
('Suraj0517', 'J SURAJ'),
('Yathish_2006', 'J YATHISH'),
('jack-v14', 'JACK V'),
('Jaiganesh16', 'JAIGANESH S'),
('jeevapriyan10', 'JEEVA PRIYAN R'),
('Mohit75', 'K MOHIT'),
('shashanthk', 'K SHASHANTH'),
('KanishJebaMathewM', 'KANISH JEBA MATHEW M'),
('mkaushikkavindra ', 'KAUSHIK KAVINDRA M'),
('kaysav18', 'KAYSAV PIRANAV P'),
('Keerthana_K_S', 'KEERTHANA K S'),
('Madhesh2007 ', 'L MADHESH'),
('Lokith_S', 'LOKITH S'),
('bhuvaneswar_123_new', 'M BHUVANESWAR'),
('Manoj_2007', 'MANOJ SHIVPRASAD S'),
('nasht123', 'NATASHA PATNAIK'),
('navdeep90', 'NAVDEEP R'),
('nithishkumar31', 'NITHISHKUMAR B'),
('2AsN9Z6O5Q', 'PEBIN JOSEPH A'),
('Pio_Godwin', 'PIO GODWIN M'),
('v_s_poovendhiran ', 'POOVENDHIRAN V S'),
('PREETHIKHA_S', 'PREETHIKHA S'),
('Prrajan_saravanan', 'PRRAJAN SARAVANAN'),
('prabanjanm', 'PRABANJAN M'),
('R_KIRTHANA', 'R KIRTHANA'),
('ragavi632007', 'RAGAVI B'),
('rohithjagan', 'ROHITH JAGAN'),
('Sivahari_S', 'S SIVAHARI'),
('SaajidAhamed', 'SAAJID AHAMED'),
('Safira_Begum', 'SAFIRA BEGUM A'),
('kuK41YJxBS', 'SANJAY S'),
('sellamuthu2007', 'SELLAMUTHU R'),
('senthamizhselvan-sm_cse-N', 'SENTHAMIZHSELVAN S'),
('Sreenithi369', 'SREENITHI R'),
('SrijaaiM', 'SRI JAAI MEENAKSHI M'),
('sukesh-2006', 'SUKESH M'),
('barath80', 'SUNKIREDDY BARATH'),
('SYLESH_', 'SYLESH P'),
('sutharsan07', 'T P SUTHARSAN'),
('tharunraaj7', 'THARUN RAAJ D A'),
('prannav_cse19', 'V G PRANNAV'),
('Rishi1201', 'V RISHITHARAN'),
('Vijitha_M', 'VIJITHA M');

-- Insert sample contest (Contest 460) for testing
INSERT INTO contests (contest_id, title, start_time, contest_type, total_participants, data_fetched) VALUES
('460', 'Weekly Contest 460', '2024-10-13 08:00:00+05:30', 'weekly', 5577, true);

-- Verify the setup
SELECT 
    'target_users' as table_name, 
    COUNT(*) as record_count 
FROM target_users
UNION ALL
SELECT 
    'contests' as table_name, 
    COUNT(*) as record_count 
FROM contests;

-- Display all target users for verification
SELECT 
    ROW_NUMBER() OVER (ORDER BY display_name) as position,
    leetcode_id,
    display_name,
    created_at
FROM target_users 
ORDER BY display_name;

-- ==========================================
-- 🎉 Setup Complete!
-- 
-- Your database now contains:
-- ✅ All 4 required tables
-- ✅ All 61 target users
-- ✅ Proper indexes for performance
-- ✅ Triggers for timestamp updates
-- ✅ Sample contest data
--
-- Ready for automated contest tracking! 🚀
-- ==========================================
