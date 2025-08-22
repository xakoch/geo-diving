/**************************************************************
* Preloader
**************************************************************/
let isFirstLoad = true;

function initPreloader() {
    if (!isFirstLoad) return;
    
    const preloader = document.getElementById('preloader');
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    const mainWrap = document.querySelector('.main-wrap');
    
    if (!preloader) return;
    
    // Добавляем класс loading к body
    document.body.classList.add('loading');
    
    let progress = 0;
    let videoLoaded = false;
    let minTimeReached = false;
    
    // Минимальное время показа preloader
    const minDisplayTime = 1500;
    const startTime = Date.now();
    
    function updateProgress(newProgress) {
        progress = Math.min(newProgress, 100);
        progressFill.style.width = progress + '%';
        progressPercent.textContent = Math.round(progress);
    }
    
    function checkIfCanHide() {
        if (videoLoaded && minTimeReached) {
            hidePreloader();
        }
    }
    
    function hidePreloader() {
        // Начинаем скрытие preloader
        preloader.classList.add('hide');
        
        // Убираем класс loading и показываем контент
        document.body.classList.remove('loading');
        
        // Плавно показываем основной контент
        if (mainWrap) {
            mainWrap.style.transition = 'opacity 1s ease, visibility 1s ease';
            mainWrap.style.opacity = '1';
            mainWrap.style.visibility = 'visible';
        }
        
        setTimeout(() => {
            preloader.style.display = 'none';
            isFirstLoad = false;
            
            // Запускаем анимации после полного появления контента
            setTimeout(() => {
                initHeroAnimation();
                initImageScaleAnimation();
                initTextAnimation();
            }, 200);
            
        }, 800);
    }
    
    // Ждем загрузки видео в .promo
    const promoVideo = document.querySelector('.promo__video');
    if (promoVideo) {
        let videoProgressLoaded = false;
        
        // Анимируем прогресс до 80% пока ждем видео
        function animateToVideo() {
            const elapsed = Date.now() - startTime;
            const progressRatio = Math.min(elapsed / 2000, 1); // 2 секунды до 80%
            const easedProgress = 80 * easeOutCubic(progressRatio);
            
            updateProgress(easedProgress);
            
            if (progressRatio < 1 && !videoProgressLoaded) {
                requestAnimationFrame(animateToVideo);
            }
        }
        
        // Обработчики событий видео
        const onVideoCanPlayThrough = () => {
            console.log('Видео готово к воспроизведению');
            videoProgressLoaded = true;
            
            // Быстро доводим прогресс до 100%
            const finalProgress = setInterval(() => {
                progress += 5;
                updateProgress(progress);
                
                if (progress >= 100) {
                    clearInterval(finalProgress);
                    videoLoaded = true;
                    checkIfCanHide();
                }
            }, 50);
        };
        
        const onVideoLoadedData = () => {
            console.log('Видео данные загружены');
            if (progress < 90) {
                updateProgress(90);
            }
        };
        
        const onVideoCanPlay = () => {
            console.log('Видео может начать воспроизведение');
            if (progress < 95) {
                updateProgress(95);
            }
        };
        
        const onVideoError = () => {
            console.log('Ошибка загрузки видео, продолжаем без него');
            videoLoaded = true;
            updateProgress(100);
            checkIfCanHide();
        };
        
        // Слушаем события видео
        promoVideo.addEventListener('loadeddata', onVideoLoadedData, { once: true });
        promoVideo.addEventListener('canplay', onVideoCanPlay, { once: true });
        promoVideo.addEventListener('canplaythrough', onVideoCanPlayThrough, { once: true });
        promoVideo.addEventListener('error', onVideoError, { once: true });
        
        // Принудительная загрузка видео
        promoVideo.load();
        
        // Запускаем анимацию прогресса
        requestAnimationFrame(animateToVideo);
        
    } else {
        // Если видео нет, используем обычную анимацию
        function animateProgress() {
            const elapsed = Date.now() - startTime;
            const progressRatio = Math.min(elapsed / 2000, 1);
            const easedProgress = 100 * easeOutCubic(progressRatio);
            
            updateProgress(easedProgress);
            
            if (progressRatio < 1) {
                requestAnimationFrame(animateProgress);
            } else {
                videoLoaded = true;
                checkIfCanHide();
            }
        }
        
        requestAnimationFrame(animateProgress);
    }
    
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    // Проверяем минимальное время
    setTimeout(() => {
        minTimeReached = true;
        checkIfCanHide();
    }, minDisplayTime);
    
    // Fallback - скрываем preloader через максимальное время
    setTimeout(() => {
        if (!videoLoaded) {
            console.log('Fallback: принудительное завершение preloader');
            videoLoaded = true;
            updateProgress(100);
            checkIfCanHide();
        }
    }, 8000);
}


