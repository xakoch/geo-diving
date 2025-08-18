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
Fancybox.bind("[data-fancybox]", {
	theme: 'light'
});

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
            // Запускаем hero анимацию в fallback случае
            initHeroAnimation();
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
            initTextAnimation();
            
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
                    
                    // Анимируем каждое слово с небольшой задержкой
                    wordSpans.forEach((span, index) => {
                        gsap.to(span, {
                            y: '0%',
                            duration: 0.8,
                            ease: "power2.out",
                            delay: index * 0.05 // небольшая задержка между словами
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

/**
 * Запускает все скрипты на новой странице
 */
function initScript() {
    try {
        initLenis();
        initBarbaNavUpdate();
        initWindowInnerheight();
        initWorksItemAnimation();
        initVideoAutoplay();
        
        // Анимации запускаются только после preloader или при переходах между страницами
        if (!isFirstLoad) {
            initHeroAnimation();
            initImageScaleAnimation();
            initTextAnimation();
        }
        
        console.log('Basic scripts initialized');
    } catch (error) {
        console.error('Error in initScript:', error);
    }
}