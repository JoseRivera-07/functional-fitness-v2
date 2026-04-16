const { createClient } = require('@supabase/supabase-js');

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function verifyToken(token) {
  if (!token) {
    return null;
  }

  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return null;
  }

  return data.user;
}

async function getProfileById(id) {
  if (!id) {
    return null;
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, role, phone')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

module.exports = {
  verifyToken,
  getProfileById,
};
