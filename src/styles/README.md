# Estrutura CSS Modularizada - Planno

Este diretório contém a estrutura CSS modularizada do Planno, organizada por funcionalidade e responsabilidade.

## 📁 Estrutura de Arquivos

```
src/styles/
├── main.css                 # Arquivo principal que importa todos os módulos
├── variables/
│   └── themes.css          # Variáveis CSS e temas (claro/escuro)
├── base/
│   ├── reset.css           # Reset CSS e estilos base
│   └── accessibility.css   # Estilos de acessibilidade
├── components/
│   ├── header.css          # Estilos do cabeçalho
│   ├── sidebar.css         # Estilos da barra lateral
│   ├── tasks.css           # Estilos das tarefas
│   ├── modals.css          # Estilos dos modais
│   ├── forms.css           # Estilos dos formulários
│   ├── buttons.css         # Estilos dos botões
│   ├── toast.css           # Estilos das notificações
│   ├── guide.css           # Estilos do guia do usuário
│   └── settings.css        # Estilos da página de configurações
├── layout/
│   ├── grid.css            # Layout principal e grid
│   └── responsive.css      # Media queries e responsividade
└── utilities/
    ├── animations.css      # Animações e keyframes
    └── utilities.css       # Classes utilitárias
```

## 🎯 Benefícios da Modularização

### ✅ Organização
- **Separação por responsabilidade**: Cada arquivo tem uma função específica
- **Fácil localização**: Encontrar estilos específicos é mais rápido
- **Manutenção simplificada**: Mudanças isoladas em componentes específicos

### ✅ Performance
- **Carregamento otimizado**: Apenas o CSS necessário é carregado
- **Cache eficiente**: Mudanças em um módulo não invalidam outros
- **Desenvolvimento mais rápido**: Hot reload mais eficiente

### ✅ Escalabilidade
- **Adição de novos componentes**: Simples de adicionar novos módulos
- **Reutilização**: Componentes podem ser facilmente reutilizados
- **Colaboração**: Múltiplos desenvolvedores podem trabalhar simultaneamente

## 🔧 Como Usar

### Importação Principal
O arquivo `main.css` importa todos os módulos na ordem correta:

```css
/* Variables primeiro */
@import url('./variables/themes.css');

/* Base styles */
@import url('./base/reset.css');
@import url('./base/accessibility.css');

/* Components */
@import url('./components/header.css');
/* ... outros componentes */

/* Layout */
@import url('./layout/grid.css');
@import url('./layout/responsive.css');

/* Utilities por último */
@import url('./utilities/animations.css');
@import url('./utilities/utilities.css');
```

### Adicionando Novos Estilos

1. **Novo Componente**: Crie um arquivo em `components/`
2. **Novo Layout**: Adicione em `layout/`
3. **Nova Utility**: Crie em `utilities/`
4. **Importe no main.css**: Adicione a linha de importação

### Exemplo de Novo Componente

```css
/* src/styles/components/new-component.css */
.new-component {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    /* ... outros estilos */
}
```

E adicione no `main.css`:
```css
@import url('./components/new-component.css');
```

## 🎨 Sistema de Variáveis

### Variáveis de Tema
Todas as variáveis estão centralizadas em `variables/themes.css`:

```css
:root {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --text-primary: #212529;
    --accent-primary: #007bff;
    /* ... outras variáveis */
}

[data-theme="dark"] {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    /* ... variáveis do tema escuro */
}
```

### Uso das Variáveis
Sempre use as variáveis CSS para cores e espaçamentos:

```css
.component {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}
```

## 📱 Responsividade

### Breakpoints Padrão
- **Mobile**: `max-width: 768px`
- **Small Mobile**: `max-width: 480px`

### Estrutura Responsiva
```css
/* Desktop first */
.component {
    /* Estilos para desktop */
}

@media (max-width: 768px) {
    .component {
        /* Estilos para mobile */
    }
}
```

## 🚀 Melhores Práticas

### 1. Nomenclatura
- Use classes descritivas: `.task-item`, `.modal-header`
- Evite abreviações confusas
- Mantenha consistência com BEM quando possível

### 2. Organização
- Agrupe estilos relacionados
- Use comentários para seções grandes
- Mantenha ordem lógica (layout → typography → colors → effects)

### 3. Performance
- Evite seletores muito específicos
- Use variáveis CSS para valores repetidos
- Minimize o uso de `!important`

### 4. Acessibilidade
- Mantenha contraste adequado
- Use unidades relativas quando possível
- Teste com leitores de tela

## 🔄 Migração do CSS Monolítico

A estrutura anterior (`styles.css`) foi dividida da seguinte forma:

- **Variáveis e temas** → `variables/themes.css`
- **Reset e base** → `base/reset.css` + `base/accessibility.css`
- **Header** → `components/header.css`
- **Sidebar** → `components/sidebar.css`
- **Tasks** → `components/tasks.css`
- **Modals** → `components/modals.css`
- **Forms** → `components/forms.css`
- **Buttons** → `components/buttons.css`
- **Toast** → `components/toast.css`
- **Guide** → `components/guide.css`
- **Settings** → `components/settings.css`
- **Layout** → `layout/grid.css`
- **Responsive** → `layout/responsive.css`
- **Animations** → `utilities/animations.css`
- **Utilities** → `utilities/utilities.css`

## 📝 Notas de Desenvolvimento

- O arquivo `main.css` deve sempre ser o ponto de entrada
- Mantenha a ordem de importação para evitar conflitos de especificidade
- Teste sempre em diferentes dispositivos após mudanças
- Use as ferramentas de desenvolvimento do navegador para debug

## 🐛 Troubleshooting

### CSS não está carregando
1. Verifique se o caminho no `index.html` está correto
2. Confirme se o arquivo `main.css` existe
3. Verifique se todas as importações estão corretas

### Estilos não estão sendo aplicados
1. Verifique a especificidade dos seletores
2. Confirme se as variáveis CSS estão definidas
3. Use as ferramentas de desenvolvimento para debug

### Conflitos de estilo
1. Verifique a ordem de importação no `main.css`
2. Use seletores mais específicos se necessário
3. Evite usar `!important` desnecessariamente
