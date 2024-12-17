document.addEventListener('DOMContentLoaded', () => {
    class Coverflow {
        constructor() {
            this.container = document.querySelector('.coverflow-items');
            this.items = document.querySelectorAll('.coverflow-item');
            this.currentIndex = 0;
            this.total = this.items.length;
            this.spacing = window.innerWidth <= 768 ? 250 : 450;
            this.zDistance = window.innerWidth <= 768 ? 400 : 600;
            this.angle = window.innerWidth <= 768 ? 25 : 32;
            this.autoplayInterval = null;
            
            window.addEventListener('resize', () => {
                this.spacing = window.innerWidth <= 768 ? 250 : 450;
                this.zDistance = window.innerWidth <= 768 ? 400 : 600;
                this.angle = window.innerWidth <= 768 ? 25 : 32;
                this.updateItems();
            });
            
            this.init();
        }
    
        init() {
            this.updateItems();
            this.startAutoplay();
    
            let startX;
            this.container.addEventListener('touchstart', (e) => {
                this.stopAutoplay();
                startX = e.touches[0].clientX;
            });
            
            this.container.addEventListener('touchend', (e) => {
                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0) this.next();
                    else this.prev();
                }
                this.startAutoplay();
            });
    
            this.container.addEventListener('mouseenter', () => this.stopAutoplay());
            this.container.addEventListener('mouseleave', () => this.startAutoplay());
    
            this.items.forEach((item, index) => {
                item.addEventListener('click', () => {
                    if(index !== this.currentIndex) {
                        this.stopAutoplay();
                        this.goTo(index);
                        this.startAutoplay();
                    }
                });
            });
        }
    
        updateItems() {
            requestAnimationFrame(() => {
                this.items.forEach((item, index) => {
                    let diff = index - this.currentIndex;
                    
                    if (diff > this.total / 2) diff -= this.total;
                    if (diff < -this.total / 2) diff += this.total;
                    
                    let translateX = diff * this.spacing;
                    let translateZ = 0;
                    let rotateY = 0;
                    let opacity = 1;
                    let scale = 1;
    
                    if (diff !== 0) {
                        translateZ = -this.zDistance;
                        rotateY = diff < 0 ? this.angle : -this.angle;
                        scale = 0.6;
                        opacity = 0.6;
                    } else {
                        scale = 1;
                        translateZ = 50;
                    }
    
                    if (Math.abs(diff) > 2) {
                        opacity = 0;
                    }
    
                    item.style.transform = `
                        translate3d(${translateX}px, 0, ${translateZ}px)
                        rotateY(${rotateY}deg)
                        scale(${scale})
                    `;
                    item.style.opacity = opacity;
                    item.style.zIndex = 100 - Math.abs(diff * 10);
    
                    const reflection = item.querySelector('.item-reflection');
                    if (reflection) {
                        reflection.style.opacity = opacity * 0.4;
                        reflection.style.transform = `
                            scaleY(-1) 
                            rotateX(180deg)
                            rotateY(${-rotateY}deg)
                        `;
                    }
                });
            });
        }
    
        startAutoplay() {
            if (!this.autoplayInterval) {
                this.autoplayInterval = setInterval(() => this.next(), 3000);
            }
        }
    
        stopAutoplay() {
            if (this.autoplayInterval) {
                clearInterval(this.autoplayInterval);
                this.autoplayInterval = null;
            }
        }
    
        prev() {
            this.currentIndex = (this.currentIndex - 1 + this.total) % this.total;
            this.updateItems();
        }
    
        next() {
            this.currentIndex = (this.currentIndex + 1) % this.total;
            this.updateItems();
        }
    
        goTo(index) {
            this.currentIndex = index % this.total;
            this.updateItems();
        }
    }
    // Инициализация элементов
    const pageCorner = document.querySelector('.page-corner');
    const pageWrapper = document.querySelector('.page-wrapper');
    const settingsContent = document.querySelector('.settings-content');
    const scrollableContent = document.querySelector('.scrollable-wrapper');
    const websiteContent = document.querySelector('.website-content');
    const cornerTooltip = document.querySelector('.corner-tooltip');
    const searchInput = document.querySelector('.search-input');
    const cards = document.querySelectorAll('.app-card');
    let isOpen = false;
    let isWebsiteMode = false;

    // Инициализация карусели
    const coverflow = new Coverflow();

    // Обработка клика по кнопкам перехода на сайт
    document.querySelectorAll('.visit-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const url = button.getAttribute('href');
            const iframe = websiteContent.querySelector('iframe');
            
            // Сначала показываем iframe
            websiteContent.style.visibility = 'visible';
            websiteContent.style.opacity = '1';
            // Затем загружаем URL
            iframe.src = url;
            
            requestAnimationFrame(() => {
                document.documentElement.style.setProperty('--page-lift', '90deg');
                pageWrapper.classList.add('lifted');
                isWebsiteMode = true;
                cornerTooltip.textContent = 'В Community';
            });
        });
    });

    // Обработка клика по углу страницы
    pageCorner.addEventListener('click', () => {
        if(isWebsiteMode) {
            document.documentElement.style.setProperty('--page-lift', '0deg');
            pageWrapper.classList.remove('lifted');
            
            pageWrapper.addEventListener('transitionend', function hideWebsite() {
                websiteContent.style.visibility = 'hidden';
                websiteContent.style.opacity = '0';
                // Очищаем iframe после завершения анимации
                const iframe = websiteContent.querySelector('iframe');
                iframe.src = 'about:blank';
                pageWrapper.removeEventListener('transitionend', hideWebsite);
                isWebsiteMode = false;
                cornerTooltip.textContent = 'Настройки';
            }, { once: true });
        } else if(isOpen) {
            document.documentElement.style.setProperty('--page-lift', '0deg');
            pageWrapper.classList.remove('lifted');
            
            pageWrapper.addEventListener('transitionend', function hideSettings() {
                settingsContent.style.visibility = 'hidden';
                settingsContent.style.opacity = '0';
                pageWrapper.removeEventListener('transitionend', hideSettings);
            }, { once: true });
            
            isOpen = false;
        } else {
            // Открываем настройки без скрытия контента
            settingsContent.style.visibility = 'visible';
            settingsContent.style.opacity = '1';
            
            requestAnimationFrame(() => {
                document.documentElement.style.setProperty('--page-lift', '90deg');
                pageWrapper.classList.add('lifted');
            });
            isOpen = true;
        }
    });

    // Функционал поиска
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        requestAnimationFrame(() => {
            cards.forEach(card => {
                const title = card.querySelector('.app-name').textContent.toLowerCase();
                const description = card.querySelector('.app-description').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Закрытие по клику вне
    document.addEventListener('click', (e) => {
        if(isOpen && 
           !pageCorner.contains(e.target) && 
           !settingsContent.contains(e.target)) {
            document.documentElement.style.setProperty('--page-lift', '0deg');
            pageWrapper.classList.remove('lifted');
            
            pageWrapper.addEventListener('transitionend', function hideSettings() {
                settingsContent.style.visibility = 'hidden';
                settingsContent.style.opacity = '0';
                pageWrapper.removeEventListener('transitionend', hideSettings);
            }, { once: true });
            
            isOpen = false;
        }
    });

    // Предотвращение всплытия кликов
    settingsContent.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Обработка клавиши Escape
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && (isOpen || isWebsiteMode)) {
            if(isWebsiteMode) {
                document.documentElement.style.setProperty('--page-lift', '0deg');
                pageWrapper.classList.remove('lifted');
                
                pageWrapper.addEventListener('transitionend', function hideWebsite() {
                    websiteContent.style.visibility = 'hidden';
                    websiteContent.style.opacity = '0';
                    const iframe = websiteContent.querySelector('iframe');
                    iframe.src = 'about:blank';
                    pageWrapper.removeEventListener('transitionend', hideWebsite);
                    isWebsiteMode = false;
                    cornerTooltip.textContent = 'Настройки';
                }, { once: true });
            } else if(isOpen) {
                document.documentElement.style.setProperty('--page-lift', '0deg');
                pageWrapper.classList.remove('lifted');
                
                pageWrapper.addEventListener('transitionend', function hideSettings() {
                    settingsContent.style.visibility = 'hidden';
                    settingsContent.style.opacity = '0';
                    pageWrapper.removeEventListener('transitionend', hideSettings);
                }, { once: true });
                
                isOpen = false;
            }
        }
    });
});