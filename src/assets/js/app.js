/**************************************************************
* Lazy-load
**************************************************************/
let lozadObserver;

function initLozad() {
    try {
        if (typeof lozad === 'undefined') {
            console.warn('Lozad не найден');
            return;
        }
        
        // Уничтожаем предыдущий observer, если существует
        if (lozadObserver) {
            lozadObserver = null;
        }
        
        // Создаем новый observer с кастомными настройками
        lozadObserver = lozad('.lozad', {
            threshold: 0.1,
            enableAutoReload: true
        });
        
        lozadObserver.observe();
        console.log('Lozad initialized successfully');
    } catch (error) {
        console.error('Error in initLozad:', error);
    }
}

/**************************************************************
* Lazy-load
**************************************************************/
Fancybox.bind("[data-fancybox]", {
	theme: 'light'
});

// Ждем загрузку DOM перед инициализацией Barba
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, загружен ли Barba.js
    if (typeof barba !== 'undefined') {
        initPageTransitions();
    } else {
        console.warn('Barba.js не найден');
        // Инициализируем скрипты напрямую, если Barba не доступен
        initScript();
    }
});

// Инициализация Lenis для плавного скролла
let lenis;

function initLenis() {
    try {
        if (typeof Lenis === 'undefined') {
            console.warn('Lenis не найден');
            return;
        }
        
        // Уничтожаем предыдущий экземпляр Lenis, если он существует
        if (lenis) {
            lenis.destroy();
            lenis = null;
        }
        
        // Создаем новый экземпляр Lenis
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });
        
        // Привязываем Lenis к requestAnimationFrame для обновления
        function raf(time) {
            lenis.raf(time);
            // Обновляем lozad observer при скролле с lenis
            if (lozadObserver && lozadObserver.observer) {
                // Используем наблюдатель для проверки видимости элементов вместо triggerLoad без параметров
                const lazyImages = document.querySelectorAll('.lozad:not([data-loaded="true"])');
                lazyImages.forEach(img => {
                    if (lozadObserver.observer) {
                        lozadObserver.observer.unobserve(img);
                        lozadObserver.observer.observe(img);
                    }
                });
            }
            requestAnimationFrame(raf);
        }
        
        requestAnimationFrame(raf);
        
        // Обрабатываем якорные ссылки с Lenis
        const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
        
        if (anchorLinks.length > 0) {
            anchorLinks.forEach(link => {
                if (link && typeof link.addEventListener === 'function') {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        
                        // Используем event.target вместо this для безопасности
                        const targetHref = e.target && e.target.getAttribute ? e.target.getAttribute('href') : null;
                        
                        if (targetHref && lenis) {
                            const targetElement = document.querySelector(targetHref);
                            
                            if (targetElement) {
                                // Скролл к элементу с помощью Lenis
                                lenis.scrollTo(targetElement, {
                                    offset: 0,
                                    duration: 1.2,
                                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                                });
                            }
                        }
                    });
                }
            });
        }
        
        console.log('Lenis initialized successfully');
    } catch (error) {
        console.error('Error in initLenis:', error);
    }
}

