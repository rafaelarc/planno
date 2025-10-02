/**
 * GuideManager - Gerenciamento da modal guia do usuário
 * Responsável por controlar a exibição e navegação da guia do usuário
 * 
 * Funcionalidades:
 * - Abertura e fechamento da modal guia
 * - Navegação entre seções da guia
 * - Controle de estado da modal
 */
class GuideManager {
    constructor() {
        this.guideModal = null;
        this.isOpen = false;
        this.currentSection = 'getting-started';
        
        this.init();
    }

    /**
     * Inicializa o gerenciador da guia
     */
    init() {
        this.guideModal = DOMUtils.getById('guideModal');
        if (!this.guideModal) {
            console.error('Modal guia do usuário não encontrada');
            return;
        }

        this.setupEventListeners();
        this.setupNavigation();
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Botão de abrir guia
        DOMUtils.addEventListener(DOMUtils.getById('guideBtn'), 'click', () => {
            this.openGuide();
        });

        // Botão de fechar guia
        DOMUtils.addEventListener(DOMUtils.getById('closeGuideBtn'), 'click', () => {
            this.closeGuide();
        });

        // Fechar ao clicar fora da modal
        DOMUtils.addEventListener(this.guideModal, 'click', (e) => {
            if (e.target === this.guideModal) {
                this.closeGuide();
            }
        });

        // Fechar com ESC
        DOMUtils.addEventListener(document, 'keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeGuide();
            }
        });
    }

    /**
     * Configura navegação entre seções
     */
    setupNavigation() {
        const navLinks = this.guideModal.querySelectorAll('.guide-nav-link');
        
        navLinks.forEach(link => {
            DOMUtils.addEventListener(link, 'click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });
    }

    /**
     * Abre a modal guia do usuário
     */
    openGuide() {
        if (!this.guideModal) return;
        
        DOMUtils.addClass(this.guideModal, 'show');
        this.isOpen = true;
        
        // Mostrar seção ativa
        this.showSection(this.currentSection);
        
        // Prevenir scroll do body
        document.body.style.overflow = 'hidden';
    }

    /**
     * Fecha a modal guia do usuário
     */
    closeGuide() {
        if (!this.guideModal) return;
        
        DOMUtils.removeClass(this.guideModal, 'show');
        this.isOpen = false;
        
        // Restaurar scroll do body
        document.body.style.overflow = '';
    }

    /**
     * Mostra uma seção específica da guia
     * @param {string} sectionId - ID da seção para mostrar
     */
    showSection(sectionId) {
        // Esconder todas as seções
        const sections = this.guideModal.querySelectorAll('.guide-section');
        sections.forEach(section => {
            DOMUtils.removeClass(section, 'active');
        });

        // Mostrar seção selecionada
        const targetSection = this.guideModal.querySelector(`#${sectionId}`);
        if (targetSection) {
            DOMUtils.addClass(targetSection, 'active');
        }

        // Atualizar navegação ativa
        const navLinks = this.guideModal.querySelectorAll('.guide-nav-link');
        navLinks.forEach(link => {
            DOMUtils.removeClass(link, 'active');
            if (link.getAttribute('data-section') === sectionId) {
                DOMUtils.addClass(link, 'active');
            }
        });

        this.currentSection = sectionId;
    }

    /**
     * Verifica se a modal está aberta
     * @returns {boolean}
     */
    isGuideOpen() {
        return this.isOpen;
    }

    /**
     * Obtém a seção atual
     * @returns {string}
     */
    getCurrentSection() {
        return this.currentSection;
    }
}

// Exportar para uso em módulos ES6 ou como global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GuideManager;
} else {
    window.GuideManager = GuideManager;
}
