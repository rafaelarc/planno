/**
 * SidebarManager - Gerenciamento da sidebar
 * Responsável por gerenciar a sidebar da aplicação
 * 
 * Funcionalidades:
 * - Toggle da sidebar
 * - Gerenciamento de estado
 * - Responsividade
 * - Event listeners
 * - Persistência de estado
 */
class SidebarManager {
    constructor() {
        this.sidebar = null;
        this.sidebarToggle = null;
        this.sidebarOverlay = null;
        this.sidebarCloseBtn = null;
        this.sidebarCollapsed = false;
        this.isMobile = false;
    }

    /**
     * Inicializa a sidebar
     */
    init() {
        this.sidebar = DOMUtils.getById('sidebar');
        this.sidebarToggle = DOMUtils.getById('sidebarToggle');
        this.sidebarOverlay = DOMUtils.getById('sidebarOverlay');
        this.sidebarCloseBtn = DOMUtils.getById('sidebarCloseBtn');
        
        if (!this.sidebar || !this.sidebarToggle) {
            console.error('Elementos da sidebar não encontrados');
            return;
        }

        // Carregar estado salvo
        this.loadSidebarState();
        
        // Verificar se é mobile
        this.checkMobile();
        
        // Aplicar estado inicial
        this.applySidebarState();
        
        // Configurar visibilidade do toggle
        this.updateToggleVisibility();
        
        // Configurar event listeners
        this.setupEventListeners();
    }

    /**
     * Carrega o estado da sidebar do localStorage
     */
    loadSidebarState() {
        try {
            this.sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        } catch (error) {
            console.error('Erro ao carregar estado da sidebar:', error);
            this.sidebarCollapsed = false;
        }
    }

