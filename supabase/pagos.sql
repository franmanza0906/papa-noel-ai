-- Pagos con Mercado Pago: tabla de pases y funciones para usarlos.
-- Correr una sola vez en Supabase > SQL Editor. Es seguro correrlo de nuevo.

create table if not exists public.pases (
  codigo text primary key,
  pack text not null,
  llamadas_restantes integer not null default 0,
  duracion_segundos integer not null default 90
);

alter table public.pases add column if not exists payment_id text;
alter table public.pases add column if not exists external_reference text;
alter table public.pases add column if not exists monto numeric;
alter table public.pases add column if not exists created_at timestamptz not null default now();

-- Un pago genera un solo pase (evita duplicados si el webhook llega dos veces)
create unique index if not exists pases_payment_id_key on public.pases (payment_id);
create index if not exists pases_external_reference_idx on public.pases (external_reference);

-- Solo el servidor (service role) puede leer o escribir pases
alter table public.pases enable row level security;

-- Descuenta una llamada de forma atómica. Devuelve la fila solo si quedaba alguna.
create or replace function public.usar_pase(p_codigo text)
returns table (duracion_segundos integer, llamadas_restantes integer)
language sql
as $$
  update public.pases
     set llamadas_restantes = pases.llamadas_restantes - 1
   where pases.codigo = upper(p_codigo)
     and pases.llamadas_restantes > 0
  returning pases.duracion_segundos, pases.llamadas_restantes;
$$;

-- Devuelve la llamada si ElevenLabs falló al conectar
create or replace function public.devolver_pase(p_codigo text)
returns void
language sql
as $$
  update public.pases
     set llamadas_restantes = pases.llamadas_restantes + 1
   where pases.codigo = upper(p_codigo);
$$;

revoke execute on function public.usar_pase(text) from anon, authenticated;
revoke execute on function public.devolver_pase(text) from anon, authenticated;
