/**
 * GendarMex Seguridad Privada - Interactivity & Cinematic Smooth Scroll
 */

// 0. Forzar que siempre que se recargue la página inicie desde arriba
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);

    // 1. Custom Smooth Easing Scroll Engine (Barrido Ultra Suave Cinemático)
    function smoothScrollTo(targetY, duration = 950) {
        const startY = window.pageYOffset;
        const diff = targetY - startY;
        let startTime = null;

        // Easing function: Cubic Ease In-Out para un inicio y frenado suave y elegante
        function easeInOutCubic(t) {
            return t < 0.5 
                ? 4 * t * t * t 
                : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        }

        function animationStep(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = easeInOutCubic(progress);

            window.scrollTo(0, startY + diff * ease);

            if (timeElapsed < duration) {
                requestAnimationFrame(animationStep);
            }
        }

        requestAnimationFrame(animationStep);
    }

    // Función de sanitización defensiva de entradas de usuario
    function sanitizeInput(str, maxLength = 100) {
        if (typeof str !== 'string') return '';
        // Eliminar caracteres nulos, secuencias de escape y caracteres de control invisibles
        let clean = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u202A-\u202E\u2066-\u2069]/g, '');
        // Normalizar saltos de línea repetidos y recortar extremos
        clean = clean.replace(/\r\n|\r/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
        return clean.slice(0, maxLength);
    }

    // Función de cálculo preciso de la altura del navbar fijo (inmune a la apertura del menú móvil)
    function getHeaderOffset() {
        const headerBar = document.querySelector('#mainNavbar > div:first-child');
        if (headerBar) {
            const navbar = document.getElementById('mainNavbar');
            const style = window.getComputedStyle(navbar);
            const pt = parseFloat(style.paddingTop) || 12;
            const pb = parseFloat(style.paddingBottom) || 12;
            return headerBar.offsetHeight + pt + pb;
        }
        return window.innerWidth < 1024 ? 68 : 78;
    }

    // Interceptar todos los enlaces del menú y botones ancla
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '' || !targetId.startsWith('#')) return;
            
            // Cerrar menú móvil inmediatamente para restaurar la altura correcta del viewport
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }

            try {
                if (targetId === '#inicio') {
                    e.preventDefault();
                    smoothScrollTo(0, 750);
                    return;
                }

                // Selector CSS seguro
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    const headerHeight = getHeaderOffset();
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    // Margen superior exacto: 10px en móvil, 15px en desktop bajo la barra fija
                    const extraPadding = window.innerWidth < 1024 ? 10 : 15;
                    const offsetPosition = Math.max(0, elementPosition + window.pageYOffset - (headerHeight + extraPadding));

                    // Ejecutar el barrido suave cinemático
                    smoothScrollTo(offsetPosition, 850);
                }
            } catch (err) {
                // Prevenir excepciones por selectores CSS no estándar
            }
        });
    });

    // 2. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // 3. Navbar Background Blur on Scroll
    const navbar = document.getElementById('mainNavbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('bg-[#0B0F17]/95', 'shadow-2xl', 'border-b', 'border-white/10');
            navbar.classList.remove('bg-transparent');
        } else {
            navbar.classList.remove('bg-[#0B0F17]/95', 'shadow-2xl', 'border-b', 'border-white/10');
            navbar.classList.add('bg-transparent');
        }
    });

    // 4. Scroll Reveal Animation Observer (Suave en PC, Tablet y Móvil)
    const revealElements = document.querySelectorAll('.reveal-item, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.08,
        rootMargin: '0px 0px -20px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 5. Counter Animation for Metrics
    const counters = document.querySelectorAll('.counter-value');
    let countersStarted = false;

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersStarted) {
                countersStarted = true;
                counters.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    const duration = 2000;
                    const increment = target / (duration / 25);

                    let current = 0;
                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            counter.innerText = Math.ceil(current);
                            setTimeout(updateCounter, 25);
                        } else {
                            counter.innerText = target + (counter.getAttribute('data-suffix') || '');
                        }
                    };
                    updateCounter();
                });
            }
        });
    }, { threshold: 0.4 });

    const metricsSection = document.getElementById('metricsSection');
    if (metricsSection) {
        counterObserver.observe(metricsSection);
    }

    // 6.5 Función de Asistencia para Postulaciones de Empleo
    window.prefillJobForm = function(puesto, plaza, experiencia) {
        const text = encodeURIComponent(`Hola GendarMex, deseo postularme para la vacante de ${puesto || 'Guardia de Seguridad'} (${plaza || 'Monterrey, N.L.'}).`);
        window.open(`https://wa.me/526183269057?text=${text}`, '_blank', 'noopener,noreferrer');
    };

    // 8. Contact / Quotation Form Submit Handler (Legal Consent & Sanitization)
    const contactForm = document.getElementById('quoteForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Verificación obligatoria de consentimiento comercial
            const quoteConsent = document.getElementById('quotePrivacyConsent');
            if (quoteConsent && !quoteConsent.checked) {
                alert('Debe aceptar el Aviso de Privacidad para que podamos elaborar su cotización.');
                quoteConsent.focus();
                return;
            }

            // Sanitización y límites defensivos de entradas
            const nombre = sanitizeInput(document.getElementById('quoteNombre')?.value || '', 70);
            const empresa = sanitizeInput(document.getElementById('quoteEmpresa')?.value || 'Particular', 70);
            const servicio = sanitizeInput(document.getElementById('quoteServicio')?.value || 'Guardias Intramuros', 50);
            const ciudad = sanitizeInput(document.getElementById('quoteCiudad')?.value || '', 70);
            const mensaje = sanitizeInput(document.getElementById('quoteMensaje')?.value || 'Sin detalles adicionales', 600);

            if (!nombre || !ciudad) {
                alert('Por favor complete los campos obligatorios.');
                return;
            }

            const text = `*SOLICITUD DE COTIZACIÓN - GENDARMEX*%0A` +
                         `👤 *Contacto:* ${encodeURIComponent(nombre)}%0A` +
                         `🏢 *Empresa:* ${encodeURIComponent(empresa)}%0A` +
                         `🛡️ *Servicio Requerido:* ${encodeURIComponent(servicio)}%0A` +
                         `📍 *Ubicación / Ciudad:* ${encodeURIComponent(ciudad)}%0A` +
                         `📝 *Detalles:* ${encodeURIComponent(mensaje)}%0A` +
                         `⚖️ *Aviso de Privacidad:* Aceptado`;

            window.open(`https://wa.me/526182933894?text=${text}`, '_blank', 'noopener,noreferrer');
        });
    }

    // 10. Controlador Universal de Carruseles Móviles (Servicios y Noticias)
    function initMobileCarousel(trackId, prevBtnId, nextBtnId, indicatorsId) {
        const track = document.getElementById(trackId);
        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);
        const indicators = document.querySelectorAll(`#${indicatorsId} [data-slide]`);

        if (!track) return;

        const getCards = () => Array.from(track.children).filter(el => el.classList.contains('glass-card') || el.classList.contains('snap-center'));

        function scrollToCard(targetIndex) {
            const cards = getCards();
            if (cards.length === 0) return;
            const clampedIndex = Math.max(0, Math.min(targetIndex, cards.length - 1));
            const card = cards[clampedIndex];
            
            const trackRect = track.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();
            const offset = (cardRect.left - trackRect.left) + track.scrollLeft - (track.clientWidth - card.clientWidth) / 2;
            
            track.scrollTo({ left: Math.max(0, offset), behavior: 'smooth' });
        }

        function getActiveIndex() {
            const cards = getCards();
            if (cards.length === 0) return 0;
            const trackRect = track.getBoundingClientRect();
            const trackCenter = trackRect.left + track.clientWidth / 2;
            let closestIndex = 0;
            let minDiff = Infinity;
            cards.forEach((card, idx) => {
                const cardRect = card.getBoundingClientRect();
                const cardCenter = cardRect.left + card.clientWidth / 2;
                const diff = Math.abs(trackCenter - cardCenter);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestIndex = idx;
                }
            });
            return closestIndex;
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const current = getActiveIndex();
                scrollToCard(current - 1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const current = getActiveIndex();
                scrollToCard(current + 1);
            });
        }

        indicators.forEach((dot, idx) => {
            dot.style.cursor = 'pointer';
            dot.addEventListener('click', () => {
                scrollToCard(idx);
            });
        });

        // Actualizar indicadores activos al hacer swipe con el dedo o scroll táctil
        let scrollRaf;
        track.addEventListener('scroll', () => {
            if (scrollRaf) cancelAnimationFrame(scrollRaf);
            scrollRaf = requestAnimationFrame(() => {
                const active = getActiveIndex();
                indicators.forEach((dot, idx) => {
                    if (idx === active) {
                        dot.classList.add('bg-[#FF6B00]');
                        dot.classList.remove('bg-white/30');
                    } else {
                        dot.classList.remove('bg-[#FF6B00]');
                        dot.classList.add('bg-white/30');
                    }
                });
            });
        }, { passive: true });
    }

    // Inicializar carruseles táctiles móviles
    initMobileCarousel('servicesTrack', 'servicesPrevBtn', 'servicesNextBtn', 'servicesIndicators');
    initMobileCarousel('newsTrack', 'newsPrevBtn', 'newsNextBtn', 'newsIndicators');

    // 11. Gestor de Consentimiento de Cookies (CMP Legal conforme a normativa de privacidad)
    const cookieBanner = document.getElementById('cookieConsentBanner');
    const btnAcceptCookies = document.getElementById('btnAcceptAllCookies');
    const btnRejectCookies = document.getElementById('btnRejectCookies');
    const footerCookieBtn = document.getElementById('footerCookieSettingsBtn');

    function showCookieBanner() {
        if (!cookieBanner) return;
        cookieBanner.classList.remove('translate-y-36', 'opacity-0', 'pointer-events-none');
        cookieBanner.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
    }

    function hideCookieBanner() {
        if (!cookieBanner) return;
        cookieBanner.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
        cookieBanner.classList.add('translate-y-36', 'opacity-0', 'pointer-events-none');
    }

    // Comprobar preferencia guardada
    const currentConsent = localStorage.getItem('gendarmex_cookie_consent');
    if (!currentConsent) {
        // Mostrar con un retardo natural tras cargar
        setTimeout(showCookieBanner, 1000);
    }

    if (btnAcceptCookies) {
        btnAcceptCookies.addEventListener('click', () => {
            localStorage.setItem('gendarmex_cookie_consent', 'all');
            hideCookieBanner();
        });
    }

    if (btnRejectCookies) {
        btnRejectCookies.addEventListener('click', () => {
            localStorage.setItem('gendarmex_cookie_consent', 'necessary');
            hideCookieBanner();
        });
    }

    if (footerCookieBtn) {
        footerCookieBtn.addEventListener('click', () => {
            showCookieBanner();
        });
    }

    // 12. Subventana Modal Legal (Aviso de Privacidad / Términos / Cookies)
    const legalModal = document.getElementById('legalModal');
    const legalTitle = document.getElementById('legalModalTitle');
    const legalBadge = document.getElementById('legalModalBadge');
    const legalModalBody = document.getElementById('legalModalBody');
    const privacySec = document.getElementById('legalPrivacySection');
    const termsSec = document.getElementById('legalTermsSection');
    const cookiesSec = document.getElementById('legalCookiesSection');
    const closeLegalBtn = document.getElementById('closeLegalModalBtn');
    const closeLegalBottomBtn = document.getElementById('closeLegalModalBottomBtn');
    const legalBackdrop = document.getElementById('legalModalBackdrop');

    function openLegalModal(type = 'privacy') {
        if (!legalModal) return;

        // Ocultar todas las secciones
        privacySec?.classList.add('hidden');
        termsSec?.classList.add('hidden');
        cookiesSec?.classList.add('hidden');

        if (type === 'privacy') {
            privacySec?.classList.remove('hidden');
            if (legalTitle) legalTitle.textContent = 'Aviso de Privacidad Integral';
            if (legalBadge) legalBadge.innerHTML = '<i class="fa-solid fa-shield-halved"></i>';
        } else if (type === 'terms') {
            termsSec?.classList.remove('hidden');
            if (legalTitle) legalTitle.textContent = 'Términos y Condiciones de Uso';
            if (legalBadge) legalBadge.innerHTML = '<i class="fa-solid fa-gavel"></i>';
        } else if (type === 'cookies') {
            cookiesSec?.classList.remove('hidden');
            if (legalTitle) legalTitle.textContent = 'Política de Cookies y Rastreadores';
            if (legalBadge) legalBadge.innerHTML = '<i class="fa-solid fa-cookie-bite"></i>';
        }

        // BLOQUEO ESTRICTO DEL SCROLL EN LA PÁGINA DE FONDO
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        // 1. Mostrar la subventana primero para que el navegador dimensione el contenedor
        legalModal.classList.remove('hidden');
        legalModal.classList.add('flex');

        // 2. Garantizar que siempre inicie en el margen superior (top) de forma infalible
        const resetModalScroll = () => {
            if (legalModalBody) {
                legalModalBody.scrollTop = 0;
                if (typeof legalModalBody.scrollTo === 'function') {
                    legalModalBody.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                }
            }
            if (legalModal) {
                legalModal.scrollTop = 0;
            }
        };

        // Ejecución inmediata
        resetModalScroll();

        // Ejecución en el siguiente cuadro de animación para asegurar el cálculo del layout
        requestAnimationFrame(() => {
            resetModalScroll();
            // Respaldo asíncrono para navegadores móviles con retardo de render
            setTimeout(resetModalScroll, 20);
        });
    }

    function closeLegalModal() {
        if (!legalModal) return;

        legalModal.classList.add('hidden');
        legalModal.classList.remove('flex');

        // Dejar el scroll en el top para la próxima apertura
        if (legalModalBody) {
            legalModalBody.scrollTop = 0;
        }

        // RESTAURAR SCROLL EN LA PÁGINA DE FONDO
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
    }

    // Asignar eventos de cierre
    if (closeLegalBtn) closeLegalBtn.addEventListener('click', closeLegalModal);
    if (closeLegalBottomBtn) closeLegalBottomBtn.addEventListener('click', closeLegalModal);
    if (legalBackdrop) legalBackdrop.addEventListener('click', closeLegalModal);

    // Cerrar con tecla Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && legalModal && !legalModal.classList.contains('hidden')) {
            closeLegalModal();
        }
    });

    // Interceptar todos los enlaces de la página para abrirlos en la subventana modal
    document.querySelectorAll('a[href*="aviso-de-privacidad"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openLegalModal('privacy');
        });
    });

    document.querySelectorAll('a[href*="terminos-y-condiciones"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openLegalModal('terms');
        });
    });

    document.querySelectorAll('a[href*="politica-de-cookies"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openLegalModal('cookies');
        });
    });
});