function initPageTransitions() {
    try {
        // Scroll to top before transition begins
        barba.hooks.before(() => {
            window.scrollTo({ top: 0 });
        });

        // Добавляем хук для запуска инициализаций после перехода страницы
        barba.hooks.after(() => {
            // Реинициализируем lozad для нового контента
            initLozad();
            
            // Реинициализируем анимацию изображений
            initImageScaleAnimation();
            
            // Реинициализируем анимацию works items
            initWorksItemAnimation();
            
            // Инициализируем анимацию чисел
            initAnimNumbers();
            
            // Проверяем наличие слайдеров на любой странице
            const sliderBlocks = document.querySelectorAll(".slider-block");
            if (sliderBlocks.length > 0) {
                // Если есть слайдеры, запускаем их инициализацию
                initSliderBlocks(sliderBlocks);
            }
            
            // Проверяем, находимся ли на странице с табами
            const tabs = document.querySelectorAll('.typecard__tab');
            const tabContents = document.querySelectorAll('.typecard__content');
            if (tabs.length > 0 && tabContents.length > 0) {
                initTypecardTabs(tabs, tabContents);
            }
        });
        
        barba.init({
            sync: false, // Better to disable sync for proper animations
            debug: false,
            timeout: 7000,
            transitions: [{
                name: 'default',
                once({ next }) {
                    // Initialize on first load
                    updateBodyClass(next.html);
                    initScript();
                    
                    // Анимация появления контента при первой загрузке с GSAP
                    if (typeof gsap !== 'undefined') {
                        gsap.from(next.container, {
                            opacity: 0,
                            duration: 0.5,
                            ease: 'power1.out',
                            clearProps: 'all'
                        });
                    }
                },
                async leave(data) {
                    try {
                        // Content fade-out animation with GSAP
                        if (data && data.current && data.current.container) {
                            initBarbaNavUpdate(data);
                            
                            if (typeof gsap !== 'undefined') {
                                // Возвращаем промис с анимацией GSAP
                                return gsap.to(data.current.container, {
                                    opacity: 0,
                                    duration: 0.5,
                                    ease: 'power1.out',
                                    onComplete: () => {
                                        data.current.container.remove();
                                    }
                                });
                            } else {
                                // Fallback если GSAP не доступен
                                data.current.container.style.opacity = '0';
                                await delay(500);
                                data.current.container.remove();
                            }
                        }
                    } catch (error) {
                        console.error('Error in leave transition:', error);
                    }
                },
                async enter({ next }) {
                    try {
                        // Content fade-in animation with GSAP
                        updateBodyClass(next.html);
                        
                        // Set initial state
                        next.container.style.opacity = '0';
                        
                        if (typeof gsap !== 'undefined') {
                            // Создаем временную шкалу для последовательных анимаций
                            const tl = gsap.timeline();
                            
                            // Анимация основного контейнера
                            tl.to(next.container, {
                                opacity: 1,
                                duration: 0.5,
                                ease: 'power1.out',
                                clearProps: 'opacity'
                            });
                            
                            // Находим и анимируем хедер и заголовок
                            const header = next.container.querySelector('.header');
                            const heroTitle = next.container.querySelector('.hero__title h1');
                            
                            if (header) {
                                tl.to(header, {
                                    opacity: 1, 
                                    y: 0, 
                                    duration: 0.8,
                                    ease: "power2.out"
                                }, "-=0.3"); // Начинаем немного раньше окончания предыдущей анимации
                            }
                            
                            if (heroTitle) {
                                tl.to(heroTitle, {
                                    opacity: 1, 
                                    y: 0, 
                                    duration: 0.8,
                                    ease: "power2.out"
                                }, "-=0.5"); // Начинаем немного раньше окончания предыдущей анимации
                            }
                            
                            // Возвращаем промис окончания всей временной шкалы
                            return tl;
                        } else {
                            // Fallback если GSAP не доступен
                            next.container.style.opacity = '1';
                        }
                    } catch (error) {
                        console.error('Error in enter transition:', error);
                        // Установим непрозрачность напрямую в случае ошибки
                        next.container.style.opacity = '1';
                    }
                },
                async beforeEnter({ next }) {
                    updateBodyClass(next.html);
                    
                    // Подготавливаем элементы для анимации
                    if (typeof gsap !== 'undefined') {
                        const header = next.container.querySelector('.header');
                        const heroTitle = next.container.querySelector('.hero__title h1');
                        
                        // Устанавливаем начальное состояние для анимируемых элементов
                        if (header) {
                            gsap.set(header, { opacity: 0, y: -30 });
                        }
                    
                        if (heroTitle) {
                            gsap.set(heroTitle, { opacity: 0, y: 50 });
                        }
                    }

                    var cf_selector = 'div.wpcf7 > form';
                    var cf_forms = $(next.container).find(cf_selector);
                    if (cf_forms.length > 0) {
                        $(cf_selector).each(function() {
                            var $form = $(this);
                            wpcf7.init($form[0]);
                        });
                    }
                    
                    initScript();
                },
            }]
        });
    } catch (error) {
        console.error('Error in initPageTransitions:', error);
        // Инициализируем скрипты напрямую в случае ошибки
        initScript();
    }
}

/**
 * Обновляет класс <body> на основе нового HTML-кода
 */
