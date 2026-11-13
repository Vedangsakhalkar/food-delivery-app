-- Trigram indexes make ILIKE '%term%' searches on names fast.
create extension if not exists pg_trgm;

create index if not exists restaurants_name_trgm_idx on restaurants using gin (lower(name) gin_trgm_ops);
create index if not exists restaurants_cuisine_trgm_idx on restaurants using gin (lower(cuisine) gin_trgm_ops);
create index if not exists menu_items_name_trgm_idx on menu_items using gin (lower(name) gin_trgm_ops);
