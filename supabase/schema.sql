-- Valiataf / LATAF — schema de referência para Supabase/PostgreSQL.
-- Aplicar somente após aprovação da governança de TI, segurança e privacidade do HULW.
-- Base de arquitetura; o frontend ainda NÃO está conectado.

create extension if not exists pgcrypto;

create table if not exists public.organizations (
 id uuid primary key default gen_random_uuid(), name text not null, created_at timestamptz not null default now()
);
create table if not exists public.organization_memberships (
 organization_id uuid not null references public.organizations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check(role in ('owner','coordinator','nurse','viewer')),
 active boolean not null default true, created_at timestamptz not null default now(),
 primary key(organization_id,user_id)
);
create table if not exists public.patients (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 record_code text not null, display_label text, care_location text, active boolean not null default true,
 created_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), unique(organization_id,record_code)
);
create table if not exists public.lesions (
 id uuid primary key default gen_random_uuid(), patient_id uuid not null references public.patients(id),
 lesion_code text not null, etiology text not null, anatomical_sites text[] not null default '{}',
 anatomical_notes text, started_at date not null default current_date,
 created_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
 unique(patient_id,lesion_code)
);
create table if not exists public.assessments (
 id uuid primary key default gen_random_uuid(), lesion_id uuid not null references public.lesions(id),
 assessed_at timestamptz not null default now(), exudate_type text, exudate_amount text,
 wound_bed text[] not null default '{}', periwound_findings text[] not null default '{}',
 observed_signs text[] not null default '{}', length_cm numeric(7,2) check(length_cm is null or length_cm>=0),
 width_cm numeric(7,2) check(width_cm is null or width_cm>=0), depth_cm numeric(7,2) check(depth_cm is null or depth_cm>=0),
 pain_score smallint check(pain_score between 0 and 10), materials_and_coverings text[] not null default '{}',
 clinical_notes text, created_by uuid not null references auth.users(id), created_at timestamptz not null default now()
);
create table if not exists public.assessment_photos (
 id uuid primary key default gen_random_uuid(), assessment_id uuid not null references public.assessments(id),
 storage_path text not null unique, original_filename text, mime_type text not null,
 byte_size bigint check(byte_size>0), captured_at timestamptz,
 created_by uuid not null references auth.users(id), created_at timestamptz not null default now()
);

create index if not exists lesions_patient_id_idx on public.lesions(patient_id);
create index if not exists assessments_lesion_date_idx on public.assessments(lesion_id,assessed_at desc);
create index if not exists patients_org_idx on public.patients(organization_id);

create or replace function public.is_org_member(target_org uuid)
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.organization_memberships m where m.organization_id=target_org and m.user_id=auth.uid() and m.active); $$;
create or replace function public.can_manage_org(target_org uuid)
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.organization_memberships m where m.organization_id=target_org and m.user_id=auth.uid() and m.active and m.role in ('owner','coordinator','nurse')); $$;
create or replace function public.can_access_patient(target_patient uuid)
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.patients p join public.organization_memberships m on m.organization_id=p.organization_id where p.id=target_patient and m.user_id=auth.uid() and m.active); $$;
create or replace function public.can_manage_patient(target_patient uuid)
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.patients p join public.organization_memberships m on m.organization_id=p.organization_id where p.id=target_patient and m.user_id=auth.uid() and m.active and m.role in ('owner','coordinator','nurse')); $$;
create or replace function public.can_access_lesion(target_lesion uuid)
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.lesions l where l.id=target_lesion and public.can_access_patient(l.patient_id)); $$;
create or replace function public.can_manage_lesion(target_lesion uuid)
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.lesions l where l.id=target_lesion and public.can_manage_patient(l.patient_id)); $$;
create or replace function public.can_access_assessment(target_assessment uuid)
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.assessments a where a.id=target_assessment and public.can_access_lesion(a.lesion_id)); $$;

alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.patients enable row level security;
alter table public.lesions enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_photos enable row level security;

drop policy if exists org_member_read on public.organizations;
create policy org_member_read on public.organizations for select to authenticated using(public.is_org_member(id));
drop policy if exists membership_read on public.organization_memberships;
create policy membership_read on public.organization_memberships for select to authenticated using(user_id=auth.uid() or public.is_org_member(organization_id));
drop policy if exists patient_read on public.patients;
create policy patient_read on public.patients for select to authenticated using(public.is_org_member(organization_id));
drop policy if exists patient_insert on public.patients;
create policy patient_insert on public.patients for insert to authenticated with check(public.can_manage_org(organization_id) and created_by=auth.uid());
drop policy if exists patient_update on public.patients;
create policy patient_update on public.patients for update to authenticated using(public.can_manage_org(organization_id)) with check(public.can_manage_org(organization_id));
drop policy if exists lesion_read on public.lesions;
create policy lesion_read on public.lesions for select to authenticated using(public.can_access_patient(patient_id));
drop policy if exists lesion_insert on public.lesions;
create policy lesion_insert on public.lesions for insert to authenticated with check(public.can_manage_patient(patient_id) and created_by=auth.uid());
drop policy if exists lesion_update on public.lesions;
create policy lesion_update on public.lesions for update to authenticated using(public.can_manage_patient(patient_id)) with check(public.can_manage_patient(patient_id));
drop policy if exists assessment_read on public.assessments;
create policy assessment_read on public.assessments for select to authenticated using(public.can_access_lesion(lesion_id));
drop policy if exists assessment_insert on public.assessments;
create policy assessment_insert on public.assessments for insert to authenticated with check(public.can_manage_lesion(lesion_id) and created_by=auth.uid());
create or replace function public.can_manage_assessment(target_assessment uuid)
returns boolean language sql stable security definer set search_path=public
as $ select exists(select 1 from public.assessments a where a.id=target_assessment and public.can_manage_lesion(a.lesion_id)); $;
create or replace function public.can_manage_org_text(target_org text)
returns boolean language sql stable security definer set search_path=public
as $ select exists(select 1 from public.organization_memberships m where m.organization_id::text=target_org and m.user_id=auth.uid() and m.active and m.role in ('owner','coordinator','nurse')); $;
\ndrop policy if exists photo_read on public.assessment_photos;
create policy photo_read on public.assessment_photos for select to authenticated using(public.can_access_assessment(assessment_id));
drop policy if exists photo_insert on public.assessment_photos;
create policy photo_insert on public.assessment_photos for insert to authenticated with check(public.can_manage_assessment(assessment_id) and created_by=auth.uid());

-- Avaliações e metadados fotográficos não recebem policies UPDATE/DELETE: append-only.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('valiat-af-private','valiat-af-private',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
create or replace function public.is_org_member_text(target_org text)
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.organization_memberships m where m.organization_id::text=target_org and m.user_id=auth.uid() and m.active); $$;
drop policy if exists valiat_af_photo_read on storage.objects;
create policy valiat_af_photo_read on storage.objects for select to authenticated using(bucket_id='valiat-af-private' and public.is_org_member_text(split_part(name,'/',1)));
drop policy if exists valiat_af_photo_insert on storage.objects;
create policy valiat_af_photo_insert on storage.objects for insert to authenticated with check(bucket_id='valiat-af-private' and public.can_manage_org_text(split_part(name,'/',1)));

-- Criar organização e primeiro owner por procedimento administrativo aprovado.
-- Revisar permissões, retenção, backups, MFA, logs e LGPD antes de qualquer piloto.
