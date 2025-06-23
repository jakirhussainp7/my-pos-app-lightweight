import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mzcezzzuzvvwxfszaalp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16Y2V6enp1enZ2d3hmc3phYWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzNTcsImV4cCI6MjA2NTk4MTM1N30.3QMYn6NCSY273xxOEJfIyyaYHdb00DItGHIIrT2pgAM'
export const supabase = createClient(supabaseUrl, supabaseKey)