const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// 환경변수에서 URL과 Service Role Key를 가져옵니다.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey && supabaseUrl !== "your_supabase_url_here") {
  // Service Role Key를 사용하여 권한 우회 접근(RLS 무시)
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("경고: Supabase 환경 변수가 설정되지 않았습니다. DB 저장이 무시됩니다.");
}

module.exports = supabase;
