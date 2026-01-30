
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initMobileMenu();
    initContactForm();
    initDesignCategoryFilter();
    initFadeInAnimations();
    initLoadMore();
    initDesign3DBackground();
    initHero3DBackground();
    initImageViewer();
});

function init3DBackground() {
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded');
        return;
    }

    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;


    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // MOUSE TRACKING
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    document.addEventListener('mousemove', (e) => {
        mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    const themeColor = new THREE.Color(0x3b82f6); 
    const particleCount = 150; 
    const particlesData = [];

 
    const pGeometry = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);

   
    for (let i = 0; i < particleCount; i++) {
        const x = (Math.random() - 0.5) * 40;
        const y = (Math.random() - 0.5) * 30;
        const z = (Math.random() - 0.5) * 20;

        pPositions[i * 3] = x;
        pPositions[i * 3 + 1] = y;
        pPositions[i * 3 + 2] = z;

        particlesData.push({
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02
            ),
            numConnections: 0
        });
    }

    pGeometry.setAttribute('position', new THREE.BufferAttribute(pPositions, 3).setUsage(THREE.DynamicDrawUsage));

    const pMaterial = new THREE.PointsMaterial({
        color: themeColor,
        size: 0.15,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    const pointCloud = new THREE.Points(pGeometry, pMaterial);
    scene.add(pointCloud);

    const lGeometry = new THREE.BufferGeometry();
    const lPositions = new Float32Array(particleCount * particleCount * 3);
    const lColors = new Float32Array(particleCount * particleCount * 3);

    lGeometry.setAttribute('position', new THREE.BufferAttribute(lPositions, 3).setUsage(THREE.DynamicDrawUsage));
    lGeometry.setAttribute('color', new THREE.BufferAttribute(lColors, 3).setUsage(THREE.DynamicDrawUsage));

    const lMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.15
    });

    const linesMesh = new THREE.LineSegments(lGeometry, lMaterial);
    scene.add(linesMesh);

    camera.position.z = 15;

    // ANIMATION LOOP
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.005;

        // Smooth mouse movement
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        // Rotate entire scene gently
        scene.rotation.y = time * 0.05 + mouse.x * 0.1;
        scene.rotation.x = mouse.y * 0.1;

        let vertexPos = 0;
        let colorPos = 0;
        let numConnected = 0;

        for (let i = 0; i < particleCount; i++) {
            const data = particlesData[i];

            // Get position
            let px = pPositions[i * 3];
            let py = pPositions[i * 3 + 1];
            let pz = pPositions[i * 3 + 2];

            // Update position
            px += data.velocity.x;
            py += data.velocity.y;
            pz += data.velocity.z

            if (px < -20 || px > 20) data.velocity.x = -data.velocity.x;
            if (py < -15 || py > 15) data.velocity.y = -data.velocity.y;
            if (pz < -10 || pz > 10) data.velocity.z = -data.velocity.z;

            pPositions[i * 3] = px;
            pPositions[i * 3 + 1] = py;
            pPositions[i * 3 + 2] = pz;

        
            for (let j = i + 1; j < particleCount; j++) {
                const dx = pPositions[i * 3] - pPositions[j * 3];
                const dy = pPositions[i * 3 + 1] - pPositions[j * 3 + 1];
                const dz = pPositions[i * 3 + 2] - pPositions[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < 4) { // Connect Threshold
                    const alpha = 1.0 - dist / 4;

                    // Line start (Particle i)
                    lPositions[vertexPos++] = pPositions[i * 3];
                    lPositions[vertexPos++] = pPositions[i * 3 + 1];
                    lPositions[vertexPos++] = pPositions[i * 3 + 2];

                    // Line end (Particle j)
                    lPositions[vertexPos++] = pPositions[j * 3];
                    lPositions[vertexPos++] = pPositions[j * 3 + 1];
                    lPositions[vertexPos++] = pPositions[j * 3 + 2];

                    // Colors (fade with distance)
                    lColors[colorPos++] = themeColor.r;
                    lColors[colorPos++] = themeColor.g;
                    lColors[colorPos++] = themeColor.b;

                    lColors[colorPos++] = themeColor.r;
                    lColors[colorPos++] = themeColor.g;
                    lColors[colorPos++] = themeColor.b;

                    numConnected++;
                }
            }
        }

        linesMesh.geometry.setDrawRange(0, numConnected * 2);
        linesMesh.geometry.attributes.position.needsUpdate = true;
        linesMesh.geometry.attributes.color.needsUpdate = true;
        pointCloud.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}


