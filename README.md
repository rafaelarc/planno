# Planno - Organizador de Tarefas Gratuito

Uma aplicação web moderna de produtividade para gerenciamento de tarefas e planejamento pessoal, desenvolvida com JavaScript puro, HTML5 e CSS3.

## Funcionalidades

### Gerenciamento de Tarefas
- Criar, editar e excluir tarefas com confirmação
- Marcar como concluída com checkbox
- Tarefas recorrentes (diária, semanal, mensal, anual)
- Sistema de prioridades (Baixa, Média, Alta)
- Datas de vencimento com horário específico
- Geração automática de próximas ocorrências para tarefas recorrentes

### Organização e Filtros
- Categorias personalizáveis com cores e nomes únicos
- Sistema de tags (até 3 por tarefa) com cores personalizáveis
- Filtros combinados categoria + tag simultaneamente
- Busca em tempo real por título, descrição e tags
- Ordenação dinâmica por prioridade, data, status, categoria e tags
- Filtros por status (todas, pendentes, concluídas, recorrentes)
- Filtros por prioridade (baixa, média, alta)

### Visualização e Estatísticas
- Estatísticas em tempo real (total, concluídas, pendentes)
- Contadores dinâmicos de categorias e tags na sidebar
- Indicadores visuais de filtros ativos
- Títulos dinâmicos mostrando filtros combinados
- Paginação inteligente (15 tarefas no mobile, 25 no desktop)
- Visualização de tarefas concluídas configurável (7-90 dias)

### Personalização
- Tema claro e escuro com alternância suave
- Personalização de cores da interface (primária, sucesso, aviso, perigo)
- Controle de visualização de tarefas concluídas
- Saudação personalizada com nome do usuário
- Interface responsiva para desktop e mobile

### Dados e Backup
- Armazenamento local (localStorage) - dados ficam no dispositivo
- Backup completo - exportar/importar todos os dados e configurações
- Validação de integridade de dados na importação
- Exportação em formato JSON e CSV
- Guia do usuário integrado e completo

## Tecnologias

- **HTML5** - Estrutura semântica e acessível
- **CSS3** - Estilização com variáveis CSS, flexbox e grid
- **JavaScript ES6+** - Lógica da aplicação com classes e módulos
- **Font Awesome** - Ícones da interface
- **localStorage** - Persistência de dados local

## Instalação

### Método 1: Abrir Diretamente
1. Clone ou baixe os arquivos do projeto
2. Abra o arquivo `index.html` em qualquer navegador moderno
3. A aplicação funcionará localmente sem necessidade de servidor

### Método 2: Servidor Local
1. Instale um servidor local (Live Server, Python, Node.js, etc.)
2. Sirva a pasta do projeto
3. Acesse via `http://localhost:porta`

### Método 3: Hospedagem
1. Faça upload dos arquivos para qualquer hospedagem web
2. Acesse via URL da hospedagem

## Uso

### Primeiros Passos
1. Configure seu nome nas configurações
2. Crie categorias para organizar suas tarefas
3. Adicione tags para melhor classificação
4. Crie suas primeiras tarefas
5. Experimente os filtros e ordenação

### Filtros Combinados
- Clique em uma categoria (ex: "Trabalho")
- Clique em uma tag (ex: "Urgente")
- Resultado: Tarefas de "Trabalho" E "Urgente"

### Tarefas Recorrentes
- Configure recorrência ao criar/editar tarefas
- Escolha frequência: diária, semanal, mensal ou anual
- Para semanal: selecione os dias da semana
- Próximas ocorrências são geradas automaticamente

### Backup e Restauração
- **Exportar**: Salva todos os dados em arquivo JSON OU CSV
- **Importar**: Restaura dados de backup anterior
- **Dados incluídos**: Tarefas, categorias, tags, configurações

## Funcionalidades Técnicas

### Arquitetura
- Arquitetura modular com separação de responsabilidades
- Padrão MVC (Model-View-Controller)
- Event delegation para melhor performance
- Renderização incremental para otimização

### Performance
- Cache de elementos DOM para evitar consultas repetidas
- Renderização incremental de tarefas
- Debounce na busca para otimizar performance
- Lazy loading de componentes

### Acessibilidade
- Labels associados a todos os campos de formulário
- Navegação por teclado
- Contraste adequado nos temas
- Estrutura semântica HTML5

## Privacidade

- **100% local**: Dados ficam no seu dispositivo
- **Sem servidores**: Nada é enviado para internet
- **Você controla**: Backup e segurança são sua responsabilidade
- **Sem coleta**: Nenhum dado pessoal é coletado

## Suporte

- Guia integrado: Acesse via botão "?" no cabeçalho
- Documentação completa dentro da própria aplicação
- Interface intuitiva sem necessidade de treinamento

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE.md) - veja o arquivo LICENSE.md para detalhes.

## Contribuição

Contribuições são bem-vindas!

## Desenvolvido por

[Rafaela Carvalho](https://github.com/rafaelarc)

---

**Versão**: 1.0.0  
**Última atualização**: 2025