/**************************************************************
* Fancybox
**************************************************************/
function initFancybox() {
    try {
        // Проверяем, существует ли Fancybox
        if (typeof Fancybox === 'undefined') {
            console.warn('Fancybox не найден');
            return;
        }

        // Уничтожаем предыдущие экземпляры Fancybox
        Fancybox.destroy();

        // Инициализируем Fancybox заново
        Fancybox.bind("[data-fancybox]", {
            theme: 'light',
            hideScrollbar: false,
            closeButton: 'outside',
            dragToClose: false,
            animated: true,
            showClass: 'f-fadeIn',
            hideClass: 'f-fadeOut',
            on: {
                init: () => {
                    console.log('Fancybox initialized');
                }
            }
        });

        console.log('Fancybox reinitialized');
    } catch (error) {
        console.error('Error in initFancybox:', error);
    }
}

/**************************************************************
* Custom Cursor for Certificates Gallery
**************************************************************/
function initCustomCursor() {
    const galleryElement = document.querySelector('.certs__gallery');
    
    if (!galleryElement) return;
    
    // Проверяем, не создан ли уже курсор
    let cursor = document.querySelector('.custom-cursor');
    if (cursor) {
        cursor.remove();
    }
    
    // Создаем элемент курсора с иконкой
    cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
        </svg>
        <span>Skatīt sertifikātus</span>
    `;
    document.body.appendChild(cursor);
    
    let isVisible = false;
    let animationFrameId = null;
    let lastX = 0;
    let lastY = 0;
    let targetX = 0;
    let targetY = 0;
    let isMoving = false;
    
    // Плавная интерполяция позиции
    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    // Функция для плавного обновления позиции курсора
    function updateCursorPosition() {
        if (!isVisible) return;
        
        // Плавная интерполяция с коэффициентом 0.15 для плавности
        lastX = lerp(lastX, targetX, 0.15);
        lastY = lerp(lastY, targetY, 0.15);
        
        cursor.style.left = lastX + 'px';
        cursor.style.top = lastY + 'px';
        
        // Проверяем, нужно ли продолжать анимацию
        const deltaX = Math.abs(targetX - lastX);
        const deltaY = Math.abs(targetY - lastY);
        
        if (deltaX > 0.5 || deltaY > 0.5) {
            animationFrameId = requestAnimationFrame(updateCursorPosition);
        } else {
            isMoving = false;
            cursor.classList.remove('moving');
        }
    }
    
    // Обработчик движения мыши
    function handleMouseMove(e) {
        targetX = e.clientX;
        targetY = e.clientY;
        
        if (!isMoving && isVisible) {
            isMoving = true;
            cursor.classList.add('moving');
            updateCursorPosition();
        }
    }
    
    // Показываем курсор при наведении на галерею
    galleryElement.addEventListener('mouseenter', (e) => {
        if (!isVisible) {
            isVisible = true;
            
            // Скрываем курсор на всей странице
            document.documentElement.style.cursor = 'none';
            document.body.style.cursor = 'none';
            
            // Инициализируем позицию
            targetX = lastX = e.clientX;
            targetY = lastY = e.clientY;
            cursor.style.left = targetX + 'px';
            cursor.style.top = targetY + 'px';
            
            cursor.classList.add('active');
        }
    });
    
    // Скрываем курсор при уходе с галереи
    galleryElement.addEventListener('mouseleave', () => {
        if (isVisible) {
            isVisible = false;
            isMoving = false;
            
            // Возвращаем обычный курсор
            document.documentElement.style.cursor = 'auto';
            document.body.style.cursor = 'auto';
            
            cursor.classList.remove('active', 'moving');
            
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        }
    });
    
    // Отслеживаем движение мыши над галереей
    galleryElement.addEventListener('mousemove', handleMouseMove);
    
    // Очистка при переходах страниц
    return function cleanup() {
        if (cursor && cursor.parentNode) {
            cursor.remove();
        }
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        document.documentElement.style.cursor = 'auto';
        document.body.style.cursor = 'auto';
        isVisible = false;
        isMoving = false;
    };
}

// Ждем загрузку DOM перед инициализацией Barba
document.addEventListener('DOMContentLoaded', function() {
    // Сразу устанавливаем начальные состояния hero элементов
    setHeroInitialState();
    
    // Проверяем, загружен ли Barba.js
    if (typeof barba !== 'undefined') {
        initPageTransitions();
    } else {
        console.warn('Barba.js не найден');
        // Инициализируем preloader и скрипты напрямую, если Barba не доступен
        if (isFirstLoad) {
            initPreloader();
            
            // Ждем завершения preloader
            const waitForPreloader = () => {
                const preloader = document.getElementById('preloader');
                if (preloader && preloader.style.display !== 'none') {
                    setTimeout(waitForPreloader, 100);
                } else {
                    initScript();
                }
            };
            
            waitForPreloader();
        } else {
            initScript();
            // Инициализируем Fancybox в случае без Barba
            initFancybox();
            initCustomCursor();
        }
    }
    
    // Fallback - убираем loading класс через 5 секунд на всякий случай
    setTimeout(() => {
        if (document.body.classList.contains('loading')) {
            document.body.classList.remove('loading');
            const mainWrap = document.querySelector('.main-wrap');
            if (mainWrap) {
                mainWrap.style.opacity = '1';
                mainWrap.style.visibility = 'visible';
            }
            // Запускаем анимации, слайдеры, мобильное меню и Fancybox в fallback случае
            initHeroAnimation();
            initAboutCardAnimation();
            initSwiperSlider();
            initMobileMenu();
            initFancybox();
            initCustomCursor();
        }
    }, 5000);
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
        // Инициализируем preloader только при первой загрузке
        if (isFirstLoad) {
            initPreloader();
        }
        
        // Scroll to top before transition begins
        barba.hooks.before(() => {
            window.scrollTo({ top: 0 });
        });

        // Добавляем хук для запуска инициализаций после перехода страницы
        barba.hooks.after(() => {
            // Реинициализируем анимации
            initHeroAnimation();
            initImageScaleAnimation();
            initWorksItemAnimation();
            initAboutCardAnimation();
            initTextAnimation();
            
            // Инициализируем анимацию чисел
            initAnimNumbers();
            
            // Инициализируем слайдеры и мобильное меню
            initSwiperSlider();
            initMobileMenu();
            
            // Переинициализируем Fancybox
            initFancybox();
            initCustomCursor();
            
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
            prevent: ({ el }) => {
                // Исключаем ссылки с data-fancybox из обработки Barba
                return el.hasAttribute('data-fancybox') || 
                       el.closest('[data-fancybox]') !== null ||
                       el.getAttribute('href')?.includes('#') ||
                       el.getAttribute('target') === '_blank';
            },
            transitions: [{
                name: 'default',
                once({ next }) {
                    // Initialize on first load
                    updateBodyClass(next.html);
                    
                    // Ждем завершения preloader перед инициализацией
                    const waitForPreloader = () => {
                        const preloader = document.getElementById('preloader');
                        if (preloader && preloader.style.display !== 'none') {
                            setTimeout(waitForPreloader, 100);
                        } else {
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
                        }
                    };
                    
                    waitForPreloader();
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
                    
                    // Устанавливаем начальные состояния для hero элементов при переходах
                    setTimeout(() => {
                        setHeroInitialState();
                    }, 10);
                    
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
 * Инициализирует анимацию появления блоков about__card с очередью
 */
function initAboutCardAnimation() {
    try {
        if (typeof gsap === 'undefined') {
            console.warn('GSAP не найден, анимация about cards отключена');
            return;
        }

        if (typeof IntersectionObserver === 'undefined') {
            console.warn('IntersectionObserver не поддерживается');
            return;
        }

        const aboutCards = document.querySelectorAll('.about__card');
        
        if (aboutCards.length === 0) return;

        // Устанавливаем начальное состояние для всех карточек
        gsap.set(aboutCards, { 
            opacity: 0, 
            y: 40 
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Находим индекс текущего элемента
                    const allCards = Array.from(document.querySelectorAll('.about__card'));
                    const currentIndex = allCards.indexOf(entry.target);
                    
                    // Анимируем только эту карточку с небольшой задержкой
                    gsap.to(entry.target, {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: "power3.out",
                        delay: currentIndex * 0.1 // задержка между карточками
                    });
                    
                    // Прекращаем наблюдение за этим элементом
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -30px 0px'
        });

        // Наблюдаем за каждой карточкой отдельно
        aboutCards.forEach(card => {
            observer.observe(card);
        });
        
        console.log('About cards animation with GSAP initialized');
    } catch (error) {
        console.error('Error in initAboutCardAnimation:', error);
    }
}

/**
 * Инициализирует анимацию заголовков по словам снизу вверх
 */
function initTextAnimation() {
    try {
        if (typeof gsap === 'undefined') {
            console.warn('GSAP не найден, анимация текста отключена');
            return;
        }

        if (typeof IntersectionObserver === 'undefined') {
            console.warn('IntersectionObserver не поддерживается');
            return;
        }

        const headings = document.querySelectorAll('h1, h2');
        
        if (headings.length === 0) return;

        // Подготавливаем каждый заголовок для анимации
        headings.forEach(heading => {
            // Проверяем, не был ли уже обработан этот заголовок
            if (heading.hasAttribute('data-text-animated')) {
                // Если уже обработан, просто запускаем анимацию
                const wordSpans = heading.querySelectorAll('span span');
                if (wordSpans.length > 0) {
                    gsap.set(wordSpans, { y: '100%' });
                }
                return;
            }
            
            const text = heading.textContent;
            const words = text.trim().split(/\s+/);
            
            // Особая обработка для promo h2 - применяем text-indent только к первому слову
            const isPromoH2 = heading.closest('.promo') && heading.tagName === 'H2';
            
            heading.innerHTML = '';
            
            words.forEach((word, index) => {
                const wordWrapper = document.createElement('span');
                wordWrapper.style.cssText = 'display: inline-block; overflow: hidden; vertical-align: top;';
                
                // Для первого слова в promo h2 добавляем text-indent
                if (isPromoH2 && index === 0) {
                    wordWrapper.style.marginLeft = '5vw';
                }
                
                const wordSpan = document.createElement('span');
                wordSpan.style.cssText = 'display: inline-block;';
                wordSpan.textContent = word;
                
                wordWrapper.appendChild(wordSpan);
                heading.appendChild(wordWrapper);
                
                // Добавляем пробел после слова (кроме последнего)
                if (index < words.length - 1) {
                    heading.appendChild(document.createTextNode(' '));
                }
            });
            
            // Помечаем как обработанный
            heading.setAttribute('data-text-animated', 'true');
            
            // Устанавливаем начальное состояние для всех слов
            const wordSpans = heading.querySelectorAll('span span');
            gsap.set(wordSpans, { y: '100%' });
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const wordSpans = entry.target.querySelectorAll('span span');
                    
                    if (wordSpans.length === 0) return;
                    
                    // Анимируем каждое слово с плавной задержкой
                    wordSpans.forEach((span, index) => {
                        gsap.to(span, {
                            y: '0%',
                            duration: 1.2,
                            ease: "power2.out",
                            delay: index * 0.15 // увеличенная задержка между словами для лучшей видимости
                        });
                    });
                    
                    // Прекращаем наблюдение за этим элементом
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
        });

        // Наблюдаем за каждым заголовком отдельно
        headings.forEach(heading => {
            observer.observe(heading);
        });
        
        console.log('Text animation with GSAP initialized');
    } catch (error) {
        console.error('Error in initTextAnimation:', error);
    }
}

/**
 * Устанавливает начальные состояния для hero анимации
 */
function setHeroInitialState() {
    try {
        if (typeof gsap === 'undefined') return;

        const heroContent = document.querySelector('.hero__content');
        const heroImg = document.querySelector('.hero__img');
        
        // Устанавливаем начальные состояния сразу (скрываем элементы)
        if (heroContent) {
            gsap.set(heroContent, { opacity: 0, y: 30 });
        }
        
        if (heroImg) {
            gsap.set(heroImg, { opacity: 0, x: 50 });
        }
        
        console.log('Hero initial state set');
    } catch (error) {
        console.error('Error in setHeroInitialState:', error);
    }
}

/**
 * Инициализирует анимацию hero секции
 */
function initHeroAnimation() {
    try {
        if (typeof gsap === 'undefined') {
            console.warn('GSAP не найден, hero анимация отключена');
            return;
        }

        const heroContent = document.querySelector('.hero__content');
        const heroImg = document.querySelector('.hero__img');
        
        if (!heroContent && !heroImg) return;

        // Создаем временную шкалу для последовательных анимаций
        const tl = gsap.timeline();
        
        // Анимируем контент
        if (heroContent) {
            tl.to(heroContent, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out"
            });
        }
        
        // Анимируем изображение
        if (heroImg) {
            tl.to(heroImg, {
                opacity: 1,
                x: 0,
                duration: 1,
                ease: "power2.out"
            }, "-=0.5"); // Начинаем на 0.5 секунды раньше
        }
        
        console.log('Hero animation started');
    } catch (error) {
        console.error('Error in initHeroAnimation:', error);
    }
}

/**
 * Инициализирует автоплей видео
 */
function initVideoAutoplay() {
    try {
        const promoVideo = document.querySelector('.promo__video');
        if (promoVideo) {
            // Попытка запустить видео при загрузке
            promoVideo.play().catch(error => {
                console.log('Автоплей заблокирован браузером:', error);
            });
            
            // Запуск при первом взаимодействии с документом
            const startVideo = () => {
                promoVideo.play().catch(e => console.log('Не удалось запустить видео:', e));
                document.removeEventListener('click', startVideo);
                document.removeEventListener('scroll', startVideo);
                document.removeEventListener('keydown', startVideo);
            };
            
            document.addEventListener('click', startVideo, { once: true });
            document.addEventListener('scroll', startVideo, { once: true });
            document.addEventListener('keydown', startVideo, { once: true });
        }
    } catch (error) {
        console.error('Error in initVideoAutoplay:', error);
    }
}

// Глобальная переменная для хранения экземпляра слайдера
let gallerySlider;

/**
 * Swiper Slider
 */
function initSwiperSlider() {
    try {
        // Проверяем, существует ли Swiper
        if (typeof Swiper === 'undefined') {
            console.warn('Swiper не найден');
            return;
        }

        // Уничтожаем предыдущий экземпляр слайдера, если он существует
        if (gallerySlider) {
            gallerySlider.destroy(true, true);
            gallerySlider = null;
        }

        // Инициализируем слайдеры только если соответствующие элементы существуют
        const gallerySliderElement = document.querySelector(".gallery__slider");
        if (gallerySliderElement) {
            console.log('Инициализация gallery slider');
            gallerySlider = new Swiper(".gallery__slider", {
                slidesPerView: 1.2,
                loop: true,
                spaceBetween: 20,
                navigation: {
                    nextEl: ".btn-next",
                    prevEl: ".btn-prev",
                },
                breakpoints: {
                    768: {
                        slidesPerView: 2.2,
                    },
                    991: {
                        slidesPerView: 3.5,
                    },
                    1200: {
                        slidesPerView: 5,
                    }
                },
                autoplay: {
                    delay: 2500,
                    disableOnInteraction: false
                },
                on: {
                    init: function () {
                        console.log('Gallery slider initialized successfully');
                    }
                }
            });
        } else {
            console.log('Gallery slider element not found');
        }
        
    } catch (error) {
        console.error('Error in initSwiperSlider:', error);
    }
}


/**
 * Инициализирует мобильное меню
 */
function initMobileMenu() {
    try {
        const burger = document.querySelector('.burger');
        const mobileMenu = document.querySelector('.mobile-menu');
        const body = document.body;

        if (!burger || !mobileMenu) return;

        let isMenuOpen = false;

        // Функция открытия меню с анимацией
        function openMenu() {
            if (isMenuOpen) return;
            
            isMenuOpen = true;
            body.classList.add('menu-open');

            // GSAP анимация бургера и меню
            if (typeof gsap !== 'undefined') {
                const navLines = mobileMenu.querySelectorAll('.nav-link-line');
                const navLinks = mobileMenu.querySelectorAll('.nav-link-wrap a');
                const menuAction = mobileMenu.querySelector('.mobile-menu__action');
                const burgerSpans = burger.querySelectorAll('span');

                // Анимируем бургер в крестик
                gsap.to(burgerSpans[0], {
                    rotation: 45,
                    y: 8,
                    duration: 0.4,
                    ease: 'power2.out'
                });
                gsap.to(burgerSpans[1], {
                    opacity: 0,
                    duration: 0.2,
                    ease: 'power2.out'
                });
                gsap.to(burgerSpans[2], {
                    rotation: -45,
                    y: -8,
                    duration: 0.4,
                    ease: 'power2.out'
                });

                // Устанавливаем начальные состояния для меню
                gsap.set(navLines, { 
                    scaleX: 0,
                    opacity: 0,
                    transformOrigin: 'left center',
                    force3D: true
                });
                gsap.set(navLinks, { 
                    opacity: 0, 
                    y: 50,
                    force3D: true
                });
                gsap.set(menuAction, { 
                    opacity: 0, 
                    y: 60,
                    force3D: true
                });

                // Анимируем появление фона меню
                gsap.to(mobileMenu, {
                    opacity: 1,
                    visibility: 'visible',
                    duration: 0.3,
                    ease: 'power2.out'
                });

                // Создаем временную шкалу для меню
                const tl = gsap.timeline({ force3D: true });

                // Анимируем линии
                tl.to(navLines, {
                    scaleX: 1,
                    opacity: 1,
                    duration: 0.6,
                    ease: 'power2.out',
                    stagger: 0.08,
                    force3D: true
                }, 0.3)
                
                // Затем анимируем ссылки плавно снизу вверх
                .to(navLinks, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                    stagger: 0.1,
                    force3D: true
                }, 0.4)
                
                // В конце анимируем action блок
                .to(menuAction, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                    force3D: true
                }, 0.8);
            } else {
                // Fallback без GSAP
                burger.classList.add('active');
            }
        }

        // Функция закрытия меню
        function closeMenu() {
            if (!isMenuOpen) return;
            
            isMenuOpen = false;
            body.classList.remove('menu-open');

            // GSAP анимация закрытия меню и возврата бургера
            if (typeof gsap !== 'undefined') {
                const burgerSpans = burger.querySelectorAll('span');

                // Анимируем исчезновение меню
                gsap.to(mobileMenu, {
                    opacity: 0,
                    visibility: 'hidden',
                    duration: 0.3,
                    ease: 'power2.out'
                });

                // Возвращаем бургер в исходное состояние
                gsap.to(burgerSpans[0], {
                    rotation: 0,
                    y: 0,
                    duration: 0.4,
                    ease: 'power2.out'
                });
                gsap.to(burgerSpans[1], {
                    opacity: 1,
                    duration: 0.3,
                    ease: 'power2.out',
                    delay: 0.1
                });
                gsap.to(burgerSpans[2], {
                    rotation: 0,
                    y: 0,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            } else {
                // Fallback без GSAP
                burger.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        }

        // Обработчик клика по бургеру
        burger.addEventListener('click', function() {
            if (isMenuOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Закрытие меню при клике на ссылки
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                closeMenu();
            });
        });

        // Закрытие меню при клике на фон
        mobileMenu.addEventListener('click', function(e) {
            if (e.target === mobileMenu) {
                closeMenu();
            }
        });

        // Закрытие меню при нажатии Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMenuOpen) {
                closeMenu();
            }
        });

        console.log('Mobile menu with GSAP animations initialized');
    } catch (error) {
        console.error('Error in initMobileMenu:', error);
    }
}

/**
 * Запускает все скрипты на новой странице
 */
function initScript() {
    try {
        initLenis();
        initBarbaNavUpdate();
        initWindowInnerheight();
        initWorksItemAnimation();
        initAboutCardAnimation();
        initVideoAutoplay();
        
        // Слайдеры, мобильное меню и Fancybox инициализируем всегда
        initSwiperSlider();
        initMobileMenu();
        initFancybox();
        initCustomCursor();
        
        // Анимации запускаются только после preloader или при переходах между страницами
        if (!isFirstLoad) {
            initHeroAnimation();
            initImageScaleAnimation();
            initAboutCardAnimation();
            initTextAnimation();
        }
        
        console.log('Basic scripts initialized');
    } catch (error) {
        console.error('Error in initScript:', error);
    }
}