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

## Novos campos clínicos e anatômicos
- `lesions.body_markers`: pontos de superfície selecionados no modelo 3D, com região e coordenadas locais normalizadas ao modelo.
- `lesions.initial_area_cm2`: área de referência, definida na primeira avaliação que contenha medidas válidas.
- `assessments.area_cm2`: estimativa calculada por comprimento × largura, em cm². A aplicação deve preservar a área original e não recalcular silenciosamente o baseline.

## Sincronização, armazenamento e backups — ainda não provisionados
A conexão do frontend com Supabase não foi ativada. Para habilitar sincronização entre dispositivos será necessário conectar um projeto Supabase autorizado, aplicar o schema em homologação, configurar Auth, políticas RLS, bucket privado e uma camada de sincronização com tratamento de conflitos e fila offline. Não basta apontar o frontend para uma URL e chave.

Para backups institucionais, definir com TI o plano de backup automático/PITR disponível no projeto, retenção, cópia independente criptografada, acesso restrito e testes documentados de restauração. Um bucket de fotografias não é backup do banco; exportação SQL não é backup suficiente sem teste de recuperação. Não armazenar dados clínicos em projeto pessoal ou região não aprovada.
