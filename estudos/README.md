# Espaço de estudo protegido

Entrada: `/estudos/`. O HTML de estudo, questões, respostas e imagens estão em `content.enc.json`, cifrados com AES-256-GCM e chave derivada via PBKDF2-SHA256 (600.000 iterações; salt e IV aleatórios). O nome de usuário normalizado também participa da derivação. Nada é liberado com credenciais incorretas. Nenhuma senha é armazenada em código ou navegador.

É um desbloqueio criptográfico local, não autenticação de servidor. Quem possuir as credenciais pode ler e copiar o conteúdo. Arquivos cifrados podem ser baixados e submetidos a tentativas offline; a resistência depende da senha. Troca de senha exige novo pacote e não revoga cópias anteriores. Não há recuperação de senha nem sincronização entre dispositivos.

Progresso e rascunhos ficam no navegador do aluno. Quando o storage não está disponível, a sessão continua na memória. Sair fecha o material e recarregar exige novo desbloqueio.

## Manutenção sem publicar conteúdo legível
Use `node scripts/study-package.mjs`, enviando por stdin um objeto JSON com `mode` (`decrypt` ou `encrypt`), `user`, `password`, `input` e `output`. Receba as credenciais por prompt oculto do ambiente; nunca use argumentos de shell ou arquivo de senha. Na descriptografia, `input` é `estudos/content.enc.json` e `output` deve ficar **fora do repositório**. Edite esse HTML privado, cifre novamente e publique apenas o pacote. Jamais commitar o HTML aberto, screenshots após login, PDFs de alunos ou credenciais. Os testes usam credenciais fictícias.

## Verificação
`node --test tests/*.test.mjs`

Os materiais identificam a bibliografia curricular indicada e fontes complementares. Não são reprodução do livro nem gabarito oficial. As questões adaptadas distinguem enunciados enviados de exercícios inéditos.