function initImageViewer() {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('image-modal-img');
    const caption = document.getElementById('image-modal-caption');
    const closeBtn = modal ? modal.querySelector('.image-modal-close') : null;
    if (!modal || !modalImg) return;

    function openImage(img) {
        modalImg.src = img.src;
        modalImg.alt = img.alt || '';
        caption.textContent = img.alt || '';
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeImage() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        setTimeout(() => { modalImg.src = ''; }, 300);
    }

    document.addEventListener('click', (e) => {
        const t = e.target;
        if (t && t.tagName === 'IMG') {
            if (t.classList.contains('grid-item') || t.closest('.smm-images')) {
                openImage(t);
            }
        }
    });

    closeBtn && closeBtn.addEventListener('click', closeImage);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeImage();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeImage();
    });
}


function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
}


function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.nav-menu');
    const menuLinks = document.querySelectorAll('.nav-menu a');

    if (!toggle || !menu) return;

    // Toggle menu on button click
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
        toggle.setAttribute('aria-expanded', menu.classList.contains('active'));
    });

    // Close menu when clicking on a link
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !menu.contains(e.target)) {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}


function initLoadMoreGraphics() {
    const btn = document.getElementById('load-more-graphics');
    const gallery = document.getElementById('graphics-grid');

    if (!btn || !gallery) return;

    // List of ALL remaining images to load (excluding those already in HTML)
    const extraImages = [
        'assets/Arjay%20moring/Graphics/%233%20Graphics.png',
        'assets/Arjay%20moring/Graphics/12.png',
        'assets/Arjay%20moring/Graphics/Copy%20of%20Instagram%20Post%20%235.png',
        'assets/Arjay%20moring/Graphics/Copy%20of%20YouTube%20Thumbnail%20%231.png',
        'assets/Arjay%20moring/Graphics/Copy%20of%20sample%202.2.png',
        'assets/Arjay%20moring/Graphics/Facebook%20Ads%20A1.png',
        'assets/Arjay%20moring/Graphics/Facebook%20Ads%20A2.jpg',
        'assets/Arjay%20moring/Graphics/Facebook%20Ads%20A3.jpg',
        'assets/Arjay%20moring/Graphics/Facebook%20Ads%20A5.jpg',
        'assets/Arjay%20moring/Graphics/Facebook%20Ads%20B1.png',
        'assets/Arjay%20moring/Graphics/Facebook%20Ads%20B2.jpg',
        'assets/Arjay%20moring/Graphics/Facebook%20Ads%20B3.jpg',
        'assets/Arjay%20moring/Graphics/Facebook%20Ads%20B4.jpg',
        'assets/Arjay%20moring/Graphics/Facebook%20Cover%20Photo%20%231.png',
        'assets/Arjay%20moring/Graphics/Facebook%20Cover%20Photo%20%232.png',
        'assets/Arjay%20moring/Graphics/Flyer%20%232.png',
        'assets/Arjay%20moring/Graphics/Instagram%20Post%20%232.png',
        'assets/Arjay%20moring/Graphics/Instagram%20Post%20%233.png',
        'assets/Arjay%20moring/Graphics/Instagram%20Post%20%234.png',
        'assets/Arjay%20moring/Graphics/STRVA%20(3).png',
        'assets/Arjay%20moring/Graphics/STRVA%20(4).png',
        'assets/Arjay%20moring/Graphics/Sample%202.png',
        'assets/Arjay%20moring/Graphics/Social%20Media%20Flyers%20(2).png',
        'assets/Arjay%20moring/Graphics/Social%20Media%20Flyers%20(3).png',
        'assets/Arjay%20moring/Graphics/Social%20Media%20Flyers%20(4).png',
        'assets/Arjay%20moring/Graphics/Social%20Media%20Flyers%20(5).png',
        'assets/Arjay%20moring/Graphics/Welcome%20to%20Escap_Inn.gif',
        'assets/Arjay%20moring/Graphics/YouTube%20Thumbnail%20%231.png'
    ];

    let loadedIndex = 0;
    const batchSize = 6; // Load more at a time

    btn.addEventListener('click', () => {
        const remaining = extraImages.length - loadedIndex;
        const count = Math.min(remaining, batchSize);

        for (let i = 0; i < count; i++) {
            const imgPath = extraImages[loadedIndex + i];

            const img = document.createElement('img');
            img.src = imgPath;
            img.className = 'grid-item fade-in'; // Reuse fade-in animation
            setTimeout(() => img.classList.add('visible'), 50); // Immediate fade-in for dynamic items
            gallery.appendChild(img);
        }

        loadedIndex += count;

        if (loadedIndex >= extraImages.length) {
            btn.style.display = 'none';
        }
    });
}


function initFadeInAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const animatableElements = document.querySelectorAll('.fade-in');
    animatableElements.forEach(el => {
        observer.observe(el);
    });
}


function initGHL3DIcons() {
    if (typeof THREE === 'undefined') return;

    const accentBlue = 0x00d4ff;
    const accentPurple = 0x8b5cf6;
    const accentGreen = 0x00ff88;

    const createMiniScene = (containerId, setupFn) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(2, 2, 5);
        scene.add(dirLight);

        const group = new THREE.Group();
        setupFn(group);
        scene.add(group);

        function animate() {
            requestAnimationFrame(animate);
            group.rotation.y += 0.01;
            renderer.render(scene, camera);
        }
        animate();
    };

    // 1. Lead Management (Funnel)
    createMiniScene('ghl-icon-lead', (group) => {
        const geometry = new THREE.ConeGeometry(1.2, 2, 32, 1, true);
        const material = new THREE.MeshStandardMaterial({ 
            color: accentBlue, 
            roughness: 0.3, 
            metalness: 0.8, 
            side: THREE.DoubleSide 
        });
        const funnel = new THREE.Mesh(geometry, material);
        funnel.rotation.x = Math.PI; // Flip to be a funnel
        funnel.position.y = 0.2;
        
        // Add balls dropping
        const ballGeo = new THREE.SphereGeometry(0.2);
        const ballMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const ball = new THREE.Mesh(ballGeo, ballMat);
        ball.position.y = 1.5;
        
        group.add(funnel);
        group.add(ball);
    });

    // 2. Client Launch (Rocket)
    createMiniScene('ghl-icon-launch', (group) => {
        // Body
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.4, 1.5, 16),
            new THREE.MeshStandardMaterial({ color: accentPurple })
        );
        // Tip
        const tip = new THREE.Mesh(
            new THREE.ConeGeometry(0.4, 0.6, 16),
            new THREE.MeshStandardMaterial({ color: accentPurple })
        );
        tip.position.y = 1.05;
        
        // Base Fire
        const fire = new THREE.Mesh(
            new THREE.ConeGeometry(0.2, 0.5, 8),
            new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff4400 })
        );
        fire.position.y = -1;
        fire.rotation.x = Math.PI;

        group.add(body, tip, fire);
        group.rotation.z = -Math.PI / 4; // Tilt
    });

    // 3. HR (User Icon)
    createMiniScene('ghl-icon-hr', (group) => {
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.6, 32, 32),
            new THREE.MeshStandardMaterial({ color: accentGreen, metalness: 0.5 })
        );
        head.position.y = 0.6;

        const body = new THREE.Mesh(
            new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshStandardMaterial({ color: accentGreen, metalness: 0.5 })
        );
        body.position.y = -0.5;
        
        group.add(head, body);
    });

    // 4. Project Plans (Gears/Cogs)
    createMiniScene('ghl-icon-auto', (group) => {
        const gearGeo = new THREE.TorusGeometry(0.8, 0.25, 16, 100); 
        const gearApp = new THREE.Mesh(
            gearGeo, 
            new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 0.8 })
        );
        
        const spokes = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 0.2, 0.1),
            new THREE.MeshStandardMaterial({ color: 0xffaa00 })
        );
        const spokes2 = spokes.clone();
        spokes2.rotation.z = Math.PI / 2;

        group.add(gearApp, spokes, spokes2);
        
        // Tiny gear
        const miniGear = new THREE.Mesh(
            new THREE.TorusGeometry(0.4, 0.15, 16, 100),
            new THREE.MeshStandardMaterial({ color: accentBlue })
        );
        miniGear.position.set(1, 1, 0);
        group.add(miniGear);
    });
}

