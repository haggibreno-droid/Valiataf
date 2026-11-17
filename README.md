# Valiataf · LATAF

Protótipo de apoio ao registro e acompanhamento longitudinal de feridas, desenvolvido para discussão de fluxo com a LATAF.

## Rodar localmente
```bash
npm install
npm run dev
```

## Funcionalidades demonstrativas
- [x] Painel, cadastro e pesquisa de pacientes fictícios.
- [x] Perfil individual com múltiplas lesões.
- [x] Modelo corporal 3D interativo, rotacionável e aproximável, com marcação de pontos na superfície e registro de região anatômica + coordenadas locais.
- [x] Registro de etiologia, exsudato, leito, área perilesional, sinais observados, medidas, dor e materiais/coberturas.
- [x] Cálculo demonstrativo da área aproximada (comprimento × largura) e variação percentual frente à primeira área medida, mostrando também aumento de área.
- [x] Histórico cronológico de avaliações por lesão.
- [x] Anexar imagens às avaliações (compressão no navegador) e comparar duas imagens da mesma lesão.
- [x] Persistência local demonstrativa via localStorage.
- [x] Relatório consolidado com opção Imprimir / Salvar como PDF pelo navegador.
- [x] PWA com cache do app-shell para reabertura offline após a primeira visita em navegadores compatíveis.
- [x] Esboço de schema PostgreSQL/Supabase com RLS e bucket privado em supabase/.

## Limites importantes
- Os dados e fotografias ficam somente no navegador deste dispositivo. Não há servidor, autenticação, backup, controle institucional de acesso nem sincronização entre dispositivos.
- O cache offline só disponibiliza a interface já carregada; não é sincronização offline segura.
- O PDF é uma impressão demonstrativa, não documento clínico certificado nem integração com prontuário.
- O SQL em supabase/schema.sql é uma proposta para revisão, não foi aplicado ou testado em projeto Supabase.
- Não inserir dados pessoais, identificadores ou imagens de pacientes reais.
- Opções clínicas são exemplos para prototipagem e precisam de validação da equipe LATAF.
- A implantação exige aprovação institucional, governança de dados, análise de segurança, LGPD, validação clínica e testes de RLS.

## CI
O GitHub Actions executa npm install e npm run build em pushes e pull requests para main.


## Atualização de interface
O modelo corporal 3D é carregado sob demanda para reduzir o JavaScript inicial. A compilação e a revisão das dependências são verificadas pelo workflow de CI.


## Segurança das dependências
A árvore de ferramentas de desenvolvimento do Vite ainda é sinalizada pelo aviso GHSA-fc5q-39xc-vjpf em `picomatch` (ReDoS; versões até 4.0.7). Na data desta revisão, o registro npm consultado ainda aponta 4.0.7 como versão mais recente e o aviso não declara uma versão corrigida. A dependência é transitiva de ferramentas de build e não integra o bundle entregue ao navegador; por isso o CI audita também as dependências de produção separadamente. Não use padrões glob fornecidos por usuários como entrada de ferramentas de build.
