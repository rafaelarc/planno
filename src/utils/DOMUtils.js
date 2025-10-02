/**
 * DOMUtils - Utilitários para manipulação do DOM
 * Responsável por operações comuns de manipulação de elementos DOM
 * 
 * Funcionalidades:
 * - Escape de HTML
 * - Criação de elementos
 * - Manipulação de classes
 * - Event listeners
 * - Seletores
 */
class DOMUtils {
    /**
     * Escapa caracteres HTML para prevenir XSS
     * @param {string} text - Texto para escapar
     * @returns {string} Texto escapado
     */
    static escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Cria um elemento HTML com atributos e conteúdo
     * @param {string} tag - Tag HTML
     * @param {Object} attributes - Atributos do elemento
     * @param {string} content - Conteúdo interno
     * @returns {HTMLElement} Elemento criado
     */
    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        // Adiciona atributos
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        // Adiciona conteúdo
        if (content) {
            element.innerHTML = content;
        }
        
        return element;
    }

    /**
     * Adiciona classes CSS a um elemento
     * @param {HTMLElement} element - Elemento DOM
     * @param {...string} classes - Classes para adicionar
     */
    static addClass(element, ...classes) {
        if (!element) return;
        element.classList.add(...classes);
    }

    /**
     * Remove classes CSS de um elemento
     * @param {HTMLElement} element - Elemento DOM
     * @param {...string} classes - Classes para remover
     */
    static removeClass(element, ...classes) {
        if (!element) return;
        element.classList.remove(...classes);
    }

    /**
     * Alterna classes CSS de um elemento
     * @param {HTMLElement} element - Elemento DOM
     * @param {...string} classes - Classes para alternar
     */
    static toggleClass(element, ...classes) {
        if (!element) return;
        element.classList.toggle(...classes);
    }

    /**
     * Verifica se um elemento tem uma classe
     * @param {HTMLElement} element - Elemento DOM
     * @param {string} className - Classe para verificar
     * @returns {boolean}
     */
    static hasClass(element, className) {
        if (!element) return false;
        return element.classList.contains(className);
    }

    /**
     * Adiciona um event listener a um elemento
     * @param {HTMLElement} element - Elemento DOM
     * @param {string} event - Tipo do evento
     * @param {Function} handler - Função de callback
     * @param {Object} options - Opções do event listener
     */
    static addEventListener(element, event, handler, options = {}) {
        if (!element) return;
        element.addEventListener(event, handler, options);
    }

    /**
     * Remove um event listener de um elemento
     * @param {HTMLElement} element - Elemento DOM
     * @param {string} event - Tipo do evento
     * @param {Function} handler - Função de callback
     */
    static removeEventListener(element, event, handler) {
        if (!element) return;
        element.removeEventListener(event, handler);
    }

    /**
     * Seleciona um elemento por ID
     * @param {string} id - ID do elemento
     * @returns {HTMLElement|null}
     */
    static getById(id) {
        return document.getElementById(id);
    }

    /**
     * Seleciona elementos por seletor CSS
     * @param {string} selector - Seletor CSS
     * @param {HTMLElement} parent - Elemento pai (opcional)
     * @returns {NodeList}
     */
    static querySelectorAll(selector, parent = document) {
        return parent.querySelectorAll(selector);
    }

    /**
     * Seleciona o primeiro elemento por seletor CSS
     * @param {string} selector - Seletor CSS
     * @param {HTMLElement} parent - Elemento pai (opcional)
     * @returns {HTMLElement|null}
     */
    static querySelector(selector, parent = document) {
        return parent.querySelector(selector);
    }

    /**
     * Mostra um elemento (remove display: none)
     * @param {HTMLElement} element - Elemento DOM
     * @param {string} display - Tipo de display (padrão: 'block')
     */
    static show(element, display = 'block') {
        if (!element) return;
        element.style.display = display;
    }

    /**
     * Esconde um elemento (adiciona display: none)
     * @param {HTMLElement} element - Elemento DOM
     */
    static hide(element) {
        if (!element) return;
        element.style.display = 'none';
    }

    /**
     * Alterna a visibilidade de um elemento
     * @param {HTMLElement} element - Elemento DOM
     * @param {string} display - Tipo de display quando visível
     */
    static toggleVisibility(element, display = 'block') {
        if (!element) return;
        if (element.style.display === 'none') {
            this.show(element, display);
        } else {
            this.hide(element);
        }
    }

    /**
     * Adiciona conteúdo HTML a um elemento
     * @param {HTMLElement} element - Elemento DOM
     * @param {string} html - HTML para adicionar
     */
    static setHTML(element, html) {
        if (!element) return;
        element.innerHTML = html;
    }

    /**
     * Adiciona conteúdo de texto a um elemento
     * @param {HTMLElement} element - Elemento DOM
     * @param {string} text - Texto para adicionar
     */
    static setText(element, text) {
        if (!element) return;
        element.textContent = text;
    }

    /**
     * Obtém o valor de um input
     * @param {HTMLElement} element - Elemento input
     * @returns {string}
     */
    static getValue(element) {
        if (!element) return '';
        return element.value || '';
    }

    /**
     * Define o valor de um input
     * @param {HTMLElement} element - Elemento input
     * @param {string} value - Valor para definir
     */
    static setValue(element, value) {
        if (!element) return;
        element.value = value || '';
    }

    /**
     * Verifica se um checkbox está marcado
     * @param {HTMLElement} element - Elemento checkbox
     * @returns {boolean}
     */
    static isChecked(element) {
        if (!element) return false;
        return element.checked;
    }

    /**
     * Marca/desmarca um checkbox
     * @param {HTMLElement} element - Elemento checkbox
     * @param {boolean} checked - Estado do checkbox
     */
    static setChecked(element, checked) {
        if (!element) return;
        element.checked = checked;
    }

    /**
     * Adiciona um elemento ao DOM
     * @param {HTMLElement} parent - Elemento pai
     * @param {HTMLElement} child - Elemento filho
     */
    static appendChild(parent, child) {
        if (!parent || !child) return;
        parent.appendChild(child);
    }

    /**
     * Remove um elemento do DOM
     * @param {HTMLElement} element - Elemento para remover
     */
    static removeElement(element) {
        if (!element || !element.parentNode) return;
        element.parentNode.removeChild(element);
    }

    /**
     * Limpa o conteúdo de um elemento
     * @param {HTMLElement} element - Elemento para limpar
     */
    static clearElement(element) {
        if (!element) return;
        element.innerHTML = '';
    }

    /**
     * Adiciona estilos inline a um elemento
     * @param {HTMLElement} element - Elemento DOM
     * @param {Object} styles - Objeto com estilos CSS
     */
    static setStyles(element, styles) {
        if (!element) return;
        Object.keys(styles).forEach(property => {
            element.style[property] = styles[property];
        });
    }

    /**
     * Obtém estilos computados de um elemento
     * @param {HTMLElement} element - Elemento DOM
     * @param {string} property - Propriedade CSS
     * @returns {string}
     */
    static getComputedStyle(element, property) {
        if (!element) return '';
        return window.getComputedStyle(element).getPropertyValue(property);
    }

    /**
     * Verifica se um elemento está visível
     * @param {HTMLElement} element - Elemento DOM
     * @returns {boolean}
     */
    static isVisible(element) {
        if (!element) return false;
        return element.style.display !== 'none' && 
               element.offsetWidth > 0 && 
               element.offsetHeight > 0;
    }

    /**
     * Foca em um elemento
     * @param {HTMLElement} element - Elemento DOM
     */
    static focus(element) {
        if (!element) return;
        element.focus();
    }

    /**
     * Seleciona o texto de um input
     * @param {HTMLElement} element - Elemento input
     */
    static selectText(element) {
        if (!element) return;
        element.select();
    }

    /**
     * Cria um elemento com classes e conteúdo
     * @param {string} tag - Tag HTML
     * @param {string} className - Classes CSS
     * @param {string} content - Conteúdo interno
     * @returns {HTMLElement}
     */
    static createElementWithClass(tag, className, content = '') {
        return this.createElement(tag, { className }, content);
    }

    /**
     * Cria um botão com ícone e texto
     * @param {string} text - Texto do botão
     * @param {string} icon - Classe do ícone FontAwesome
     * @param {string} className - Classes CSS adicionais
     * @param {Function} onClick - Função de callback
     * @returns {HTMLElement}
     */
    static createButton(text, icon = '', className = '', onClick = null) {
        const button = this.createElement('button', {
            className: `btn ${className}`.trim()
        }, `<i class="${icon}"></i> ${text}`);
        
        if (onClick) {
            this.addEventListener(button, 'click', onClick);
        }
        
        return button;
    }

    /**
     * Cria um ícone FontAwesome
     * @param {string} iconClass - Classe do ícone
     * @param {string} className - Classes CSS adicionais
     * @returns {HTMLElement}
     */
    static createIcon(iconClass, className = '') {
        return this.createElement('i', {
            className: `${iconClass} ${className}`.trim()
        });
    }
}

// Exportar para uso em módulos ES6 ou como global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DOMUtils;
} else {
    window.DOMUtils = DOMUtils;
}
