insert into public.roles (name, description)
values
  ('admin', 'Full platform administration access'),
  ('coach', 'Golf coach access to assigned students'),
  ('student', 'Student access to own visible development record'),
  ('parent', 'Parent access to linked junior player records'),
  ('fitness_pt', 'Fitness/PT access to assigned students')
on conflict (name) do nothing;
