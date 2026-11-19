# Valiataf — migração Firebase (em andamento)

Esta branch prepara a autenticação Firebase. **Não está publicada e não substitui o sistema atual.**

## O que está preparado
- SDK oficial Firebase Web instalado.
- Inicialização Firebase via variáveis VITE_FIREBASE_* (sem credenciais privadas no código).
- Idioma da autenticação definido como pt-BR.

## Necessário antes de ativar
1. Criar um projeto Firebase pertencente à LATAF/gestão autorizada.
2. Ativar Authentication > Sign-in method > Email/Password.
3. Registrar um app Web e copiar a configuração pública para um arquivo local `.env` baseado em `.env.example`.
4. Configurar o domínio autorizado do site no Firebase Authentication.
5. Implementar e testar cadastro, login, recuperação de senha, aprovação de membros e regras de acesso.
6. Migrar os dados para Firestore/Cloud Storage com regras de segurança revisadas; não copiar registros clínicos reais até haver aprovação institucional e avaliação LGPD.

## Limitações do protótipo atual
O app encontrado neste repositório mantém pacientes e fotos no localStorage e contém pacientes demonstrativos. Não há backend conectado nem sincronização. O schema em `supabase/schema.sql` é apenas uma proposta, não um banco ativo. Não importar dados clínicos reais neste estado.

## Recuperação de senha
O Firebase Authentication fornece o fluxo `sendPasswordResetEmail`, enviando o link de redefinição pela infraestrutura do Firebase/Google. A documentação oficial: https://firebase.google.com/docs/auth/web/manage-users.
