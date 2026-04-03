import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rtmiqwbgdxndeyvuyeqa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0bWlxd2JnZHhuZGV5dnV5ZXFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NDg4MjIsImV4cCI6MjA5MDUyNDgyMn0.rsUNftymoynWLXuxvFfa7dqYmO9QDJakWYci7rdYzYk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
