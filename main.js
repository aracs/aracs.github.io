
// Set dynamic year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile Menu Logic
const btn = document.getElementById('mobile-menu-btn');
const menu = document.getElementById('mobile-menu');
const icon = btn.querySelector('i');

btn.addEventListener('click', () => {
	menu.classList.toggle('hidden');
	if(menu.classList.contains('hidden')){
		icon.classList.replace('ph-x', 'ph-list');
	} else {
		icon.classList.replace('ph-list', 'ph-x');
	}
});

// Close menu on link tap (mobile)
menu.querySelectorAll('a').forEach(link => {
	link.addEventListener('click', () => {
		menu.classList.add('hidden');
		icon.classList.replace('ph-x', 'ph-list');
	});
});

// Navbar Scroll Effect for clear readability
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
	if (window.scrollY > 10) {
		navbar.classList.add('shadow-sm');
		navbar.classList.replace('bg-white/90', 'bg-white/98');
	} else {
		navbar.classList.remove('shadow-sm');
		navbar.classList.replace('bg-white/98', 'bg-white/90');
	}
});

// Advanced IDE Animation Sequence & IntersectionObserver Form
document.addEventListener("DOMContentLoaded", () => {
	
	// --- CONTACT FORM SUBMISSION ---
	// ARACS website -> the NeoChip bot (one bot handles both NeoChip and ARACS).
	// 1. Deploy the bot in neochip-bot-main.
	// 2. Paste its public URL below (example: https://neochip-bot.onrender.com).
	// 3. INQUIRY_API_SECRET must match ARACS_WEBHOOK_SECRET in neochip-bot-main/.env
	const INQUIRY_API_URL = "https://neochip-bot.onrender.com";
	const INQUIRY_API_SECRET = "38eeb8e90b6553df77b368438791082db4d4b968a821dad90eb5dfeb3a4142aa";

	// Existing website backend (kept so nothing that already worked stops working).
	const LEGACY_INQUIRY_URL = "https://iucwldheyynpfpmiigrc.supabase.co/functions/v1/super-worker/functions/v1/contact";
	const LEGACY_ANON_KEY = "sb_publishable_3Vd9pA5uzFpVYSjscuSiPg_e8alhTSG";

	const contactForm = document.getElementById('contact-form');
	const formSuccessMessage = document.getElementById('form-success-message');

	async function fetchWithTimeout(url, options = {}, timeoutMs = 20000) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeoutMs);
		try {
			return await fetch(url, { ...options, signal: controller.signal });
		} finally {
			clearTimeout(timer);
		}
	}

	async function sendInquiryToBot(data) {
		const response = await fetchWithTimeout(`${INQUIRY_API_URL.replace(/\/$/, '')}/api/contact`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-webhook-secret": INQUIRY_API_SECRET
			},
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			const detail = await response.text().catch(() => "");
			throw new Error(`Bot returned ${response.status}${detail ? ` - ${detail}` : ""}`);
		}

		return response.json().catch(() => ({}));
	}

	async function sendInquiryToLegacy(data) {
		const response = await fetchWithTimeout(LEGACY_INQUIRY_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"apikey": LEGACY_ANON_KEY
			},
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			throw new Error(`Legacy server returned status: ${response.status}`);
		}

		return response;
	}

	if (contactForm && formSuccessMessage) {
		contactForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			
			// Show loading state on submit button
			const submitBtn = contactForm.querySelector('button[type="submit"]');
			const originalBtnContent = submitBtn.innerHTML;
			submitBtn.disabled = true;
			submitBtn.innerHTML = `<i class="ph ph-circle-notch animate-spin text-lg"></i> Submitting...`;
			
			// Get form data
			const formData = new FormData(contactForm);
			const payload = {
				first_name: formData.get('first_name'),
				last_name: formData.get('last_name'),
				email: formData.get('email'),
				project_type: formData.get('project_type'),
				project_description: formData.get('project_description'),
				_gotcha: formData.get('_gotcha') || '',
				source: 'website',
				page: window.location.href
			};

			try {
				// Keep the existing Supabase submission AND notify the NeoChip bot.
				// The form succeeds if at least one of the two accepted the inquiry.
				const botConfigured = INQUIRY_API_URL && !INQUIRY_API_URL.includes('YOUR-BOT');

				const legacyPromise = sendInquiryToLegacy(payload)
					.then(() => true)
					.catch((legacyError) => {
						console.warn('Legacy backend failed:', legacyError);
						return false;
					});

				const botPromise = botConfigured
					? sendInquiryToBot(payload)
						.then(() => true)
						.catch((botError) => {
							console.warn('Bot webhook failed:', botError);
							return false;
						})
					: Promise.resolve(false);

				const [legacyOk, botOk] = await Promise.all([legacyPromise, botPromise]);

				if (!legacyOk && !botOk) {
					throw new Error('Both the website backend and the Telegram bot were unreachable.');
				}
				if (!botConfigured) {
					console.warn('INQUIRY_API_URL is not configured in main.js — the website backend worked, but Telegram was not notified.');
				}

				// Hide form, show success message
				contactForm.classList.add('hidden');
				formSuccessMessage.classList.remove('hidden');
				formSuccessMessage.classList.add('flex');
				
				// Scroll to the card header
				formSuccessMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			} catch (error) {
				console.error('Error submitting form:', error);
				alert("Sorry, we couldn't send your inquiry right now. Please try again in a moment.");
				
				// Reset button state
				submitBtn.disabled = false;
				submitBtn.innerHTML = originalBtnContent;
			}
		});
	}

	// IDE Animation
	const codeBlock = document.getElementById('code-block');
	
	if (codeBlock) {
		// UI Elements for animation
		const runBtn = document.getElementById('ide-run-btn');
		const cursor = document.getElementById('mock-cursor');
		
		// New Overlay Elements
		const overlay = document.getElementById('ide-overlay');
		const modal = document.getElementById('ide-modal');
		const badgeIcon = document.getElementById('badge-icon');
		const badgeSpinner = document.getElementById('badge-spinner');
		const badgeTitle = document.getElementById('badge-title');
		const badgeDesc = document.getElementById('badge-desc');
		const progressBar = document.getElementById('badge-progress-bar');
		const badgePercentage = document.getElementById('badge-percentage');
		const statusText = document.getElementById('badge-status-text');

		// Prepare text nodes for typing animation
		const walker = document.createTreeWalker(codeBlock, NodeFilter.SHOW_TEXT, null, false);
		const textNodes = [];
		while(walker.nextNode()) {
			textNodes.push(walker.currentNode);
		}
		
		textNodes.forEach(node => {
			const text = node.nodeValue;
			const fragment = document.createDocumentFragment();
			for(let i=0; i<text.length; i++) {
				const span = document.createElement('span');
				span.className = 'hidden'; 
				span.textContent = text[i];
				fragment.appendChild(span);
			}
			node.parentNode.replaceChild(fragment, node);
		});

		const charSpans = codeBlock.querySelectorAll('span.hidden');

		// Master Animation Loop
		async function runIdeAnimation() {
			// -- Reset State --
			charSpans.forEach(span => span.classList.add('hidden'));
			
			// Hide Modal Overlay completely
			overlay.classList.remove('opacity-100');
			overlay.classList.add('opacity-0');
			modal.classList.remove('scale-100');
			modal.classList.add('scale-95');
			
			// Reset Mouse Cursor
			cursor.style.opacity = '0';
			cursor.style.transform = 'scale(1)';
			cursor.style.top = '80%';
			cursor.style.left = '80%';
			
			// Reset Button
			runBtn.style.transform = 'scale(1)';
			runBtn.classList.remove('bg-brand-lightTeal', 'text-brand-navy');
			runBtn.classList.add('bg-brand-lightTeal/10', 'text-brand-lightTeal');

			// Reset Modal UI to Compiling State
			badgeSpinner.classList.remove('hidden');
			badgeIcon.className = 'ph ph-terminal-window text-2xl text-white absolute';
			
			badgeTitle.textContent = 'Compiling Engine...';
			badgeTitle.classList.remove('text-brand-lightTeal');
			badgeTitle.classList.add('text-white');
			
			badgeDesc.textContent = 'Initializing build process';
			
			progressBar.style.transition = 'none';
			progressBar.style.width = '0%';
			badgePercentage.textContent = '0%';
			
			statusText.textContent = 'Running';
			statusText.className = 'text-brand-lightTeal ml-1 font-bold';
			
			// -- Phase 1: Typing Code --
			await new Promise(r => setTimeout(r, 800));
			
			for(let i=0; i<charSpans.length; i++) {
				charSpans[i].classList.remove('hidden');
				let delay = Math.random() * 25 + 10;
				if (charSpans[i].textContent === ' ') delay = 5;
				if (charSpans[i].textContent === '\n') delay = 120;
				await new Promise(r => setTimeout(r, delay));
			}

			// -- Phase 2: Mouse moves to Run Button --
			await new Promise(r => setTimeout(r, 400));
			cursor.style.opacity = '1';
			await new Promise(r => setTimeout(r, 100));
			
			// Target coordinates exactly on the Run button
			cursor.style.top = '18px';
			cursor.style.left = 'calc(100% - 45px)';
			
			// Wait for CSS transition
			await new Promise(r => setTimeout(r, 800));

			// -- Phase 3: Click Run Button --
			cursor.style.transform = 'scale(0.8)';
			runBtn.style.transform = 'scale(0.95)';
			
			// Swap colors to highlight click
			runBtn.classList.remove('bg-brand-lightTeal/10', 'text-brand-lightTeal');
			runBtn.classList.add('bg-brand-lightTeal', 'text-brand-navy');
			
			await new Promise(r => setTimeout(r, 200)); // Button held down
			
			cursor.style.transform = 'scale(1)';
			runBtn.style.transform = 'scale(1)';
			
			runBtn.classList.remove('bg-brand-lightTeal', 'text-brand-navy');
			runBtn.classList.add('bg-brand-lightTeal/10', 'text-brand-lightTeal');
			
			cursor.style.top = '30%';
			cursor.style.left = '110%';
			await new Promise(r => setTimeout(r, 400));
			cursor.style.opacity = '0';

			// -- Phase 4: Show Modal Progress Overlay --
			overlay.classList.remove('opacity-0');
			overlay.classList.add('opacity-100');
			modal.classList.remove('scale-95');
			modal.classList.add('scale-100');
			
			await new Promise(r => setTimeout(r, 300));
			
			// Animate progress smoothly
			progressBar.style.transition = 'width 50ms linear';
			for(let p = 0; p <= 100; p += 2) {
				progressBar.style.width = `${p}%`;
				badgePercentage.textContent = `${p}%`;
				
				// Update text descriptions based on progress
				if (p === 20) badgeDesc.textContent = 'Resolving dependencies...';
				if (p === 50) badgeDesc.textContent = 'Optimizing assets and executing build scripts...';
				if (p === 80) badgeDesc.textContent = 'Finalizing production bundle...';
				
				let speed = 40;
				if(p > 30 && p < 60) speed = 15;
				if(p > 80 && p < 90) speed = 90;
				
				await new Promise(r => setTimeout(r, speed));
			}

			// -- Phase 5: Show Success State --
			await new Promise(r => setTimeout(r, 200));
			
			badgeSpinner.classList.add('hidden');
			badgeIcon.className = 'ph ph-check-circle text-5xl text-brand-lightTeal absolute';
			
			badgeTitle.textContent = 'Compiled Successfully';
			badgeTitle.classList.remove('text-white');
			badgeTitle.classList.add('text-brand-lightTeal');
			
			badgeDesc.textContent = 'Ready for production deployment';
			
			statusText.textContent = 'Complete';
			statusText.className = 'text-green-400 ml-1 font-bold';
			
			// Hold success state
			await new Promise(r => setTimeout(r, 5000));
			
			// Fade out overlay before restarting
			overlay.classList.remove('opacity-100');
			overlay.classList.add('opacity-0');
			modal.classList.remove('scale-100');
			modal.classList.add('scale-95');
			
			await new Promise(r => setTimeout(r, 800));
			
			// Restart Loop
			runIdeAnimation();
		}

		// Start sequence
		runIdeAnimation();
	}
});


