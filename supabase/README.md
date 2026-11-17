# Backend institucional — Valiataf

O frontend atual NÃO está conectado ao backend. O SQL é uma proposta técnica para revisão por TI, segurança da informação, encarregado de dados e equipe clínica do HULW/LATAF.

## Arquitetura proposta
- Supabase Auth para identidade e autenticação multifator, após configuração institucional.
- PostgreSQL com Row Level Security e vínculo explícito de usuários à organização.
- Bucket privado para fotografias; sem URLs públicas.
- Avaliações e metadados fotográficos sem permissões UPDATE/DELETE no primeiro desenho (histórico append-only).
- Perfis previstos: owner, coordinator, nurse e viewer. Validar a matriz real com o hospital.
- Identificação pseudonimizada no banco sempre que possível; evitar nome/CPF como código de registro.

## Etapas ainda necessárias
1. Aprovação formal do HULW e definição de controlador/operador, base legal, finalidade, retenção e fluxo de direitos do titular.
2. Revisão de segurança do SQL/RLS e teste de isolamento entre organizações.
3. Provisionar projeto institucional em região aprovada, aplicar schema.sql em homologação e configurar backups/recuperação.
4. Configurar MFA, convites, recuperação de conta, encerramento de sessão, auditoria e revisão periódica de acessos.
5. Criar o vínculo inicial de owner por procedimento administrativo documentado (sem cadastro público).
6. Definir armazenamento, validação de MIME, antivírus, trilha de acesso e retenção das imagens.
7. Conectar o frontend com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY somente após aprovação; nunca expor service-role key no navegador.
8. Executar testes de segurança, acessibilidade, usabilidade e validação clínica antes de qualquer piloto.

## Protótipo atual
- Persistência local no navegador via localStorage, somente para dados fictícios.
- Fotografias comprimidas e armazenadas junto aos dados locais; podem atingir a quota do navegador.
- App-shell PWA em cache após a primeira visita, permitindo abrir a interface offline em navegadores compatíveis.
- Isso NÃO equivale a sincronização offline segura, armazenamento institucional, controle de acesso ou backup.
- PDF é gerado pela função Imprimir do navegador (destino Salvar como PDF), não é documento clínico certificado.
