# Valiataf — Supabase conectado

O frontend utiliza Supabase Auth, PostgreSQL, RLS, Realtime e Storage. O código está no GitHub e pode ser hospedado na Vercel, sem depender do Floot.

## Configuração do frontend
Defina no host:
- VITE_SUPABASE_URL = URL do projeto
- VITE_SUPABASE_PUBLISHABLE_KEY = publishable key (ou legacy anon key)

Não use service_role no frontend.

## Organização e primeiro owner
A organização LATAF já foi criada no projeto. O primeiro owner deve ser adicionado após criar conta, executando `bootstrap_owner.sql` com o UUID do usuário. Depois o owner pode conceder membership aos membros autorizados.

## Auth URLs
No Supabase Dashboard > Authentication > URL Configuration, configure Site URL para a URL final hospedada e adicione a mesma URL como Redirect URL. Para Vercel, inclua também o domínio de preview se necessário.

## Proteção dos dados clínicos
Pacientes devem usar código/pseudônimo. Fotos clínicas ficam no bucket privado `valiataf-clinical-private`, acessível somente a membros ativos. Não use dados identificáveis nem fotos reais antes da aprovação institucional, avaliação de privacidade, revisão de RLS e política de retenção/backup.