/* ========================================
   7. Contact Form Validation and Submission
   ======================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    const btnText = document.querySelector('.btn-text');
    const btnLoading = document.querySelector('.btn-loading');

    if (!form) return;

    // Check if config is loaded
    if (typeof TELEGRAM_CONFIG === 'undefined') {
        console.error('Telegram config not loaded. Make sure telegram-config.js exists.');
        return;
    }

    // Deobfuscation method
    function _d(e) {
        const d = atob(e);
        let r = '';
        for (let i = 0; i < d.length; i++) {
            r += String.fromCharCode(d.charCodeAt(i) ^ TELEGRAM_CONFIG.ENCRYPTION_KEY.charCodeAt(i % TELEGRAM_CONFIG.ENCRYPTION_KEY.length));
        }
        return r;
    }

    // Get encrypted credentials from config file
    function _c() {
        return { 
            t: _d(TELEGRAM_CONFIG.ENCRYPTED_BOT_TOKEN), 
            c: _d(TELEGRAM_CONFIG.ENCRYPTED_CHAT_ID) 
        };
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const name = document.getElementById('client-name').value.trim();
        const email = document.getElementById('client-email').value.trim();
        const service = document.getElementById('service-type').value;
        const message = document.getElementById('client-message').value.trim();

        // Basic validation
        if (!name || !email || !message) {
            showFormMessage('Please fill in all required fields.', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showFormMessage('Please enter a valid email address.', 'error');
            return;
        }

        // Show loading state
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        form.querySelector('button[type="submit"]').disabled = true;

        try {
            // Get decrypted credentials
            const creds = _c();

            // Format message for Telegram
            const telegramMessage = 
                `🔔 New Portfolio Contact\n\n` +
                `👤 Name: ${name}\n` +
                `📧 Email: ${email}\n` +
                `💼 Service: ${service}\n\n` +
                `💬 Message:\n${message}\n\n` +
                `⏰ ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })}`;

            const response = await fetch(`https://api.telegram.org/bot${creds.t}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: creds.c,
                    text: telegramMessage
                })
            });

            const result = await response.json();

            if (result.ok) {
                showFormMessage('✓ Thank you! Your message has been sent successfully. I\'ll get back to you soon!', 'success');
                form.reset();
                
                // Hide message after 5 seconds
                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 5000);
            } else {
                throw new Error(result.description || 'Failed to send message');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showFormMessage('✗ Oops! Something went wrong. Please try again or email me directly at moringrichuerdjorge@gmail.com', 'error');
        } finally {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            form.querySelector('button[type="submit"]').disabled = false;
        }
    });

    function showFormMessage(text, type) {
        formMessage.textContent = text;
        formMessage.className = `form-message ${type}`;
        formMessage.style.display = 'block';
    }
}

// Encryption tool (use this in console to encrypt your credentials)
// Run this once to get your encrypted values, then you can remove this function
function encryptCredentials(botToken, chatId) {
    const _k = 'arjay_moring_2026';
    
    function _e(str) {
        let r = '';
        for (let i = 0; i < str.length; i++) {
            r += String.fromCharCode(str.charCodeAt(i) ^ _k.charCodeAt(i % _k.length));
        }
        return btoa(r);
    }
    
    console.log('=== ENCRYPTED CREDENTIALS ===');
    console.log('Copy these values to telegram-config.js:\n');
    console.log('ENCRYPTED_BOT_TOKEN:', `'${_e(botToken)}'`);
    console.log('ENCRYPTED_CHAT_ID:', `'${_e(chatId)}'`);
    console.log('\n⚠️ Make sure telegram-config.js is in .gitignore!');
}

function initDesignCategoryFilter() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const gridItems = document.querySelectorAll('.grid-item');

    if (tabButtons.length === 0 || gridItems.length === 0) return;

    // Hide items beyond the first 12 initially
    gridItems.forEach((item, index) => {
        if (index >= 12) {
            item.classList.add('hidden');
        }
    });

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');

            // Filter grid items
            gridItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                if (category === 'all') {
                    item.classList.remove('hidden');
                    // Fade in animation
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else if (itemCategory === category) {
                    item.classList.remove('hidden');
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        item.classList.add('hidden');
                    }, 300);
                }
            });
        });
    });
}

/* ========================================
   Load More Functionality
   ======================================== */
