
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qugweelgvascflcmujfl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1Z3dlZWxndmFzY2ZsY211amZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODAwNTQsImV4cCI6MjA4NDA1NjA1NH0.6Ey2PaAU6lijOlauL7f5AnXv7gwEDgAHJZds8pgp2IQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
