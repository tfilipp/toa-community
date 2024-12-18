document.addEventListener('DOMContentLoaded', () => {
    class NotificationSystem {
        constructor() {
            this.container = document.querySelector('.notification-container');
        }

        show(message) {
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = message;

            this.container.appendChild(notification);

            requestAnimationFrame(() => {
                notification.classList.add('active');
            });

            setTimeout(() => {
                notification.classList.remove('active');
                notification.addEventListener('transitionend', () => {
                    notification.remove();
                });
            }, 3000);
        }
    }

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
            
            this.refreshImages();
            
            window.addEventListener('resize', () => {
                this.spacing = window.innerWidth <= 768 ? 250 : 450;
                this.zDistance = window.innerWidth <= 768 ? 400 : 600;
                this.angle = window.innerWidth <= 768 ? 25 : 32;
                this.updateItems();
            });
            
            this.init();
        }

        refreshImages() {
            const timestamp = new Date().getTime();
            this.items.forEach(item => {
                const img = item.querySelector('img');
                const originalSrc = img.src.split('?')[0];
                img.src = `${originalSrc}?t=${timestamp}`;
            });
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

            setInterval(() => this.refreshImages(), 300000);
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

    class AuthSystem {
        constructor() {
            this.isAuthenticated = false;
            this.currentUser = null;
            this.initElements();
            this.initEvents();
            this.checkAuth();
        }

        initElements() {
            this.userProfile = document.querySelector('.user-profile');
            this.authButtons = document.querySelector('.auth-buttons');
            this.authForms = document.querySelector('.auth-forms');
            this.loginForm = document.querySelector('.login-form');
            this.registerForm = document.querySelector('.register-form');
            this.loginShowBtn = document.querySelector('.login-show');
            this.registerShowBtn = document.querySelector('.register-show');
            this.backButtons = document.querySelectorAll('.form-back');
            this.logoutButton = document.querySelector('.logout-button');
            this.displayNameElement = document.querySelector('.display-name');
            this.usernameElement = document.querySelector('.username');

            // Form inputs
            this.loginUsername = document.querySelector('.login-username');
            this.loginPassword = document.querySelector('.login-password');
            this.registerUsername = document.querySelector('.register-username');
            this.registerDisplayname = document.querySelector('.register-displayname');
            this.registerPassword = document.querySelector('.register-password');
            this.registerPasswordConfirm = document.querySelector('.register-password-confirm');
        }

        initEvents() {
            this.loginShowBtn.addEventListener('click', () => this.showLoginForm());
            this.registerShowBtn.addEventListener('click', () => this.showRegisterForm());
            
            this.backButtons.forEach(btn => {
                btn.addEventListener('click', () => this.showAuthButtons());
            });

            this.logoutButton.addEventListener('click', () => this.logout());

            document.querySelector('.login-submit').addEventListener('click', () => this.login());
            document.querySelector('.register-submit').addEventListener('click', () => this.register());
        }

        showLoginForm() {
            this.authButtons.style.display = 'none';
            this.loginForm.style.display = 'block';
            this.registerForm.style.display = 'none';
        }

        showRegisterForm() {
            this.authButtons.style.display = 'none';
            this.loginForm.style.display = 'none';
            this.registerForm.style.display = 'block';
        }

        showAuthButtons() {
            this.authButtons.style.display = 'block';
            this.loginForm.style.display = 'none';
            this.registerForm.style.display = 'none';
        }

        checkAuth() {
            const userData = localStorage.getItem('user');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
                this.updateUI();
            }
        }

        updateUI() {
            if (this.isAuthenticated) {
                this.userProfile.style.display = 'block';
                this.authButtons.style.display = 'none';
                this.authForms.style.display = 'none';
                this.displayNameElement.textContent = this.currentUser.displayName;
                this.usernameElement.textContent = '@' + this.currentUser.username;
            } else {
                this.userProfile.style.display = 'none';
                this.authButtons.style.display = 'block';
                this.authForms.style.display = 'block';
            }
        }

        login() {
            const username = this.loginUsername.value;
            const password = this.loginPassword.value;

            if (!username || !password) {
                notifications.show('Пожалуйста, заполните все поля');
                return;
            }

            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                this.currentUser = {
                    username: user.username,
                    displayName: user.displayName
                };
                this.isAuthenticated = true;
                localStorage.setItem('user', JSON.stringify(this.currentUser));
                this.updateUI();
                this.loginUsername.value = '';
                this.loginPassword.value = '';
                notifications.show('Вы успешно вошли в систему');
            } else {
                notifications.show('Неверный логин или пароль');
            }
        }

        register() {
            const username = this.registerUsername.value;
            const displayName = this.registerDisplayname.value;
            const password = this.registerPassword.value;
            const passwordConfirm = this.registerPasswordConfirm.value;

            if (!username || !displayName || !password || !passwordConfirm) {
                notifications.show('Пожалуйста, заполните все поля');
                return;
            }

            if (password !== passwordConfirm) {
                notifications.show('Пароли не совпадают');
                return;
            }

            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            if (users.some(u => u.username === username)) {
                notifications.show('Пользователь с таким именем уже существует');
                return;
            }

            const newUser = {
                username,
                displayName,
                password
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            this.currentUser = {
                username,
                displayName
            };
            this.isAuthenticated = true;
            localStorage.setItem('user', JSON.stringify(this.currentUser));
            this.updateUI();

            this.registerUsername.value = '';
            this.registerDisplayname.value = '';
            this.registerPassword.value = '';
            this.registerPasswordConfirm.value = '';

            notifications.show('Регистрация успешно завершена');
        }

        logout() {
            localStorage.removeItem('user');
            this.currentUser = null;
            this.isAuthenticated = false;
            this.updateUI();
            this.showAuthButtons();
            notifications.show('Вы вышли из системы');
        }
    }

    class UploadSystem {
        constructor(auth) {
            this.auth = auth;
            this.initElements();
            this.initEvents();
        }

        initElements() {
            this.addGameBtn = document.querySelector('.add-game');
            this.uploadMenu = document.querySelector('.upload-menu');
            this.uploadProcess = document.querySelector('.upload-process');
            this.manualUploadBtn = document.querySelector('.manual-upload');
            this.jsonDownloadedBtn = document.querySelector('.json-downloaded');
            this.stepJson = document.querySelector('.step-json');
            this.stepPackager = document.querySelector('.step-packager');
            this.stepDetails = document.querySelector('.step-details');
            this.htmlUpload = document.querySelector('.html-upload');
            this.uploadHtmlBtn = document.querySelector('.upload-html');
            this.submitGameBtn = document.querySelector('.submit-game');
        }

        initEvents() {
            this.addGameBtn.addEventListener('click', () => this.showUploadMenu());
            this.manualUploadBtn.addEventListener('click', () => this.startManualUpload());
            this.jsonDownloadedBtn.addEventListener('click', () => this.showPackagerStep());
            this.uploadHtmlBtn.addEventListener('click', () => this.htmlUpload.click());
            this.htmlUpload.addEventListener('change', (e) => this.handleHtmlUpload(e));
            this.submitGameBtn.addEventListener('click', () => this.submitGame());

            // Активируем кнопку через 3 секунды
            setTimeout(() => {
                this.jsonDownloadedBtn.disabled = false;
            }, 3000);
        }

        showUploadMenu() {
            this.addGameBtn.style.display = 'none';
            this.uploadMenu.style.display = 'block';
        }

        startManualUpload() {
            if (!this.auth.isAuthenticated) {
                notifications.show('Требуется авторизация для загрузки игр');
                return;
            }

            this.uploadMenu.style.display = 'none';
            this.uploadProcess.style.display = 'block';
        }

        showPackagerStep() {
            this.stepJson.style.display = 'none';
            this.stepPackager.style.display = 'block';
        }

        handleHtmlUpload(e) {
            const file = e.target.files[0];
            if (file) {
                this.stepPackager.style.display = 'none';
                this.stepDetails.style.display = 'block';
            }
        }

        submitGame() {
            const emoji = document.querySelector('.emoji-input').value;
            const name = document.querySelector('.name-input').value;
            const desc = document.querySelector('.desc-input').value;

            if (!emoji || !name || !desc) {
                notifications.show('Заполните все поля');
                return;
            }

            const newCard = document.createElement('div');
            newCard.className = 'app-card';
            newCard.innerHTML = `
                <div class="app-content">
                    <div class="app-icon">
                        ${emoji}
                    </div>
                    <h2 class="app-name">${name}</h2>
                    <p class="app-description">${desc}</p>
                </div>
                <div class="button-container">
                    <a href="#" class="visit-button">Открыть</a>
                </div>
            `;

            const appGrid = document.querySelector('.app-grid');
            appGrid.insertBefore(newCard, appGrid.firstChild);

            this.uploadProcess.style.display = 'none';
            this.addGameBtn.style.display = 'block';
            notifications.show('Игра успешно добавлена!');
        }
    }

    // Основная инициализация
    const notifications = new NotificationSystem();
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

    // Инициализация карусели и системы авторизации
    const coverflow = new Coverflow();
    const auth = new AuthSystem();
    const upload = new UploadSystem(auth);

    // Обработка клика по кнопкам перехода на сайт
    document.querySelectorAll('.visit-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const url = button.getAttribute('href');
            const iframe = websiteContent.querySelector('iframe');
            
            websiteContent.style.visibility = 'visible';
            websiteContent.style.opacity = '1';
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