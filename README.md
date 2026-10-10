# Quarta Asa · Uma jornada para você

Site estático de aniversário com ambientação original de fantasia, uma convocação para Basgiath e seis desafios inspirados em **Quarta Asa**, **Chama de Ferro** e **Tempestade de Ônix**.

## Acesso

- Site: https://lukeigl.github.io/hannacaradebanana/
- Prévia da jornada antes do aniversário: https://lukeigl.github.io/hannacaradebanana/?preview
- Publicação: branch `gh-pages`, diretório raiz. Sem dependências de execução e sem etapa de build.

## Comportamento

- Contagem regressiva anual até **17 de outubro, 00h00 de America/Sao_Paulo**. O portão abre automaticamente, sem recarregar, e permanece aberto durante todo o aniversário.
- A página de espera mostra o cenário, o contador e a apresentação dos três capítulos.
- **20 segundos por pergunta**, seis perguntas e três vidas, apresentadas como chamas.
- Cada acerto avança após a leitura do feedback. Erro ou tempo esgotado custa uma chama e permite repetir a pergunta. Pedir passagem custa uma chama e avança. Ao esgotar as chamas, é possível recomeçar.
- O relógio só começa ao entrar em uma prova; capítulos, feedback, resultado e carta não consomem tempo. Pausar ou ocultar a aba preserva o tempo restante e exige retomar a prova.
- A carta aparece depois da conclusão da jornada. O conteúdo pessoal original foi mantido como base, com a idade fixa substituída por uma referência ao aniversário.
- Som ambiente e efeitos sintetizados são opcionais e começam desligados. As animações respeitam a preferência de movimento reduzido, com controle manual disponível.

`?preview` mantém o atalho de prévia já existente. Como o site é inteiramente estático, a data organiza a experiência; não é uma proteção de acesso ao código ou à mensagem.

## Personalização

| Conteúdo | Arquivo |
| --- | --- |
| Dia, mês, segundos e vidas | `CONFIG`, em `quest.mjs` |
| Perguntas, respostas e textos dos capítulos | `quest.mjs` |
| Mensagem pessoal e textos da entrada | `index.html` |
| Cores, tipografia, tamanhos e adaptação para celular | `styles.css` |
| Navegação, áudio, brasas, pausa e cópia da carta | `app.mjs` |
| Cenário original, otimizado em WebP | `assets/basgiath.webp` |

Ao mudar o dia ou mês em `CONFIG`, atualize também os textos de data em `index.html` e `app.mjs`. A implementação atual usa o fuso UTC−03 da data de outubro em São Paulo.

## Verificação

Com Node.js instalado:

```sh
node --test tests/quest.test.mjs
node --check app.mjs
node --check quest.mjs
```

Os testes cobrem a virada da data em São Paulo, espera sem consumo de vidas, prazo real, ações repetidas, pausa, falha, reinício e conclusão dos três capítulos.

Para visualizar localmente, use um servidor HTTP estático, pois os arquivos JavaScript usam módulos. A publicação no GitHub Pages serve os arquivos diretamente.

## Referências das perguntas

Perguntas e explicações redigidas para esta experiência, conferidas com:

- [A série no site de Rebecca Yarros](https://rebeccayarros.com/empyrean)
- [Fourth Wing — resumo SparkNotes](https://www.sparknotes.com/lit/fourth-wing/summary/)
- [Iron Flame — resumo SparkNotes](https://www.sparknotes.com/lit/iron-flame/summary/)
- [Onyx Storm — resumo SparkNotes](https://www.sparknotes.com/lit/onyx-storm/summary/)

A arte do cenário é original, gerada para este projeto; o áudio usa síntese Web Audio. Não são necessárias fontes, músicas, scripts ou imagens de servidores externos.
