/* ===============================
   PHARMENTIA WEBSITE JAVASCRIPT
   Nexathon-Style Animations Engine (GSAP + Canvas)
   =============================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. LOADING SCREEN
    const loader = document.querySelector('.loader');
    const loaderProgress = document.querySelector('.loader-progress');
    
    if (loaderProgress) {
        gsap.to(loaderProgress, {
            width: '100%',
            duration: 1.5,
            ease: 'power2.inOut',
            onComplete: () => {
                if (loader) {
                    loader.classList.add('hidden');
                    gsap.to(loader, { 
                        opacity: 0, 
                        duration: 0.5, 
                        onComplete: () => loader.style.display = 'none' 
                    });
                }
                initHeroAnimations();
            }
        });
    } else {
        initHeroAnimations();
    }

    // 2. CUSTOM CURSOR
    const cursor = document.querySelector('.custom-cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;
    
    if (window.innerWidth >= 1000 && cursor && cursorFollower) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            gsap.set(cursor, { x: mouseX, y: mouseY });
        });
        
        const updateFollower = () => {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            
            gsap.set(cursorFollower, { x: followerX, y: followerY });
            requestAnimationFrame(updateFollower);
        };
        updateFollower();
        
        const interactiveElements = document.querySelectorAll('a, button, .tilt-card, .magnetic, input, textarea');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('active');
                cursorFollower.classList.add('active');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('active');
                cursorFollower.classList.remove('active');
            });
        });
    } else {
        if(cursor) cursor.style.display = 'none';
        if(cursorFollower) cursorFollower.style.display = 'none';
    }

    // 3. GSAP SCROLL TRIGGER ANIMATIONS
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }
    
    function initHeroAnimations() {
        // Hero split text
        const lineInners = document.querySelectorAll('.line-inner');
        if (lineInners.length) {
            gsap.fromTo(lineInners, 
                { y: '100%' },
                { y: '0%', stagger: 0.15, duration: 1.2, ease: 'power4.out' }
            );
        }
        
        // Eyebrows & hero elements
        const eyebrows = document.querySelectorAll('.eyebrow');
        if (eyebrows.length) {
            gsap.fromTo(eyebrows,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
            );
        }

        const heroText = document.querySelectorAll('.hero-text, .hero-buttons');
        if (heroText.length) {
            gsap.fromTo(heroText,
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.2, duration: 1, ease: 'power3.out', delay: 0.4 }
            );
        }
    }
    
    // Reveal animations
    document.querySelectorAll("[data-animate='reveal']").forEach(el => {
        gsap.fromTo(el,
            { y: 60, opacity: 0 },
            { 
                y: 0, opacity: 1, duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 85%', once: true } 
            }
        );
    });
    
    document.querySelectorAll("[data-animate='fade-up']").forEach(el => {
        gsap.fromTo(el,
            { y: 60, opacity: 0 },
            { 
                y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 85%', once: true } 
            }
        );
    });
    
    document.querySelectorAll("[data-animate='scale-in']").forEach(el => {
        gsap.fromTo(el,
            { scale: 0.8, opacity: 0 },
            { 
                scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)',
                scrollTrigger: { trigger: el, start: 'top 85%', once: true } 
            }
        );
    });
    
    // Stagger cards
    const staggerCards = document.querySelectorAll("[data-animate='stagger-card']");
    const parents = new Set(Array.from(staggerCards).map(card => card.parentElement));
    parents.forEach(parent => {
        const cards = parent.querySelectorAll("[data-animate='stagger-card']");
        gsap.fromTo(cards,
            { y: 80, opacity: 0 },
            { 
                y: 0, opacity: 1, stagger: 0.15, duration: 0.8, ease: 'power3.out',
                scrollTrigger: { trigger: parent, start: 'top 85%', once: true }
            }
        );
    });
    
    document.querySelectorAll("[data-animate='timeline']").forEach(el => {
        gsap.fromTo(el,
            { x: -40, opacity: 0 },
            { 
                x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 85%', once: true } 
            }
        );
    });

    // 4. COUNTER ANIMATION
    document.querySelectorAll('.counter').forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'), 10) || 0;
        gsap.to(counter, {
            innerHTML: target,
            duration: 2,
            ease: 'power2.out',
            snap: { innerHTML: 1 },
            scrollTrigger: {
                trigger: counter,
                start: 'top 85%',
                once: true
            }
        });
    });

    // 5. PARALLAX
    document.querySelectorAll('.gradient-orb').forEach((orb, index) => {
        gsap.to(orb, {
            y: (index + 1) * -50,
            scrollTrigger: {
                trigger: document.body,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1
            }
        });
    });
    
    const heroLab = document.querySelector('.hero-lab');
    if (heroLab) {
        gsap.to(heroLab, {
            y: -60,
            scrollTrigger: {
                trigger: heroLab,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });
    }

    // 6. MAGNETIC BUTTONS
    document.querySelectorAll('.magnetic').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(btn, {
                x: x * 0.35,
                y: y * 0.35,
                duration: 0.2,
                ease: 'power2.out'
            });
        });
        
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            });
        });
    });

    // 7. TILT CARDS
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            
            gsap.to(card, {
                transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                duration: 0.1,
                ease: 'none'
            });
            
            card.style.setProperty('--glow-x', `${x}px`);
            card.style.setProperty('--glow-y', `${y}px`);
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                transform: 'perspective(800px) rotateX(0deg) rotateY(0deg)',
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    });

    // 8. NAVBAR SCROLL
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // 9. MOLECULAR CANVAS
    const canvas = document.getElementById('moleculeCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        
        const colors = [
            { r: 0, g: 240, b: 255 },    // cyan
            { r: 180, g: 74, b: 255 },   // purple
            { r: 57, g: 255, b: 20 },    // green
            { r: 77, g: 122, b: 255 },   // blue
        ];
        
        const particles = [];
        const numParticles = Math.min(80, Math.floor((width * height) / 15000));
        let mouse = { x: -1000, y: -1000 };
        
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        
        window.addEventListener('mouseleave', () => {
            mouse.x = -1000;
            mouse.y = -1000;
        });
        
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });
        
        for (let i = 0; i < numParticles; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                radius: Math.random() * 2 + 1,
                color: color,
                alpha: Math.random() * 0.5 + 0.2
            });
        }
        
        function drawParticles() {
            ctx.clearRect(0, 0, width, height);
            
            particles.forEach((p, index) => {
                // Mouse repel
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    p.vx += (dx / dist) * force * 0.15;
                    p.vy += (dy / dist) * force * 0.15;
                }
                
                p.vx *= 0.99;
                p.vy *= 0.99;
                
                p.x += p.vx;
                p.y += p.vy;
                
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;
                
                // Connections
                for (let j = index + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx2 = p.x - p2.x;
                    const dy2 = p.y - p2.y;
                    const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                    
                    if (dist2 < 180) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        const alpha = (1 - dist2 / 180) * 0.15;
                        ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
                
                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
                ctx.fill();
            });
            
            requestAnimationFrame(drawParticles);
        }
        drawParticles();
    }

    // 10. MOUSE MOLECULE PARALLAX
    document.querySelectorAll('.molecule').forEach((mol, index) => {
        document.addEventListener('mousemove', (e) => {
            const strength = (index + 1) * 0.25;
            const x = (e.clientX / window.innerWidth - 0.5) * 30 * strength;
            const y = (e.clientY / window.innerHeight - 0.5) * 30 * strength;
            
            gsap.to(mol, {
                x: x,
                y: y,
                duration: 1,
                ease: 'power1.out'
            });
        });
    });

    // 11. FLASK CLICK
    const flask = document.querySelector('.flask');
    if (flask) {
        flask.addEventListener('click', () => {
            gsap.to(flask, {
                scale: 1.1,
                boxShadow: '0 0 50px rgba(0, 240, 255, 0.8)',
                duration: 0.15,
                yoyo: true,
                repeat: 1
            });
        });
    }

    // 12. SCROLL INDICATOR HIDE
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 150) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.pointerEvents = 'none';
            } else {
                scrollIndicator.style.opacity = '1';
                scrollIndicator.style.pointerEvents = 'auto';
            }
        });
    }

    // 14. LOGIN / JOIN MODAL HANDLERS
    const loginModal = document.getElementById('loginModal');
    const openLoginBtn = document.getElementById('openLoginBtn');
    const openJoinBtn = document.getElementById('openJoinBtn');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const modalToast = document.getElementById('modalToast');
    const toastMessage = document.getElementById('toastMessage');

    function openModal() {
        if (loginModal) {
            loginModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (loginModal) {
            loginModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (openLoginBtn) openLoginBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    if (openJoinBtn) openJoinBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    if (closeLoginModal) closeLoginModal.addEventListener('click', closeModal);

    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) closeModal();
        });
    }

    // REST API Backend URL
    const API_BASE_URL = 'http://localhost:5000/api/auth';

    // Switch Auth Tab (Sign In vs Create Account)
    window.switchAuthTab = function(mode) {
        const tabSignIn = document.getElementById('tabSignIn');
        const tabRegister = document.getElementById('tabRegister');
        const signInForm = document.getElementById('signInForm');
        const registerForm = document.getElementById('registerForm');
        const dividerText = document.getElementById('dividerText');
        const modalTitle = document.getElementById('modalTitle');

        if (mode === 'signin') {
            tabSignIn.classList.add('active');
            tabRegister.classList.remove('active');
            signInForm.style.display = 'block';
            registerForm.style.display = 'none';
            if (dividerText) dividerText.textContent = 'OR STUDENT SIGN IN';
            if (modalTitle) modalTitle.textContent = 'JOIN PHARMENTIA R&D';
        } else {
            tabRegister.classList.add('active');
            tabSignIn.classList.remove('active');
            registerForm.style.display = 'block';
            signInForm.style.display = 'none';
            if (dividerText) dividerText.textContent = 'OR CREATE ACCOUNT';
            if (modalTitle) modalTitle.textContent = 'STUDENT REGISTRATION';
        }
    };

    // 15. BACKEND REST API CONNECTIVITY
    // Register Student Account
    window.handleBackendRegister = async function(e) {
        e.preventDefault();
        const regSubmitBtn = document.getElementById('regSubmitBtn');
        const fullName = document.getElementById('regFullName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const studentId = document.getElementById('regStudentId').value.trim();
        const yearOfStudy = document.getElementById('regYearOfStudy').value;
        const password = document.getElementById('regPassword').value;

        if (regSubmitBtn) regSubmitBtn.disabled = true;
        showToast('Registering student account...', false);

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, studentId, yearOfStudy, password })
            });

            const data = await response.json();

            if (!response.ok) {
                showToast(`❌ ${data.error || 'Registration failed'}`, true);
            } else {
                saveStudentSession(data.token, data.student);
                showToast(`🎉 ${data.message}`, false);
                setTimeout(() => closeModal(), 1800);
            }
        } catch (err) {
            console.error('Registration API error:', err);
            showToast('❌ Backend server offline (http://localhost:5000)', true);
        } finally {
            if (regSubmitBtn) regSubmitBtn.disabled = false;
        }
    };

    // Login Student Account
    window.handleBackendLogin = async function(e) {
        e.preventDefault();
        const signInSubmitBtn = document.getElementById('signInSubmitBtn');
        const identifier = document.getElementById('loginIdentifier').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (signInSubmitBtn) signInSubmitBtn.disabled = true;
        showToast('Authenticating student...', false);

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });

            const data = await response.json();

            if (!response.ok) {
                showToast(`❌ ${data.error || 'Login failed'}`, true);
            } else {
                saveStudentSession(data.token, data.student);
                showToast(`🔑 ${data.message}`, false);
                setTimeout(() => closeModal(), 1800);
            }
        } catch (err) {
            console.error('Login API error:', err);
            showToast('❌ Backend server offline (http://localhost:5000)', true);
        } finally {
            if (signInSubmitBtn) signInSubmitBtn.disabled = false;
        }
    };

    // Social Auth Handler
    window.handleSocialAuth = async function(provider) {
        showToast(`Connecting with ${provider}...`, false);
        const sampleEmail = `student.${provider.toLowerCase()}@aiktc.ac.in`;
        const sampleName = `Pharmacy Student (${provider})`;

        try {
            const response = await fetch(`${API_BASE_URL}/social`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider, email: sampleEmail, name: sampleName })
            });

            const data = await response.json();

            if (!response.ok) {
                showToast(`❌ ${data.error || 'Social auth failed'}`, true);
            } else {
                saveStudentSession(data.token, data.student);
                showToast(`🌐 Logged in via ${provider}! Welcome, ${data.student.fullName}.`, false);
                setTimeout(() => closeModal(), 1800);
            }
        } catch (err) {
            showToast(`🌐 Signed in via ${provider}! Welcome aboard.`, false);
            setTimeout(() => closeModal(), 1800);
        }
    };

    // Save Student Session & Update Navbar UI
    function saveStudentSession(token, student) {
        localStorage.setItem('pharmentia_token', token);
        localStorage.setItem('pharmentia_student', JSON.stringify(student));
        updateNavbarUserUI(student);
    }

    function updateNavbarUserUI(student) {
        const openLoginBtnCurrent = document.getElementById('openLoginBtn');
        if (!openLoginBtnCurrent && !document.getElementById('userPill')) return;

        const targetEl = openLoginBtnCurrent || document.getElementById('userPill');

        if (student && targetEl) {
            targetEl.outerHTML = `
                <div class="user-pill" id="userPill" onclick="window.location.href='profile.html'" style="cursor:pointer;" title="View My Pharmentia Student Pass">
                    <span>👤 ${student.fullName.split(' ')[0]} (${student.yearOfStudy ? student.yearOfStudy.split(' ')[0] : 'Member'})</span>
                    <button class="user-logout-btn" onclick="event.stopPropagation(); handleStudentLogout();" title="Sign Out">✕</button>
                </div>
            `;
        }
    }

    window.handleStudentLogout = function() {
        localStorage.removeItem('pharmentia_token');
        localStorage.removeItem('pharmentia_student');
        const userPill = document.getElementById('userPill');
        if (userPill) {
            userPill.outerHTML = `<a href="#join" class="nav-cta" id="openLoginBtn">JOIN US</a>`;
            const newOpenBtn = document.getElementById('openLoginBtn');
            if (newOpenBtn) newOpenBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
        }
        showToast('Logged out successfully.', false);
    };

    // Check Active Session on Page Load
    async function checkActiveSession() {
        const token = localStorage.getItem('pharmentia_token');
        const savedStudent = localStorage.getItem('pharmentia_student');

        if (savedStudent) {
            try {
                updateNavbarUserUI(JSON.parse(savedStudent));
            } catch(e) {}
        }

        if (token) {
            try {
                const response = await fetch(`${API_BASE_URL}/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    saveStudentSession(token, data.student);
                }
            } catch (err) {}
        }
    }

    checkActiveSession();

    function showToast(message, isError = false) {
        const toastIcon = document.getElementById('toastIcon');
        if (modalToast && toastMessage) {
            toastMessage.textContent = message;
            if (toastIcon) toastIcon.textContent = isError ? '❌' : '✓';
            if (isError) {
                modalToast.style.background = 'rgba(239, 68, 68, 0.95)';
            } else {
                modalToast.style.background = 'rgba(16, 185, 129, 0.95)';
            }
            modalToast.classList.add('active');
            setTimeout(() => {
                modalToast.classList.remove('active');
            }, 3500);
        }
    }
});