/* ARACS — extras: looping process player + bilingual (EN/AR) FAQ assistant.
   Separate from main.js on purpose, so the form and IDE animation are untouched. */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =====================================================
   1. PROCESS PLAYER (plays on repeat; pause or pick a step)
   ===================================================== */
(function () {
	const root = document.getElementById('proc');
	if (!root) return;

	const STEP_MS = 4200;      // time spent on each step
	const END_HOLD_MS = 1600;  // extra pause on the last step before replaying

	const PHASES = ['Discover', 'Shape', 'Build', 'Ship'];
	const STEPS = [
		{ t: 'Idea', i: 'ph-lightbulb', p: 0,
		  d: 'Every project starts with a conversation about what you want to build and why. Bring a rough idea, a sketch or just a problem. That is enough to begin.',
		  o: 'a shared, clear picture of the goal' },
		{ t: 'Research', i: 'ph-magnifying-glass', p: 0,
		  d: 'We look at your users, similar products and the technical options, including which hardware or software fits best, before anything is decided.',
		  o: 'a clear view of what is possible and what is not' },
		{ t: 'Strategy', i: 'ph-strategy', p: 0,
		  d: 'We turn the research into a plan: the scope, the technology to use and the order of work, so there are no surprises later.',
		  o: 'a defined scope and a plan to follow' },
		{ t: 'Brand', i: 'ph-trademark', p: 1,
		  d: 'Your product needs an identity people recognise. We define the visual foundations and the tone it speaks in.',
		  o: 'the visual and verbal foundations of your product' },
		{ t: 'Design', i: 'ph-palette', p: 1,
		  d: 'We design the interface and the experience screen by screen, so you can see and react to the product before it is built.',
		  o: 'UI/UX designs you can review and approve' },
		{ t: 'Development', i: 'ph-code', p: 2,
		  d: 'We build the software, whether web, mobile, API or e-commerce, and share progress as it takes shape.',
		  o: 'a working product, built step by step' },
		{ t: 'Prototype', i: 'ph-cube', p: 2,
		  d: 'For hardware, we assemble a working prototype with Arduino, ESP32 or Raspberry Pi. For software, a first usable version to try out.',
		  o: 'something you can hold, run and test' },
		{ t: 'Testing', i: 'ph-check-square', p: 2,
		  d: 'We test what we built and check its security, then fix what we find, so it is ready for real users.',
		  o: 'a tested, more secure product' },
		{ t: 'Presentation', i: 'ph-presentation-chart', p: 3,
		  d: 'We walk you through the finished work, answer your questions and collect your feedback before going live.',
		  o: 'a walkthrough and the chance to give feedback' },
		{ t: 'Launch', i: 'ph-rocket-launch', p: 3,
		  d: 'We deploy your product so it is live and reachable, from cloud setup to the final checks.',
		  o: 'your product, live' },
		{ t: 'Growth', i: 'ph-chart-line-up', p: 3,
		  d: 'Launch is not the end. We keep supporting, fixing and improving the product as your users and needs grow.',
		  o: 'ongoing support and improvements' }
	];

	const $ = (id) => document.getElementById(id);
	const nodesEl = $('proc-nodes');
	const fill = $('proc-fill');
	const bar = $('proc-bar');
	const panel = $('proc-panel');
	const iconEl = $('proc-icon');
	const scroller = $('proc-scroll');
	const prev = $('proc-prev');
	const next = $('proc-next');
	const play = $('proc-play');
	const status = $('proc-status');
	const phaseEls = root.querySelectorAll('.proc-phase');

	let current = 0;
	let timer = null;
	let userPaused = reduceMotion; // reduced-motion users start paused and can press Play
	let inView = !('IntersectionObserver' in window);

	STEPS.forEach((s, idx) => {
		const b = document.createElement('button');
		b.type = 'button';
		b.className = 'proc-node';
		b.setAttribute('role', 'tab');
		b.setAttribute('aria-controls', 'proc-panel');
		b.innerHTML = `<span class="dot"><i class="ph ${s.i}"></i></span><span class="lbl">${s.t}</span>`;
		// Pressing a step plays from that step
		b.addEventListener('click', () => { userPaused = false; go(idx); });
		b.addEventListener('keydown', (e) => {
			let to = null;
			if (e.key === 'ArrowRight') to = Math.min(idx + 1, STEPS.length - 1);
			if (e.key === 'ArrowLeft') to = Math.max(idx - 1, 0);
			if (e.key === 'Home') to = 0;
			if (e.key === 'End') to = STEPS.length - 1;
			if (to !== null) { e.preventDefault(); go(to, true); }
		});
		nodesEl.appendChild(b);
	});
	const nodes = nodesEl.querySelectorAll('.proc-node');

	function render(idx, animate) {
		const s = STEPS[idx];
		const write = () => {
			$('proc-count').textContent = `Step ${idx + 1} of ${STEPS.length}`;
			$('proc-phase').textContent = PHASES[s.p];
			$('proc-title').textContent = s.t;
			$('proc-desc').textContent = s.d;
			$('proc-out').textContent = s.o;
			iconEl.innerHTML = `<i class="ph ${s.i} text-5xl"></i>`;
			panel.classList.remove('swap');
		};
		if (animate && !reduceMotion) { panel.classList.add('swap'); setTimeout(write, 160); }
		else write();

		nodes.forEach((n, i) => {
			n.setAttribute('aria-selected', i === idx ? 'true' : 'false');
			n.tabIndex = i === idx ? 0 : -1;
			n.dataset.state = i < idx ? 'done' : (i === idx ? 'current' : 'todo');
		});
		phaseEls.forEach((el) => { el.dataset.active = String(Number(el.dataset.phase) === s.p); });
		fill.style.width = (idx / (STEPS.length - 1)) * 100 + '%';
		prev.disabled = idx === 0;
		next.disabled = idx === STEPS.length - 1;
	}

	function keepVisible(idx) {
		const n = nodes[idx];
		if (!n || scroller.scrollWidth <= scroller.clientWidth) return;
		scroller.scrollTo({ left: n.offsetLeft - (scroller.clientWidth - n.offsetWidth) / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
	}

	function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }

	function setBar(ms) {
		bar.style.animation = 'none';
		if (!ms) { bar.style.width = '0'; return; }
		void bar.offsetWidth; // restart the animation
		bar.style.animation = `procbar ${ms}ms linear forwards`;
	}

	function updateUi() {
		const playing = !userPaused;
		play.querySelector('i').className = 'ph ' + (playing ? 'ph-pause' : 'ph-play');
		play.querySelector('span').textContent = playing ? 'Pause' : 'Play';
		play.setAttribute('aria-label', playing ? 'Pause the process animation' : 'Play the process animation');
		status.querySelector('i').className = 'ph ' + (playing ? 'ph-repeat' : 'ph-pause-circle');
		status.querySelector('span').textContent = playing ? 'Playing on repeat' : 'Paused';
	}

	// One timer per step; after the last step it loops back to the first
	function schedule() {
		clearTimer();
		updateUi();
		if (userPaused || !inView) { setBar(0); return; }
		const last = current === STEPS.length - 1;
		const ms = last ? STEP_MS + END_HOLD_MS : STEP_MS;
		setBar(ms);
		timer = setTimeout(() => { timer = null; go(last ? 0 : current + 1); }, ms);
	}

	function go(idx, focus) {
		current = Math.max(0, Math.min(STEPS.length - 1, idx));
		render(current, true);
		keepVisible(current);
		if (focus) nodes[current].focus({ preventScroll: true });
		schedule();
	}

	prev.addEventListener('click', () => go(current - 1));
	next.addEventListener('click', () => go(current + 1));
	play.addEventListener('click', () => { userPaused = !userPaused; schedule(); });

	render(0, false);
	updateUi();

	// Play while the section is on screen; hold still when it is not
	if ('IntersectionObserver' in window) {
		new IntersectionObserver((entries) => {
			inView = entries[0].isIntersecting;
			schedule();
		}, { threshold: 0.35 }).observe(root);
	} else {
		schedule();
	}
})();

/* =====================================================
   2. FAQ ASSISTANT: rule-based, English and Arabic
   ===================================================== */
(function () {
	const launcher = document.getElementById('bot-launcher');
	const panel = document.getElementById('bot-panel');
	if (!launcher || !panel) return;

	const $ = (id) => document.getElementById(id);
	const log = $('bot-log');
	const chipsEl = $('bot-chips');
	const form = $('bot-form');
	const input = $('bot-input');
	const closeBtn = $('bot-close');
	const langBtn = $('bot-lang');

	const WA = 'https://wa.me/213550044008';
	const PH = '\u200E+213 550 04 40 08'; // left-to-right mark keeps the number intact inside Arabic text

	// Interface strings: [English, Arabic]
	const UI = {
		title: ['ARACS assistant', 'مساعد ARACS'],
		status: ['Instant answers to common questions', 'إجابات فورية على الأسئلة الشائعة'],
		placeholder: ['Ask about services, process, hardware…', 'اسأل عن الخدمات أو المراحل أو الأجهزة…'],
		launcher: ['Ask us', 'اسألنا'],
		launcherAria: ['Open the ARACS assistant', 'افتح مساعد ARACS'],
		close: ['Close assistant', 'إغلاق المساعد'],
		send: ['Send', 'إرسال'],
		question: ['Your question', 'سؤالك'],
		typing: ['Assistant is typing', 'المساعد يكتب'],
		toggleLabel: ['عربي', 'EN'],
		toggleAria: ['Switch to Arabic', 'Switch to English'],
		greet: ["Hi! I'm the ARACS assistant. Ask me about our services, process or hardware prototyping, or pick a question below.",
			'مرحبًا! أنا مساعد ARACS. اسألني عن خدماتنا ومراحل العمل أو النماذج الأولية للأجهزة، أو اختر سؤالًا من الأسفل.']
	};

	// Buttons that appear under answers
	const ACT = {
		form: { l: ['Send an inquiry', 'أرسل استفسارًا'], href: '#contact' },
		wa: { l: ['Chat on WhatsApp', 'تحدث عبر واتساب'], href: WA, ext: true },
		process: { l: ['See our process', 'شاهد مراحل العمل'], href: '#process' },
		services: { l: ['See services', 'شاهد الخدمات'], href: '#services' },
		email: { l: ['Send an email', 'أرسل بريدًا إلكترونيًا'], href: 'mailto:aracstechnologies@gmail.com', ext: true },
		neochip: { l: ['Open NeoChip Club', 'افتح NeoChip Club'], href: 'https://neochipclub.oneapp.dev', ext: true }
	};

	/* Knowledge base.
	   k / ka: English / Arabic keywords and phrases. q / a: [English, Arabic]. act: button ids. f: follow-up ids. */
	const KB = [
		{ id: 'hello', q: ['Hello', 'مرحبًا'],
		  k: ['hi', 'hello', 'hey', 'salam', 'salut', 'bonjour', 'good morning', 'good evening'],
		  ka: ['مرحبا', 'اهلا', 'السلام عليكم', 'سلام', 'هلا', 'هاي', 'صباح الخير', 'مساء الخير'],
		  a: ["Hi! I'm the ARACS assistant. I can answer questions about our services, process, hardware prototyping and how to start a project.",
			'مرحبًا! أنا مساعد ARACS. يمكنني الإجابة عن أسئلتك حول خدماتنا ومراحل العمل والنماذج الأولية للأجهزة وكيفية بدء مشروعك.'],
		  f: ['services', 'process', 'start'] },

		{ id: 'about', q: ['Who is ARACS?', 'من هي ARACS؟'],
		  k: ['who are you', 'about', 'aracs', 'company', 'what do you do', 'what is aracs', 'tell me about'],
		  ka: ['من انتم', 'من هي', 'عن الشركة', 'اراكس', 'شركة', 'نبذة', 'تعريف'],
		  a: ['ARACS Technologies delivers end-to-end solutions in development and prototyping: from idea to deployment and beyond. That covers software, hardware prototypes and the cloud behind them.',
			'تقدّم ARACS Technologies حلولًا متكاملة في التطوير والنماذج الأولية: من الفكرة إلى النشر وما بعده. ونغطي البرمجيات والنماذج الأولية للأجهزة والسحابة التي تقوم عليها.'],
		  act: ['services'], f: ['services', 'endtoend', 'start'] },

		{ id: 'services', q: ['What services do you offer?', 'ما الخدمات التي تقدمونها؟'],
		  k: ['services', 'service', 'offer', 'capabilities', 'what can you build', 'what can you do', 'expertise', 'solutions', 'products'],
		  ka: ['خدمات', 'خدماتكم', 'ماذا تقدمون', 'ما الذي تقدمونه', 'قدرات', 'تخصصات', 'مجالات', 'ماذا تفعلون'],
		  a: ['We cover ten areas:\n• Development\n• Hardware MVP\n• Automation\n• Cloud\n• Embedded & IoT\n• UI/UX\n• Data\n• Testing\n• Security\n• Support',
			'نغطي عشرة مجالات:\n• التطوير\n• النموذج الأولي للأجهزة (Hardware MVP)\n• الأتمتة\n• الحوسبة السحابية\n• الأنظمة المدمجة وإنترنت الأشياء\n• تصميم الواجهات وتجربة المستخدم\n• البيانات\n• الاختبار\n• الأمان\n• الدعم'],
		  act: ['services'], f: ['hardware', 'webapp', 'projecttypes'] },

		{ id: 'endtoend', q: ['What does end-to-end mean?', 'ماذا تعني «حلول متكاملة»؟'],
		  k: ['end to end', 'end-to-end', 'full service', 'one team', 'from idea to launch', 'complete solution', 'everything'],
		  ka: ['متكامل', 'متكاملة', 'حلول متكاملة', 'شامل', 'شاملة', 'من الفكرة الى الاطلاق', 'طرف واحد', 'كل شيء'],
		  a: ['It means one team takes your project from the first idea through design, development, prototyping, testing and launch, and stays with you afterwards, so you do not have to piece together separate vendors.',
			'يعني أن فريقًا واحدًا يأخذ مشروعك من الفكرة الأولى مرورًا بالتصميم والتطوير والنموذج الأولي والاختبار حتى الإطلاق، ويبقى معك بعده، فلا تحتاج إلى التنسيق بين جهات متعددة.'],
		  act: ['process'], f: ['process', 'start'] },

		{ id: 'hardware', q: ['Do you build hardware prototypes?', 'هل تصنعون نماذج أولية للأجهزة؟'],
		  k: ['hardware', 'prototype', 'prototyping', 'arduino', 'esp32', 'raspberry', 'raspberry pi', 'mvp', 'device', 'electronics', 'embedded', 'iot', 'sensor', 'board'],
		  ka: ['اجهزة', 'جهاز', 'نموذج أولي', 'نماذج أولية', 'نموذج اولي', 'هاردوير', 'اردوينو', 'ارديونو', 'راسبيري', 'رازبيري', 'الكترونيات', 'حساسات', 'انترنت الاشياء', 'انظمة مدمجة', 'مدمج'],
		  a: ['Yes. We build hardware MVPs and embedded/IoT solutions with Arduino, ESP32 and Raspberry Pi, and connect them to software and the cloud when your product needs it.',
			'نعم. نبني نماذج أولية للأجهزة وحلولًا مدمجة وإنترنت الأشياء باستخدام Arduino وESP32 وRaspberry Pi، ونربطها بالبرمجيات والسحابة عندما يحتاج منتجك لذلك.'],
		  act: ['form'], f: ['process', 'cloud', 'price'] },

		{ id: 'webapp', q: ['Do you build web and mobile apps?', 'هل تبرمجون تطبيقات الويب والموبايل؟'],
		  k: ['web', 'website', 'web app', 'webapp', 'mobile', 'app', 'application', 'development', 'develop', 'software'],
		  ka: ['موقع الكتروني', 'موقع ويب', 'مواقع', 'تطبيق', 'تطبيقات', 'ويب', 'موبايل', 'جوال', 'برمجة', 'تطوير', 'برمجيات'],
		  a: ['Yes. We build web applications, mobile applications, e-commerce stores, business landing pages, and APIs with integrations.',
			'نعم. نبني تطبيقات الويب وتطبيقات الموبايل ومتاجر التجارة الإلكترونية وصفحات الهبوط للأعمال وواجهات API مع التكاملات.'],
		  act: ['form'], f: ['ecommerce', 'landing', 'price'] },

		{ id: 'landing', q: ['Do you build business landing pages?', 'هل تصممون صفحات هبوط للأعمال؟'],
		  k: ['landing page', 'landing', 'business website', 'company website', 'one page website', 'one page'],
		  ka: ['صفحة هبوط', 'صفحة الهبوط', 'لاندينج', 'لاندنج', 'موقع شركة', 'موقع تعريفي', 'صفحة واحدة', 'صفحة تعريفية'],
		  a: ['Yes. "Business Landing Page" is one of the project types in the inquiry form, and our UI/UX and development work covers designing and building it.',
			'نعم. «صفحة هبوط للأعمال» من أنواع المشاريع في نموذج الاستفسار، وعملنا في التصميم والتطوير يغطي تصميمها وبناءها.'],
		  act: ['form'], f: ['price', 'timeline'] },

		{ id: 'ecommerce', q: ['Do you build e-commerce stores?', 'هل تبنون متاجر إلكترونية؟'],
		  k: ['ecommerce', 'e-commerce', 'online store', 'online shop', 'sell online', 'store', 'shop'],
		  ka: ['متجر', 'متاجر', 'متجر الكتروني', 'تجارة الكترونية', 'بيع اونلاين', 'بيع على الانترنت', 'اي كومرس'],
		  a: ['Yes. "E-commerce store" is one of our project types: we build online stores, from the design to the development behind them.',
			'نعم. «متجر إلكتروني» من أنواع مشاريعنا: نبني المتاجر الإلكترونية، من التصميم إلى التطوير الذي يقوم عليها.'],
		  act: ['form'], f: ['price', 'timeline'] },

		{ id: 'api', q: ['Do you build APIs and integrations?', 'هل تبنون واجهات API وتكاملات؟'],
		  k: ['api', 'apis', 'integration', 'integrations', 'integrate', 'webhook', 'connect systems'],
		  ka: ['api', 'واجهة برمجية', 'واجهات برمجة', 'ربط', 'تكامل', 'تكاملات', 'ويب هوك', 'دمج'],
		  a: ['Yes. "API development and integration" is one of our project types: we build APIs and connect your product to the other systems and services it needs.',
			'نعم. «تطوير وتكامل واجهات API» من أنواع مشاريعنا: نبني واجهات API ونربط منتجك بالأنظمة والخدمات الأخرى التي يحتاجها.'],
		  act: ['form'], f: ['automation', 'cloud'] },

		{ id: 'process', q: ['How does your process work?', 'كيف تعملون؟'],
		  k: ['process', 'steps', 'how do you work', 'how does it work', 'workflow', 'stages', 'methodology', 'phases', 'approach'],
		  ka: ['مراحل', 'خطوات', 'كيف تعملون', 'كيف تعمل', 'طريقة العمل', 'منهجية', 'سير العمل', 'اسلوب'],
		  a: ['We work in eleven steps across four phases:\n• Discover: Idea, Research, Strategy\n• Shape: Brand, Design\n• Build: Development, Prototype, Testing\n• Ship: Presentation, Launch, Growth\n\nYou can explore each step on the page.',
			'نعمل في أحد عشر خطوة موزعة على أربع مراحل:\n• الاكتشاف: الفكرة، البحث، الاستراتيجية\n• التشكيل: الهوية، التصميم\n• البناء: التطوير، النموذج الأولي، الاختبار\n• الإطلاق: العرض، الإطلاق، النمو\n\nيمكنك استكشاف كل خطوة في الصفحة.'],
		  act: ['process'], f: ['involvement', 'timeline', 'support'] },

		{ id: 'involvement', q: ['How involved will I be?', 'ما مدى مشاركتي في العمل؟'],
		  k: ['involved', 'involvement', 'feedback', 'progress', 'review', 'approve', 'keep me updated', 'communication', 'updates'],
		  ka: ['مشاركة', 'مشاركتي', 'ملاحظات', 'تعليقات', 'تقدم العمل', 'تواصل مستمر', 'اراجع', 'اطلع', 'اوافق'],
		  a: ['You stay in the loop: you review the designs before development, we share progress as the product takes shape, and the Presentation step walks you through the finished work and collects your feedback before launch.',
			'ستبقى على اطلاع: تراجع التصاميم قبل بدء التطوير، ونشاركك التقدم أثناء بناء المنتج، وتعرض لك خطوة العرض العمل النهائي وتجمع ملاحظاتك قبل الإطلاق.'],
		  act: ['process'], f: ['process', 'start'] },

		{ id: 'start', q: ['How do I start a project?', 'كيف أبدأ مشروعًا؟'],
		  k: ['start', 'begin', 'get started', 'hire', 'work with you', 'project', 'order', 'request', 'inquiry', 'enquiry', 'collaborate'],
		  ka: ['ابدا', 'بدء', 'ابدأ مشروع', 'كيف ابدأ', 'اطلب', 'طلب', 'مشروع', 'تعاون', 'استفسار', 'اريد ان اعمل معكم'],
		  a: ['Send us a short project inquiry with your name, email, project type and a description of what you want to build. We reply in minutes. If you prefer to talk, WhatsApp works too.',
			'أرسل لنا استفسارًا قصيرًا يتضمن اسمك وبريدك الإلكتروني ونوع المشروع ووصفًا لما تريد بناءه، وسنرد خلال دقائق. وإن فضّلت الحديث مباشرة فواتساب متاح أيضًا.'],
		  act: ['form', 'wa'], f: ['inquiryinfo', 'reply', 'price'] },

		{ id: 'inquiryinfo', q: ['What do I put in the inquiry form?', 'ماذا أكتب في نموذج الاستفسار؟'],
		  k: ['inquiry form', 'form', 'fields', 'what do i send', 'what to include', 'what information', 'what do i need to provide'],
		  ka: ['نموذج الاستفسار', 'نموذج التواصل', 'ماذا اكتب', 'ماذا اضع', 'المعلومات المطلوبة', 'حقول'],
		  a: ['The form asks for your first and last name, your email, a project type and a description of your project. The more specific the description, the better our reply.',
			'يطلب النموذج اسمك الأول واسم العائلة وبريدك الإلكتروني ونوع المشروع ووصفًا له. وكلما كان الوصف أدق كان ردنا أفضل.'],
		  act: ['form'], f: ['projecttypes', 'reply'] },

		{ id: 'projecttypes', q: ['Which project types do you take?', 'ما أنواع المشاريع التي تقبلونها؟'],
		  k: ['project types', 'project type', 'types of projects', 'what projects', 'kinds of projects'],
		  ka: ['انواع المشاريع', 'نوع المشروع', 'اي مشاريع', 'ما المشاريع'],
		  a: ['The inquiry form lists:\n• Business Landing Page\n• Web application\n• Mobile application\n• E-commerce store\n• API development and integration\n• Hardware Prototyping\n• Automation Solutions\n• Cloud & Infrastructure\n• Consulting & Technical Architecture\n• Quality assurance & Testing\n• UI/UX Design\n• Other',
			'يعرض نموذج الاستفسار:\n• صفحة هبوط للأعمال\n• تطبيق ويب\n• تطبيق موبايل\n• متجر إلكتروني\n• تطوير وتكامل واجهات API\n• نماذج أولية للأجهزة\n• حلول الأتمتة\n• السحابة والبنية التحتية\n• الاستشارات والهندسة التقنية\n• ضمان الجودة والاختبار\n• تصميم الواجهات وتجربة المستخدم\n• أخرى'],
		  act: ['form'], f: ['idea', 'start'] },

		{ id: 'idea', q: ['I only have an idea. Is that enough?', 'لدي مجرد فكرة، هل يكفي ذلك؟'],
		  k: ['only have an idea', 'just an idea', 'i have an idea', 'idea only', 'not technical', 'non technical', 'no experience', 'beginner', 'not sure what i need'],
		  ka: ['لدي فكرة', 'عندي فكرة', 'مجرد فكرة', 'فقط فكرة', 'فكرة فقط', 'ليس لدي خبرة', 'مبتدئ', 'غير تقني', 'لا اعرف', 'فكرة'],
		  a: ['Yes, that is exactly where we start. The first step is Idea, followed by Research and Strategy, so you do not need a finished spec or technical knowledge. Tell us what you want to achieve.',
			'نعم، من هنا نبدأ تمامًا. الخطوة الأولى هي الفكرة، ثم البحث والاستراتيجية، فلا تحتاج إلى مواصفات جاهزة ولا إلى معرفة تقنية. أخبرنا بما تريد تحقيقه.'],
		  act: ['form'], f: ['process', 'price'] },

		{ id: 'reply', q: ['How fast do you reply?', 'ما سرعة ردكم؟'],
		  k: ['long to reply', 'long to respond', 'long to answer', 'reply', 'respond', 'response', 'how fast', 'how quickly', 'answer time', 'wait', 'minutes', 'quick'],
		  ka: ['سرعة الرد', 'وقت الرد', 'كم يستغرق الرد', 'متى ترد', 'ترد', 'تردون', 'سريع', 'دقائق'],
		  a: ['We reply to inquiries in minutes. For the fastest answer, message us on WhatsApp.',
			'نرد على الاستفسارات خلال دقائق. وللحصول على أسرع إجابة راسلنا عبر واتساب.'],
		  act: ['wa', 'form'], f: ['start', 'contact'] },

		{ id: 'price', q: ['How much does a project cost?', 'كم تبلغ تكلفة المشروع؟'],
		  k: ['price', 'pricing', 'cost', 'costs', 'quote', 'budget', 'how much', 'rates', 'rate', 'fee', 'fees', 'tarif', 'prix', 'devis', 'expensive', 'cheap', 'afford'],
		  ka: ['سعر', 'اسعار', 'تكلفة', 'تكاليف', 'كم يكلف', 'كم السعر', 'كم التكلفة', 'كم تكلف', 'ثمن', 'ميزانية', 'عرض سعر', 'بكم', 'غالي', 'رخيص'],
		  a: ["Cost depends on the scope: what you want to build, whether hardware is involved, and how much design and testing it needs, so I don't quote fixed prices here. Describe your project and the team will come back with a quote.",
			'تعتمد التكلفة على نطاق المشروع: ما تريد بناءه، وهل يتضمن أجهزة، وكم يحتاج من تصميم واختبار، لذلك لا أذكر أسعارًا ثابتة هنا. صِف مشروعك وسيعود إليك الفريق بعرض سعر.'],
		  act: ['form', 'wa'], f: ['payment', 'timeline'] },

		{ id: 'payment', q: ['How does payment work?', 'كيف تتم عملية الدفع؟'],
		  k: ['payment', 'pay', 'paying', 'invoice', 'deposit', 'installments', 'advance', 'upfront', 'terms', 'contract'],
		  ka: ['دفع', 'الدفع', 'سداد', 'فاتورة', 'عربون', 'دفعة', 'تقسيط', 'شروط', 'عقد', 'مقدم'],
		  a: ["I don't have payment terms to share here. They are agreed with the team once your project is scoped, so ask in your inquiry or on WhatsApp.",
			'ليس لدي شروط دفع لأذكرها هنا. يتم الاتفاق عليها مع الفريق بعد تحديد نطاق مشروعك، فاسأل في استفسارك أو عبر واتساب.'],
		  act: ['form', 'wa'], f: ['price', 'start'] },

		{ id: 'timeline', q: ['How long does a project take?', 'كم يستغرق المشروع؟'],
		  k: ['how long', 'duration', 'timeline', 'deadline', 'delivery', 'time', 'when will', 'weeks', 'months', 'delai', 'turnaround'],
		  ka: ['كم يستغرق', 'المدة', 'موعد', 'تسليم', 'متى يكتمل', 'اسابيع', 'اشهر', 'كم من الوقت', 'كم تحتاج'],
		  a: ['It depends on the type and size of the project: a landing page and a hardware prototype are very different jobs. Tell us what you need and the team will give you a realistic estimate after the research step.',
			'يعتمد ذلك على نوع المشروع وحجمه؛ فصفحة هبوط ونموذج أولي لجهاز عملان مختلفان تمامًا. أخبرنا بما تحتاجه وسيعطيك الفريق تقديرًا واقعيًا بعد مرحلة البحث.'],
		  act: ['form'], f: ['process', 'price'] },

		{ id: 'contact', q: ['How can I contact you?', 'كيف أتواصل معكم؟'],
		  k: ['contact', 'phone', 'call', 'number', 'email', 'mail', 'whatsapp', 'reach', 'telephone'],
		  ka: ['تواصل', 'اتصال', 'اتصل', 'هاتف', 'رقم', 'ايميل', 'بريد', 'واتساب', 'واتس', 'تلفون', 'كيف اتواصل'],
		  a: ['You can reach us here:\n• Phone and WhatsApp: ' + PH + '\n• Email: aracstechnologies@gmail.com',
			'يمكنك التواصل معنا عبر:\n• الهاتف وواتساب: ' + PH + '\n• البريد الإلكتروني: aracstechnologies@gmail.com'],
		  act: ['wa', 'email'], f: ['reply', 'social'] },

		{ id: 'human', q: ['Can I talk to a person?', 'هل يمكنني التحدث مع شخص؟'],
		  k: ['talk to a human', 'talk to a person', 'talk to someone', 'speak to someone', 'speak to a person', 'human', 'person', 'agent', 'real person', 'someone', 'representative', 'team member', 'engineer'],
		  ka: ['التحدث مع شخص', 'اتحدث مع شخص', 'اتحدث مع احد', 'شخص', 'انسان', 'موظف', 'مسؤول', 'احد من الفريق', 'مهندس', 'ممثل'],
		  a: ['Of course. The fastest way to reach the team is WhatsApp, or you can send an inquiry and we reply in minutes.',
			'بالتأكيد. أسرع طريقة للوصول إلى الفريق هي واتساب، أو أرسل استفسارًا وسنرد خلال دقائق.'],
		  act: ['wa', 'form'], f: ['contact'] },

		{ id: 'social', q: ['Where can I follow you?', 'أين أتابعكم؟'],
		  k: ['social', 'linkedin', 'instagram', 'facebook', 'github', 'follow', 'socials', 'media'],
		  ka: ['سوشيال', 'لينكدان', 'لينكدإن', 'انستغرام', 'انستقرام', 'فيسبوك', 'فيس بوك', 'جيت هاب', 'تابع', 'حسابات', 'مواقع التواصل'],
		  a: ['You can find ARACS on LinkedIn, Instagram, Facebook and GitHub. The links are in the footer of this page.',
			'تجدون ARACS على لينكدإن وإنستغرام وفيسبوك وGitHub. الروابط موجودة أسفل هذه الصفحة.'],
		  f: ['contact', 'portfolio'] },

		{ id: 'portfolio', q: ['Do you have a portfolio or past work?', 'هل لديكم معرض أعمال أو مشاريع سابقة؟'],
		  k: ['portfolio', 'past work', 'previous work', 'examples', 'references', 'case study', 'case studies', 'samples', 'showcase'],
		  ka: ['اعمال سابقة', 'اعمالكم', 'معرض اعمال', 'امثلة', 'مراجع', 'دراسة حالة', 'بورتفوليو', 'مشاريع سابقة'],
		  a: ["This page doesn't show a portfolio. For examples of our work, ask the team on WhatsApp, or look at our LinkedIn, Instagram and GitHub pages linked in the footer.",
			'لا تعرض هذه الصفحة معرض أعمال. للاطلاع على أمثلة من أعمالنا اسأل الفريق عبر واتساب، أو تصفّح صفحاتنا على لينكدإن وإنستغرام وGitHub الموجودة أسفل الصفحة.'],
		  act: ['wa'], f: ['social', 'start'] },

		{ id: 'cloud', q: ['Do you handle cloud and deployment?', 'هل تتولون السحابة والنشر؟'],
		  k: ['cloud', 'deploy', 'deployment', 'hosting', 'host', 'server', 'infrastructure', 'devops', 'scalable', 'scale', 'scaling'],
		  ka: ['سحابة', 'سحابي', 'استضافة', 'سيرفر', 'خادم', 'نشر', 'بنية تحتية', 'ديف اوبس'],
		  a: ['Yes. We deploy and set up cloud infrastructure so your product is live and can scale as your users grow.',
			'نعم. نقوم بالنشر وإعداد البنية السحابية ليكون منتجك متاحًا وقادرًا على النمو مع زيادة مستخدميك.'],
		  act: ['form'], f: ['security', 'support'] },

		{ id: 'design', q: ['Do you do UI/UX and branding?', 'هل تقدمون تصميم الواجهات والهوية؟'],
		  k: ['design', 'ui', 'ux', 'ui/ux', 'brand', 'branding', 'logo', 'interface', 'figma', 'mockup', 'identity'],
		  ka: ['تصميم', 'واجهات', 'واجهة', 'هوية', 'شعار', 'لوجو', 'براند', 'تجربة المستخدم', 'فيجما'],
		  a: ['Yes. UI/UX design and brand are part of our process, so the interface and the identity of your product are shaped before development starts.',
			'نعم. التصميم وتجربة المستخدم والهوية جزء من عملنا، فنُشكّل الواجهة وهوية منتجك قبل بدء التطوير.'],
		  act: ['process'], f: ['process', 'webapp'] },

		{ id: 'automation', q: ['Do you build automation?', 'هل تبنون حلول أتمتة؟'],
		  k: ['automation', 'automate', 'automatic', 'workflow automation', 'bot', 'script'],
		  ka: ['اتمتة', 'تلقائي', 'اوتوميشن', 'سكريبت', 'بوت'],
		  a: ['Yes. Automation is one of our services: replacing repetitive manual work with systems that run on their own.',
			'نعم. الأتمتة إحدى خدماتنا: نستبدل العمل اليدوي المتكرر بأنظمة تعمل تلقائيًا.'],
		  act: ['form'], f: ['api', 'cloud'] },

		{ id: 'data', q: ['Do you work with data?', 'هل تعملون مع البيانات؟'],
		  k: ['data', 'database', 'databases', 'storage', 'analytics', 'dashboard', 'sql'],
		  ka: ['بيانات', 'قاعدة بيانات', 'قواعد بيانات', 'تخزين', 'تحليلات', 'داتا'],
		  a: ['Yes. Data is one of our capabilities: designing how your product stores, structures and uses its data.',
			'نعم. البيانات من مجالاتنا: نصمم كيف يخزّن منتجك بياناته وينظمها ويستفيد منها.'],
		  act: ['form'], f: ['cloud', 'security'] },

		{ id: 'consulting', q: ['Do you offer technical consulting?', 'هل تقدمون استشارات تقنية؟'],
		  k: ['consulting', 'consultation', 'consultant', 'advice', 'advise', 'architecture', 'architect', 'technical architecture', 'technical advice'],
		  ka: ['استشارة', 'استشارات', 'استشاري', 'نصيحة', 'نصائح', 'هندسة تقنية', 'معمارية تقنية', 'مراجعة'],
		  a: ['Yes. "Consulting & Technical Architecture" is one of our project types: we help you choose the right approach, technology and structure before you build.',
			'نعم. «الاستشارات والهندسة التقنية» من أنواع مشاريعنا: نساعدك على اختيار النهج والتقنيات والبنية المناسبة قبل أن تبدأ البناء.'],
		  act: ['form'], f: ['process', 'start'] },

		{ id: 'security', q: ['Is security covered?', 'هل الأمان مشمول؟'],
		  k: ['security', 'secure', 'safe', 'safety', 'protect', 'protection', 'privacy', 'hack', 'vulnerability'],
		  ka: ['امان', 'امن', 'حماية', 'خصوصية', 'اختراق', 'ثغرات'],
		  a: ['Yes. Security is one of our listed services, and we check it during the testing step before anything goes live.',
			'نعم. الأمان من خدماتنا، ونفحصه في خطوة الاختبار قبل أن ينطلق أي شيء.'],
		  f: ['testing', 'confidential'] },

		{ id: 'confidential', q: ['Is my idea kept confidential?', 'هل ستبقى فكرتي سرية؟'],
		  k: ['confidential', 'confidentiality', 'nda', 'non disclosure', 'steal my idea', 'secret', 'protect my idea', 'intellectual property', 'who owns', 'ownership'],
		  ka: ['سرية', 'عدم افشاء', 'ملكية', 'سرقة', 'اسرار', 'فكرتي'],
		  a: ["I can't make promises about NDAs or ownership terms in this chat. Those are agreed directly with the team, so ask them before you share sensitive details. You can start with a general description of your project.",
			'لا أستطيع تقديم وعود بشأن اتفاقيات السرية أو الملكية في هذه المحادثة. يتم الاتفاق عليها مباشرة مع الفريق، فاسألهم قبل مشاركة أي تفاصيل حساسة. ويمكنك البدء بوصف عام لمشروعك.'],
		  act: ['wa'], f: ['start', 'security'] },

		{ id: 'testing', q: ['Do you test what you build?', 'هل تختبرون ما تبنونه؟'],
		  k: ['testing', 'test', 'qa', 'quality', 'quality assurance', 'bug', 'bugs', 'reliable'],
		  ka: ['اختبار', 'فحص', 'جودة', 'ضمان الجودة', 'اخطاء', 'تجريب'],
		  a: ['Yes. Testing and quality assurance are a dedicated step in our process, and we fix what we find before launch.',
			'نعم. الاختبار وضمان الجودة خطوة مستقلة في عملنا، ونُصلح ما نجده قبل الإطلاق.'],
		  f: ['process', 'support'] },

		{ id: 'support', q: ['Do you offer support after launch?', 'هل تقدمون دعمًا بعد الإطلاق؟'],
		  k: ['support', 'maintenance', 'maintain', 'after launch', 'after delivery', 'help after', 'growth', 'warranty', 'afterwards'],
		  ka: ['دعم', 'صيانة', 'بعد الاطلاق', 'بعد التسليم', 'تحديثات', 'ضمان'],
		  a: ['Yes. Support is one of our services, and Growth is the last step of our process: we keep fixing and improving the product after launch.',
			'نعم. الدعم إحدى خدماتنا، والنمو هو آخر خطوة في عملنا: نواصل الإصلاح والتحسين بعد الإطلاق.'],
		  act: ['process'], f: ['start', 'contact'] },

		{ id: 'existing', q: ['Can you improve something I already have?', 'هل يمكنكم تحسين شيء أملكه بالفعل؟'],
		  k: ['existing', 'already have', 'improve', 'redesign', 'upgrade', 'fix', 'revamp', 'take over', 'rebuild', 'current website', 'current app'],
		  ka: ['موجود', 'لدي موقع', 'لدي تطبيق', 'تحسين', 'اعادة تصميم', 'تجديد', 'اصلاح', 'تعديل', 'قائم', 'حالي'],
		  a: ["Possibly. Describe what you have and what you would like to change in an inquiry, and the team will tell you what is possible. Pick the closest project type, or Other.",
			'ربما. صِف ما لديك وما تريد تغييره في استفسار، وسيخبرك الفريق بما هو ممكن. اختر أقرب نوع مشروع، أو «أخرى».'],
		  act: ['form'], f: ['projecttypes', 'start'] },

		{ id: 'clients', q: ['Who do you work with?', 'مع من تعملون؟'],
		  k: ['clients', 'customers', 'who do you work with', 'startups', 'startup', 'companies', 'small business', 'individuals', 'students', 'who is it for'],
		  ka: ['عملاء', 'زبائن', 'مع من تعملون', 'شركات ناشئة', 'ناشئة', 'افراد', 'طلاب', 'لمن', 'شركات صغيرة'],
		  a: ['We build the systems that drive your business, from the first idea to deployment. If you have a project, send the details and the team will tell you whether and how they can help.',
			'نبني الأنظمة التي تدفع عملك إلى الأمام، من الفكرة الأولى إلى النشر. إن كان لديك مشروع فأرسل تفاصيله وسيخبرك الفريق إن كان بإمكانهم مساعدتك وكيف.'],
		  act: ['form'], f: ['idea', 'start'] },

		{ id: 'location', q: ['Where are you based?', 'أين مقركم؟'],
		  k: ['where', 'location', 'address', 'office', 'based', 'country', 'city', 'visit', 'meet', 'meeting'],
		  ka: ['اين مقركم', 'اين تقعون', 'اين مكانكم', 'اين', 'مقر', 'عنوان', 'مكتب', 'مكان', 'بلد', 'مدينة', 'زيارة', 'اجتماع', 'لقاء'],
		  a: ["I don't have an address to share here. Our contact number is an Algerian (+213) line. For meetings or anything location-related, message the team on WhatsApp.",
			'ليس لدي عنوان لأذكره هنا. رقم التواصل لدينا خط جزائري (\u200E+213). للاجتماعات أو أي استفسار عن الموقع راسل الفريق عبر واتساب.'],
		  act: ['wa'], f: ['contact'] },

		{ id: 'neochip', q: ['What is NeoChip?', 'ما هو NeoChip؟'],
		  k: ['neochip', 'neochip club', 'neochip dev'],
		  ka: ['نيوشيب', 'نيو تشيب'],
		  a: ['NeoChip Dev and NeoChip Club are mentioned in our footer, along with ARACS. For details, visit neochipclub.oneapp.dev or ask the team on WhatsApp.',
			'يُذكر NeoChip Dev وNeoChip Club في أسفل الصفحة إلى جانب ARACS. للتفاصيل زر neochipclub.oneapp.dev أو اسأل الفريق عبر واتساب.'],
		  act: ['neochip', 'wa'], f: ['about'] },

		{ id: 'thanks', q: ['Thanks', 'شكرًا'],
		  k: ['thanks', 'thank you', 'thx', 'merci', 'shukran', 'great', 'perfect', 'awesome'],
		  ka: ['شكرا', 'مشكور', 'تسلم', 'ممتاز', 'رائع', 'جزاك الله خيرا', 'بارك الله فيك'],
		  a: ["You're welcome! Anything else you'd like to know?", 'على الرحب والسعة! هل تريد معرفة شيء آخر؟'],
		  f: ['start', 'services'] },

		{ id: 'bye', q: ['Bye', 'مع السلامة'],
		  k: ['bye', 'goodbye', 'see you', 'ciao'],
		  ka: ['مع السلامة', 'وداعا', 'الى اللقاء', 'باي'],
		  a: ['Goodbye! When you are ready, send us your idea and we will take it from there.',
			'مع السلامة! عندما تكون جاهزًا أرسل لنا فكرتك وسنتولى الباقي.'],
		  act: ['form'] }
	];
	const byId = Object.fromEntries(KB.map((e) => [e.id, e]));

	const START_CHIPS = ['services', 'process', 'hardware', 'start', 'reply'];
	const FALLBACK = {
		a: ["I'm not sure about that one. I can help with our services, process, hardware prototyping, how to start, or how to contact us. For anything else, the team answers on WhatsApp in minutes.",
			'لست متأكدًا من الإجابة عن هذا. يمكنني المساعدة في خدماتنا ومراحل العمل والنماذج الأولية للأجهزة وكيفية البدء والتواصل. وللأمور الأخرى يجيب الفريق عبر واتساب خلال دقائق.'],
		act: ['wa', 'form'],
		f: ['services', 'process', 'start']
	};

	/* ---------- language ---------- */
	let L = 0; // 0 = English (default), 1 = Arabic
	const AR_RE = /[\u0600-\u06FF]/;
	const t = (pair) => pair[L];

	/* ---------- matching (both languages are always understood) ---------- */
	const norm = (s) => s.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f\u064B-\u065F\u0670\u0640]/g, '') // accents, Arabic diacritics, tatweel
		.replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
		.replace(/[\u060C\u061B\u061F]/g, ' ') // Arabic comma, semicolon, question mark
		.replace(/[^a-z0-9+/ \u0600-\u06FF]/g, ' ').replace(/\s+/g, ' ').trim();

	const AR_PREFIXES = ['وبال', 'وال', 'بال', 'كال', 'فال', 'لل', 'ال', 'و', 'ب', 'ل'];
	function arVariants(tok) {
		const v = [tok];
		for (const p of AR_PREFIXES) if (tok.startsWith(p) && tok.length - p.length >= 2) v.push(tok.slice(p.length));
		return v;
	}
	function lev(a, b) {
		if (Math.abs(a.length - b.length) > 1) return 2;
		const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
		for (let j = 1; j <= b.length; j++) m[0][j] = j;
		for (let i = 1; i <= a.length; i++)
			for (let j = 1; j <= b.length; j++)
				m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
		return m[a.length][b.length];
	}
	function score(text, toks, entry) {
		let s = 0;
		const padded = ' ' + text + ' ';
		for (const raw of entry.k.concat(entry.ka || [])) {
			const k = norm(raw);
			if (!k) continue;
			if (k.includes(' ')) {
				if (padded.includes(' ' + k + ' ')) s += 3;
			} else if (AR_RE.test(k)) {
				const hit = toks.some((tk) => AR_RE.test(tk) && arVariants(tk).some((v) => v === k || (k.length >= 4 && v.startsWith(k))));
				if (hit) s += k.length <= 2 ? 1 : 2;
			} else if (toks.includes(k)) {
				s += k.length <= 2 ? 1 : 2;
			} else if (k.length >= 5) {
				const stem = k.slice(0, Math.max(4, k.length - 2));
				if (toks.some((tk) => !AR_RE.test(tk) && tk.length >= 4 && (tk.startsWith(stem) || lev(tk, k) <= 1))) s += 1.2;
			}
		}
		return s;
	}
	function answer(userText) {
		const text = norm(userText);
		const toks = text.split(' ').filter(Boolean);
		let best = null, bestScore = 0;
		for (const e of KB) {
			const sc = score(text, toks, e);
			if (sc > bestScore) { bestScore = sc; best = e; }
		}
		return bestScore >= 2 ? best : FALLBACK;
	}

	/* ---------- state + rendering ---------- */
	let history = [];          // { role: 'user', text } | { role: 'bot', entry }
	let chipIds = START_CHIPS; // follow-up chips currently shown
	let busy = false;
	let greeted = false;

	const scrollDown = () => { log.scrollTop = log.scrollHeight; };

	function userNode(text) {
		const d = document.createElement('div');
		d.className = 'bot-msg me';
		d.textContent = text;
		return d;
	}
	function botNode(entry) {
		const wrap = document.createElement('div');
		const bubble = document.createElement('div');
		bubble.className = 'bot-msg bot';
		bubble.textContent = t(entry.a);
		wrap.appendChild(bubble);
		if (entry.act && entry.act.length) {
			const row = document.createElement('div');
			entry.act.forEach((id) => {
				const a = ACT[id];
				const link = document.createElement('a');
				link.className = 'bot-act';
				link.textContent = t(a.l);
				link.href = a.href;
				if (a.ext) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
				else link.addEventListener('click', closePanel); // in-page link: get out of the way
				row.appendChild(link);
			});
			wrap.appendChild(row);
		}
		return wrap;
	}
	function renderLog() {
		log.innerHTML = '';
		history.forEach((m) => log.appendChild(m.role === 'user' ? userNode(m.text) : botNode(m.entry)));
		scrollDown();
	}
	function renderChips() {
		chipsEl.innerHTML = '';
		chipIds.forEach((id) => {
			const e = byId[id];
			if (!e) return;
			const b = document.createElement('button');
			b.type = 'button';
			b.className = 'bot-chip';
			b.textContent = t(e.q);
			b.addEventListener('click', () => ask(t(e.q), e));
			chipsEl.appendChild(b);
		});
	}
	function renderUi() {
		panel.dir = L ? 'rtl' : 'ltr';
		panel.lang = L ? 'ar' : 'en';
		launcher.lang = L ? 'ar' : 'en';
		$('bot-title').textContent = t(UI.title);
		$('bot-status').textContent = t(UI.status);
		input.placeholder = t(UI.placeholder);
		$('bot-launcher-label').textContent = t(UI.launcher);
		launcher.setAttribute('aria-label', t(UI.launcherAria));
		closeBtn.setAttribute('aria-label', t(UI.close));
		form.querySelector('button[type="submit"]').setAttribute('aria-label', t(UI.send));
		form.querySelector('label').textContent = t(UI.question);
		langBtn.textContent = t(UI.toggleLabel);
		langBtn.setAttribute('aria-label', t(UI.toggleAria));
		langBtn.title = t(UI.toggleAria);
	}
	function setLang(next) {
		L = next;
		renderUi();
		renderLog();
		renderChips();
	}

	function showTyping(on) {
		let el = $('bot-typing');
		if (on && !el) {
			el = document.createElement('div');
			el.id = 'bot-typing';
			el.className = 'bot-msg bot bot-typing';
			el.setAttribute('aria-label', t(UI.typing));
			el.innerHTML = '<span></span><span></span><span></span>';
			log.appendChild(el);
			scrollDown();
		} else if (!on && el) el.remove();
	}

	function ask(text, forced) {
		if (busy) return;
		text = text.trim();
		if (!text) return;
		// If someone types Arabic while the chat is in English, switch over for them
		if (!L && AR_RE.test(text)) { L = 1; renderUi(); renderLog(); }
		busy = true;
		history.push({ role: 'user', text });
		log.appendChild(userNode(text));
		chipsEl.innerHTML = '';
		const entry = forced || answer(text);
		showTyping(true);
		setTimeout(() => {
			showTyping(false);
			history.push({ role: 'bot', entry });
			log.appendChild(botNode(entry));
			scrollDown();
			chipIds = (entry.f && entry.f.length) ? entry.f : START_CHIPS;
			renderChips();
			busy = false;
		}, reduceMotion ? 0 : 550);
	}

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const v = input.value;
		input.value = '';
		ask(v);
	});
	langBtn.addEventListener('click', () => setLang(L ? 0 : 1));

	/* ---------- open / close ---------- */
	function openPanel() {
		panel.classList.remove('hidden');
		launcher.setAttribute('aria-expanded', 'true');
		launcher.classList.add('hidden');
		if (!greeted) {
			greeted = true;
			history.push({ role: 'bot', entry: { a: UI.greet } });
			renderLog();
			renderChips();
		}
		setTimeout(() => input.focus(), 50);
	}
	function closePanel() {
		panel.classList.add('hidden');
		launcher.setAttribute('aria-expanded', 'false');
		launcher.classList.remove('hidden');
	}
	launcher.addEventListener('click', openPanel);
	closeBtn.addEventListener('click', () => { closePanel(); launcher.focus(); });
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && !panel.classList.contains('hidden')) { closePanel(); launcher.focus(); }
	});

	renderUi();
})();

