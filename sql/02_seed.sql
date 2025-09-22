insert into public.services (package_id, name, price, cycle)
values
  (null, 'Basic maintenance', 150, 'monthly')        on conflict do nothing,
  (null, 'SEO monitoring',    200, 'monthly')        on conflict do nothing,
  (null, 'One-shot landing',  800, 'one-off')        on conflict do nothing;