function initLoadMore() {
    const loadMoreBtn = document.getElementById('load-more-graphics');
    const gridItems = document.querySelectorAll('.grid-item');
    
    if (!loadMoreBtn || gridItems.length === 0) return;

    let itemsToShow = 12;
    const itemsPerLoad = 12;

    loadMoreBtn.addEventListener('click', () => {
        itemsToShow += itemsPerLoad;
        
        let visibleCount = 0;
        gridItems.forEach((item, index) => {
            if (!item.classList.contains('hidden') || index < itemsToShow) {
                item.classList.remove('hidden');
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
                visibleCount++;
            }
        });

        // Hide button if all items are shown
        if (itemsToShow >= gridItems.length) {
            loadMoreBtn.style.display = 'none';
        }
    });
}

/* ========================================
   Three.js Design Section Background
   ======================================== */
function initDesign3DBackground() {
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded');
        return;
    }

    const canvas = document.getElementById('design-3d-bg');
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 50;

    // Mouse position for interaction
    const mouse = { x: 0, y: 0 };

    // Create different geometry shapes
    const shapes = [];
    const shapeCount = 60;

    // Geometry templates (doubled in size)
    const triangleGeometry = new THREE.ConeGeometry(1.0, 2.0, 3);
    const hexagonGeometry = new THREE.CylinderGeometry(1.0, 1.0, 0.4, 6);
    const torusGeometry = new THREE.TorusGeometry(0.8, 0.3, 8, 6);
    const octahedronGeometry = new THREE.OctahedronGeometry(1.0);

    const geometries = [triangleGeometry, hexagonGeometry, torusGeometry, octahedronGeometry];

    // Material with purple glow
    const material = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.6,
        wireframe: true
    });

    // Create shape instances
    for (let i = 0; i < shapeCount; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const mesh = new THREE.Mesh(geometry, material.clone());
        
        // Random starting position (right side)
        mesh.position.x = Math.random() * 100 + 50;
        mesh.position.y = (Math.random() - 0.5) * 80;
        mesh.position.z = (Math.random() - 0.5) * 50;
        
        // Random rotation
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        mesh.rotation.z = Math.random() * Math.PI;
        
        // Random scale
        const scale = Math.random() * 2 + 0.5;
        mesh.scale.set(scale, scale, scale);
        
        // Turbulence properties
        mesh.userData = {
            speedX: -(Math.random() * 0.3 + 0.2), // Left movement
            speedY: (Math.random() - 0.5) * 0.1, // Slight vertical drift
            turbulence: Math.random() * 0.02,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            originalOpacity: mesh.material.opacity,
            phase: Math.random() * Math.PI * 2 // For wave motion
        };
        
        scene.add(mesh);
        shapes.push(mesh);
    }

    let animationId;
    let isAnimating = true;
    let time = 0;

    // Mouse move handler for interaction
    const handleMouseMove = (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    function animate() {
        if (!isAnimating) return;
        
        animationId = requestAnimationFrame(animate);
        time += 0.01;

        shapes.forEach((shape, index) => {
            const userData = shape.userData;
            
            // Turbulent flow from right to left
            shape.position.x += userData.speedX;
            
            // Wave-like vertical movement (turbulence)
            shape.position.y += userData.speedY + Math.sin(time + userData.phase) * userData.turbulence;
            
            // Slight depth oscillation for 3D effect
            shape.position.z += Math.cos(time * 0.5 + userData.phase) * 0.02;
            
            // Continuous rotation
            shape.rotation.x += userData.rotationSpeed.x;
            shape.rotation.y += userData.rotationSpeed.y;
            shape.rotation.z += userData.rotationSpeed.z;
            
            // Mouse interaction - shapes repel from cursor
            const dx = shape.position.x - (mouse.x * 30);
            const dy = shape.position.y - (mouse.y * 30);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 15) {
                const force = (15 - distance) / 15;
                shape.position.x += dx * force * 0.1;
                shape.position.y += dy * force * 0.1;
                
                // Brighten on hover
                shape.material.opacity = Math.min(1.0, userData.originalOpacity + force * 0.4);
                shape.material.color.setHex(0xc084fc); // Lighter purple
            } else {
                // Reset to original
                shape.material.opacity += (userData.originalOpacity - shape.material.opacity) * 0.1;
                shape.material.color.setHex(0x8b5cf6); // Original purple
            }
            
            // Reset position when shape goes off screen (left side)
            if (shape.position.x < -60) {
                shape.position.x = Math.random() * 20 + 60; // Respawn on right
                shape.position.y = (Math.random() - 0.5) * 80;
                shape.position.z = (Math.random() - 0.5) * 50;
            }
            
            // Boundary check for vertical drift
            if (Math.abs(shape.position.y) > 45) {
                userData.speedY *= -0.5;
            }
        });

        // Gentle camera parallax
        camera.position.x += (mouse.x * 3 - camera.position.x) * 0.05;
        camera.position.y += (mouse.y * 3 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
        isAnimating = false;
        if (animationId) cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        renderer.dispose();
        shapes.forEach(shape => {
            shape.geometry.dispose();
            shape.material.dispose();
        });
        triangleGeometry.dispose();
        hexagonGeometry.dispose();
        torusGeometry.dispose();
        octahedronGeometry.dispose();
    };
}