function updateBodyClass(html) {
    try {
        if (!html) return;
        const matches = html.match(/<body.+?class="([^"]*)"/i);
        document.body.setAttribute('class', matches ? matches[1] : '');
    } catch (error) {
        console.error('Error in updateBodyClass:', error);
    }
}

/**
 * Функция задержки
 */
function delay(n = 2000) {
    return new Promise(done => setTimeout(done, n));
}

/**
 * Обновляет атрибуты элементов с data-barba-update
 */
function initBarbaNavUpdate(data) {
    try {
        // Проверяем, что data и data.next существуют и data.next.html определен
        if (!data || !data.next || !data.next.html) return;

        const updateItems = $(data.next.html).find('[data-barba-update]');
        
        if (updateItems.length > 0) {
            $('[data-barba-update]').each(function (index) {
                if ($(updateItems[index]).length > 0) {
                    const newLinkStatus = $(updateItems[index]).attr('data-link-status');
                    $(this).attr('data-link-status', newLinkStatus);
                }
            });
        }
    } catch (error) {
        console.error('Error in initBarbaNavUpdate:', error);
    }
}

/**
 * Устанавливает CSS-переменную для мобильных устройств
 */
function initWindowInnerheight() {
    try {
        $(document).ready(() => {
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        });

        // Обработка якорных ссылок теперь происходит в initLenis
    } catch (error) {
        console.error('Error in initWindowInnerheight:', error);
    }
}

/**
 * Инициализирует анимацию изображений при скролле с помощью GSAP (один раз)
 */
function initImageScaleAnimation() {
    try {
        if (typeof gsap === 'undefined') {
            console.warn('GSAP не найден, анимация изображений отключена');
            return;
        }

        if (typeof IntersectionObserver === 'undefined') {
            console.warn('IntersectionObserver не поддерживается');
            return;
        }

        const images = document.querySelectorAll('.hero img, .service__img img, .certs__gallery img');
        
        if (images.length === 0) return;

        // Устанавливаем начальное состояние для всех изображений
        gsap.set(images, { scale: 1.4 });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Анимируем к scale(1) только один раз
                    gsap.to(entry.target, {
                        scale: 1,
                        duration: 1.2,
                        ease: "power2.out"
                    });
                    
                    // Прекращаем наблюдение за этим элементом
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        images.forEach(img => {
            observer.observe(img);
        });
        
        console.log('Image scale animation with GSAP initialized');
    } catch (error) {
        console.error('Error in initImageScaleAnimation:', error);
    }
}

/**
 * Инициализирует анимацию появления блоков works__item с очередью
 */
function initWorksItemAnimation() {
    try {
        if (typeof gsap === 'undefined') {
            console.warn('GSAP не найден, анимация works items отключена');
            return;
        }

        if (typeof IntersectionObserver === 'undefined') {
            console.warn('IntersectionObserver не поддерживается');
            return;
        }

        const worksItems = document.querySelectorAll('.works__item');
        
        if (worksItems.length === 0) return;

        // Устанавливаем начальное состояние для всех элементов
        gsap.set(worksItems, { 
            opacity: 0, 
            y: 50 
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Находим индекс текущего элемента
                    const allItems = Array.from(document.querySelectorAll('.works__item'));
                    const currentIndex = allItems.indexOf(entry.target);
                    
                    // Анимируем только этот элемент с задержкой на основе его позиции
                    gsap.to(entry.target, {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "power2.out",
                        delay: (currentIndex % 2) * 0.2 // задержка для четных элементов
                    });
                    
                    // Прекращаем наблюдение за этим элементом
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        });

        // Наблюдаем за каждым элементом отдельно
        worksItems.forEach(item => {
            observer.observe(item);
        });
        
        console.log('Works items animation with GSAP initialized');
    } catch (error) {
        console.error('Error in initWorksItemAnimation:', error);
    }
}

/**
 * Запускает все скрипты на новой странице
 */
function initScript() {
    try {
        initLenis();
        initLozad();
        initBarbaNavUpdate();
        initWindowInnerheight();
        initImageScaleAnimation();
        initWorksItemAnimation();
        
        console.log('Basic scripts initialized');
    } catch (error) {
        console.error('Error in initScript:', error);
    }
}