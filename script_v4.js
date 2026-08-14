/* ==========================================================================
   Lógica de Presentación Interactiva - script.js
   Presentador: Octavio Galván (Basado en el material de Fredi Vivas)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializaciones principales
    initScrollSpy();
    initScrollTop();
    initBackgroundParticles();
    initPresenterNotes();
    initIndexMenu();
    
    // Inicialización de widgets específicos
    initCoverSlide();
    initPyramidWidget();
    initNestedCirclesWidget();
    initNeuralNetWidget();
    initVennWidget();
    initComparisonSlider();
    initQuizWidget();
    initStatsCountUp();
    initChatSimulator();
    initFailureWidget();
    initEvolutionTimeline();
    initPolicyCards();
    initRegulationWidget();
    initUseCaseGrid();
    initMindsetWidget();
    
    // Widgets del Módulo Práctico Jurídico
    initTokensWidget();
    initMultimodalWidget();
    initExtensionsWidget();
    initGemsWidget();
    initNotebookLMWidget();
    initGmailWidget();
    
    // Menú hamburguesa móvil
    initMobileMenu();
});

// ==========================================================================
// MOBILE HAMBURGER MENU
// ==========================================================================
function initMobileMenu() {
    const btn = document.getElementById('btn-mobile-menu');
    const drawer = document.getElementById('mobile-nav-drawer');
    if (!btn || !drawer) return;
    
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        drawer.classList.toggle('open');
        const isOpen = drawer.classList.contains('open');
        btn.innerHTML = isOpen
            ? '<i data-lucide="x" style="width:20px;height:20px;"></i>'
            : '<i data-lucide="menu" style="width:20px;height:20px;"></i>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });
    
    // Cerrar al hacer clic en un enlace
    drawer.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            drawer.classList.remove('open');
            btn.innerHTML = '<i data-lucide="menu" style="width:20px;height:20px;"></i>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    });
    
    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!drawer.contains(e.target) && e.target !== btn) {
            drawer.classList.remove('open');
            btn.innerHTML = '<i data-lucide="menu" style="width:20px;height:20px;"></i>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    });
}


// ==========================================================================
// 1. SISTEMA DE NAVEGACIÓN Y SCROLL SPY (Landing Page Normal)
// ==========================================================================
let currentActiveIndex = 0;
let slides = [];
let slideSectionIndicator;
let navLinks = [];

function initScrollSpy() {
    slides = document.querySelectorAll('.slide');
    slideSectionIndicator = document.querySelector('.slide-section-indicator');
    navLinks = document.querySelectorAll('.header-nav-link');
    
    if (slides.length === 0) return;
    
    // Configurar IntersectionObserver para detectar qué sección está en pantalla
    const observerOptions = {
        root: null, // viewport principal
        rootMargin: '-20% 0px -60% 0px', // Detecta la sección activa según el centro de la pantalla
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = Array.from(slides).indexOf(entry.target);
                setActiveSection(index);
            }
        });
    }, observerOptions);
    
    slides.forEach(slide => observer.observe(slide));
    
    // Interceptar clics en los enlaces de la cabecera para suavidad
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                const offset = 90; // compensar el header sticky
                const elementPosition = targetEl.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition - offset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function setActiveSection(index) {
    currentActiveIndex = index;
    
    // Actualizar clases activas en las secciones
    slides.forEach((slide, idx) => {
        if (idx === index) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });
    
    // Actualizar el indicator del header
    const activeSlide = slides[index];
    if (activeSlide) {
        const sectionName = activeSlide.getAttribute('data-section') || 'Introducción';
        if (slideSectionIndicator) {
            slideSectionIndicator.textContent = sectionName;
        }
    }
    
    // Actualizar el enlace activo de la cabecera (mapear IDs)
    updateHeaderNavLinks(activeSlide ? activeSlide.id : '');
    
    // Sincronizar índice flotante
    const indexItems = document.querySelectorAll('.index-item');
    indexItems.forEach((item, idx) => {
        if (idx === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Sincronizar notas
    syncPresenterNotes(index);
    
    // Disparar animaciones específicas
    onSectionActivate(index);
}

function updateHeaderNavLinks(activeSlideId) {
    if (!activeSlideId) return;
    
    // Determinar qué grupo de navegación pertenece el ID
    let activeGroup = 'Inicio';
    if (activeSlideId === 'slide-cover') {
        activeGroup = 'Inicio';
    } else if (['slide-pyramid', 'slide-nested-circles', 'slide-neural-net', 'slide-mad', 'slide-comparison-analytics'].includes(activeSlideId)) {
        activeGroup = 'Conceptos';
    } else if (['slide-history', 'slide-stats'].includes(activeSlideId)) {
        activeGroup = 'Historia';
    } else if (['slide-chaos', 'slide-failure', 'slide-success', 'slide-policies'].includes(activeSlideId)) {
        activeGroup = 'Gobernanza';
    } else if (activeSlideId === 'slide-regulation') {
        activeGroup = 'Regulación';
    } else if (activeSlideId === 'slide-usecases') {
        activeGroup = 'Casos';
    } else if (['slide-mindset', 'slide-practical-intro', 'slide-tokens', 'slide-multimodal', 'slide-gems', 'slide-notebook', 'slide-matrix'].includes(activeSlideId)) {
        activeGroup = 'Práctica';
    }
    
    navLinks.forEach(link => {
        if (link.textContent.trim() === activeGroup) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Controladores para animaciones al activar slides
let lastActivatedIndex = -1;
function onSectionActivate(index) {
    if (index === lastActivatedIndex) return; // Evitar ejecuciones duplicadas repetitivas
    lastActivatedIndex = index;
    
    const activeSlide = slides[index];
    if (!activeSlide) return;
    const slideId = activeSlide.id;
    
    // 1. Estadísticas: Iniciar contador animado
    if (slideId === 'slide-stats') {
        startStatsCounters();
    }
    
    // 2. Chat de caos organizacional: Iniciar simulación de chat
    if (slideId === 'slide-chaos') {
        triggerChatSimulation();
    }
}

// ==========================================================================
// 2. BOTÓN IR ARRIBA (SCROLL TO TOP)
// ==========================================================================
function initScrollTop() {
    const btn = document.getElementById('scroll-top-btn');
    if (!btn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
            btn.style.transform = 'translateY(0) scale(1)';
        } else {
            btn.style.opacity = '0';
            btn.style.pointerEvents = 'none';
            btn.style.transform = 'translateY(10px) scale(0.9)';
        }
    });
    
    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Estilos iniciales del botón flotante
    btn.style.opacity = '0';
    btn.style.pointerEvents = 'none';
    btn.style.transition = 'var(--transition-smooth)';
    btn.style.transform = 'translateY(10px) scale(0.9)';
}

// ==========================================================================
// 3. PARTÍCULAS DE FONDO INTERACTIVAS (CANVAS)
// ==========================================================================
function initBackgroundParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    const maxParticles = 65;
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.35;
            this.vy = (Math.random() - 0.5) * 0.35;
            this.radius = Math.random() * 2 + 1;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 102, 254, 0.2)';
            ctx.fill();
        }
    }
    
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar conexiones
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 102, 254, ${0.1 * (1 - dist / 100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// ==========================================================================
// 4. PANEL DE NOTAS DEL PRESENTADOR (SPEAKER NOTES)
// ==========================================================================
function initPresenterNotes() {
    const notesToggle = document.querySelector('.btn-notes-toggle');
    const notesDrawer = document.getElementById('notes-drawer');
    const notesClose = document.querySelector('.notes-close');
    
    if (!notesToggle || !notesDrawer) return;
    
    notesToggle.addEventListener('click', () => {
        notesDrawer.classList.toggle('open');
    });
    
    notesClose.addEventListener('click', () => {
        notesDrawer.classList.remove('open');
    });
}

function syncPresenterNotes(index) {
    const notesTextContainer = document.getElementById('notes-text-content');
    if (!notesTextContainer) return;
    
    const activeSlide = slides[index];
    if (!activeSlide) return;
    
    const sourceSlideRef = activeSlide.getAttribute('data-source-slide') || 'Sin referencia';
    const notesHTML = activeSlide.querySelector('.speaker-notes-data') ? 
                      activeSlide.querySelector('.speaker-notes-data').innerHTML : 
                      '<p>No hay notas específicas para esta sección.</p>';
    
    notesTextContainer.innerHTML = `
        <div class="notes-section">
            <div class="notes-section-title">Origen de la Diapositiva original</div>
            <div class="notes-section-content" style="font-weight: 700; color: var(--accent-purple);">
                ${sourceSlideRef}
            </div>
        </div>
        <div class="notes-section">
            <div class="notes-section-title">Guía de Discurso y Consejos</div>
            <div class="notes-section-content">
                ${notesHTML}
            </div>
        </div>
    `;
}

// ==========================================================================
// 5. ÍNDICE RÁPIDO FLOTANTE
// ==========================================================================
function initIndexMenu() {
    const menuToggle = document.getElementById('index-menu-toggle');
    const indexDrawer = document.getElementById('index-drawer');
    
    if (!menuToggle || !indexDrawer) return;
    
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        indexDrawer.classList.toggle('open');
    });
    
    document.addEventListener('click', (e) => {
        if (!indexDrawer.contains(e.target) && e.target !== menuToggle) {
            indexDrawer.classList.remove('open');
        }
    });
    
    // Crear lista de índice a partir de las slides/secciones
    const indexList = indexDrawer.querySelector('.index-list');
    indexList.innerHTML = '';
    
    slides.forEach((slide, idx) => {
        const titleElement = slide.querySelector('.slide-title');
        let titleText = titleElement ? titleElement.textContent.replace(/[\n\r]+/g, ' ').trim() : `Sección ${idx + 1}`;
        if (titleText.length > 28) titleText = titleText.substring(0, 26) + '...';
        
        const section = slide.getAttribute('data-section') || 'Intro';
        
        const li = document.createElement('li');
        li.className = 'index-item';
        if (idx === currentActiveIndex) li.className += ' active';
        
        li.innerHTML = `
            <span style="font-size: 0.7rem; color: var(--text-muted); font-family: monospace; width: 20px;">${String(idx).padStart(2, '0')}</span>
            <span style="flex:1;">${titleText}</span>
            <span style="font-size: 0.65rem; background: rgba(0,102,254,0.05); padding: 2px 6px; border-radius: 4px; color: var(--accent-blue);">${section}</span>
        `;
        
        li.addEventListener('click', () => {
            const offset = 90;
            const elementPosition = slide.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = elementPosition - offset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            indexDrawer.classList.remove('open');
        });
        
        indexList.appendChild(li);
    });
}

// ==========================================================================
// WIDGETS INTERACTIVOS DE DIAPOSITIVAS
// ==========================================================================

// --- Slide 1: Portada y Bios ---
function initCoverSlide() {
    const bioCards = document.querySelectorAll('.bio-card');
    bioCards.forEach(card => {
        card.addEventListener('click', () => {
            const role = card.getAttribute('data-role');
            if (role === 'fredi') {
                alert("Fredi Vivas: Ingeniero en Sistemas, Profesor de Inteligencia Artificial en UdeSA, Fundador de RockingData y autor del Best Seller 'Cómo piensan las máquinas'. Es un divulgador y formador clave en la región.");
            } else {
                alert("Octavio Galván: Abogado especializado en Derecho Digital e Integración Tecnológica. Experto en mitigar riesgos legales, propiedad intelectual y gobernanza corporativa en la implementación de IA.");
            }
        });
    });
}

// --- Slide 2: Ecosistema Pirámide ---
function initPyramidWidget() {
    const tiers = document.querySelectorAll('.pyramid-tier');
    const title = document.getElementById('pyramid-tier-title');
    const desc = document.getElementById('pyramid-tier-desc');
    const num = document.getElementById('pyramid-tier-num');
    const examplesContainer = document.getElementById('pyramid-tier-examples');
    
    if (tiers.length === 0) return;
    
    const tierData = {
        5: {
            title: "Aplicaciones Tradicionales con IA",
            desc: "Software que todos usamos a diario en el ámbito laboral y de consumo, al cual se le han inyectado capacidades de IA (como autocompletar, recomendaciones inteligentes, retoques generativos básicos). El usuario final consume IA sin configurar nada técnico.",
            examples: ["Microsoft Copilot en Office 365", "Adobe Firefly en Photoshop", "Filtros inteligentes en Gmail", "Autocompletar en Excel"]
        },
        4: {
            title: "Aplicaciones Especializadas (Nativas de IA)",
            desc: "Herramientas construidas desde cero con el único propósito de resolver tareas generativas específicas (redacción de textos, generación de imágenes, edición de video automatizada, transcripción estructurada). Tienen interfaces listas para el usuario final.",
            examples: ["Jasper AI (Redacción)", "Midjourney (Imágenes)", "Synthesia (Video)", "Otter.ai (Transcripciones)"]
        },
        3: {
            title: "Asistentes Multimodales & Chatbots",
            desc: "Puntos de entrada universales que pueden procesar múltiples tipos de datos (texto, audio, código, imágenes) y actuar como agentes conversacionales para razonar, resumir y automatizar tareas a nivel general. Son el estándar actual de productividad.",
            examples: ["ChatGPT Plus (OpenAI)", "Gemini Advanced (Google)", "Claude 3.5 Sonnet (Anthropic)", "Copilot Chat"]
        },
        2: {
            title: "Herramientas Generativas & Frameworks de Desarrollo",
            desc: "Capas intermedias, librerías, APIs e infraestructuras que permiten a desarrolladores programar agentes complejos, conectar modelos fundacionales con bases de datos corporativas externas (RAG) e integrar IA de forma segura en sistemas existentes.",
            examples: ["LangChain (Framework de Agentes)", "OpenAI API", "Hugging Face (Librerías)", "Vector Databases (Pinecone/Chroma)"]
        },
        1: {
            title: "Modelos Fundacionales (La Base de Todo)",
            desc: "Grandes modelos de lenguaje y multimodales (LLMs) preentrenados con terabytes de información general. Requieren millones de dólares en supercómputo y son el cerebro latente sobre el cual se apoya todo el ecosistema de IA generativa moderno.",
            examples: ["GPT-4o (OpenAI)", "Claude 3 (Anthropic)", "Llama 3 (Meta - Open Source)", "Gemini 1.5 Pro (Google)"]
        }
    };
    
    function updateTierDisplay(tierNum) {
        tiers.forEach(t => t.classList.remove('active'));
        const activeTier = Array.from(tiers).find(t => t.getAttribute('data-tier') == tierNum);
        if (activeTier) activeTier.classList.add('active');
        
        const data = tierData[tierNum];
        num.textContent = `Nivel ${tierNum} — ${tierNum === 1 ? 'Base' : tierNum === 5 ? 'Cúspide' : 'Ecosistema'}`;
        title.textContent = data.title;
        desc.textContent = data.desc;
        
        examplesContainer.innerHTML = '';
        data.examples.forEach(ex => {
            const span = document.createElement('span');
            span.className = 'example-tag';
            span.innerHTML = `<i class="lucide-cpu" style="width:12px; height:12px;"></i> ${ex}`;
            examplesContainer.appendChild(span);
        });
    }
    
    tiers.forEach(tier => {
        tier.addEventListener('click', () => {
            const tierNum = tier.getAttribute('data-tier');
            updateTierDisplay(tierNum);
        });
    });
    
    // Iniciar con la base (Nivel 1)
    updateTierDisplay(1);
}

// --- Slide 3: Círculos Anidados ---
function initNestedCirclesWidget() {
    const circles = document.querySelectorAll('.nested-circle');
    const title = document.getElementById('circle-detail-title');
    const desc = document.getElementById('circle-detail-desc');
    const source = document.getElementById('circle-detail-source');
    
    if (circles.length === 0) return;
    
    const circleData = {
        cs: {
            title: "Ciencias de la Computación",
            desc: "El campo científico general enfocado en el estudio de la computación, algoritmos, procesamiento de datos y la arquitectura de sistemas. Es el tronco común tecnológico del cual nace toda la informática.",
            source: "Fuente: ACM (Association for Computing Machinery)"
        },
        ai: {
            title: "Inteligencia Artificial (Concepto Paraguas)",
            desc: "Nacido formalmente en 1956, describe el desarrollo de sistemas capaces de realizar tareas que usualmente requieren inteligencia humana (razonar, tomar decisiones, comprender lenguajes, reconocer patrones visuales). Es una meta amplia.",
            source: "Fuente: Dartmouth Workshop 1956"
        },
        ml: {
            title: "Machine Learning (Aprendizaje Automático)",
            desc: "Subcampo de la IA donde las computadoras no son programadas explícitamente con reglas rígidas, sino que aprenden de forma autónoma analizando patrones dentro de conjuntos de datos y mejorando sus predicciones con el tiempo.",
            source: "Fuente: Arthur Samuel (1959)"
        },
        dl: {
            title: "Deep Learning (Aprendizaje Profundo)",
            desc: "Técnica avanzada de Machine Learning inspirada en la estructura del cerebro humano. Utiliza redes neuronales artificiales profundas (de múltiples capas) para procesar datos complejos no estructurados como audios, imágenes y textos libres.",
            source: "Fuente: Yann LeCun / Geoffrey Hinton (2012)"
        },
        genai: {
            title: "Generative AI (IA Generativa)",
            desc: "La punta más reciente del ecosistema. Modelos que no solo analizan datos existentes, sino que son capaces de **crear contenido nuevo e inédito** (texto, código, imágenes, música) basándose en las probabilidades estadísticas aprendidas durante su entrenamiento.",
            source: "Fuente: OpenAI / Google DeepMind"
        }
    };
    
    function updateCircleDisplay(id) {
        circles.forEach(c => c.classList.remove('active'));
        const activeCircle = Array.from(circles).find(c => c.getAttribute('data-circle') === id);
        if (activeCircle) activeCircle.classList.add('active');
        
        const data = circleData[id];
        title.textContent = data.title;
        desc.textContent = data.desc;
        source.innerHTML = `<strong>${data.source}</strong>`;
    }
    
    circles.forEach(circle => {
        circle.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que burbujee a círculos exteriores
            const id = circle.getAttribute('data-circle');
            updateCircleDisplay(id);
        });
    });
    
    // Iniciar con la punta visible (GenAI)
    updateCircleDisplay('genai');
}

// --- Slide 4: Venn Diagram (MAD) ---
function initVennWidget() {
    const bubbles = document.querySelectorAll('.venn-circle, .venn-intersection');
    const title = document.getElementById('mad-detail-title');
    const desc = document.getElementById('mad-detail-desc');
    
    if (bubbles.length === 0) return;
    
    const vennData = {
        data: {
            title: "D — DATA (Los Datos)",
            desc: "La IA no es magia, es estadística a gran escala. Sin datos de calidad estructurados y accesibles, los algoritmos carecen del 'alimento' necesario para entrenarse o dar respuestas. Los datos representan el pasado e histórico de la organización."
        },
        ml: {
            title: "M — MACHINE LEARNING",
            desc: "El motor de cómputo y modelado matemático que procesa esos datos, detecta patrones sutiles imposibles de ver para un humano y aprende a predecir comportamientos futuros."
        },
        ai: {
            title: "A — ARTIFICIAL INTELLIGENCE",
            desc: "La automatización del proceso decisional completo y la interfaz de cara al negocio. Es el agente que decide la acción basada en las predicciones que generó el motor de Machine Learning."
        },
        mad: {
            title: "MAD: Machine Learning + AI + Data",
            desc: "El ecosistema completo. 'No hay IA sin MAD'. Muestra que antes de querer implementar modelos avanzados de IA (como ChatGPT), una empresa debe consolidar su infraestructura de datos (D) e integrar el aprendizaje automático (M). De lo contrario, se construyen soluciones sobre arena."
        }
    };
    
    function updateVennDisplay(id) {
        bubbles.forEach(b => b.classList.remove('active'));
        const activeBubble = Array.from(bubbles).find(b => b.getAttribute('data-venn') === id);
        if (activeBubble) activeBubble.classList.add('active');
        
        const data = vennData[id];
        title.textContent = data.title;
        desc.textContent = data.desc;
    }
    
    bubbles.forEach(bubble => {
        bubble.addEventListener('click', () => {
            const id = bubble.getAttribute('data-venn');
            updateVennDisplay(id);
        });
    });
    
    // Iniciar con MAD (Fórmula general)
    updateVennDisplay('mad');
}

// --- Slide 5: Analytics vs Machine Learning ---
function initComparisonSlider() {
    const switchContainer = document.querySelector('.switch-input-container');
    const labelAnalytics = document.getElementById('label-analytics');
    const labelML = document.getElementById('label-ml');
    const cardAnalytics = document.getElementById('card-analytics');
    const cardML = document.getElementById('card-ml');
    const churnScenario = document.getElementById('churn-scenario-desc');
    
    if (!switchContainer) return;
    
    const scenarios = {
        analytics: "<strong>Caso Fuga de Clientes (Churn):</strong> El departamento de Analytics tradicional genera un reporte en PDF el día 5 de cada mes que indica cuántos clientes se dieron de baja el mes pasado y detalla que la pérdida de ingresos fue del 4%. <em>Es un diagnóstico reactivo del pasado.</em>",
        ml: "<strong>Caso Fuga de Clientes (Churn):</strong> Un modelo predictivo de Machine Learning analiza el comportamiento de uso diario en tiempo real. Al detectar que un cliente premium disminuyó sus ingresos un 30% en la última semana, predice un 85% de probabilidad de fuga inminente y dispara automáticamente un email con un descuento del 15% personalizado. <em>Es una acción proactiva enfocada en el futuro.</em>"
    };
    
    function toggleState(isML) {
        if (isML) {
            switchContainer.classList.add('active');
            labelML.classList.add('active');
            labelAnalytics.classList.remove('active');
            cardML.classList.add('highlight', 'active-ml');
            cardAnalytics.classList.remove('highlight');
            churnScenario.innerHTML = scenarios.ml;
        } else {
            switchContainer.classList.remove('active');
            labelML.classList.remove('active');
            labelAnalytics.classList.add('active');
            cardAnalytics.classList.add('highlight');
            cardML.classList.remove('highlight', 'active-ml');
            churnScenario.innerHTML = scenarios.analytics;
        }
    }
    
    switchContainer.addEventListener('click', () => {
        const isCurrentlyML = switchContainer.classList.contains('active');
        toggleState(!isCurrentlyML);
    });
    
    labelAnalytics.addEventListener('click', () => toggleState(false));
    labelML.addEventListener('click', () => toggleState(true));
    
    // Iniciar en Analytics
    toggleState(false);
}

// --- Slide 6: Línea de Tiempo e Historia ---
function initQuizWidget() {
    const timeline = document.querySelector('.timeline-container');
    const timelineProgress = document.querySelector('.timeline-progress-line');
    const timelineNodes = document.querySelectorAll('.timeline-node');
    
    if (!timeline || timelineNodes.length === 0) return;
    
    // Configuración de la línea de tiempo
    const timelineData = [
        { progressWidth: "0%" },   // 1956
        { progressWidth: "25%" },  // 1997
        { progressWidth: "50%" },  // 2012
        { progressWidth: "75%" },  // 2022
        { progressWidth: "100%" }  // Presente
    ];

    const timelineYears = {
        0: { year: "1956 - Conferencia de Dartmouth (Origen)", text: "John McCarthy, Marvin Minsky y Claude Shannon proponen formalmente el término 'Artificial Intelligence' (Inteligencia Artificial) en un workshop de verano en Dartmouth. Se consolida el campo científico." },
        1: { year: "1997 - Derrota de Kasparov (Deep Blue)", text: "La supercomputadora Deep Blue de IBM derrota al campeón mundial de ajedrez Garry Kasparov en un encuentro oficial. Demuestra que la potencia de cálculo lógico bruto puede vencer al intelecto humano en juegos estructurados." },
        2: { year: "2012 - Boom de las Redes Neuronales (AlexNet)", text: "La red AlexNet gana la competencia de visión ImageNet por un margen sin precedentes. Demuestra la viabilidad del Aprendizaje Profundo (Deep Learning) entrenado sobre tarjetas gráficas (GPUs)." },
        3: { year: "2022 - Lanzamiento de ChatGPT (Democratización)", text: "OpenAI lanza una interfaz conversacional masiva y gratuita para interactuar con su LLM. ChatGPT alcanza 100 millones de usuarios activos en solo dos meses, iniciando el boom de la IA Generativa." },
        4: { year: "Hoy - Agentes Inteligentes y Regulación", text: "Evolución hacia sistemas multiagentes capaces de actuar con autonomía en procesos corporativos. A la vez, se consolida la primera legislación integral del mundo (la Ley Europea de IA - IA Act)." }
    };
    
    function activateTimelineNode(index) {
        timelineNodes.forEach(node => node.classList.remove('active'));
        timelineNodes[index].classList.add('active');
        if (timelineProgress) {
            timelineProgress.style.width = timelineData[index].progressWidth;
        }
        
        // Actualizar panel de detalles inferior
        const yearEl = document.getElementById('timeline-detail-year');
        const textEl = document.getElementById('timeline-detail-text');
        if (yearEl && textEl && timelineYears[index]) {
            yearEl.textContent = timelineYears[index].year;
            textEl.textContent = timelineYears[index].text;
        }
    }
    
    timelineNodes.forEach((node, idx) => {
        node.addEventListener('click', () => {
            activateTimelineNode(idx);
        });
    });
    
    // Pre-activar el nodo Dartmouth 1956 por defecto
    activateTimelineNode(0);
}

// Confeti Digital Simple con Canvas
function triggerConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '99999';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let pieces = [];
    const numPieces = 150;
    const colors = ['#0066fe', '#00b4d8', '#7209b7', '#9d4edd', '#0f9d58', '#f2994a'];
    
    for (let i = 0; i < numPieces; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * canvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 5,
            tiltAngleIncremental: Math.random() * 0.07 + 0.02,
            tiltAngle: 0
        });
    }
    
    let animationId;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let active = false;
        pieces.forEach(p => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.x += Math.sin(p.tiltAngle);
            p.tilt = Math.sin(p.tiltAngle - (p.r / 2)) * 8;
            
            if (p.y < canvas.height) active = true;
            
            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
            ctx.stroke();
        });
        
        if (active) {
            animationId = requestAnimationFrame(draw);
        } else {
            cancelAnimationFrame(animationId);
            canvas.remove();
        }
    }
    draw();
}

// --- Slide 7: Animación de Estadísticas ---
function initStatsCountUp() {
    // Se ejecuta al activarse la sección en scroll
}

let statsAnimated = false;
function startStatsCounters() {
    if (statsAnimated) return;
    statsAnimated = true;
    
    const stats = [
        { elementId: 'stat-num-1', target: 180, suffix: 'M+' },
        { elementId: 'stat-num-2', target: 50, suffix: '%' },
        { elementId: 'stat-num-3', target: 210, suffix: 'B$' }
    ];
    
    stats.forEach(stat => {
        const el = document.getElementById(stat.elementId);
        if (!el) return;
        
        el.textContent = '0' + stat.suffix;
        
        let current = 0;
        const duration = 1200; // ms
        const stepTime = 15; // ms
        const steps = duration / stepTime;
        const increment = stat.target / steps;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= stat.target) {
                el.textContent = Math.round(stat.target) + stat.suffix;
                clearInterval(timer);
            } else {
                el.textContent = Math.round(current) + stat.suffix;
            }
        }, stepTime);
    });
}

// --- Slide 8: Simulador de Chat de Caos Organizacional ---
let chatSimTimer;
let chatAnimated = false;
function initChatSimulator() {
    // Se ejecuta al activarse la sección en scroll
}

function triggerChatSimulation() {
    if (chatAnimated) return;
    chatAnimated = true;
    
    const container = document.getElementById('chat-messages-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const messages = [
        { sender: "Director de Marketing", text: "¡Mi hijo de 12 años hizo una web en 5 minutos con GPT! Estamos perdiendo el tiempo, hay que subir todo a la IA ya.", class: "right" },
        { sender: "CEO", text: "¡Cuidado! Prohíban de inmediato el uso de ChatGPT en las computadoras de la oficina. Riesgo total de filtraciones.", class: "left" },
        { sender: "Gerente Legal", text: "El uso no regulado (Shadow AI) expone nuestros datos a OpenAI. Podríamos perder el secreto industrial de nuestros algoritmos si los empleados suben código.", class: "lawyer" },
        { sender: "Líder de Ventas", text: "Pero mis vendedores están cerrando el doble de propuestas usándolo a escondidas... ¿qué hacemos?", class: "right" }
    ];
    
    let idx = 0;
    
    function addNextMessage() {
        if (idx >= messages.length) return;
        
        const msg = messages[idx];
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${msg.class}`;
        bubble.innerHTML = `
            <span class="bubble-sender">${msg.sender}</span>
            <span class="bubble-text">${msg.text}</span>
        `;
        
        container.appendChild(bubble);
        container.scrollTop = container.scrollHeight;
        
        idx++;
        chatSimTimer = setTimeout(addNextMessage, 1800);
    }
    
    chatSimTimer = setTimeout(addNextMessage, 300);
}

// --- Slide 9: Samsung Leak Step Dashboard ---
function initFailureWidget() {
    const cards = document.querySelectorAll('.leak-step-card');
    const legalTexts = {
        1: {
            title: "Pérdida de Secretos Comerciales",
            content: "Al subir código fuente patentado del software de medición de semiconductores a OpenAI para corregir un bug, Samsung perdió el control exclusivo sobre esa información confidencial. Legalmente, el secreto industrial exige medidas de resguardo; subirlo a una IA pública rompe esa confidencialidad."
        },
        2: {
            title: "Exposición de Datos Sensibles e IP",
            content: "Optimizar el rendimiento de la maquinaria de descarte de chips subiendo bases de datos técnicas expone propiedad intelectual corporativa ante servidores externos, sin un acuerdo de confidencialidad (NDA) firmado."
        },
        3: {
            title: "Secreto Profesional y Actas Directivas",
            content: "La transcripción de actas de una reunión corporativa estratégica para generar un resumen ejecutivo con ChatGPT filtra información comercial confidencial a un tercero, vulnerando el deber de reserva societario."
        }
    };
    
    const verdictHeader = document.getElementById('failure-verdict-title');
    const verdictContent = document.getElementById('failure-verdict-content');
    
    if (cards.length === 0) return;
    
    function updateVerdict(stepNum) {
        cards.forEach(c => c.classList.remove('active'));
        const activeCard = Array.from(cards).find(c => c.getAttribute('data-step') == stepNum);
        if (activeCard) activeCard.classList.add('active');
        
        const data = legalTexts[stepNum];
        verdictHeader.textContent = data.title;
        verdictContent.textContent = data.content;
    }
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const stepNum = card.getAttribute('data-step');
            updateVerdict(stepNum);
        });
    });
    
    // Iniciar con la primera filtración
    updateVerdict(1);
}

// --- Slide 10: JP Morgan Evolution ---
function initEvolutionTimeline() {
    const nodes = document.querySelectorAll('.evolution-node');
    const progressLine = document.querySelector('.evolution-progress-line');
    
    const statusIcon = document.getElementById('evolution-status-icon');
    const evoTitle = document.getElementById('evolution-title');
    const evoDesc = document.getElementById('evolution-desc');
    
    if (nodes.length === 0) return;
    
    const evoData = [
        {
            progressWidth: "0%",
            iconClass: "danger",
            iconInner: '<i class="lucide-shield-alert" style="width:36px; height:36px;"></i>',
            title: "Febrero 2023: Bloqueo Total",
            desc: "Siguiendo la postura general de Wall Street (riesgos de fuga de datos y presiones del regulador FINRA), JP Morgan prohíbe de forma absoluta el uso de ChatGPT y herramientas de IA de consumo en su red interna."
        },
        {
            progressWidth: "50%",
            iconClass: "primary",
            iconInner: '<i class="lucide-git-branch" style="width:36px; height:36px;"></i>',
            title: "Verano 2024: Desarrollo Interno (LLM Suite)",
            desc: "En lugar de mantener un veto perpetuo, construyen una pasarela propia y segura (LLM Suite). Conectan modelos de lenguaje de nivel corporativo vía APIs privadas, garantizando por contrato que los datos bancarios no se utilicen para entrenar modelos externos."
        },
        {
            progressWidth: "100%",
            iconClass: "success",
            iconInner: '<i class="lucide-users" style="width:36px; height:36px;"></i>',
            title: "Adopción Masiva y Productividad Segura",
            desc: "Alcanza rápidamente 60,000 usuarios en agosto 2024. Para 2025/2026, la plataforma asiste de forma regulada a más de 200,000 empleados a nivel mundial para la redacción de informes, auditorías de contratos y análisis financiero con total cumplimiento legal."
        }
    ];
    
    function activateEvoNode(index) {
        nodes.forEach(n => n.classList.remove('active'));
        nodes[index].classList.add('active');
        progressLine.style.width = evoData[index].progressWidth;
        
        const data = evoData[index];
        statusIcon.className = `evolution-status-icon ${data.iconClass}`;
        statusIcon.innerHTML = data.iconInner;
        evoTitle.textContent = data.title;
        evoDesc.textContent = data.desc;
    }
    
    nodes.forEach((node, idx) => {
        node.addEventListener('click', () => {
            activateEvoNode(idx);
        });
    });
    
    // Iniciar en la prohibición
    activateEvoNode(0);
}

// --- Slide 11: 3 Políticas de Decisiones ---
function initPolicyCards() {
    const cards = document.querySelectorAll('.policy-card-3d');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });
}

// --- Slide 12: Regulación (IA Act) ---
function initRegulationWidget() {
    const cards = document.querySelectorAll('.reg-level-card');
    const title = document.getElementById('reg-detail-title');
    const desc = document.getElementById('reg-detail-desc');
    const listContainer = document.getElementById('reg-detail-examples-list');
    
    if (cards.length === 0) return;
    
    const regData = {
        unacceptable: {
            title: "Riesgo Inaceptable (Totalmente Prohibido)",
            desc: "Sistemas de IA que representan una amenaza clara para la seguridad, los medios de vida y los derechos constitucionales de las personas de la Unión Europea. Su uso está estrictamente vedado.",
            examples: [
                "Sistemas de puntuación social administrados por gobiernos (Social Scoring).",
                "Manipulación cognitiva del comportamiento (ej. juguetes activados por voz que induzcan a conductas peligrosas).",
                "Categorización biométrica para deducir opiniones políticas, raza u orientación sexual."
            ]
        },
        high: {
            title: "Riesgo Alto (Estrictamente Regulado)",
            desc: "Sistemas utilizados en áreas de alta criticidad social y económica. No están prohibidos, pero exigen auditorías periódicas, trazabilidad algorítmica, mitigación de sesgos e intervención humana garantizada antes de su despliegue.",
            examples: [
                "Software de reclutamiento y selección de personal (CV Screening).",
                "Evaluación de solvencia crediticia bancaria (Credit Scoring).",
                "Sistemas de identificación biométrica remota en tiempo real.",
                "Gestión de infraestructuras críticas (agua, gas, electricidad)."
            ]
        },
        limited: {
            title: "Riesgo Limitado (Obligación de Transparencia)",
            desc: "Herramientas que interactúan directamente con humanos o generan contenido manipulado. Deben asegurar por ley que el usuario final sea notificado de que está tratando con una IA.",
            examples: [
                "Chatbots de atención al cliente (como la versión gratuita de ChatGPT).",
                "Contenido generado o manipulado sintéticamente (Deepfakes).",
                "Textos generados por IA con fines informativos masivos."
            ]
        },
        minimal: {
            title: "Riesgo Mínimo o Nulo (Sin Obligación Legal)",
            desc: "La gran mayoría de los sistemas que se usan a diario. Representan una amenaza mínima para la seguridad del usuario y no tienen cargas regulatorias bajo la ley.",
            examples: [
                "Videojuegos impulsados por IA (comportamiento de NPCs).",
                "Filtros de Spam en el correo electrónico corporativo.",
                "Sistemas de recomendación básicos en e-commerce."
            ]
        }
    };
    
    function updateRegDisplay(levelId) {
        cards.forEach(c => c.classList.remove('active'));
        const activeCard = Array.from(cards).find(c => c.getAttribute('data-level') === levelId);
        if (activeCard) activeCard.classList.add('active');
        
        const data = regData[levelId];
        title.textContent = data.title;
        desc.textContent = data.desc;
        
        listContainer.innerHTML = '';
        data.examples.forEach(ex => {
            const li = document.createElement('li');
            li.className = 'reg-detail-example-item';
            li.innerHTML = `<i class="lucide-alert-triangle" style="width:14px; height:14px; flex-shrink:0;"></i> <span>${ex}</span>`;
            listContainer.appendChild(li);
        });
    }
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const levelId = card.getAttribute('data-level');
            updateRegDisplay(levelId);
        });
    });
    
    // Iniciar con Riesgo Alto (punto más crítico)
    updateRegDisplay('high');
}

// --- Slide 13: Casos de Uso Sectoriales ---
const caseStudies = [
    {
        sector: "retail",
        company: "Walmart",
        tag: "Buscador GenAI",
        metric: "Conversacional",
        summary: "Migró de una búsqueda tradicional de palabras clave a una orientada a 'misiones de compra' en lenguaje natural (ej. 'planear fiesta infantil de unicornios').",
        problem: "Los clientes pasaban demasiado tiempo buscando productos individuales y usando filtros manuales confusos.",
        solution: "Integración de LLMs propios ('Wallaby') combinados con APIs de OpenAI, permitiendo analizar intenciones complejas del usuario en un solo chat.",
        impact: "Reducción significativa del abandono del carrito de compras y aumento de la conversión al ofrecer soluciones y listas enteras en lugar de productos aislados.",
        source: "Fuente: Walmart Corporate / Retail Dive"
    },
    {
        sector: "operaciones",
        company: "AB InBev",
        tag: "Multiagentes NLP",
        metric: "+40% Satisfacción",
        summary: "Automatizó la resolución y procesamiento de errores de envío de facturación en su ecosistema B2B digital (BEES).",
        problem: "Los errores de facturación y despacho tardaban días en resolverse a través de emails y soporte humano, afectando la experiencia del cliente.",
        solution: "Despliegue de agentes automatizados inteligentes (SS&C Blue Prism) integrados con procesamiento de lenguaje natural (NLP) para interactuar directamente con facturas.",
        impact: "Mejora del 40% en los índices de satisfacción del cliente (CSAT) y agilización total del proceso administrativo.",
        source: "Fuente: SS&C Blue Prism / CX Dive Case Study"
    },
    {
        sector: "retail",
        company: "Amazon",
        tag: "Recomendaciones",
        metric: "35% Ventas",
        summary: "Motor de recomendación predictivo e inteligente altamente personalizado basado en hábitos históricos de compra y navegación.",
        problem: "Los usuarios a menudo no lograban descubrir productos complementarios relevantes para sus necesidades en el catálogo masivo.",
        solution: "Desarrollo de algoritmos de filtrado colaborativo en tiempo real a nivel de ítem que predicen lo que comprarás a continuación.",
        impact: "Aproximadamente el 35% de todas las ventas del sitio de Amazon provienen directamente de estas sugerencias contextuales.",
        source: "Fuente: McKinsey & Company / Amazon Business Report"
    },
    {
        sector: "finanzas",
        company: "Seguros Fraude",
        tag: "Detección Fraude",
        metric: "-70% Tiempo Inv.",
        summary: "Aplicación de redes neuronales y ML para auditar reclamos de daños y accidentes automovilísticos de forma masiva.",
        problem: "Los analistas pasaban semanas revisando documentación física, fotos y facturas para descartar fraudes en seguros de autos.",
        solution: "Modelos de visión artificial que analizan fotografías de siniestros, cruzándolas con metadatos del clima y bases de datos históricas de colisiones.",
        impact: "Reducción del 70% en el tiempo de investigación manual y ahorro millonario en liquidaciones de reclamos fraudulentos.",
        source: "Fuente: Accenture Financial Services Report"
    },
    {
        sector: "finanzas",
        company: "Seguros de Viaje",
        tag: "Motor Recomendación",
        metric: "61% Precisión",
        summary: "Algoritmo predictivo que analiza el destino, edad y duración del viaje del cliente para ofrecer coberturas específicas óptimas.",
        problem: "Las pólizas de viaje genéricas no lograban atraer a viajeros jóvenes o de deportes extremos, resultando en bajas tasas de conversión.",
        solution: "Motores de Machine Learning predictivos entrenados con perfiles de siniestralidad de millones de viajes previos.",
        impact: "Logró una precisión del 61% en recomendar la póliza ideal en el primer contacto, elevando las ventas cruzadas.",
        source: "Fuente: Gartner Case Study in Insurance Tech"
    },
    {
        sector: "operaciones",
        company: "Redacción Deportes",
        tag: "Generación Texto",
        metric: "Automatizada",
        summary: "Uso de sistemas de NLP estructurados para redactar crónicas de partidos deportivos locales o ligas menores de forma instantánea.",
        problem: "Los medios no podían costear redactores humanos dedicados para cubrir ligas de fútbol escolar o juvenil.",
        solution: "Motores de IA que toman planillas estructuradas de estadísticas (goles, tiros, tarjetas) y redactan crónicas informativas fluidas en segundos.",
        impact: "Generación de miles de artículos deportivos locales adicionales de bajo costo sin sobrecargar a la redacción principal.",
        source: "Fuente: AP (Associated Press) / Reuters AI Journalism"
    }
];

function initUseCaseGrid() {
    const grid = document.getElementById('usecases-grid');
    const filterButtons = document.querySelectorAll('.btn-filter-tag');
    const modal = document.getElementById('usecase-modal');
    const modalContent = document.getElementById('modal-body-content');
    const modalClose = document.querySelector('.modal-close');
    
    if (!grid || !modal) return;
    
    // Generar dinámicamente las tarjetas de casos de uso
    function renderCards(filter = 'all') {
        grid.innerHTML = '';
        caseStudies.forEach(item => {
            if (filter !== 'all' && item.sector !== filter) return;
            
            const card = document.createElement('div');
            card.className = 'usecase-card';
            card.innerHTML = `
                <div class="usecase-card-header">
                    <span class="usecase-company">${item.company}</span>
                    <span class="usecase-tag">${item.tag}</span>
                </div>
                <p class="usecase-summary">${item.summary}</p>
                <div class="usecase-metric">
                    <i class="lucide-trending-up" style="width:16px; height:16px;"></i>
                    <span>${item.metric}</span>
                </div>
            `;
            
            card.addEventListener('click', () => {
                openUseCaseModal(item);
            });
            
            grid.appendChild(card);
        });
    }
    
    // Filtrado
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            renderCards(filterValue);
        });
    });
    
    // Modal
    function openUseCaseModal(item) {
        modalContent.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid rgba(0, 102, 254, 0.08); padding-bottom:12px;">
                <h3 style="font-family:var(--font-heading); font-size:1.6rem; font-weight:800; color:var(--text-primary);">${item.company}</h3>
                <span class="usecase-tag" style="font-size:0.75rem; padding:6px 12px; border-radius:30px;">${item.tag}</span>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:12px; margin-top:15px;">
                <div>
                    <h4 style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">El Problema inicial</h4>
                    <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.4; margin-top:2px;">${item.problem}</p>
                </div>
                
                <div>
                    <h4 style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Solución con IA</h4>
                    <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.4; margin-top:2px;">${item.solution}</p>
                </div>
                
                <div style="background:var(--success-light); border:1px solid rgba(15,157,88,0.15); padding:15px; border-radius:12px;">
                    <h4 style="font-size:0.75rem; text-transform:uppercase; color:var(--success); font-weight:800;">Impacto / Métricas de Éxito</h4>
                    <p style="font-size:0.9rem; color:#0e5a32; font-weight:700; line-height:1.4; margin-top:4px;">
                        <i class="lucide-check-circle" style="width:16px; height:16px; display:inline-block; vertical-align:middle; margin-right:4px;"></i>
                        ${item.impact} (${item.metric})
                    </p>
                </div>
            </div>
            
            <div style="font-size:0.7rem; color:var(--text-muted); text-align:right; border-top:1px solid #e4e7ec; padding-top:10px; margin-top:10px;">
                <strong>${item.source}</strong>
            </div>
        `;
        modal.classList.add('open');
    }
    
    modalClose.addEventListener('click', () => {
        modal.classList.remove('open');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('open');
        }
    });
    
    renderCards('all');
}

// --- Slide 14: Mindset ---
function initMindsetWidget() {
    const rows = document.querySelectorAll('.mindset-row');
    rows.forEach(row => {
        row.addEventListener('click', () => {
            row.style.transform = 'scale(1.02)';
            setTimeout(() => {
                row.style.transform = 'scale(1)';
            }, 200);
        });
    });
}

// --- Slide: Redes Neuronales ---
function initNeuralNetWidget() {
    const btnApple = document.getElementById('btn-nn-apple');
    const btnBanana = document.getElementById('btn-nn-banana');
    
    if (!btnApple || !btnBanana) return;
    
    // Draw SVG connections on load and window resize
    setTimeout(drawNNConnections, 200);
    window.addEventListener('resize', drawNNConnections);
    
    // Handler for inputs
    btnApple.addEventListener('click', () => updateNNInput('apple'));
    btnBanana.addEventListener('click', () => updateNNInput('banana'));
    
    // Draw initial state
    updateNNInput('apple');
}

function updateNNInput(type) {
    const btnApple = document.getElementById('btn-nn-apple');
    const btnBanana = document.getElementById('btn-nn-banana');
    const nodeX1 = document.getElementById('nn-node-x1');
    const nodeX2 = document.getElementById('nn-node-x2');
    const nodeH1 = document.getElementById('nn-node-h1');
    const nodeH2 = document.getElementById('nn-node-h2');
    const nodeY1 = document.getElementById('nn-node-y1');
    const nodeY2 = document.getElementById('nn-node-y2');
    
    const eqApple = document.getElementById('nn-eq-apple');
    const eqBanana = document.getElementById('nn-eq-banana');
    const resApple = document.getElementById('nn-res-apple');
    const resBanana = document.getElementById('nn-res-banana');
    
    // Remove active classes
    btnApple.classList.remove('active');
    btnBanana.classList.remove('active');
    nodeX1.classList.remove('active', 'active-purple');
    nodeX2.classList.remove('active', 'active-purple');
    nodeH1.classList.remove('active', 'active-purple');
    nodeH2.classList.remove('active', 'active-purple');
    nodeY1.classList.remove('active', 'active-purple');
    nodeY2.classList.remove('active', 'active-purple');
    
    // Reset SVG connection lines active classes
    const lines = document.querySelectorAll('.nn-connection-line');
    lines.forEach(line => {
        line.classList.remove('active', 'active-purple');
    });
    
    if (type === 'apple') {
        btnApple.classList.add('active');
        nodeX1.textContent = '1';
        nodeX2.textContent = '0';
        
        nodeX1.classList.add('active');
        
        // Simular retardo de paso de señal (izquierda a derecha)
        setTimeout(() => {
            document.getElementById('conn-x1-h1')?.classList.add('active');
            nodeH1.classList.add('active');
        }, 150);
        
        setTimeout(() => {
            document.getElementById('conn-h1-y1')?.classList.add('active');
            nodeY1.classList.add('active');
            nodeY1.textContent = '90%';
            nodeY2.textContent = '5%';
            
            // Fórmulas
            eqApple.textContent = 'y1 = (1 * 0.9) + (0 * -0.4) = +0.9';
            eqBanana.textContent = 'y2 = (1 * -0.5) + (0 * 0.95) = -0.5';
            
            resApple.className = 'nn-math-result';
            resApple.textContent = 'Resultado: +0.9 (Manzana ✅)';
            resBanana.className = 'nn-math-result danger';
            resBanana.textContent = 'Resultado: -0.5 (Banana ❌)';
        }, 300);
        
    } else {
        btnBanana.classList.add('active');
        nodeX1.textContent = '0';
        nodeX2.textContent = '1';
        
        nodeX2.classList.add('active-purple');
        
        setTimeout(() => {
            document.getElementById('conn-x2-h2')?.classList.add('active-purple');
            nodeH2.classList.add('active-purple');
        }, 150);
        
        setTimeout(() => {
            document.getElementById('conn-h2-y2')?.classList.add('active-purple');
            nodeY2.classList.add('active-purple');
            nodeY1.textContent = '8%';
            nodeY2.textContent = '95%';
            
            // Fórmulas
            eqApple.textContent = 'y1 = (0 * 0.9) + (1 * -0.4) = -0.4';
            eqBanana.textContent = 'y2 = (0 * -0.5) + (1 * 0.95) = +0.95';
            
            resApple.className = 'nn-math-result danger';
            resApple.textContent = 'Resultado: -0.4 (Manzana ❌)';
            resBanana.className = 'nn-math-result';
            resBanana.textContent = 'Resultado: +0.95 (Banana ✅)';
        }, 300);
    }
}

function drawNNConnections() {
    const svg = document.getElementById('nn-svg-connections');
    const container = document.querySelector('.nn-visual-container');
    if (!svg || !container) return;
    
    svg.innerHTML = ''; // Limpiar conexiones previas
    
    const x1 = document.getElementById('nn-node-x1');
    const x2 = document.getElementById('nn-node-x2');
    const h1 = document.getElementById('nn-node-h1');
    const h2 = document.getElementById('nn-node-h2');
    const y1 = document.getElementById('nn-node-y1');
    const y2 = document.getElementById('nn-node-y2');
    
    if (!x1 || !x2 || !h1 || !h2 || !y1 || !y2) return;
    
    const containerRect = container.getBoundingClientRect();
    
    function getCenter(el) {
        const r = el.getBoundingClientRect();
        return {
            x: r.left - containerRect.left + r.width / 2,
            y: r.top - containerRect.top + r.height / 2
        };
    }
    
    const px1 = getCenter(x1);
    const px2 = getCenter(x2);
    const ph1 = getCenter(h1);
    const ph2 = getCenter(h2);
    const py1 = getCenter(y1);
    const py2 = getCenter(y2);
    
    const connections = [
        { from: px1, to: ph1, id: 'conn-x1-h1' },
        { from: px1, to: ph2, id: 'conn-x1-h2' },
        { from: px2, to: ph1, id: 'conn-x2-h1' },
        { from: px2, to: ph2, id: 'conn-x2-h2' },
        { from: ph1, to: py1, id: 'conn-h1-y1' },
        { from: ph1, to: py2, id: 'conn-h1-y2' },
        { from: ph2, to: py1, id: 'conn-h2-y1' },
        { from: ph2, to: py2, id: 'conn-h2-y2' }
    ];
    
    connections.forEach(conn => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', conn.from.x);
        line.setAttribute('y1', conn.from.y);
        line.setAttribute('x2', conn.to.x);
        line.setAttribute('y2', conn.to.y);
        line.setAttribute('id', conn.id);
        line.setAttribute('class', 'nn-connection-line');
        svg.appendChild(line);
    });
}

// --- Slide P1: Tokens Calculator ---
function initTokensWidget() {
    const presets = document.querySelectorAll('.btn-token-preset');
    const label = document.getElementById('token-preset-name');
    const display = document.getElementById('token-count-display');
    const fill = document.getElementById('token-progress-fill');
    
    if (presets.length === 0) return;
    
    function updateTokens(btn) {
        presets.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        
        const count = parseInt(btn.getAttribute('data-tokens'));
        const name = btn.getAttribute('data-label');
        
        if (label) label.textContent = name;
        if (display) display.textContent = `~${count.toLocaleString('es-AR')} tokens`;
        
        // Gemini 3.5 Pro has 2,000,000 max. Calculate percentage.
        // We add a min-width of 1% so the bar is always visible, and max of 100%
        let pct = (count / 2000000) * 100;
        if (pct < 1) pct = 1.2; // min visual representation
        if (pct > 100) pct = 100;
        
        if (fill) fill.style.width = `${pct}%`;
    }
    
    presets.forEach(btn => {
        btn.addEventListener('click', () => updateTokens(btn));
    });
    
    // Initial state
    updateTokens(presets[0]);
}

// --- Slide P2: Gemini Multimodal ---
function initMultimodalWidget() {
    const btn = document.getElementById('btn-apply-prompt');
    const displayTable = document.getElementById('prompt-table-display');
    
    if (!btn || !displayTable) return;
    
    btn.addEventListener('click', () => {
        btn.innerHTML = `<i class="lucide-refresh-cw" style="width:16px; height:16px; display:inline-block; vertical-align:middle; margin-right:6px; animation: spin 1s linear infinite;"></i> Analizando cédula...`;
        displayTable.classList.remove('active');
        
        setTimeout(() => {
            btn.innerHTML = `<i class="lucide-check-circle" style="width:16px; height:16px; display:inline-block; vertical-align:middle; margin-right:6px;"></i> Análisis Completado`;
            displayTable.classList.add('active');
            
            // Confeti de celebración
            triggerConfetti();
            
            setTimeout(() => {
                btn.innerHTML = `<i class="lucide-play" style="width:16px; height:16px; display:inline-block; vertical-align:middle; margin-right:6px;"></i> Re-ejecutar Prompt`;
            }, 3000);
        }, 1200);
    });
}

// Animación de rotación para icono Lucide
const styleTag = document.createElement('style');
styleTag.innerHTML = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(styleTag);

// --- Slide P3: Gems Creator ---
const gemsData = {
    redactor: {
        prompt: `Actúa como un abogado especialista en Derecho Procesal y Administrativo. Tu única función es redactar borradores formales de Cartas Documento e Intimaciones legales en español técnico-jurídico argentino. En cada respuesta debes:\n1. Incluir el encabezado formal de notificación.\n2. Utilizar corchetes [ ] para delimitar los datos variables.\n3. Citar la fundamentación normativa o contractual aplicable.\n4. Concluir con la apercibimiento legal correspondiente en caso de incumplimiento.`,
        original: `Intimar al cobro de haberes adeudados de junio de forma urgente.`,
        output: `[Localidad], [Fecha].\n\nAL SEÑOR: [Nombre del Destinatario]\n[Domicilio del Destinatario]\n\nINTIMO a usted en su carácter de empleador, para que en el plazo perentorio de 48 horas proceda a liquidar y abonar haberes adeudados del mes de junio del corriente año... Todo ello bajo apercibimiento de iniciar acciones legales pertinentes (Art. 74 y ccs. LCT)... Fdo: [Nombre del Abogado].`
    },
    simplificador: {
        prompt: `Toma dictámenes técnicos, sentencias complejas o resoluciones administrativas y los traduce a lenguaje claro en formato de viñetas para informar al afiliado o cliente por correo/WhatsApp. Utiliza tono cordial, lenguaje sencillo sin tecnicismos jurídicos y resalta los pasos a seguir.`,
        original: `Que de conformidad con lo normado en el artículo 15 de la Ley Previsional N° 8206 y habiendo dictaminado favorablemente la Asesoría Jurídica de esta Caja de Seguridad Social, corresponde hacer lugar al beneficio pensionario solicitado por la actora...`,
        output: `• Se aprobó su solicitud de pensión jubilatoria.\n• El dictamen del área legal de la Caja de Seguridad Social fue a su favor.\n• El beneficio fue concedido bajo la Ley 8206.\n• El cobro se liquidará automáticamente en su cuenta bancaria habitual.`
    },
    auditor: {
        prompt: `Escanea cláusulas de contratos de locación, convenios o servicios buscando riesgos procesales, desequilibrios prestacionales o vacíos legales. Reporta alertas de riesgo identificadas con una explicación procesal y sugiere redacciones alternativas de mitigación.`,
        original: `Cláusula Décima: El Locatario acepta renunciar a todo derecho de indemnización por daños causados por filtraciones, humedad o defectos edilicios previos, asumiendo el costo íntegro de su reparación.`,
        output: `⚠️ ALERTA DE RIESGO: Cláusula abusiva de exoneración de responsabilidad.\n\nExplicación: Desequilibra la relación contractual al liberar al propietario de su obligación legal de entregar el inmueble en condiciones de habitabilidad. Viola principios del Código Civil y Comercial argentino.`
    }
};

function initGemsWidget() {
    const selectors = document.querySelectorAll('.gem-card-selector');
    const promptBox = document.getElementById('gems-prompt-box');
    const originalBox = document.getElementById('gems-diff-original');
    const outputBox = document.getElementById('gems-diff-output');
    
    if (selectors.length === 0) return;
    
    function showGem(id) {
        selectors.forEach(s => s.classList.remove('active'));
        const activeSel = Array.from(selectors).find(s => s.getAttribute('data-gem') === id);
        if (activeSel) activeSel.classList.add('active');
        
        const data = gemsData[id];
        if (promptBox) promptBox.textContent = data.prompt;
        if (originalBox) originalBox.textContent = data.original;
        if (outputBox) outputBox.textContent = data.output;
    }
    
    selectors.forEach(sel => {
        sel.addEventListener('click', () => {
            showGem(sel.getAttribute('data-gem'));
        });
    });
    
    // Init state
    showGem('redactor');
}

// --- Slide P4: NotebookLM simulator ---
const notebookAnswers = {
    contradicciones: {
        text: "Al auditar las fuentes se detecta una contradicción procesal directa entre la demanda [1] y la declaración del Testigo B [2]. Mientras la demanda alega incapacidad previsional absoluta a partir de marzo de 2026, el testigo declara que el actor continuó realizando tareas operativas remuneradas en la finca hasta mayo de 2026. Esta diferencia de fechas debilita la fundamentación del perjuicio urgente en el amparo.",
        highlights: [1, 2]
    },
    cronologia: {
        text: "Construyendo cronología procesal extraída de las fuentes de la demanda [1] y la Ley Previsional [3]:\n- 10/08/2026: Presentación de demanda ante el Juzgado Civil y Comercial.\n- 13/08/2026: Recepción de cédula de traslado por 5 días.\n- 20/08/2026: Plazo límite para contestar el amparo bajo ley local.",
        highlights: [1, 3]
    }
};

function initNotebookLMWidget() {
    const queries = document.querySelectorAll('.btn-notebook-query');
    const chatOutput = document.getElementById('notebook-chat-output');
    const sourceCards = [
        document.getElementById('source-doc-1'),
        document.getElementById('source-doc-2'),
        document.getElementById('source-doc-3')
    ];
    
    if (queries.length === 0) return;
    
    function executeQuery(btn) {
        queries.forEach(q => q.classList.remove('active'));
        btn.classList.add('active');
        
        // Reset highlights
        sourceCards.forEach(card => {
            if (card) card.classList.remove('highlighted');
        });
        
        const qId = btn.getAttribute('data-q');
        const data = notebookAnswers[qId];
        
        if (!chatOutput) return;
        chatOutput.innerHTML = '';
        
        // Render text with clickable citation bubbles
        let text = data.text;
        text = text.replace(/\[(\d+)\]/g, (match, num) => {
            return `<span class="citation-bubble-ref" data-doc="${num}">${num}</span>`;
        });
        
        chatOutput.innerHTML = text;
        
        // Add event listeners to citation bubbles inside output
        const bubbles = chatOutput.querySelectorAll('.citation-bubble-ref');
        bubbles.forEach(bubble => {
            const docNum = parseInt(bubble.getAttribute('data-doc'));
            
            bubble.addEventListener('mouseenter', () => {
                const docCard = sourceCards[docNum - 1];
                if (docCard) docCard.classList.add('highlighted');
            });
            bubble.addEventListener('mouseleave', () => {
                const docCard = sourceCards[docNum - 1];
                if (docCard) docCard.classList.remove('highlighted');
            });
        });
        
        // Highlight corresponding sources for this query globally at start
        data.highlights.forEach(hNum => {
            const card = sourceCards[hNum - 1];
            if (card) card.classList.add('highlighted');
        });
    }
    
    queries.forEach(btn => {
        btn.addEventListener('click', () => {
            executeQuery(btn);
        });
    });
    
    // Init state
    executeQuery(queries[0]);
}

// --- Slide P4.5: Gmail Assistant ---
function initGmailWidget() {
    const presets = document.querySelectorAll('.btn-gmail-preset');
    const imgSinIa = document.getElementById('gmail-img-sin-ia');
    const imgConIa = document.getElementById('gmail-img-con-ia');
    
    if (presets.length === 0) return;
    
    presets.forEach(btn => {
        btn.addEventListener('click', () => {
            presets.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            
            const target = btn.getAttribute('data-img');
            
            if (target === 'sin-ia') {
                imgSinIa?.classList.add('active');
                imgConIa?.classList.remove('active');
            } else {
                imgSinIa?.classList.remove('active');
                imgConIa?.classList.add('active');
            }
        });
    });
}

// --- Slide P2.5: Gemini Extensions ---
const extensionsData = {
    gmail: {
        input: `<strong>@Gmail</strong> busca los últimos mails sobre el amparo de Gómez y resumí el conflicto principal`,
        output: `Buscando en tus correos electrónicos de Gmail...<br><br>Encontré 3 correos electrónicos relevantes:<br>1. <strong>De: Procuración Fiscal</strong> (11/08/2026): Envía cédula digital y advierte sobre el traslado de 5 días.<br>2. <strong>De: Dr. Pérez (Abogado Actor)</strong> (12/08/2026): Adjunta dictamen médico que alega incapacidad permanente desde marzo de 2026.<br>3. <strong>De: Asesoría Previsional Caja</strong> (13/08/2026): Reporta que el afiliado registra aportes por tareas operativas en finca hasta mayo de 2026.<br><br><strong>Conflicto principal:</strong> Contradicción de fechas sobre el cese real de actividades del actor (marzo vs. mayo).`
    },
    drive: {
        input: `<strong>@Google Drive</strong> analizá el archivo 'Demanda_Amparo_Fls_1_25.pdf' y decime el monto reclamado`,
        output: `Analizando tus archivos en Google Drive...<br><br>He procesado el archivo <strong>Demanda_Amparo_Fls_1_25.pdf</strong>:<br>• <strong>Monto reclamado:</strong> El actor Gómez demanda la suma de $1.250.000 en concepto de haberes previsionales retroactivos e intereses liquidados.<br>• <strong>Plazo de reclamo:</strong> Abarca desde marzo de 2026 a la fecha de inicio del amparo.<br>• <strong>Objeto del amparo:</strong> Medida cautelar para ordenar el pago inmediato del beneficio de retiro por invalidez.`
    },
    docs: {
        input: `<strong>@Google Docs</strong> redactá el borrador inicial de la contestación basándote en la plantilla de amparos`,
        output: `Buscando plantillas en Google Docs...<br><br>He encontrado el documento 'Plantilla_Contestacion_Amparo.docx' y redacté el siguiente borrador inicial en base a los datos del caso de Gómez:<br><br><em>"SEÑOR JUEZ CIVIL Y COMERCIAL... Contestamos demanda de amparo... Negamos todos y cada uno de los hechos alegados por la actora. Específicamente negamos que la incapacidad reclamada sea absoluta a partir de marzo de 2026, dado que el actor registra tareas activas hasta mayo de 2026..."</em><br><br>El documento preliminar fue creado y guardado en tu Drive como <strong>'Borrador_Contestacion_Gomez.docx'</strong>.`
    }
};

function initExtensionsWidget() {
    const cards = document.querySelectorAll('.extension-card');
    const userInput = document.getElementById('ext-chat-user-input');
    const aiOutput = document.getElementById('ext-chat-ai-output');
    
    if (cards.length === 0) return;
    
    function showExtension(appId) {
        cards.forEach(c => c.classList.remove('active'));
        const activeCard = Array.from(cards).find(c => c.getAttribute('data-app') === appId);
        if (activeCard) activeCard.classList.add('active');
        
        const data = extensionsData[appId];
        if (userInput) userInput.innerHTML = data.input;
        if (aiOutput) aiOutput.innerHTML = data.output;
    }
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            showExtension(card.getAttribute('data-app'));
        });
    });
    
    // Init state
    showExtension('gmail');
}


