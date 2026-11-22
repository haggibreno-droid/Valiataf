# Valiataf · LATAF UFPB

Aplicação React + Vite + TypeScript, com Supabase Auth, PostgreSQL, Row Level Security, Realtime e Storage privado. O desenvolvimento e deploy são independentes do Floot.

## Funcionalidades
- Cadastro, login e recuperação de senha por e-mail.
- Perfis de membros, comunidade, publicações, comentários, curtidas e conexões.
- Conversas privadas, notificações e atualização em tempo real.
- Registros de pacientes pseudonimizados, lesões, avaliação longitudinal, modelo anatômico 3D e fotos privadas.
- Biblioteca educativa de feridas com progresso e questões.
- Relatórios para impressão/PDF.

## Configuração local
1. Use Node.js 20 ou superior.
2. Copie `.env.example` para `.env.local`.
3. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` com os valores do projeto Supabase.
4. Execute `npm install`, depois `npm run dev`.
5. Para validar: `npm run build`.

A publishable/anon key pode estar no frontend; a service-role key NUNCA pode ser usada no navegador. Toda tabela e bucket precisa de RLS/policies adequadas.

## Primeiro acesso da equipe clínica
O schema cria a organização LATAF, mas não concede automaticamente acesso clínico a qualquer pessoa que se cadastre. Após o primeiro usuário autorizado criar conta, um administrador deve executar `supabase/bootstrap_owner.sql` no SQL Editor, substituindo o UUID pelo id do usuário em Authentication > Users. Depois, o owner pode cadastrar os demais membros por procedimento administrativo seguro.

## Deploy
Conecte este repositório ao Vercel (ou outro host estático) e configure as duas variáveis de ambiente acima. Em Supabase Authentication > URL Configuration, adicione a URL final do site em Site URL e Redirect URLs para recuperação de senha e autenticação.

## Segurança e uso clínico
Este é um protótipo acadêmico, não um prontuário homologado. Não registre dados identificáveis nem fotos reais de pacientes até aprovação institucional, revisão independente de RLS, definição de controlador/operador, base legal, consentimento quando aplicável, retenção, backup e recuperação. O armazenamento clínico é privado e acessível apenas a membros ativos da organização.