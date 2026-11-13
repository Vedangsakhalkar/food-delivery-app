-- Rebrand: new orders get codes like TDK-10234 (existing orders keep their old code).
alter table orders alter column code set default ('TDK-' || nextval('order_code_seq'));
