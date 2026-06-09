drop policy if exists "profiles_select_authorized" on public.profiles;

create policy "profiles_select_authorized"
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
    or public.can_view_student(id)
    or exists (
      select 1
      from public.coach_student_assignments csa
      where csa.coach_user_id = public.profiles.id
        and csa.status = 'active'
        and csa.start_date <= current_date
        and (csa.end_date is null or csa.end_date >= current_date)
        and (
          auth.uid() = csa.student_user_id
          or public.is_linked_parent(csa.student_user_id)
          or public.is_assigned_coach(csa.student_user_id)
        )
    )
  );
