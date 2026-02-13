// ===========================================
// mock.js — API Mock para desenvolvimento
// Coloque em: assets/js/config/mock.js
// ===========================================

(function () {
    'use strict';

    // Aguardar API estar disponível
    function waitForAPI(callback, attempts = 0) {
        if (typeof API !== 'undefined' && typeof API.request === 'function') {
            callback();
        } else if (attempts < 50) {
            setTimeout(() => waitForAPI(callback, attempts + 1), 100);
        } else {
            console.error('[MOCK] API não encontrada após 5s');
        }
    }

    waitForAPI(function () {

        const _original = API.request.bind(API);

        API.request = async function (endpoint, options = {}) {
            // Simular latência de rede realista
            await delay(200 + Math.random() * 300);

            const method  = (options.method || 'GET').toUpperCase();
            const body    = safeParseBody(options.body);

            console.log(`%c[MOCK] ${method} ${endpoint}`,
                'color:#818cf8;font-size:11px', body || '');

            // ── AUTH ─────────────────────────────────────────
            if (match(endpoint, 'POST', '/auth/login')) {
                return mockLogin(body);
            }

            if (match(endpoint, 'POST', '/auth/register')) {
                return mockRegister(body);
            }

            if (match(endpoint, 'POST', '/auth/logout')) {
                return { data: { success: true } };
            }

            if (match(endpoint, 'POST', '/auth/forgot-password')) {
                return { data: { success: true } };
            }

            if (match(endpoint, 'POST', '/auth/reset-password')) {
                return { data: { success: true } };
            }

            if (endpoint.includes('/auth/session') ||
                endpoint.includes('/auth/check')) {
                return mockCheckSession();
            }

            if (match(endpoint, 'POST', '/auth/refresh')) {
                return {
                    data: {
                        access_token:  'mock_token_' + Date.now(),
                        refresh_token: 'mock_refresh_' + Date.now(),
                        expires_in: 3600
                    }
                };
            }

            // ── USER ─────────────────────────────────────────
            if (endpoint.includes('/user/profile') && method === 'PUT') {
                const user = { ...getStoredUser(), ...body };
                storeUser(user);
                return { data: user };
            }

            if (endpoint.includes('/user/password')) {
                return { data: { success: true } };
            }

            if (endpoint.includes('/user/avatar')) {
                return { data: { url: 'https://i.pravatar.cc/150?img=3' } };
            }

            // ── DASHBOARD ────────────────────────────────────
            if (endpoint.includes('/dashboard/stats')) {
                return {
                    data: {
                        enrolled_courses:  5,
                        completed_courses: 2,
                        total_watch_time:  1240,
                        completed_lessons: 48
                    }
                };
            }

            // ── ENROLLMENTS ──────────────────────────────────
            if (endpoint.includes('/enrollments/continue')) {
                return {
                    data: {
                        course_id:           '1',
                        lesson_id:           'l3',
                        course_title:        'React do Zero ao Avançado',
                        lesson_title:        'Hooks: useState e useEffect',
                        thumbnail_url:       'https://picsum.photos/seed/react/400/225',
                        progress_percentage: 34
                    }
                };
            }

            if (endpoint.includes('/enrollments/my-courses') ||
                endpoint.includes('/enrollments/completed')) {
                return {
                    data: {
                        courses: courses().slice(0, 4).map(c => ({
                            ...c,
                            progress: { percentage: randInt(10, 95) }
                        })),
                        pagination: { total: 4, has_more: false }
                    }
                };
            }

            if (endpoint.includes('/enrollments/check-access')) {
                return { data: { hasAccess: !!getStoredToken() } };
            }

            if (endpoint.includes('/enrollments/enroll')) {
                return { data: { success: true } };
            }

            // ── COURSES ──────────────────────────────────────
            if (endpoint.includes('/courses/featured')) {
                return { data: courses().slice(0, 3) };
            }

            if (endpoint.includes('/courses/popular')) {
                return { data: courses().slice(0, 6) };
            }

            if (endpoint.includes('/courses/categories')) {
                return {
                    data: [
                        { id:'1', name:'Frontend',   courses_count:12 },
                        { id:'2', name:'Backend',    courses_count:8  },
                        { id:'3', name:'DevOps',     courses_count:5  },
                        { id:'4', name:'Mobile',     courses_count:7  },
                        { id:'5', name:'UX/UI',      courses_count:6  },
                        { id:'6', name:'Data Science',courses_count:9 }
                    ]
                };
            }

            if (endpoint.includes('/courses/search')) {
                return {
                    data: {
                        courses: courses(),
                        pagination: { total: courses().length, has_more: false }
                    }
                };
            }

            if (endpoint.includes('/courses/slug/')) {
                const slug = endpoint.split('/courses/slug/')[1];
                const found = courses().find(c => c.slug === slug) || courses()[0];
                return { data: { ...found, ...courseExtra() } };
            }

            // /courses/:id  ou  /courses?...
            if (endpoint.match(/\/courses\/[a-z0-9]+$/) && !endpoint.includes('/modules')) {
                const id = endpoint.split('/courses/')[1];
                const found = courses().find(c => c.id === id) || courses()[0];
                return { data: { ...found, ...courseExtra() } };
            }

            if (endpoint.includes('/courses')) {
                return {
                    data: {
                        courses: courses(),
                        pagination: { total: courses().length, has_more: false }
                    }
                };
            }

            // ── MODULES / LESSONS ────────────────────────────
            if (endpoint.includes('/modules')) {
                return { data: modules() };
            }

            if (endpoint.includes('/lessons/') && endpoint.includes('/video-url')) {
                return {
                    data: {
                        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                        expires_at: new Date(Date.now() + 3600000).toISOString(),
                        quality_options: ['360p', '720p', '1080p']
                    }
                };
            }

            if (endpoint.includes('/lessons/') && endpoint.includes('/pdf-url')) {
                return {
                    data: {
                        url: 'https://www.w3.org/WAI/WCAG21/wcag21.pdf',
                        expires_at: new Date(Date.now() + 3600000).toISOString()
                    }
                };
            }

            if (endpoint.includes('/mark-complete')) {
                return { data: { success: true, course_completed: false } };
            }

            if (endpoint.includes('/lessons/')) {
                return { data: modules()[0].lessons[0] };
            }

            // ── PROGRESS ─────────────────────────────────────
            if (endpoint.includes('/progress/batch') ||
                endpoint.includes('/progress/sync')) {
                return { data: { success: true } };
            }

            if (endpoint.includes('/progress/course') ||
                endpoint.includes('/progress/lesson')) {
                return {
                    data: {
                        percentage:         34,
                        completed_lessons:  5,
                        lessons_progress:   []
                    }
                };
            }

            if (endpoint.includes('/progress')) {
                return { data: { success: true } };
            }

            // ── QUIZ ─────────────────────────────────────────
            if (endpoint.includes('/quiz/') && endpoint.includes('/submit')) {
                return {
                    data: {
                        score:   75,
                        passed:  true,
                        correct: 3,
                        total:   4
                    }
                };
            }

            if (endpoint.includes('/quiz/') && endpoint.includes('/retry')) {
                return { data: { success: true } };
            }

            if (endpoint.includes('/quiz/')) {
                return { data: mockQuiz() };
            }

            // ── REVIEWS ──────────────────────────────────────
            if (endpoint.includes('/reviews')) {
                return { data: { reviews: mockReviews(), pagination: { total: 3 } } };
            }

            // ── NOTIFICATIONS ────────────────────────────────
            if (endpoint.includes('/notifications')) {
                return { data: { notifications: [], unread_count: 0 } };
            }

            // ── SEARCH ───────────────────────────────────────
            if (endpoint.includes('/search/suggestions')) {
                return { data: ['React', 'Node.js', 'TypeScript', 'Docker'] };
            }

            if (endpoint.includes('/search')) {
                return {
                    data: {
                        courses: courses().slice(0, 3),
                        pagination: { total: 3 }
                    }
                };
            }

            // ── ANALYTICS ────────────────────────────────────
            if (endpoint.includes('/analytics')) {
                return { data: { success: true } };
            }

            // ── TRAILS ───────────────────────────────────────
            if (endpoint.includes('/trails')) {
                return { data: { trails: [], pagination: { total: 0 } } };
            }

            // ── RESOURCES ────────────────────────────────────
            if (endpoint.includes('/resources/') && endpoint.includes('/url')) {
                return { data: { url: '#' } };
            }

            // ── FALLBACK ─────────────────────────────────────
            console.warn('%c[MOCK] Sem handler para:', 'color:#f59e0b', endpoint);
            return { data: {} };
        };

        console.log('%c[MOCK API] ✅ Ativo — backend simulado',
            'color:#34d399;font-weight:bold;font-size:12px');
    });

    // ── Helpers ────────────────────────────────────────────

    function delay(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    function match(endpoint, method, path) {
        const currentMethod = method; // já é string
        return endpoint.includes(path) && currentMethod === method;
    }

    function safeParseBody(body) {
        if (!body) return null;
        try { return JSON.parse(body); } catch { return body; }
    }

    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getStoredToken() {
        try {
            return localStorage.getItem('token') ||
                   sessionStorage.getItem('token');
        } catch { return null; }
    }

    function getStoredUser() {
        try {
            const raw = localStorage.getItem('user');
            return raw ? JSON.parse(raw) : defaultUser();
        } catch { return defaultUser(); }
    }

    function storeUser(user) {
        try { localStorage.setItem('user', JSON.stringify(user)); } catch {}
    }

    function defaultUser(email) {
        return {
            id:         '1',
            name:       'João Silva',
            email:      email || 'joao@email.com',
            role:       'student',
            avatar_url: null,
            phone:      '(11) 99999-9999',
            created_at: '2024-01-15T10:00:00Z'
        };
    }

    // ── Mock handlers ──────────────────────────────────────

    function mockLogin(body) {
        if (!body || !body.email) {
            throw { status: 422, message: 'E-mail obrigatório' };
        }

        const user = defaultUser(body.email);
        storeUser(user);

        return {
            data: {
                access_token:  'mock_token_' + Date.now(),
                refresh_token: 'mock_refresh_' + Date.now(),
                expires_in:    3600,
                session_id:    'session_' + Date.now(),
                user
            }
        };
    }

    function mockRegister(body) {
        if (!body || !body.email) {
            throw { status: 422, message: 'Dados inválidos' };
        }

        const user = {
            id:         String(Date.now()),
            name:       body.name   || 'Novo Usuário',
            email:      body.email  || 'novo@email.com',
            role:       'student',
            avatar_url: null,
            created_at: new Date().toISOString()
        };

        storeUser(user);

        return {
            data: {
                access_token:  'mock_token_' + Date.now(),
                refresh_token: 'mock_refresh_' + Date.now(),
                expires_in:    3600,
                session_id:    'session_' + Date.now(),
                user
            }
        };
    }

    function mockCheckSession() {
        const token = getStoredToken();
        const user  = getStoredUser();

        if (!token && !user?.id) {
            throw { status: 401, message: 'Não autenticado' };
        }

        return {
            data: {
                user:       user || defaultUser(),
                session_id: 'session_mock',
                expires_in: 3600
            }
        };
    }

    // ── Dados estáticos ────────────────────────────────────

    function courses() {
        const items = [
            { id:'1', title:'React do Zero ao Avançado',
              slug:'react-zero-avancado', level:'intermediate',
              category:'Frontend', mins:2400, lessons:48, price:197,
              img:'react' },
            { id:'2', title:'Node.js com TypeScript',
              slug:'nodejs-typescript', level:'advanced',
              category:'Backend', mins:1800, lessons:36, price:247,
              img:'nodejs' },
            { id:'3', title:'UI/UX Design na Prática',
              slug:'uiux-design', level:'beginner',
              category:'UX/UI', mins:900, lessons:24, price:147,
              img:'uiux' },
            { id:'4', title:'Docker e Kubernetes',
              slug:'docker-kubernetes', level:'advanced',
              category:'DevOps', mins:1200, lessons:30, price:297,
              img:'docker' },
            { id:'5', title:'Vue.js 3 Completo',
              slug:'vuejs-3-completo', level:'intermediate',
              category:'Frontend', mins:1600, lessons:40, price:197,
              img:'vue' },
            { id:'6', title:'Python para Data Science',
              slug:'python-data-science', level:'beginner',
              category:'Data Science', mins:2100, lessons:52, price:227,
              img:'python' },
        ];

        const instructors = [
            'Ana Costa', 'Pedro Lima', 'Maria Santos',
            'Carlos Souza', 'Julia Ferreira', 'Rafael Oliveira'
        ];

        return items.map((s, i) => ({
            id:          s.id,
            title:       s.title,
            slug:        s.slug,
            description: `Aprenda ${s.title} do básico ao avançado com projetos reais e práticos.`,
            thumbnail_url:`https://picsum.photos/seed/${s.img}/400/225`,
            price:       s.price,
            created_at:  new Date(Date.now() - i * 7 * 86400000).toISOString(),
            instructor: {
                id:         String(i + 1),
                name:       instructors[i],
                avatar_url: null
            },
            metadata: {
                duration_minutes: s.mins,
                lessons_count:    s.lessons,
                students_count:   randInt(500, 5000),
                level:            s.level,
                category:         s.category
            },
            rating: {
                average: parseFloat((4.2 + Math.random() * 0.7).toFixed(1)),
                count:   randInt(100, 900)
            }
        }));
    }

    function courseExtra() {
        return {
            long_description: 'Este curso foi desenvolvido para levar você do básico ao avançado com exemplos práticos e projetos reais. Você aprenderá os conceitos fundamentais e as melhores práticas utilizadas no mercado.',
            requirements:  ['Conhecimento básico de programação', 'Computador com acesso à internet', 'Vontade de aprender'],
            what_you_learn:['Fundamentos sólidos da tecnologia','Projetos práticos do mundo real','Boas práticas e padrões de mercado','Deploy em produção','Testes automatizados','Performance e otimização'],
            trailer_url: null
        };
    }

    function modules() {
        return [
            {
                id: 'm1', title: 'Módulo 1 — Fundamentos',
                order: 1, duration_minutes: 120,
                lessons: [
                    { id:'l1', module_id:'m1', title:'Introdução ao curso',
                      type:'video', duration_seconds:480,  order:1,
                      is_preview:true,  is_locked:false,
                      description:'Boas-vindas e visão geral do que você vai aprender.' },
                    { id:'l2', module_id:'m1', title:'Configurando o ambiente',
                      type:'video', duration_seconds:720,  order:2,
                      is_preview:false, is_locked:false,
                      description:'Instalação e configuração de todas as ferramentas necessárias.' },
                    { id:'l3', module_id:'m1', title:'Conceitos fundamentais',
                      type:'video', duration_seconds:1200, order:3,
                      is_preview:false, is_locked:false,
                      description:'Os pilares da tecnologia que vamos explorar durante o curso.' },
                    { id:'l4', module_id:'m1', title:'Quiz — Fundamentos',
                      type:'quiz',  duration_seconds:0,    order:4,
                      is_preview:false, is_locked:false,
                      content: { quiz_id: 'q1' } }
                ]
            },
            {
                id: 'm2', title: 'Módulo 2 — Intermediário',
                order: 2, duration_minutes: 180,
                lessons: [
                    { id:'l5', module_id:'m2', title:'Padrões avançados',
                      type:'video', duration_seconds:900, order:1,
                      is_preview:false, is_locked:false },
                    { id:'l6', module_id:'m2', title:'Material complementar',
                      type:'pdf',   duration_seconds:0,   order:2,
                      is_preview:false, is_locked:false,
                      content: { pdf_url: '#' } },
                    { id:'l7', module_id:'m2', title:'Projeto prático',
                      type:'video', duration_seconds:1500, order:3,
                      is_preview:false, is_locked:true }
                ]
            },
            {
                id: 'm3', title: 'Módulo 3 — Avançado',
                order: 3, duration_minutes: 240,
                lessons: [
                    { id:'l8', module_id:'m3', title:'Performance e otimização',
                      type:'video', duration_seconds:1800, order:1,
                      is_preview:false, is_locked:true },
                    { id:'l9', module_id:'m3', title:'Deploy em produção',
                      type:'video', duration_seconds:1200, order:2,
                      is_preview:false, is_locked:true },
                    { id:'l10', module_id:'m3', title:'Quiz Final',
                      type:'quiz',  duration_seconds:0,    order:3,
                      is_preview:false, is_locked:true,
                      content: { quiz_id: 'q2' } }
                ]
            }
        ];
    }

    function mockQuiz() {
        return {
            id:            'q1',
            title:         'Quiz de Revisão',
            passing_score: 70,
            questions: [
                {
                    id: 'q1_1',
                    type: 'multiple_choice',
                    question: 'Qual hook do React é usado para gerenciar estado local de um componente?',
                    options: ['useEffect', 'useState', 'useContext', 'useReducer'],
                    correct_answer: 'useState',
                    explanation: 'O useState é o hook responsável por adicionar e gerenciar estado local em componentes funcionais do React.'
                },
                {
                    id: 'q1_2',
                    type: 'multiple_choice',
                    question: 'O que é JSX no React?',
                    options: [
                        'Um banco de dados para React',
                        'Uma extensão de sintaxe JavaScript que parece HTML',
                        'Uma biblioteca de estilização',
                        'Um gerenciador de estado global'
                    ],
                    correct_answer: 'Uma extensão de sintaxe JavaScript que parece HTML',
                    explanation: 'JSX é uma extensão de sintaxe para JavaScript que permite escrever HTML dentro do JavaScript, facilitando a criação de interfaces com React.'
                },
                {
                    id: 'q1_3',
                    type: 'true_false',
                    question: 'O useEffect é executado após cada renderização do componente por padrão.',
                    options: ['Verdadeiro', 'Falso'],
                    correct_answer: 'Verdadeiro',
                    explanation: 'Por padrão, o useEffect é executado após cada renderização. Para controlar quando ele executa, usamos o array de dependências.'
                },
                {
                    id: 'q1_4',
                    type: 'multiple_choice',
                    question: 'Qual é a forma correta de atualizar um array no estado do React?',
                    options: [
                        'state.push(novoItem)',
                        'setState(state.push(novoItem))',
                        'setState([...state, novoItem])',
                        'state[state.length] = novoItem'
                    ],
                    correct_answer: 'setState([...state, novoItem])',
                    explanation: 'No React, nunca devemos mutar o estado diretamente. O correto é criar um novo array usando spread operator e incluir o novo item.'
                }
            ]
        };
    }

    function mockReviews() {
        return [
            { id:'r1', user:{ name:'Carlos Mendes' }, rating:5,
              comment:'Excelente curso! Conteúdo muito bem estruturado e didático.',
              created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
            { id:'r2', user:{ name:'Ana Oliveira' }, rating:4,
              comment:'Muito bom! Os projetos práticos fazem toda a diferença.',
              created_at: new Date(Date.now() - 12 * 86400000).toISOString() },
            { id:'r3', user:{ name:'Roberto Silva' }, rating:5,
              comment:'Melhor curso que já fiz sobre o assunto. Recomendo muito!',
              created_at: new Date(Date.now() - 20 * 86400000).toISOString() }
        ];
    }

})(); // IIFE — não polui o escopo global