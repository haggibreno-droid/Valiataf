# Valiataf · LATAF UFPB

Aplicação React + Vite + TypeScript com Firebase Authentication, Firestore e Storage.

## Módulos implementados nesta reconstrução
- Autenticação por e-mail/senha e recuperação de senha.
- Cadastro e pesquisa de pacientes.
- Cadastro de lesões com localização anatômica e modelo corporal 3D.
- Avaliações longitudinais com medidas, dor, exsudato, leito, pele perilesional, sinais observados, coberturas, notas e fotografias.
- Histórico e galeria de evolução fotográfica.
- Relatórios resumidos com impressão/PDF.
- Perfis de membros, mural, solicitações de conexão e mensagens privadas.
- Persistência em nuvem via Firestore e fotografias no Firebase Storage.

## Configuração
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Ative Authentication > Email/Password.
3. Crie Firestore Database e Storage.
4. Copie `.env.example` para `.env.local` e preencha as seis variáveis VITE_FIREBASE_* com a configuração do app Web.
5. Publique as regras iniciais: `firebase deploy --only firestore:rules,storage`.
6. Instale e execute: `npm install`, `npm run dev`. Valide com `npm run build`.

## Hospedagem
O build é gerado em `dist`. Configure as seis variáveis VITE_FIREBASE_* no provedor de hospedagem antes de publicar. A URL pública depende de habilitar o provedor e configurar as credenciais de produção.

## Segurança, LGPD e validação institucional
Esta versão é uma reconstrução funcional em desenvolvimento, **não é um prontuário clínico homologado**. Não insira dados identificáveis nem fotografias reais de pacientes. Antes de qualquer uso real, a UFPB/LATAF precisa autorizar formalmente o tratamento, definir controlador/operador, base legal, consentimento quando aplicável, política de retenção, papéis e permissões, e realizar revisão independente das regras Firebase.

As regras fornecidas são uma base inicial, não uma política final de produção. A leitura clínica ainda precisa ser limitada por equipe/papel e as solicitações de amizade/mensagens precisam de revisão contra abuso. O cadastro ainda não possui aprovação administrativa. O modelo 3D é um localizador aproximado, não substitui documentação anatômica validada. As opções clínicas devem ser revisadas pelos responsáveis da comissão.

**Não utilize dados reais até concluir a revisão de segurança, testes de autorização, validação clínica e aprovação institucional.**
