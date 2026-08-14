create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  if tg_table_name = 'courses'
    and (to_jsonb(new) - 'updated_at' - 'enrolled_count')
      = (to_jsonb(old) - 'updated_at' - 'enrolled_count')
  then
    new.updated_at = old.updated_at;
  else
    new.updated_at = now();
  end if;

  return new;
end;
$$;

create or replace function public.refresh_course_enrolled_count(target_course_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.courses
  set enrolled_count = (
    select count(*)::integer
    from public.enrollments
    where enrollments.course_id = target_course_id
  )
  where id = target_course_id;
end;
$$;

create or replace function public.sync_course_enrolled_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.refresh_course_enrolled_count(new.course_id);
    return new;
  end if;

  if tg_op = 'DELETE' then
    perform public.refresh_course_enrolled_count(old.course_id);
    return old;
  end if;

  if tg_op = 'UPDATE' and old.course_id is distinct from new.course_id then
    perform public.refresh_course_enrolled_count(old.course_id);
    perform public.refresh_course_enrolled_count(new.course_id);
  end if;

  return new;
end;
$$;

drop trigger if exists enrollments_sync_course_enrolled_count on public.enrollments;

create trigger enrollments_sync_course_enrolled_count
after insert or update of course_id or delete on public.enrollments
for each row execute function public.sync_course_enrolled_count();

update public.courses
set enrolled_count = counts.enrolled_count
from (
  select
    courses.id,
    count(enrollments.id)::integer as enrolled_count
  from public.courses
  left join public.enrollments on enrollments.course_id = courses.id
  group by courses.id
) as counts
where courses.id = counts.id;
