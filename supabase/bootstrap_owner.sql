-- Bootstrap seguro do primeiro administrador da organização LATAF.
-- Execute no SQL Editor do Supabase SOMENTE após o primeiro usuário criar conta.
-- Substitua o UUID abaixo pelo id do usuário em Authentication > Users.
-- Não habilite cadastro clínico público nem compartilhe este script com tokens.
insert into public.organization_memberships (organization_id, user_id, role, active)
select 'ebf0c3f3-1f81-4fb8-91e5-da4f78b21622'::uuid,
       'SUBSTITUA-PELO-UUID-DO-USUARIO'::uuid,
       'owner',
       true
on conflict (organization_id, user_id)
do update set role = 'owner', active = true;