    /**
     * Salva o estado da sidebar no localStorage
     */
    saveSidebarState() {
        try {
            localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed.toString());
        } catch (error) {
            console.error('Erro ao salvar estado da sidebar:', error);
        }
    }

    /**
     * Aplica o estado atual da sidebar
     */
    applySidebarState() {
        if (!this.sidebar || !this.sidebarToggle) return;

        if (this.isMobile) {
            // Mobile: sempre começar fechado
            DOMUtils.removeClass(this.sidebar, 'show');
            DOMUtils.removeClass(this.sidebarOverlay, 'show');
        } else {
            // Desktop: aplicar estado salvo
            if (this.sidebarCollapsed) {
                DOMUtils.addClass(this.sidebar, 'collapsed');
            } else {
                DOMUtils.removeClass(this.sidebar, 'collapsed');
            }
        }
    }

    /**
     * Alterna o estado da sidebar
     */
    toggleSidebar() {
        if (!this.sidebar || !this.sidebarToggle) return;

        if (this.isMobile) {
            // Mobile: toggle overlay
            const isCurrentlyOpen = DOMUtils.hasClass(this.sidebar, 'show');
            
            if (isCurrentlyOpen) {
                // Fechar sidebar
                DOMUtils.removeClass(this.sidebar, 'show');
                DOMUtils.removeClass(this.sidebarOverlay, 'show');
            } else {
                // Abrir sidebar
                DOMUtils.addClass(this.sidebar, 'show');
                DOMUtils.addClass(this.sidebarOverlay, 'show');
            }
        } else {
            // Desktop: alternar estado colapsado
            this.sidebarCollapsed = !this.sidebarCollapsed;
            this.applySidebarState();
            this.saveSidebarState();
        }
    }

    /**
     * Fecha a sidebar
     */
    closeSidebar() {
        if (!this.sidebar || !this.sidebarToggle) return;

        if (this.isMobile) {
            DOMUtils.removeClass(this.sidebar, 'show');
            DOMUtils.removeClass(this.sidebarOverlay, 'show');
        }
    }

    /**
     * Abre a sidebar
     */
    openSidebar() {
        if (!this.sidebar || !this.sidebarToggle) return;

        if (this.isMobile) {
            DOMUtils.addClass(this.sidebar, 'show');
            DOMUtils.addClass(this.sidebarOverlay, 'show');
        } else {
            this.sidebarCollapsed = false;
            this.applySidebarState();
            this.saveSidebarState();
        }
    }

    /**
     * Verifica se é mobile
     */
    checkMobile() {
        this.isMobile = window.innerWidth <= 768;
    }

    /**
     * Lida com redimensionamento da janela
     */
    handleResize() {
        const wasMobile = this.isMobile;
        this.checkMobile();
        
        // Se mudou de mobile para desktop ou vice-versa, reaplicar estado
        if (wasMobile !== this.isMobile) {
            this.applySidebarState();
            this.updateToggleVisibility();
        }
    }

    /**
     * Atualiza a visibilidade do toggle baseado no tamanho da tela
     */
    updateToggleVisibility() {
        if (!this.sidebarToggle) return;

        if (this.isMobile) {
            // Mobile: mostrar toggle
            this.sidebarToggle.style.display = 'flex';
            this.sidebarToggle.style.visibility = 'visible';
            this.sidebarToggle.style.opacity = '1';
        } else {
            // Desktop: ocultar toggle
            this.sidebarToggle.style.display = 'none';
            this.sidebarToggle.style.visibility = 'hidden';
            this.sidebarToggle.style.opacity = '0';
        }
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        if (!this.sidebarToggle) return;

        // Toggle da sidebar
        DOMUtils.addEventListener(this.sidebarToggle, 'click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleSidebar();
        });

        // Overlay (mobile)
        if (this.sidebarOverlay) {
            DOMUtils.addEventListener(this.sidebarOverlay, 'click', () => {
                this.closeSidebar();
            });
        }

        // Botão de fechar (mobile)
        if (this.sidebarCloseBtn) {
            DOMUtils.addEventListener(this.sidebarCloseBtn, 'click', () => {
                this.closeSidebar();
            });
        }

        // Redimensionamento da janela
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Fechar sidebar ao pressionar Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobile && DOMUtils.hasClass(this.sidebar, 'show')) {
                this.closeSidebar();
            }
        });
    }

    /**
     * Obtém o estado atual da sidebar
     * @returns {Object} Estado da sidebar
     */
    getState() {
        return {
            collapsed: this.sidebarCollapsed,
            isMobile: this.isMobile,
            isOpen: this.isMobile ? DOMUtils.hasClass(this.sidebar, 'show') : !this.sidebarCollapsed
        };
    }

    /**
     * Define o estado da sidebar
     * @param {Object} state - Estado para definir
     */
    setState(state) {
        if (state.collapsed !== undefined) {
            this.sidebarCollapsed = state.collapsed;
        }
        
        this.applySidebarState();
        this.saveSidebarState();
    }

    /**
     * Verifica se a sidebar está aberta
     * @returns {boolean}
     */
    isOpen() {
        if (this.isMobile) {
            return DOMUtils.hasClass(this.sidebar, 'show');
        } else {
            return !this.sidebarCollapsed;
        }
    }

    /**
     * Verifica se a sidebar está colapsada
     * @returns {boolean}
     */
    isCollapsed() {
        return this.sidebarCollapsed;
    }

    /**
     * Verifica se está em modo mobile
     * @returns {boolean}
     */
    isMobileMode() {
        return this.isMobile;
    }

    /**
     * Força a sidebar a fechar (útil para mobile)
     */
    forceClose() {
        if (this.isMobile) {
            this.closeSidebar();
        }
    }

    /**
     * Força a sidebar a abrir
     */
    forceOpen() {
        if (this.isMobile) {
            this.openSidebar();
        } else {
            this.sidebarCollapsed = false;
            this.applySidebarState();
            this.saveSidebarState();
        }
    }

    /**
     * Alterna entre estados mobile e desktop
     */
    toggleMobileMode() {
        this.isMobile = !this.isMobile;
        this.applySidebarState();
    }

    /**
     * Obtém informações de debug
     * @returns {Object} Informações de debug
     */
    getDebugInfo() {
        return {
            sidebar: !!this.sidebar,
            sidebarToggle: !!this.sidebarToggle,
            sidebarOverlay: !!this.sidebarOverlay,
            sidebarCloseBtn: !!this.sidebarCloseBtn,
            sidebarCollapsed: this.sidebarCollapsed,
            isMobile: this.isMobile,
            windowWidth: window.innerWidth,
            sidebarClasses: this.sidebar ? this.sidebar.className : 'N/A',
            toggleDisplay: this.sidebarToggle ? this.sidebarToggle.style.display : 'N/A'
        };
    }

    /**
     * Destrói o gerenciador da sidebar
     */
    destroy() {
        // Remover event listeners
        if (this.sidebarToggle) {
            this.sidebarToggle.removeEventListener('click', this.toggleSidebar);
        }
        
        if (this.sidebarOverlay) {
            this.sidebarOverlay.removeEventListener('click', this.closeSidebar);
        }
        
        if (this.sidebarCloseBtn) {
            this.sidebarCloseBtn.removeEventListener('click', this.closeSidebar);
        }
        
        window.removeEventListener('resize', this.handleResize);
        
        // Limpar referências
        this.sidebar = null;
        this.sidebarToggle = null;
        this.sidebarOverlay = null;
        this.sidebarCloseBtn = null;
    }


    /**
     * Adiciona classe à sidebar
     * @param {string} className - Nome da classe
     */
    addClass(className) {
        if (this.sidebar) {
            DOMUtils.addClass(this.sidebar, className);
        }
    }

    /**
     * Remove classe da sidebar
     * @param {string} className - Nome da classe
     */
    removeClass(className) {
        if (this.sidebar) {
            DOMUtils.removeClass(this.sidebar, className);
        }
    }

    /**
     * Alterna classe da sidebar
     * @param {string} className - Nome da classe
     */
    toggleClass(className) {
        if (this.sidebar) {
            DOMUtils.toggleClass(this.sidebar, className);
        }
    }

    /**
     * Verifica se a sidebar tem uma classe
     * @param {string} className - Nome da classe
     * @returns {boolean}
     */
    hasClass(className) {
        if (this.sidebar) {
            return DOMUtils.hasClass(this.sidebar, className);
        }
        return false;
    }
}

// Exportar para uso em módulos ES6 ou como global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SidebarManager;
} else {
    window.SidebarManager = SidebarManager;
}
