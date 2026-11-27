-- Opiniones de los papás al terminar la llamada.
-- Correr una sola vez en Supabase > SQL Editor. Es seguro correrlo de nuevo.

create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  puntaje smallint not null check (puntaje between 1 and 5),
  comentario text check (char_length(comentario) <= 400),
  permite_testimonio boolean not null default false,
  edad smallint,
  acento text,
  con_codigo boolean not null default false
);

-- Solo el servidor (service role) puede leer o escribir
alter table public.feedback enable row level security;

-- Para ver el resumen: select puntaje, count(*) from feedback group by puntaje order by puntaje;