/* =====================================================
   3. CAPABILITY STACK (Expertise section): chip to cloud
   Visitors tick what they need; the choice is carried into the inquiry form.
   ===================================================== */
(function () {
	const root = document.getElementById('stack');
	if (!root) return;

	// type = value of the matching option in the inquiry form
	const LAYERS = [
		{ n: 'Devices', tag: 'Where products start to exist', caps: [
			{ n: 'Hardware MVP', i: 'ph-cube', type: 'Hardware Prototyping',
			  d: 'A working prototype you can hold, run and test before a full build.',
			  tags: ['Arduino', 'ESP32', 'Raspberry Pi'] },
			{ n: 'Embedded & IoT', i: 'ph-cpu', type: 'Hardware Prototyping',
			  d: 'Connected devices that sense, decide and report to your software.',
			  tags: ['Embedded', 'IoT', 'Sensors'] } ] },
		{ n: 'Software', tag: 'What your users touch', caps: [
			{ n: 'Development', i: 'ph-code', type: 'Web application',
			  d: 'Web and mobile applications, e-commerce stores and the APIs that connect them.',
			  tags: ['Web', 'Mobile', 'E-commerce', 'APIs'] },
			{ n: 'UI/UX', i: 'ph-monitor', type: 'UI/UX Design',
			  d: 'Interfaces that are clear to use and consistent with your brand.',
			  tags: ['UI', 'UX', 'Brand'] },
			{ n: 'Automation', i: 'ph-gear', type: 'Automation Solutions',
			  d: 'Systems that take over the repetitive work, so your team can focus.',
			  tags: ['Workflows', 'Integrations'] } ] },
		{ n: 'Cloud & Data', tag: 'Where it runs and lives', caps: [
			{ n: 'Cloud', i: 'ph-cloud', type: 'Cloud & Infrastructure',
			  d: 'Deployment and infrastructure that scale as your users grow.',
			  tags: ['Deployment', 'Infrastructure', 'Scale'] },
			{ n: 'Data', i: 'ph-database', type: 'Other',
			  d: 'Structured storage and data flows your product can rely on.',
			  tags: ['Storage', 'Structure'] } ] },
		{ n: 'Trust & Care', tag: 'What keeps it reliable', caps: [
			{ n: 'Testing', i: 'ph-check-square', type: 'Quality assurance & Testing',
			  d: 'Quality checked and issues fixed before anything reaches your users.',
			  tags: ['QA', 'Fixes'] },
			{ n: 'Security', i: 'ph-shield-check', type: 'Other',
			  d: 'Protection built in from the start and checked during testing.',
			  tags: ['Protection', 'Checks'] },
			{ n: 'Support', i: 'ph-headset', type: 'Other',
			  d: 'We stay with you after launch, from fixes to new improvements.',
			  tags: ['Support', 'Growth'] } ] }
	];

	const $ = (id) => document.getElementById(id);
	const chosen = new Set();
	const all = LAYERS.flatMap((l) => l.caps);
	const buttons = {};

	// Render the layers
	LAYERS.forEach((layer, li) => {
		const row = document.createElement('div');
		row.className = 'layer';
		const last = li === LAYERS.length - 1;
		row.innerHTML = `
			<div class="rail" aria-hidden="true"><span class="rail-dot">${li + 1}</span>${last ? '' : '<span class="rail-line"></span>'}</div>
			<div class="layer-head rounded-2xl bg-brand-navy hero-pattern p-6 text-white self-start">
				<p class="relative z-10 text-brand-lightTeal font-semibold text-sm mb-2">Layer ${li + 1} of ${LAYERS.length}</p>
				<h3 class="relative z-10 text-2xl font-bold mb-1">${layer.n}</h3>
				<p class="relative z-10 text-gray-300 text-[15px]">${layer.tag}</p>
			</div>
			<div class="layer-cards" style="--n:${layer.caps.length}"></div>`;
		const grid = row.querySelector('.layer-cards');
		layer.caps.forEach((c) => {
			const b = document.createElement('button');
			b.type = 'button';
			b.className = 'cap2';
			b.setAttribute('aria-pressed', 'false');
			b.innerHTML = `
				<span class="ico"><i class="ph ${c.i}"></i></span>
				<span class="tick"><i class="ph ph-plus"></i></span>
				<span class="block text-lg font-bold text-brand-navy pr-8">${c.n}</span>
				<span class="block text-gray-500 text-[15px] leading-relaxed">${c.d}</span>
				<span class="flex flex-wrap gap-2 mt-auto pt-1">${c.tags.map((t) => `<span class="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-blue/10 text-brand-blue">${t}</span>`).join('')}</span>`;
			b.addEventListener('click', () => toggle(c.n));
			buttons[c.n] = b;
			grid.appendChild(b);
		});
		root.appendChild(row);
	});

	function toggle(name) {
		if (chosen.has(name)) chosen.delete(name); else chosen.add(name);
		update();
	}

	function update() {
		all.forEach((c) => {
			const on = chosen.has(c.n);
			const b = buttons[c.n];
			b.setAttribute('aria-pressed', on ? 'true' : 'false');
			b.querySelector('.tick i').className = 'ph ' + (on ? 'ph-check' : 'ph-plus');
		});
		const picked = all.filter((c) => chosen.has(c.n));
		const n = picked.length;
		$('stack-count').textContent = n ? `${n} selected` : 'Tap what you need';
		$('stack-clear').classList.toggle('hidden', !n);
		$('stack-cta').querySelector('span').textContent = n ? `Start with ${n === 1 ? 'this' : 'these'}` : 'Start a project';
		const chips = $('stack-chips');
		chips.innerHTML = '';
		picked.forEach((c) => {
			const chip = document.createElement('button');
			chip.type = 'button';
			chip.className = 'inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-sm font-medium hover:bg-brand-blue hover:text-white transition-colors';
			chip.setAttribute('aria-label', 'Remove ' + c.n);
			chip.innerHTML = `${c.n} <i class="ph ph-x text-xs"></i>`;
			chip.addEventListener('click', () => toggle(c.n));
			chips.appendChild(chip);
		});
	}

	$('stack-clear').addEventListener('click', () => { chosen.clear(); update(); });

	// Carry the choice into the inquiry form
	$('stack-cta').addEventListener('click', () => {
		const picked = all.filter((c) => chosen.has(c.n));
		if (!picked.length) return;
		const sel = document.getElementById('project_type');
		const desc = document.getElementById('project_description');
		const specific = picked.find((c) => c.type !== 'Other');
		if (sel) sel.value = specific ? specific.type : 'Other';
		if (desc) {
			const line = "I'm interested in: " + picked.map((c) => c.n).join(', ') + '.';
			const current = desc.value.trim();
			if (!current) desc.value = line + '\n\n';
			else if (current.startsWith("I'm interested in:")) { const v = desc.value, nl = v.indexOf('\n'); desc.value = line + (nl === -1 ? '\n\n' : v.slice(nl)); }
			else desc.value = line + '\n\n' + desc.value;
		}
	});

	update();
})();