/* ========================================
   Three.js Hero Section Background
   ======================================== */
function initHero3DBackground() {
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded');
        return;
    }

    const canvas = document.getElementById('hero-3d-bg');
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 50;

    // Mouse position for interaction
    const mouse = { x: 0, y: 0 };

    // Create different geometry shapes
    const shapes = [];
    const shapeCount = 50;

    // Geometry templates (doubled in size)
    const triangleGeometry = new THREE.ConeGeometry(1.0, 2.0, 3);
    const diamondGeometry = new THREE.OctahedronGeometry(1.0);
    const torusGeometry = new THREE.TorusGeometry(0.8, 0.3, 8, 6);
    const tetrahedronGeometry = new THREE.TetrahedronGeometry(1.2);

    const geometries = [triangleGeometry, diamondGeometry, torusGeometry, tetrahedronGeometry];

    // Material with cyan glow
    const material = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.5,
        wireframe: true
    });

    // Create shape instances
    for (let i = 0; i < shapeCount; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const mesh = new THREE.Mesh(geometry, material.clone());
        
        // Random starting position (right side)
        mesh.position.x = Math.random() * 100 + 50;
        mesh.position.y = (Math.random() - 0.5) * 80;
        mesh.position.z = (Math.random() - 0.5) * 50;
        
        // Random rotation
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        mesh.rotation.z = Math.random() * Math.PI;
        
        // Random scale
        const scale = Math.random() * 2 + 0.5;
        mesh.scale.set(scale, scale, scale);
        
        // Turbulence properties
        mesh.userData = {
            speedX: -(Math.random() * 0.25 + 0.15), // Left movement
            speedY: (Math.random() - 0.5) * 0.08, // Slight vertical drift
            turbulence: Math.random() * 0.025,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.025,
                y: (Math.random() - 0.5) * 0.025,
                z: (Math.random() - 0.5) * 0.025
            },
            originalOpacity: mesh.material.opacity,
            phase: Math.random() * Math.PI * 2 // For wave motion
        };
        
        scene.add(mesh);
        shapes.push(mesh);
    }

    let animationId;
    let isAnimating = true;
    let time = 0;

    // Mouse move handler for interaction
    const handleMouseMove = (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    function animate() {
        if (!isAnimating) return;
        
        animationId = requestAnimationFrame(animate);
        time += 0.01;

        shapes.forEach((shape, index) => {
            const userData = shape.userData;
            
            // Turbulent flow from right to left
            shape.position.x += userData.speedX;
            
            // Wave-like vertical movement (turbulence)
            shape.position.y += userData.speedY + Math.sin(time + userData.phase) * userData.turbulence;
            
            // Slight depth oscillation for 3D effect
            shape.position.z += Math.cos(time * 0.5 + userData.phase) * 0.015;
            
            // Continuous rotation
            shape.rotation.x += userData.rotationSpeed.x;
            shape.rotation.y += userData.rotationSpeed.y;
            shape.rotation.z += userData.rotationSpeed.z;
            
            // Mouse interaction - shapes repel from cursor
            const dx = shape.position.x - (mouse.x * 30);
            const dy = shape.position.y - (mouse.y * 30);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 15) {
                const force = (15 - distance) / 15;
                shape.position.x += dx * force * 0.1;
                shape.position.y += dy * force * 0.1;
                
                // Brighten on hover
                shape.material.opacity = Math.min(1.0, userData.originalOpacity + force * 0.5);
                shape.material.color.setHex(0xffffff); // White glow
            } else {
                // Reset to original
                shape.material.opacity += (userData.originalOpacity - shape.material.opacity) * 0.1;
                shape.material.color.setHex(0x00d4ff); // Original cyan
            }
            
            // Reset position when shape goes off screen (left side)
            if (shape.position.x < -60) {
                shape.position.x = Math.random() * 20 + 60; // Respawn on right
                shape.position.y = (Math.random() - 0.5) * 80;
                shape.position.z = (Math.random() - 0.5) * 50;
            }
            
            // Boundary check for vertical drift
            if (Math.abs(shape.position.y) > 45) {
                userData.speedY *= -0.5;
            }
        });

        // Gentle camera parallax
        camera.position.x += (mouse.x * 3 - camera.position.x) * 0.05;
        camera.position.y += (mouse.y * 3 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
        isAnimating = false;
        if (animationId) cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        renderer.dispose();
        shapes.forEach(shape => {
            shape.geometry.dispose();
            shape.material.dispose();
        });
        triangleGeometry.dispose();
        diamondGeometry.dispose();
        torusGeometry.dispose();
        tetrahedronGeometry.dispose();
    };
}
