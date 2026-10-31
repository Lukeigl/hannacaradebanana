# Espaço de estudo protegido

Entrada: `/estudos/`. O HTML de estudo, questões, respostas e imagens estão em `content.enc.json`, cifrados com AES-256-GCM e chave derivada via PBKDF2-SHA256 (600.000 iterações; salt e IV aleatórios). O nome de usuário normalizado também participa da derivação. Nada é liberado com credenciais incorretas. Nenhuma senha é armazenada em código ou navegador.

É um desbloqueio criptográfico local, não autenticação de servidor. Quem possuir as credenciais pode ler e copiar o conteúdo. Arquivos cifrados podem ser baixados e submetidos a tentativas offline; a resistência depende da senha. Troca de senha exige novo pacote e não revoga cópias anteriores. Não há recuperação de senha nem sincronização entre dispositivos.

Progresso e rascunhos ficam no navegador do aluno. Quando o storage não está disponível, a sessão continua na memória. Sair fecha o material e recarregar exige novo desbloqueio.

## Manutenção sem publicar conteúdo legível
Use `node scripts/study-package.mjs`, enviando por stdin um objeto JSON com `mode` (`decrypt` ou `encrypt`), `user`, `password`, `input` e `output`. Receba as credenciais por prompt oculto do ambiente; nunca use argumentos de shell ou arquivo de senha. Na descriptografia, `input` é `estudos/content.enc.json` e `output` deve ficar **fora do repositório**. Edite esse HTML privado, cifre novamente e publique apenas o pacote. Jamais commitar o HTML aberto, screenshots após login, PDFs de alunos ou credenciais. Os testes usam credenciais fictícias.

## Verificação
`node --test tests/*.test.mjs`

Os materiais identificam a bibliografia curricular indicada e fontes complementares. Não são reprodução do livro nem gabarito oficial. As questões adaptadas distinguem enunciados enviados de exercícios inéditos.

## Experiência ampliada
Aulas guiadas em seis etapas, leitura completa, tabelas vasculares pesquisáveis, atlas comentado, reconstrução de trajetos, 160 objetivas e 60 discursivas. Etapas concluídas indicam autoacompanhamento, não domínio demonstrado. Preferências de leitura, casos e progresso usam o armazenamento local existente.

A importação do módulo genérico no HTML cifrado inclui uma versão na query string. Ao alterar suas exportações, atualize essa versão para evitar incompatibilidade com caches antigos.

## Atlas em português
As dez pranchas históricas receberam referências numeradas com legendas em português; o diagrama do estômago já estava em português. As descrições foram revisadas. O visualizador oferece ampliação e comparação com os originais. As traduções usam camadas manuais sobre os arquivos originais, sem redesenho generativo. Inscrições históricas residuais podem permanecer no fundo da gravura; a legenda de estudo fica disponível em texto legível.

As fontes privadas incluem `localize-plates.mjs` e `localized/manifest.json`, com posições das inscrições e hashes dos originais. Reconstrua as pranchas com `node localize-plates.mjs` antes de `node build.mjs`. Publique somente o pacote cifrado, mantendo essas fontes fora do repositório público.

## Fisiologia e biofísica · M2
Oito aulas de fisiologia cardiovascular integradas às doze de anatomia, com 64 novas questões disponíveis também em flashcards e simulados, 24 novas discursivas, oito diagramas autorais e quatro trajetos adicionais. Total: 20 aulas, 120 etapas guiadas, 160 objetivas, 60 discursivas, 19 imagens e 16 trajetos. As aulas fisiológicas usam etapas próprias de conceitos, mecanismos e aplicação. O conteúdo anterior e seus identificadores de progresso foram preservados.
