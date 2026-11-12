
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
		navbar.classList.replace('bg-white/90', 'bg-white/95');
	} else {
		navbar.classList.remove('shadow-sm');
		navbar.classList.replace('bg-white/95', 'bg-white/90');
	}
});

// Contact form
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

	// "How did you know about us?" — show a follow-up field only when it adds something.
	const heardAboutSelect = document.getElementById('heard_about');
	const referralWrap = document.getElementById('referral-details-wrap');
	const referralLabel = document.getElementById('referral-details-label');
	const referralHint = document.getElementById('referral-details-hint');
	const referralInput = document.getElementById('referral_details');

	const REFERRAL_DETAILS = {
		'Social media': {
			label: 'Which platform?',
			placeholder: 'Facebook, Instagram, LinkedIn…',
			hint: 'Optional — it helps us know where to say thank you.'
		},
		'A friend or colleague': {
			label: "Friend's name",
			placeholder: 'Name of the person who told you about us',
			hint: 'Optional — mention their name if you can, so we can thank them.'
		},
		'A previous client': {
			label: 'Client name',
			placeholder: 'Name of the client who referred you',
			hint: 'Optional — mention their name if you can, so we can thank them.'
		},
		'An event or workshop': {
			label: 'Event or workshop',
			placeholder: 'Name of the event or workshop',
			hint: 'Optional — which event was it?'
		},
		'University or school': {
			label: 'University or school',
			placeholder: 'Name of the university or school',
			hint: 'Optional — helps us know where to find you.'
		},
		'A business partner': {
			label: 'Partner name',
			placeholder: 'Name of the partner or company',
			hint: 'Optional — mention their name if you can.'
		},
		'NeoChip Club or community': {
			label: 'Which community?',
			placeholder: 'e.g. NeoChip Club',
			hint: 'Optional — any detail helps.'
		},
		'Saw an ad or poster': {
			label: 'Where did you see it?',
			placeholder: 'e.g. An ad on Facebook, a poster at university',
			hint: 'Optional — any detail helps.'
		},
		'Other': {
			label: 'Tell us more',
			placeholder: 'Where did you hear about us?',
			hint: 'Optional — any detail helps.'
		}
	};

	function updateReferralDetails() {
		if (!heardAboutSelect || !referralWrap || !referralInput) return;
		const config = REFERRAL_DETAILS[heardAboutSelect.value];
		if (config) {
			referralWrap.classList.remove('hidden');
			if (referralLabel) referralLabel.textContent = config.label;
			if (referralHint) referralHint.textContent = config.hint;
			referralInput.placeholder = config.placeholder;
			referralInput.disabled = false;
		} else {
			referralWrap.classList.add('hidden');
			referralInput.value = '';
			referralInput.disabled = true;
		}
	}

	if (heardAboutSelect) {
		heardAboutSelect.addEventListener('change', updateReferralDetails);
		updateReferralDetails();
	}

	async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeoutMs);
		try {
			return await fetch(url, { ...options, signal: controller.signal });
		} finally {
			clearTimeout(timer);
		}
	}

	// Resolves as soon as the first request succeeds; rejects only if all fail.
	function firstAccepted(tasks) {
		return new Promise((resolve, reject) => {
			let pending = tasks.length;
			if (!pending) {
				reject(new Error('No submission endpoints are configured.'));
				return;
			}
			tasks.forEach((task) => {
				Promise.resolve(task).then(resolve, () => {
					pending -= 1;
					if (pending === 0) reject(new Error('All submission endpoints failed.'));
				});
			});
		});
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

			// The form now has one "Full name" field. The bot and the existing backend
			// still expect first_name/last_name, so derive them from it.
			const fullName = String(formData.get('full_name') || '').replace(/\s+/g, ' ').trim();
			const nameParts = fullName.split(' ').filter(Boolean);
			const firstName = nameParts.shift() || '';
			const lastName = nameParts.join(' ');
			const hasWhatsapp = formData.get('has_whatsapp') === 'yes';
			const referralDetails = String(formData.get('referral_details') || '').trim();

			const payload = {
				// Original fields (kept for the bot/backend)
				first_name: firstName,
				last_name: lastName,
				email: String(formData.get('email') || '').trim(),
				project_type: formData.get('project_type'),
				project_description: formData.get('project_description'),
				_gotcha: formData.get('_gotcha') || '',
				source: 'website',
				page: window.location.href,
				// New fields
				full_name: fullName,
				wilaya: String(formData.get('wilaya') || ''),
				phone: String(formData.get('phone') || '').trim(),
				has_whatsapp: hasWhatsapp,
				whatsapp: hasWhatsapp ? 'Yes' : 'No',
				promo_code: String(formData.get('promo_code') || '').trim(),
				invitor: String(formData.get('invitor') || '').trim(),
				heard_about: String(formData.get('heard_about') || ''),
				referral_details: referralDetails
			};

			// The existing backend only knows the original fields, so keep it untouched.
			const legacyPayload = {
				first_name: payload.first_name,
				last_name: payload.last_name,
				email: payload.email,
				project_type: payload.project_type,
				project_description: payload.project_description,
				_gotcha: payload._gotcha,
				source: payload.source,
				page: payload.page
			};

			// The bot receives every field, plus a readable summary appended to the
			// description so the new details show up even if the bot's message template
			// only prints the description.
			const extraLines = [];
			if (payload.wilaya) extraLines.push(`Wilaya: ${payload.wilaya}`);
			if (payload.phone) extraLines.push(`Phone: ${payload.phone}${payload.has_whatsapp ? ' (WhatsApp)' : ''}`);
			if (payload.promo_code) extraLines.push(`Promo code: ${payload.promo_code}`);
			if (payload.invitor) extraLines.push(`Invited by: ${payload.invitor}`);
			if (payload.heard_about) extraLines.push(`Heard about us: ${payload.heard_about}${referralDetails ? ` (${referralDetails})` : ''}`);
			if (!hasWhatsapp) extraLines.push('WhatsApp on this number: No');

			const botPayload = {
				...payload,
				project_description: extraLines.length
					? `${payload.project_description || ''}\n\n— Additional details —\n${extraLines.join('\n')}`
					: payload.project_description
			};

			try {
				// Keep the existing Supabase submission AND notify the NeoChip bot.
				// The form succeeds as soon as ONE of them accepts the inquiry, so a
				// slow or offline endpoint never keeps the visitor waiting for the other.
				const botConfigured = INQUIRY_API_URL && !INQUIRY_API_URL.includes('YOUR-BOT');

				const attempts = [
					sendInquiryToLegacy(legacyPayload).catch((legacyError) => {
						console.warn('Legacy backend failed:', legacyError);
						throw legacyError;
					})
				];

				if (botConfigured) {
					attempts.push(
						sendInquiryToBot(botPayload).catch((botError) => {
							console.warn('Bot webhook failed:', botError);
							throw botError;
						})
					);
				} else {
					console.warn('INQUIRY_API_URL is not configured in main.js — Telegram will not be notified.');
				}

				await firstAccepted(attempts);

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

});


/* ARACS — extras: looping process player + bilingual (EN/AR) FAQ assistant.
   Interactive extras: hero scene, process player, capability stack, FAQ assistant. */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =====================================================
   0. HERO: "Project ARACS" launch sequence, then a living circuit board (one canvas, no libraries)
   Intro: an IDE types the launch code, compiles it, loads, glitches away, and the board assembles itself
   part by part and wire by wire. Then it powers on: live signals, an inspection beam, and a probe.
   Ten components stand for the ten ARACS capabilities.
   ===================================================== */
(function () {
	const root = document.getElementById('hero-pcb');
	if (!root) return;
	const cv = root.querySelector('canvas');
	const ctx = cv && cv.getContext && cv.getContext('2d');
	if (!ctx) return;
	const $ = (id) => document.getElementById(id);
	const nameEl = $('pcb-name'), lineEl = $('pcb-line'), statEl = $('pcb-stat'), skipBtn = $('pcb-skip'), ideEl = $('pcb-ide');
	const touch = !window.matchMedia('(hover: hover)').matches;
	if (touch) lineEl.textContent = lineEl.textContent.replace('Hover', 'Tap');
	const DEFAULT = { name: nameEl.textContent, line: lineEl.textContent };

	const LW = 1000, LH = 800, TAU = Math.PI * 2;
	let seed = 3;
	const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
	const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
	const easeOut = (x) => 1 - Math.pow(1 - x, 3);
	const easeBack = (x) => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

	const CAPS = [
		['Hardware MVP', 'A prototype you can hold and test'], ['Embedded & IoT', 'Connected devices that sense and report'],
		['Automation', 'Systems that do the repetitive work'], ['Development', 'Web, mobile, e-commerce and APIs'],
		['UI/UX', 'Interfaces that are clear to use'], ['Data', 'Structured data your product can rely on'],
		['Cloud', 'Deployment that scales with you'], ['Testing', 'Quality checked before launch'],
		['Security', 'Protection built in from the start'], ['Support', 'We stay with you after launch']
	];

	/* ---------------- components ---------------- */
	const COMPS = [
		{ id: 'U1', kind: 'mcu', x: 400, y: 300, w: 200, h: 200, name: 'U1 · Microcontroller', cap: 1 },
		{ id: 'U2', kind: 'wifi', x: 625, y: 102, w: 150, h: 96, name: 'U2 · Wi-Fi module', cap: 6 },
		{ id: 'ANT', kind: 'ant', x: 790, y: 92, w: 160, h: 118, name: 'ANT1 · 2.4 GHz antenna', cap: 6 },
		{ id: 'U3', kind: 'soic', x: 160, y: 167, w: 60, h: 46, name: 'U3 · SPI flash memory', cap: 5 },
		{ id: 'U4', kind: 'soic', x: 160, y: 577, w: 60, h: 46, name: 'U4 · Sensor', cap: 0, mark: 'SNS' },
		{ id: 'U5', kind: 'soic', x: 770, y: 497, w: 60, h: 46, name: 'U5 · Secure element', cap: 8, mark: 'SE' },
		{ id: 'U7', kind: 'soic', x: 770, y: 307, w: 60, h: 46, name: 'U7 · Driver', cap: 2, mark: 'DRV' },
		{ id: 'K1', kind: 'relay', x: 868, y: 285, w: 82, h: 92, name: 'K1 · Relay', cap: 2 },
		{ id: 'U6', kind: 'sot', x: 760, y: 668, w: 60, h: 44, name: 'U6 · Voltage regulator', cap: 1 },
		{ id: 'J1', kind: 'usb', x: 440, y: 722, w: 120, h: 56, name: 'J1 · USB-C port', cap: 3 },
		{ id: 'J2', kind: 'fpc', x: 40, y: 340, w: 60, h: 100, name: 'J2 · Display connector', cap: 4 },
		{ id: 'J3', kind: 'header', x: 310, y: 636, w: 68, h: 28, name: 'J3 · Debug header', cap: 9 },
		{ id: 'TP', kind: 'tp', x: 452, y: 78, w: 74, h: 24, name: 'TP1-TP6 · Test points', cap: 7 },
		{ id: 'Y1', kind: 'xtal', x: 350, y: 200, w: 60, h: 28, name: 'Y1 · Crystal', cap: 1 }
	];
	const C = Object.fromEntries(COMPS.map((c) => [c.id, c]));
	COMPS.forEach((c) => { c.act = 0; });

	const PASSIVES = [
		[368, 262, 10, 20, 'C1', 'c'], [628, 262, 10, 20, 'C2', 'c'], [368, 518, 10, 20, 'C3', 'c'], [628, 518, 10, 20, 'C4', 'c'],
		[110, 585, 20, 9, 'R1', 'r'], [110, 606, 20, 9, 'R2', 'r'], [110, 180, 20, 9, 'R3', 'r'], [110, 202, 20, 9, 'R4', 'r'],
		[846, 505, 20, 9, 'R5', 'r'], [846, 528, 20, 9, 'R6', 'r'], [846, 676, 12, 20, 'C5', 'c'], [868, 676, 12, 20, 'C6', 'c'],
		[660, 66, 20, 9, 'R7', 'r'], [690, 66, 20, 9, 'R8', 'r'], [260, 735, 20, 9, 'R9', 'r'], [286, 735, 20, 9, 'R10', 'r']
	];
	const LEDS = [{ x: 612, y: 748, c: '60,255,150', src: 'J1' }, { x: 912, y: 412, c: '255,90,80', src: 'K1' }, { x: 600, y: 64, c: '80,170,255', src: 'U2' }];

	/* ---------------- routing ---------------- */
	const mp = { L: (k) => [386, 400 + (k - 7.5) * 11], R: (k) => [614, 400 + (k - 7.5) * 11], T: (k) => [500 + (k - 7.5) * 11, 286], B: (k) => [500 + (k - 7.5) * 11, 514] };
	const ks = (f, a, b) => { const o = []; for (let k = a; k <= b; k++) o.push(mp[f](k)); return o; };
	const col = (x, y0, n) => Array.from({ length: n }, (_, i) => [x, y0 + i * 11]);
	const rowp = (x0, y, n) => Array.from({ length: n }, (_, i) => [x0 + i * 11, y]);

	function route(s, e, order) {
		const dx = e[0] - s[0], dy = e[1] - s[1], adx = Math.abs(dx), ady = Math.abs(dy), d = Math.min(adx, ady);
		const sx = Math.sign(dx) || 1, sy = Math.sign(dy) || 1, pts = [s];
		const r = Math.abs(adx - ady);
		if (adx >= ady) {
			if (order === 'SD') { if (r > 0.5) pts.push([s[0] + sx * r, s[1]]); pts.push(e); }
			else { pts.push([s[0] + sx * d, s[1] + sy * d]); if (r > 0.5) pts.push(e); }
		} else {
			if (order === 'SD') { if (r > 0.5) pts.push([s[0], s[1] + sy * r]); pts.push(e); }
			else { pts.push([s[0] + sx * d, s[1] + sy * d]); if (r > 0.5) pts.push(e); }
		}
		return pts;
	}

	const traces = [];
	let groupKey = '', groupIdx = 0;
	function addTrace(o) {
		let acc = 0; const cum = [0];
		for (let i = 1; i < o.pts.length; i++) { acc += Math.hypot(o.pts[i][0] - o.pts[i - 1][0], o.pts[i][1] - o.pts[i - 1][1]); cum.push(acc); }
		o.cum = cum; o.len = acc; o.boost = 0;
		o.path = new Path2D(); o.pts.forEach((p, i) => (i ? o.path.lineTo(p[0], p[1]) : o.path.moveTo(p[0], p[1])));
		const key = o.a + '>' + o.b; groupIdx = key === groupKey ? groupIdx + 1 : 0; groupKey = key; o.gi = groupIdx;
		traces.push(o);
	}
	function bus(a, b, from, to, order, nets, desc, layer) {
		from.forEach((s, i) => addTrace({ pts: route(s, to[i], order), net: nets[i], desc: `${desc} · ${a} to ${b}`, a, b, layer, w: 2.6 }));
	}
	bus('U1', 'U3', ks('L', 0, 3), col(228, 173.5, 4), 'SD', ['SPI_CS', 'SPI_CLK', 'SPI_MOSI', 'SPI_MISO'], '3.3 V · SPI · 80 MHz', 0);
	bus('U1', 'U4', ks('L', 10, 13), col(228, 583.5, 4), 'SD', ['I2C_SDA', 'I2C_SCL', 'SENS_INT', 'SENS_CS'], '3.3 V · I2C · 400 kHz', 0);
	bus('U1', 'U2', ks('T', 10, 15), col(617, 122.5, 6), 'SD', ['WIFI_TX', 'WIFI_RX', 'WIFI_EN', 'WIFI_IO0', 'WIFI_CLK', 'WIFI_RST'], '3.3 V · SDIO · 40 MHz', 0);
	bus('U1', 'U7', ks('R', 0, 3), col(762, 313.5, 4), 'SD', ['GPIO_IN1', 'GPIO_IN2', 'GPIO_IN3', 'GPIO_IN4'], '3.3 V · GPIO · 10 kHz', 0);
	bus('U1', 'U5', ks('R', 10, 13), col(762, 503.5, 4), 'SD', ['SE_SDA', 'SE_SCL', 'SE_RST', 'SE_PWR'], '3.3 V · I2C · 1 MHz', 1);
	bus('U1', 'J1', ks('B', 5, 10), rowp(472.5, 708, 6), 'SD', ['USB_DP', 'USB_DN', 'USB_CC1', 'USB_CC2', 'USB_ID', 'USB_SBU'], 'USB 2.0 · 480 Mbit/s', 0);
	bus('U1', 'J3', ks('B', 0, 3), rowp(323.5, 650, 4), 'SD', ['UART_TX', 'UART_RX', 'UART_RTS', 'UART_CTS'], '3.3 V · UART · 115200 baud', 1);
	bus('U1', 'Y1', [mp.T(0), mp.T(1)], [[365, 230], [395, 230]], 'SD', ['XTAL_P', 'XTAL_N'], '40 MHz crystal', 0);
	bus('U1', 'TP', ks('T', 4, 9), rowp(461.5, 90, 6), 'SD', ['TP1', 'TP2', 'TP3', 'TP4', 'TP5', 'TP6'], 'Test point', 0);
	bus('U1', 'J2', ks('L', 4, 9), col(104, 375.5, 6), 'DS', ['DISP_CS', 'DISP_DC', 'DISP_RST', 'DISP_SCK', 'DISP_MOSI', 'DISP_BL'], '3.3 V · SPI · 40 MHz', 1);
	bus('U7', 'K1', [[838, 324.5], [838, 335.5]], [[862, 322], [862, 346]], 'SD', ['COIL_A', 'COIL_B'], '5 V coil · 70 mA', 0);
	addTrace({ pts: [[775, 150], [800, 150], [800, 122], [835, 122], [835, 172], [860, 172], [860, 122], [895, 122], [895, 172], [920, 172], [920, 122], [940, 122]], net: 'ANT_RF', desc: '2.4 GHz · 50 ohm RF feed · U2 to ANT1', a: 'U2', b: 'ANT', layer: 0, w: 3.2 });
	addTrace({ pts: [[565, 748], [690, 748], [728, 710], [752, 690]], net: 'VBUS', desc: '5 V · 1 A · J1 to U6', a: 'J1', b: 'U6', layer: 0, w: 5, power: true });
	addTrace({ pts: [[828, 690], [880, 690], [880, 416.5], [614, 416.5]], net: '3V3', desc: '3.3 V rail · 600 mA · U6 to U1', a: 'U6', b: 'U1', layer: 0, w: 5, power: true });
	const TOTAL_TRACES = traces.length;

	const compTraces = {};
	traces.forEach((t) => { (compTraces[t.a] = compTraces[t.a] || []).push(t); (compTraces[t.b] = compTraces[t.b] || []).push(t); });

	function pointAt(t, s) {
		s = Math.max(0, Math.min(t.len, s));
		for (let i = 1; i < t.cum.length; i++) if (s <= t.cum[i]) {
			const u = (s - t.cum[i - 1]) / ((t.cum[i] - t.cum[i - 1]) || 1);
			return [t.pts[i - 1][0] + (t.pts[i][0] - t.pts[i - 1][0]) * u, t.pts[i - 1][1] + (t.pts[i][1] - t.pts[i - 1][1]) * u];
		}
		return t.pts[t.pts.length - 1];
	}
	function strokeRange(t, s0, s1) {
		s0 = Math.max(0, s0); s1 = Math.min(t.len, s1);
		if (s1 <= s0) return;
		let p = pointAt(t, s0);
		ctx.beginPath(); ctx.moveTo(p[0], p[1]);
		for (let i = 1; i < t.cum.length; i++) if (t.cum[i] > s0 && t.cum[i] < s1) ctx.lineTo(t.pts[i][0], t.pts[i][1]);
		p = pointAt(t, s1); ctx.lineTo(p[0], p[1]); ctx.stroke();
	}

	const vias = [];
	traces.forEach((t) => { if (t.layer === 1) { vias.push(pointAt(t, 24)); vias.push(pointAt(t, t.len - 24)); } });
	const rectHit = (x, y, r) => COMPS.some((c) => x > c.x - r - 14 && x < c.x + c.w + r + 14 && y > c.y - r - 14 && y < c.y + c.h + r + 14);
	for (let x = 60; x <= 940; x += 36) { [48, 752].forEach((y) => { if (!rectHit(x, y, 6)) vias.push([x, y, 1]); }); }
	for (let y = 96; y <= 704; y += 36) { [48, 952].forEach((x) => { if (!rectHit(x, y, 6)) vias.push([x, y, 1]); }); }

	traces.forEach((t) => {
		const n = t.len > 260 ? 2 : 1;
		t.pulses = Array.from({ length: n }, () => ({ s: rnd() * t.len, v: (90 + rnd() * 150) * (rnd() < 0.5 ? 1 : -1), wait: 0 }));
	});
	const STAT = `${TOTAL_TRACES} nets · ${vias.length} vias`;
	if (statEl) statEl.textContent = STAT;

	/* ---------------- drawing helpers ---------------- */
	function rr(g, x, y, w, h, r) {
		g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
	}
	const FONT = '"JetBrains Mono", ui-monospace, monospace';
	const txt = (g, s, x, y, size, color, align) => { g.font = `600 ${size}px ${FONT}`; g.fillStyle = color; g.textAlign = align || 'center'; g.textBaseline = 'middle'; g.fillText(s, x, y); };
	const pinRect = (g, x, y, w, h) => { g.fillStyle = '#b9ccd1'; g.fillRect(x, y, w, h); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x, y, w, 1); };
	const SILK = 'rgba(225,245,242,0.78)';
	const copperStyle = (t) => (t.power ? 'rgba(255,196,96,0.85)' : t.layer ? 'rgba(80,165,215,0.55)' : 'rgba(0,205,178,0.62)');

	/* ---- layer 1: the bare substrate ---- */
	function buildSubstrate(g, sc) {
		g.setTransform(sc, 0, 0, sc, 0, 0); g.clearRect(0, 0, LW, LH);
		g.save(); g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 26 * sc; g.shadowOffsetY = 12 * sc;
		const bg = g.createLinearGradient(30, 30, 970, 770); bg.addColorStop(0, '#10404f'); bg.addColorStop(1, '#09232f');
		g.fillStyle = bg; rr(g, 30, 30, 940, 740, 28); g.fill(); g.restore();
		g.save(); rr(g, 30, 30, 940, 740, 28); g.clip();
		g.strokeStyle = 'rgba(0,194,168,0.05)'; g.lineWidth = 1; g.beginPath();
		for (let i = -800; i < 1000; i += 13) { g.moveTo(i, 0); g.lineTo(i + 800, 800); }
		g.stroke();
		const sh = g.createRadialGradient(330, 220, 40, 500, 400, 620); sh.addColorStop(0, 'rgba(120,255,240,0.07)'); sh.addColorStop(1, 'rgba(0,0,0,0.12)');
		g.fillStyle = sh; g.fillRect(0, 0, LW, LH);
		g.restore();
		g.strokeStyle = 'rgba(190,255,248,0.16)'; g.lineWidth = 1.5; rr(g, 30, 30, 940, 740, 28); g.stroke();
		g.setLineDash([6, 6]); g.strokeStyle = 'rgba(190,255,248,0.12)'; rr(g, 44, 44, 912, 712, 20); g.stroke(); g.setLineDash([]);
		[[70, 70], [930, 70], [70, 730], [930, 730]].forEach(([x, y]) => {
			g.fillStyle = 'rgba(201,180,106,0.85)'; g.beginPath(); g.arc(x, y, 21, 0, TAU); g.fill();
			g.fillStyle = '#071822'; g.beginPath(); g.arc(x, y, 12, 0, TAU); g.fill();
			g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 26, 0, TAU); g.stroke();
		});
		vias.filter((v) => v[2]).forEach((v) => {
			g.fillStyle = 'rgba(0,194,168,0.45)'; g.beginPath(); g.arc(v[0], v[1], 4, 0, TAU); g.fill();
			g.fillStyle = '#05141c'; g.beginPath(); g.arc(v[0], v[1], 1.8, 0, TAU); g.fill();
		});
		txt(g, 'ARACS', 150, 64, 30, SILK, 'left'); txt(g, 'TECHNOLOGIES', 152, 88, 11, 'rgba(225,245,242,0.55)', 'left');
		txt(g, 'END-TO-END SOLUTIONS', 96, 752, 11, 'rgba(225,245,242,0.5)', 'left');
		txt(g, 'REV A · 4-LAYER', 906, 752, 11, 'rgba(225,245,242,0.5)', 'right');
		g.fillStyle = 'rgba(225,245,242,0.55)'; g.beginPath(); g.arc(118, 64, 6, 0, TAU); g.fill();
	}

	/* ---- layer 2: all the copper (final state) ---- */
	function drawCopperTrace(g, t) {
		g.strokeStyle = 'rgba(0,0,0,0.38)'; g.lineWidth = t.w + 3.5; g.stroke(t.path);
		g.strokeStyle = copperStyle(t); g.lineWidth = t.w; g.stroke(t.path);
		g.strokeStyle = 'rgba(255,255,255,0.20)'; g.lineWidth = Math.max(0.8, t.w * 0.25); g.stroke(t.path);
	}
	function drawPadsAndVias(g, list) {
		list.forEach((t) => [t.pts[0], t.pts[t.pts.length - 1]].forEach((p) => { g.fillStyle = '#cfe2e4'; g.beginPath(); g.arc(p[0], p[1], t.w * 0.9 + 0.6, 0, TAU); g.fill(); }));
		list.forEach((t) => { if (t.layer === 1) [pointAt(t, 24), pointAt(t, t.len - 24)].forEach((v) => {
			g.fillStyle = '#9fc2c9'; g.beginPath(); g.arc(v[0], v[1], 6.2, 0, TAU); g.fill();
			g.fillStyle = '#05141c'; g.beginPath(); g.arc(v[0], v[1], 2.8, 0, TAU); g.fill();
		}); });
	}
	function buildCopper(g, sc) {
		g.setTransform(sc, 0, 0, sc, 0, 0); g.clearRect(0, 0, LW, LH);
		g.lineJoin = 'round'; g.lineCap = 'round';
		[1, 0].forEach((layer) => traces.filter((t) => t.layer === layer).forEach((t) => drawCopperTrace(g, t)));
		drawPadsAndVias(g, traces);
	}

	/* ---- layer 3: parts, each rendered to its own small sprite ---- */
	const ITEMS = [];
	COMPS.forEach((c) => { if (c.kind !== 'ant') ITEMS.push({ id: c.id, type: 'c', ref: c, bx: c.x - 32, by: c.y - 36, bw: c.w + 64, bh: c.h + 70, label: c.name }); });
	PASSIVES.forEach((p) => ITEMS.push({ id: p[4], type: 'p', ref: p, bx: p[0] - 12, by: p[1] - 18, bw: p[2] + 24, bh: p[3] + 36, label: `${p[4]} · ${p[5] === 'c' ? 'Capacitor' : 'Resistor'}` }));
	LEDS.forEach((l, i) => ITEMS.push({ id: 'LED' + i, type: 'l', ref: l, bx: l.x - 14, by: l.y - 12, bw: 28, bh: 24, label: `D${i + 1} · LED` }));
	const ORDER = ['U1', 'C1', 'C2', 'C3', 'C4', 'Y1', 'U3', 'R3', 'R4', 'U4', 'R1', 'R2', 'U2', 'R7', 'R8', 'LED2', 'U7', 'K1', 'LED1', 'U5', 'R5', 'R6', 'U6', 'C5', 'C6', 'J1', 'LED0', 'J3', 'TP', 'J2', 'R9', 'R10'];
	const ITEM = Object.fromEntries(ITEMS.map((it) => [it.id, it]));
	ITEMS.forEach((it) => { const i = ORDER.indexOf(it.id); it.t0 = 0.9 + (i < 0 ? ORDER.length : i) * 0.15; });
	const placedAt = (id) => (ITEM[id] ? ITEM[id].t0 + 0.3 : ITEM.U2.t0 + 0.3);
	// wire schedule: a wire starts once both of its parts are on the board
	let buildEnd = 0;
	traces.forEach((t, j) => {
		t.bt0 = Math.max(2.0 + j * 0.05, placedAt(t.a), placedAt(t.b)) + 0.15 + t.gi * 0.07;
		t.bdur = clamp(t.len / 650, 0.35, 1.0);
		buildEnd = Math.max(buildEnd, t.bt0 + t.bdur);
	});
	buildEnd += 0.5;
	const EVENTS = [];
	ITEMS.forEach((it) => EVENTS.push({ t: it.t0, name: 'Placing ' + it.label, line: 'Pick and place · component mounted' }));
	traces.forEach((t) => EVENTS.push({ t: t.bt0, name: 'Routing ' + t.net, line: t.desc }));
	EVENTS.sort((a, b) => a.t - b.t);

	function drawItem(g, sc, it) {
		g.setTransform(sc, 0, 0, sc, -it.bx * sc, -it.by * sc); g.clearRect(it.bx, it.by, it.bw, it.bh);
		const shadow = (fn) => { g.save(); g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 11 * sc; g.shadowOffsetX = 4 * sc; g.shadowOffsetY = 7 * sc; fn(); g.restore(); };
		const body = (x, y, w, h, r, c1, c2) => {
			const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
			shadow(() => { g.fillStyle = gr; rr(g, x, y, w, h, r); g.fill(); });
			g.strokeStyle = 'rgba(255,255,255,0.14)'; g.lineWidth = 1; rr(g, x + 0.5, y + 0.5, w - 1, h - 1, r); g.stroke();
		};
		const pin1 = (x, y) => { g.fillStyle = 'rgba(225,245,242,0.7)'; g.beginPath(); g.arc(x, y, 3, 0, TAU); g.fill(); };
		if (it.type === 'p') {
			const [x, y, w, h, lab, t] = it.ref;
			shadow(() => { g.fillStyle = t === 'c' ? '#8a6a3a' : '#151e24'; g.fillRect(x, y, w, h); });
			g.fillStyle = '#d7d2c0'; if (w > h) { g.fillRect(x, y, 4, h); g.fillRect(x + w - 4, y, 4, h); } else { g.fillRect(x, y, w, 4); g.fillRect(x, y + h - 4, w, 4); }
			txt(g, lab, x + w / 2, y + (w > h ? -8 : h + 9), 8, SILK); return;
		}
		if (it.type === 'l') { const l = it.ref; shadow(() => { g.fillStyle = `rgba(${l.c},0.35)`; g.fillRect(l.x - 7, l.y - 4, 14, 8); }); g.fillStyle = `rgba(${l.c},0.7)`; g.fillRect(l.x - 5, l.y - 3, 10, 6); return; }
		const c = it.ref, cx = c.x + c.w / 2, cy = c.y + c.h / 2;
		if (c.kind !== 'tp') { g.strokeStyle = 'rgba(225,245,242,0.28)'; g.lineWidth = 1.2; rr(g, c.x - 6, c.y - 6, c.w + 12, c.h + 12, 4); g.stroke(); }
		if (c.kind !== 'mcu') txt(g, c.id, c.x, c.y - 14, 11, SILK, 'left');
		if (c.kind === 'mcu') {
			for (let k = 0; k < 16; k++) {
				const o = (k - 7.5) * 11;
				pinRect(g, c.x - 14, cy + o - 2.5, 14, 5); pinRect(g, c.x + c.w, cy + o - 2.5, 14, 5);
				pinRect(g, cx + o - 2.5, c.y - 14, 5, 14); pinRect(g, cx + o - 2.5, c.y + c.h, 5, 14);
			}
			body(c.x, c.y, c.w, c.h, 8, '#16303f', '#0a1822');
			g.strokeStyle = 'rgba(0,194,168,0.35)'; g.lineWidth = 1.2; rr(g, c.x + 8, c.y + 8, c.w - 16, c.h - 16, 5); g.stroke();
			pin1(c.x + 16, c.y + 16); txt(g, 'U1', c.x + 38, c.y + 21, 11, 'rgba(225,245,242,0.7)', 'left');
			txt(g, 'ARACS', cx, c.y + 168, 28, 'rgba(235,252,250,0.92)'); txt(g, 'EMBEDDED SoC · 240 MHz', cx, c.y + 186, 9, 'rgba(0,194,168,0.85)');
		} else if (c.kind === 'soic') {
			for (let i = 0; i < 4; i++) { const y = cy + (i - 1.5) * 11 - 2; pinRect(g, c.x - 8, y, 8, 4); pinRect(g, c.x + c.w, y, 8, 4); }
			body(c.x, c.y, c.w, c.h, 3, '#14232d', '#08121a'); pin1(c.x + 8, c.y + 8);
			txt(g, c.mark || 'FLASH', cx, cy + 3, 11, 'rgba(235,252,250,0.85)');
		} else if (c.kind === 'sot') {
			for (let i = 0; i < 3; i++) pinRect(g, c.x - 8, cy + (i - 1) * 12 - 2, 8, 4);
			pinRect(g, c.x + c.w, cy - 10, 10, 20);
			body(c.x, c.y, c.w, c.h, 3, '#18262f', '#09131a'); txt(g, 'REG', cx, cy, 11, 'rgba(235,252,250,0.85)');
		} else if (c.kind === 'wifi') {
			for (let i = 0; i < 6; i++) pinRect(g, c.x - 8, cy + (i - 2.5) * 11 - 2, 8, 4);
			const gr = g.createLinearGradient(c.x, c.y, c.x + c.w, c.y + c.h); gr.addColorStop(0, '#c9d3d6'); gr.addColorStop(0.5, '#8fa1a7'); gr.addColorStop(1, '#b4c2c6');
			shadow(() => { g.fillStyle = gr; rr(g, c.x, c.y, c.w, c.h, 4); g.fill(); });
			g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 1; for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(c.x + 8, c.y + i * 18); g.lineTo(c.x + c.w - 8, c.y + i * 18); g.stroke(); }
			g.fillStyle = 'rgba(8,24,34,0.88)'; rr(g, c.x + 30, c.y + 26, 90, 44, 3); g.fill();
			txt(g, 'WIFI · BT', cx, cy, 12, 'rgba(0,224,196,0.95)'); txt(g, '2.4 GHz', cx, cy + 12, 8, 'rgba(225,245,242,0.6)');
		} else if (c.kind === 'relay') {
			body(c.x, c.y, c.w, c.h, 5, '#1b4f8f', '#0e2d57'); g.fillStyle = 'rgba(255,255,255,0.09)'; rr(g, c.x + 8, c.y + 8, c.w - 16, 24, 3); g.fill();
			txt(g, 'K1', cx, c.y + 20, 13, 'rgba(235,252,250,0.9)'); txt(g, '5 V · 10 A', cx, c.y + 56, 9, 'rgba(235,252,250,0.7)');
			[[c.x + 14, c.y + c.h - 4], [c.x + c.w / 2, c.y + c.h - 4], [c.x + c.w - 14, c.y + c.h - 4]].forEach((p) => pinRect(g, p[0] - 3, p[1] - 2, 6, 8));
			pinRect(g, c.x - 6, c.y + 36, 8, 4); pinRect(g, c.x - 6, c.y + 60, 8, 4);
		} else if (c.kind === 'usb') {
			const gr = g.createLinearGradient(c.x, c.y, c.x, c.y + c.h); gr.addColorStop(0, '#d6dee0'); gr.addColorStop(1, '#8c9ca1');
			shadow(() => { g.fillStyle = gr; rr(g, c.x, c.y, c.w, c.h, 10); g.fill(); });
			g.fillStyle = '#071218'; rr(g, c.x + 14, c.y + 16, c.w - 28, 24, 12); g.fill(); g.fillStyle = '#2a3a42'; g.fillRect(c.x + 26, c.y + 26, c.w - 52, 4);
			for (let i = 0; i < 6; i++) pinRect(g, 469 + i * 11, c.y - 16, 7, 14);
			txt(g, 'USB-C', cx, c.y + 49, 8, 'rgba(8,24,34,0.7)');
		} else if (c.kind === 'fpc') {
			body(c.x, c.y, c.w, c.h, 3, '#d9d3c4', '#a49f90'); g.fillStyle = '#222'; g.fillRect(c.x + 4, c.y + 8, c.w - 8, 10);
			for (let i = 0; i < 6; i++) pinRect(g, c.x + c.w, 375.5 + i * 11 - 2, 8, 4);
			g.save(); g.translate(c.x + 22, cy); g.rotate(-Math.PI / 2); txt(g, 'DISPLAY', 0, 0, 9, 'rgba(10,20,30,0.7)'); g.restore();
		} else if (c.kind === 'header') {
			body(c.x, c.y, c.w, c.h, 2, '#101c24', '#070e14');
			for (let i = 0; i < 4; i++) { g.fillStyle = '#d7bf74'; g.fillRect(323.5 + i * 11 - 3, 650 - 3, 6, 6); }
			txt(g, 'UART', cx, c.y + c.h + 10, 8, SILK);
		} else if (c.kind === 'tp') {
			for (let i = 0; i < 6; i++) {
				g.fillStyle = '#d7bf74'; g.beginPath(); g.arc(461.5 + i * 11, 90, 4.4, 0, TAU); g.fill();
				g.fillStyle = '#05141c'; g.beginPath(); g.arc(461.5 + i * 11, 90, 1.5, 0, TAU); g.fill();
			}
			txt(g, 'TEST', cx, c.y - 8, 8, SILK);
		} else if (c.kind === 'xtal') {
			const gr = g.createLinearGradient(c.x, c.y, c.x, c.y + c.h); gr.addColorStop(0, '#dfe7e9'); gr.addColorStop(1, '#9aa9ae');
			shadow(() => { g.fillStyle = gr; rr(g, c.x, c.y, c.w, c.h, 6); g.fill(); });
			txt(g, '40.000', cx, cy, 9, 'rgba(8,24,34,0.75)');
			pinRect(g, 362, c.y + c.h, 6, 4); pinRect(g, 392, c.y + c.h, 6, 4);
		}
	}

	/* ---------------- canvas sizing + caches ---------------- */
	let W = 600, H = 480, dpr = 1, sc = 0.6, LSUB = null, LCOP = null, LPARTS = null;
	function layer(draw) { const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; draw(c.getContext('2d'), sc); return c; }
	function rebuild() {
		LSUB = layer(buildSubstrate); LCOP = layer(buildCopper);
		ITEMS.forEach((it) => {
			it.cv = document.createElement('canvas'); it.cv.width = Math.ceil(it.bw * sc); it.cv.height = Math.ceil(it.bh * sc);
			drawItem(it.cv.getContext('2d'), sc, it);
		});
		LPARTS = layer(() => {}); const g = LPARTS.getContext('2d');
		ITEMS.forEach((it) => g.drawImage(it.cv, Math.round(it.bx * sc), Math.round(it.by * sc)));
		redraw();
	}
	function resize() {
		const r = cv.getBoundingClientRect();
		W = Math.max(240, r.width); H = W * 0.8; dpr = Math.min(2, window.devicePixelRatio || 1);
		cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); sc = (W / LW) * dpr;
		rebuild();
	}

	/* ---------------- state ---------------- */
	let phase = 'type', pt = 0, buildT = 0, liveT0 = 0, evIdx = -1;
	let time = 0, running = false, last = 0, raf = 0, pending = false;
	let mx = 0, my = 0, mtx = 0, mty = 0, inside = false, px = 0, py = 0;
	let hov = null, sel = null; const ripples = [];
	const isLive = () => phase === 'live';

	function caption() {
		const o = hov || sel;
		if (!o) { nameEl.textContent = DEFAULT.name; lineEl.textContent = DEFAULT.line; }
		else if (o.type === 'c') { nameEl.textContent = o.ref.name; lineEl.textContent = `${CAPS[o.ref.cap][0]} · ${CAPS[o.ref.cap][1]}`; }
		else { nameEl.textContent = 'NET ' + o.ref.net; lineEl.textContent = o.ref.desc; }
	}
	const say = (n, l) => { nameEl.textContent = n; lineEl.textContent = l; };
	function offsets() { return { o0: [-mx * 3.5, -my * 2.8], o1: [mx * 8, my * 6.5] }; }

	function pick(lx, ly) {
		if (!isLive()) return null;
		const { o0, o1 } = offsets();
		for (let i = COMPS.length - 1; i >= 0; i--) {
			const c = COMPS[i], x = lx - o1[0], y = ly - o1[1];
			if (x >= c.x - 6 && x <= c.x + c.w + 6 && y >= c.y - 6 && y <= c.y + c.h + 6) return { type: 'c', ref: c };
		}
		let best = null, bd = 7;
		const x = lx - o0[0], y = ly - o0[1];
		for (const t of traces) for (let i = 1; i < t.pts.length; i++) {
			const [x1, y1] = t.pts[i - 1], [x2, y2] = t.pts[i], dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy || 1;
			const u = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / l2));
			const d = Math.hypot(x - (x1 + dx * u), y - (y1 + dy * u));
			if (d < bd) { bd = d; best = t; }
		}
		return best ? { type: 't', ref: best } : null;
	}

	/* =====================================================
	   INTRO: the IDE (typing, compiling, loading)
	   ===================================================== */
	const CODE = [
		'// launch.ts: Project ARACS',
		"import { Board, Part, Net } from '@aracs/core';",
		"import { deploy } from '@aracs/cloud';",
		'',
		"const board = new Board('ARACS', { layers: 4 });",
		'',
		"board.place(Part('U1', 'mcu'));",
		"board.place(Part('U2', 'wifi'));",
		"board.place(Part('U3', 'flash'));",
		"board.place(Part('J1', 'usb-c'));",
		'',
		"board.route(Net('SPI', 'U1', 'U3'));",
		"board.route(Net('SDIO', 'U1', 'U2'));",
		"board.route(Net('USB', 'U1', 'J1'));",
		'',
		'await board.build();',
		"await deploy(board, 'production');",
		"console.log('Project ARACS is live');"
	];
	const KW = new Set(['import', 'from', 'const', 'new', 'await', 'true', 'false']);
	const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	const span = (c, t) => (c ? `<span class="${c}">${esc(t)}</span>` : esc(t));
	function tokenize(line) {
		const re = /(\/\/.*$)|("[^"]*"|'[^']*')|(\b\d+\b)|(\b[A-Za-z_]\w*\b)/g;
		const out = []; let lastI = 0, m;
		while ((m = re.exec(line))) {
			if (m.index > lastI) out.push(['', line.slice(lastI, m.index)]);
			let c = '';
			if (m[1]) c = 'cm'; else if (m[2]) c = 'st'; else if (m[3]) c = 'nm';
			else if (KW.has(m[4])) c = 'kw'; else if (line[re.lastIndex] === '(') c = 'fn'; else if (/^[A-Z]/.test(m[4])) c = 'ty';
			out.push([c, m[0]]); lastI = re.lastIndex;
		}
		if (lastI < line.length) out.push(['', line.slice(lastI)]);
		return out;
	}
	const TOK = CODE.map(tokenize), LENS = CODE.map((l) => l.length);
	const HTML = TOK.map((tk) => tk.map(([c, t]) => span(c, t)).join(''));
	const TOTAL = LENS.reduce((a, b) => a + b + 1, 0) - 1;
	const CUM = []; { let acc = 0; CODE.forEach((l, i) => { for (let k = 0; k < l.length; k++) { acc += 1 / 165; CUM.push(acc); } acc += 1 / 165 + (l ? 0.09 : 0.03); CUM.push(acc); }); }
	const TYPE_TIME = CUM[CUM.length - 1] + 0.5;
	const pre = $('ide-pre'), gut = $('ide-gut'), box = $('ide-box'), posEl = $('ide-pos'), stEl = $('ide-state');
	const termEl = $('ide-term'), logEl = $('ide-log'), barEl = $('ide-bar'), pctEl = $('ide-pct');
	const loadEl = $('ide-load'), loadBar = $('ide-load-bar'), loadTxt = $('ide-load-txt');
	let typedN = 0;

	function renderIde(n) {
		let out = '', left = n, ln = 0, colN = 0;
		for (let i = 0; i < TOK.length; i++) {
			if (left >= LENS[i] + 1 && i < TOK.length - 1) { out += HTML[i] + '\n'; left -= LENS[i] + 1; ln = i + 1; colN = 0; continue; }
			let rem = Math.min(left, LENS[i]), s = '';
			for (const [c, t] of TOK[i]) { if (rem <= 0) break; const p = t.slice(0, rem); rem -= p.length; s += span(c, p); }
			out += s; ln = i; colN = Math.min(left, LENS[i]); break;
		}
		pre.innerHTML = out + '<span class="cur"></span>';
		gut.textContent = Array.from({ length: Math.max(ln + 1, 14) }, (_, i) => i + 1).join('\n');
		posEl.textContent = `Ln ${ln + 1}, Col ${colN + 1}`;
		box.scrollTop = box.scrollHeight;
	}
	const TLOG = [
		[0.0, '<b>$</b> aracs build --target production'], [0.5, '<span class="d">[1/4]</span> resolving dependencies <em>ok</em>'],
		[1.0, '<span class="d">[2/4]</span> compiling firmware <em>ok</em>'], [1.5, `<span class="d">[3/4]</span> routing ${TOTAL_TRACES} nets <em>ok</em>`],
		[2.0, '<span class="d">[4/4]</span> linking Project ARACS <em>ok</em>'], [2.5, '<em class="g">&#10003; built in 2.4s</em>']
	];
	const COMPILE_TIME = 3.0, LOAD_TIME = 1.5;
	const LOAD_STEPS = [[0, 'Loading board layout'], [0.5, 'Mounting components'], [1.0, 'Energizing power rails']];
	let logIdx = 0, loadIdx = -1;

	function resetIntro() {
		phase = 'type'; pt = 0; typedN = 0; logIdx = 0; loadIdx = -1; buildT = 0; evIdx = -1;
		ideEl.classList.remove('hide', 'out', 'glitch'); void ideEl.offsetWidth;
		termEl.classList.remove('open'); logEl.innerHTML = ''; barEl.style.width = '0'; pctEl.textContent = '0%';
		loadEl.classList.remove('on'); loadBar.style.width = '0'; stEl.textContent = 'editing';
		sel = hov = null; ripples.length = 0; COMPS.forEach((c) => { c.act = 0; });
		renderIde(0); say('Project ARACS', 'Writing launch.ts'); if (statEl) statEl.textContent = 'BOOT';
		skipBtn.textContent = 'Skip intro';
	}
	function goLive(instant) {
		phase = 'live'; buildT = buildEnd; liveT0 = instant ? time - 2 : time;
		ideEl.classList.add('hide'); caption(); if (statEl) statEl.textContent = STAT;
		skipBtn.textContent = '↻ Replay build';
	}

	function introUpdate(dt) {
		pt += dt;
		if (phase === 'type') {
			while (typedN < CUM.length && CUM[typedN] <= pt) typedN++;
			renderIde(Math.min(typedN, TOTAL));
			if (pt >= TYPE_TIME) { phase = 'compile'; pt = 0; termEl.classList.add('open'); stEl.textContent = 'building'; say('Compiling Project ARACS', 'aracs build --target production'); }
		} else if (phase === 'compile') {
			while (logIdx < TLOG.length && TLOG[logIdx][0] <= pt) { const d = document.createElement('div'); d.innerHTML = TLOG[logIdx][1]; logEl.appendChild(d); logIdx++; }
			const p = clamp(pt / 2.6, 0, 1); barEl.style.width = p * 100 + '%'; pctEl.textContent = Math.round(p * 100) + '%';
			if (pt >= COMPILE_TIME) { phase = 'load'; pt = 0; loadEl.classList.add('on'); stEl.textContent = 'launching'; say('Launching Project ARACS', 'Loading board layout'); }
		} else if (phase === 'load') {
			loadBar.style.width = clamp(pt / LOAD_TIME, 0, 1) * 100 + '%';
			for (let i = LOAD_STEPS.length - 1; i >= 0; i--) if (pt >= LOAD_STEPS[i][0]) { if (i !== loadIdx) { loadIdx = i; loadTxt.textContent = LOAD_STEPS[i][1]; lineEl.textContent = LOAD_STEPS[i][1]; } break; }
			if (pt >= LOAD_TIME) { phase = 'transform'; pt = 0; ideEl.classList.add('glitch'); say('Project ARACS', 'Transforming code into hardware'); }
		} else if (phase === 'transform') {
			if (pt >= 0.35 && !ideEl.classList.contains('out')) { ideEl.classList.add('out'); setTimeout(() => { if (phase === 'build' || phase === 'live') ideEl.classList.add('hide'); }, 800); }
			if (pt >= 0.45) { phase = 'build'; buildT = 0.45; evIdx = -1; }
		} else if (phase === 'build') {
			buildT += dt;
			let k = evIdx; while (k + 1 < EVENTS.length && EVENTS[k + 1].t <= buildT) k++;
			if (k !== evIdx) { evIdx = k; if (k >= 0) say(EVENTS[k].name, EVENTS[k].line); }
			let parts = 0, wires = 0; ITEMS.forEach((it) => { if (buildT >= it.t0) parts++; }); traces.forEach((t) => { if (buildT >= t.bt0 + t.bdur) wires++; });
			if (statEl) statEl.textContent = `${parts}/${ITEMS.length} parts · ${wires}/${TOTAL_TRACES} nets`;
			if (buildT >= buildEnd) { goLive(false); }
		}
	}

	/* ---------------- simulation ---------------- */
	function update(dt) {
		time += dt;
		mx += (mtx - mx) * Math.min(1, dt * 5); my += (mty - my) * Math.min(1, dt * 5);
		if (!inside || !isLive()) { mtx = Math.sin(time * 0.35) * 0.45; mty = Math.cos(time * 0.27) * 0.35; }
		if (!isLive()) return;
		for (const t of traces) {
			const k = time < t.boost ? 2.4 : 1;
			for (const p of t.pulses) {
				if (p.wait > 0) { p.wait -= dt; continue; }
				p.s += p.v * k * dt;
				if (p.v > 0 && p.s >= t.len) { C[t.b].act = 1; p.s = 0; p.wait = rnd() * 1.1; }
				else if (p.v < 0 && p.s <= 0) { C[t.a].act = 1; p.s = t.len; p.wait = rnd() * 1.1; }
			}
		}
		COMPS.forEach((c) => { c.act = Math.max(0, c.act - dt * 1.6); });
		for (let i = ripples.length - 1; i >= 0; i--) if (time - ripples[i].t0 > 1.3) ripples.splice(i, 1);
	}

	/* ---------------- drawing ---------------- */
	function draw() {
		const { o0, o1 } = offsets();
		ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
		if (!LSUB || phase === 'type' || phase === 'compile' || phase === 'load') return;
		const building = phase === 'build' || phase === 'transform';
		const bt = phase === 'transform' ? pt : buildT;
		const live = phase === 'live' ? clamp((time - liveT0) / 0.9, 0, 1) : 0;

		// substrate grows in
		const sa = building ? easeOut(clamp(bt / 0.8, 0, 1)) : 1;
		ctx.save(); ctx.globalAlpha = sa; ctx.translate(cv.width / 2, cv.height / 2); const z = 0.93 + 0.07 * sa; ctx.scale(z, z); ctx.translate(-cv.width / 2, -cv.height / 2);
		ctx.drawImage(LSUB, Math.round(o0[0] * sc), Math.round(o0[1] * sc)); ctx.restore();
		if (phase === 'transform') return;

		ctx.setTransform(sc, 0, 0, sc, 0, 0); ctx.lineCap = 'round'; ctx.lineJoin = 'round';

		// ---- copper ----
		if (building) {
			ctx.save(); ctx.translate(o0[0], o0[1]);
			const done = [];
			for (const t of traces) {
				const p = clamp((bt - t.bt0) / t.bdur, 0, 1);
				if (p <= 0) continue;
				const L = t.len * easeOut(p);
				ctx.lineWidth = t.w + 3.5; ctx.strokeStyle = 'rgba(0,0,0,0.38)'; strokeRange(t, 0, L);
				ctx.lineWidth = t.w; ctx.strokeStyle = copperStyle(t); strokeRange(t, 0, L);
				ctx.lineWidth = Math.max(0.8, t.w * 0.25); ctx.strokeStyle = 'rgba(255,255,255,0.2)'; strokeRange(t, 0, L);
				if (p >= 1) done.push(t);
				else {
					const h = pointAt(t, L), g = ctx.createRadialGradient(h[0], h[1], 0, h[0], h[1], 16);
					ctx.globalCompositeOperation = 'lighter';
					g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.35, 'rgba(0,230,200,0.5)'); g.addColorStop(1, 'rgba(0,230,200,0)');
					ctx.fillStyle = g; ctx.beginPath(); ctx.arc(h[0], h[1], 16, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
				}
			}
			drawPadsAndVias(ctx, done);
			ctx.restore();
		} else {
			ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(LCOP, Math.round(o0[0] * sc), Math.round(o0[1] * sc)); ctx.setTransform(sc, 0, 0, sc, 0, 0);
		}

		// ---- signals on the copper (live) ----
		if (live > 0) {
			ctx.save(); ctx.translate(o0[0], o0[1]); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = live;
			const hot = new Set();
			[hov, sel].forEach((o) => { if (o && o.type === 'c') (compTraces[o.ref.id] || []).forEach((t) => hot.add(t)); else if (o && o.type === 't') hot.add(o.ref); });
			hot.forEach((t) => { ctx.strokeStyle = 'rgba(210,255,248,0.75)'; ctx.lineWidth = t.w + 1.6; ctx.stroke(t.path); });
			for (const t of traces) {
				const rgb = t.power ? '255,226,160' : t.layer ? '160,215,255' : '170,255,246';
				for (const p of t.pulses) {
					if (p.wait > 0) continue;
					const d = p.v > 0 ? 1 : -1;
					ctx.lineWidth = t.w + 0.8;
					ctx.strokeStyle = `rgba(${rgb},0.16)`; strokeRange(t, d > 0 ? p.s - 40 : p.s, d > 0 ? p.s : p.s + 40);
					ctx.strokeStyle = `rgba(${rgb},0.42)`; strokeRange(t, d > 0 ? p.s - 24 : p.s, d > 0 ? p.s : p.s + 24);
					ctx.strokeStyle = `rgba(${rgb},0.95)`; strokeRange(t, d > 0 ? p.s - 11 : p.s, d > 0 ? p.s : p.s + 11);
					const h = pointAt(t, p.s); ctx.fillStyle = 'rgba(240,255,252,0.95)'; ctx.beginPath(); ctx.arc(h[0], h[1], t.w * 0.7 + 0.8, 0, TAU); ctx.fill();
				}
			}
			const bx = ((time * 0.16) % 1.25) * LW - 125;
			ctx.save(); ctx.beginPath(); ctx.rect(bx - 30, 0, 60, LH); ctx.clip();
			ctx.strokeStyle = 'rgba(190,255,248,0.55)';
			for (const t of traces) { ctx.lineWidth = t.w + 0.4; ctx.stroke(t.path); }
			ctx.restore();
			const bg = ctx.createLinearGradient(bx - 40, 0, bx + 4, 0); bg.addColorStop(0, 'rgba(0,194,168,0)'); bg.addColorStop(1, 'rgba(0,194,168,0.1)');
			ctx.fillStyle = bg; ctx.fillRect(bx - 40, 30, 44, 740);
			ctx.fillStyle = 'rgba(190,255,248,0.65)'; ctx.fillRect(bx + 3, 30, 1.5, 740);
			ctx.restore();
		}

		// ---- parts ----
		if (building) {
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			for (const it of ITEMS) {
				const p = clamp((bt - it.t0) / 0.5, 0, 1);
				if (p <= 0) continue;
				const s = 0.5 + 0.5 * easeBack(p), cx = (it.bx + it.bw / 2 + o1[0]) * sc, cy = (it.by + it.bh / 2 + o1[1] - (1 - p) * 18) * sc;
				ctx.save(); ctx.globalAlpha = clamp(p * 2.2, 0, 1); ctx.translate(cx, cy); ctx.scale(s, s);
				ctx.drawImage(it.cv, -it.cv.width / 2, -it.cv.height / 2); ctx.restore();
			}
			ctx.setTransform(sc, 0, 0, sc, 0, 0);
			ctx.save(); ctx.translate(o1[0], o1[1]); ctx.globalCompositeOperation = 'lighter';
			for (const it of ITEMS) {
				const p = (bt - it.t0) / 0.7;
				if (p <= 0 || p >= 1 || it.type === 'l') continue;
				const r = it.type === 'c' ? it.ref : { x: it.ref[0], y: it.ref[1], w: it.ref[2], h: it.ref[3] };
				ctx.strokeStyle = `rgba(190,255,248,${(1 - p) * 0.9})`; ctx.lineWidth = 2; rr(ctx, r.x - 6 - p * 8, r.y - 6 - p * 8, r.w + 12 + p * 16, r.h + 12 + p * 16, 6); ctx.stroke();
			}
			ctx.restore();
		} else {
			ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(LPARTS, Math.round(o1[0] * sc), Math.round(o1[1] * sc)); ctx.setTransform(sc, 0, 0, sc, 0, 0);
		}
		if (live <= 0) return;

		// ---- live overlays on the parts ----
		ctx.save(); ctx.translate(o1[0], o1[1]); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = live;
		{
			const c = C.U1, x0 = c.x + 42, y0 = c.y + 40;
			ctx.fillStyle = 'rgba(2,12,18,0.9)'; ctx.fillRect(x0 - 3, y0 - 3, 116, 106);
			for (let i = 0; i < 9; i++) for (let j = 0; j < 8; j++) {
				const v = 0.5 + 0.5 * Math.sin(i * 12.9 + j * 78.2 + time * (1.1 + ((i * 7 + j * 3) % 5) * 0.35));
				ctx.fillStyle = `rgba(0,${150 + ((v * 90) | 0)},${140 + ((v * 70) | 0)},${0.1 + v * 0.55 * (0.4 + C.U1.act * 0.6)})`;
				ctx.fillRect(x0 + i * 12.6, y0 + j * 12.6, 10, 10);
			}
			ctx.strokeStyle = `rgba(0,194,168,${0.35 + 0.35 * Math.sin(time * 3) ** 2})`; ctx.lineWidth = 1.4; ctx.strokeRect(x0 - 3, y0 - 3, 116, 106);
		}
		COMPS.forEach((c) => {
			if (c.act < 0.03 || c.kind === 'ant') return;
			ctx.strokeStyle = `rgba(0,230,200,${c.act * 0.85})`; ctx.lineWidth = 2; rr(ctx, c.x - 4, c.y - 4, c.w + 8, c.h + 8, 6); ctx.stroke();
			ctx.fillStyle = `rgba(0,230,200,${c.act * 0.08})`; ctx.fill();
		});
		LEDS.forEach((l) => {
			const a = 0.25 + 0.75 * C[l.src].act, g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, 26);
			g.addColorStop(0, `rgba(${l.c},${0.9 * a})`); g.addColorStop(1, `rgba(${l.c},0)`);
			ctx.fillStyle = g; ctx.beginPath(); ctx.arc(l.x, l.y, 26, 0, TAU); ctx.fill();
		});
		for (let i = 0; i < 3; i++) {
			const u = (time * 0.5 + i / 3) % 1;
			ctx.strokeStyle = `rgba(0,220,195,${(1 - u) * 0.4})`; ctx.lineWidth = 1.6;
			ctx.beginPath(); ctx.arc(880, 147, 14 + u * 70, -1.1, 1.1); ctx.stroke();
			ctx.beginPath(); ctx.arc(880, 147, 14 + u * 70, Math.PI - 1.1, Math.PI + 1.1); ctx.stroke();
		}
		[sel, hov].forEach((o) => {
			if (!o || o.type !== 'c') return;
			const c = o.ref, pulse = 0.65 + 0.35 * Math.sin(time * 6);
			ctx.strokeStyle = `rgba(255,255,255,${0.9 * (o === hov ? 1 : pulse)})`; ctx.lineWidth = 2;
			rr(ctx, c.x - 8, c.y - 8, c.w + 16, c.h + 16, 8); ctx.stroke();
			const k = 12; ctx.strokeStyle = 'rgba(0,230,200,1)'; ctx.lineWidth = 3;
			[[c.x - 8, c.y - 8, 1, 1], [c.x + c.w + 8, c.y - 8, -1, 1], [c.x - 8, c.y + c.h + 8, 1, -1], [c.x + c.w + 8, c.y + c.h + 8, -1, -1]].forEach(([x, y, sx, sy]) => { ctx.beginPath(); ctx.moveTo(x + sx * k, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy * k); ctx.stroke(); });
		});
		ripples.forEach((r) => { const u = (time - r.t0) / 1.3; ctx.strokeStyle = `rgba(0,230,200,${(1 - u) * 0.7})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(r.x, r.y, 10 + u * 150, 0, TAU); ctx.stroke(); });
		// power-on flash right after the build
		if (live < 1) { ctx.fillStyle = `rgba(190,255,248,${(1 - live) * 0.10})`; ctx.fillRect(30, 30, 940, 740); }
		ctx.restore();

		// ---- probe crosshair ----
		if (inside && !touch) {
			ctx.globalCompositeOperation = 'source-over';
			ctx.strokeStyle = 'rgba(190,255,248,0.16)'; ctx.lineWidth = 1; ctx.setLineDash([4, 5]);
			ctx.beginPath(); ctx.moveTo(px, 30); ctx.lineTo(px, 770); ctx.moveTo(30, py); ctx.lineTo(970, py); ctx.stroke(); ctx.setLineDash([]);
			ctx.strokeStyle = 'rgba(0,230,200,0.9)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(px, py, 7, 0, TAU); ctx.stroke();
			ctx.font = `500 12px ${FONT}`; ctx.textAlign = px > 800 ? 'right' : 'left'; ctx.textBaseline = 'bottom';
			const label = `X ${Math.round(px)}  Y ${Math.round(py)}`, tw = ctx.measureText(label).width, lx = px + (px > 800 ? -12 - tw : 12);
			ctx.fillStyle = 'rgba(4,18,28,0.82)'; rr(ctx, lx - 5, py - 28, tw + 10, 19, 4); ctx.fill();
			ctx.fillStyle = 'rgba(190,255,248,0.95)'; ctx.fillText(label, px + (px > 800 ? -12 : 12), py - 12);
		}
	}

	/* ---------------- loop ---------------- */
	function frame(now) {
		if (!running) return;
		raf = requestAnimationFrame(frame);
		const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
		if (!isLive()) introUpdate(dt);
		update(dt); draw();
	}
	function start() { if (running || reduceMotion) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
	function stop() { running = false; cancelAnimationFrame(raf); }
	function redraw() { if (running || pending) return; pending = true; requestAnimationFrame(() => { pending = false; if (!running) draw(); }); }

	/* ---------------- interaction ---------------- */
	const toLogical = (e) => { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * LW, ((e.clientY - r.top) / r.height) * LH]; };
	cv.addEventListener('pointermove', (e) => {
		if (!isLive()) return;
		[px, py] = toLogical(e); inside = true;
		mtx = (px / LW - 0.5) * 2; mty = (py / LH - 0.5) * 2;
		const h = pick(px, py);
		const same = (a, b) => (!a && !b) || (a && b && a.ref === b.ref);
		if (!same(h, hov)) { hov = h; cv.style.cursor = h ? 'pointer' : 'crosshair'; caption(); }
		redraw();
	});
	cv.addEventListener('pointerleave', () => { inside = false; if (!isLive()) return; hov = null; cv.style.cursor = 'crosshair'; caption(); redraw(); });
	cv.addEventListener('pointerdown', (e) => {
		if (!isLive()) return;
		const [x, y] = toLogical(e); [px, py] = [x, y];
		const h = pick(x, y);
		if (h && !(sel && sel.ref === h.ref)) {
			sel = h; ripples.push({ x: x - offsets().o1[0], y: y - offsets().o1[1], t0: time });
			const list = h.type === 'c' ? compTraces[h.ref.id] || [] : [h.ref];
			list.forEach((t) => { t.boost = time + 1.6; });
			if (h.type === 'c') h.ref.act = 1;
		} else sel = null;
		hov = touch ? h : hov; caption(); redraw();
	});
	skipBtn.addEventListener('click', () => {
		if (isLive()) { resetIntro(); start(); }
		else { goLive(true); redraw(); }
	});

	resize();
	if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(cv);
	if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);
	if (reduceMotion) { skipBtn.style.display = 'none'; ideEl.classList.add('hide'); time = 2; goLive(true); skipBtn.style.display = 'none'; draw(); }
	else { renderIde(0); say('Project ARACS', 'Writing launch.ts'); if (statEl) statEl.textContent = 'BOOT'; }
	if ('IntersectionObserver' in window) new IntersectionObserver((en) => { en[0].isIntersecting ? start() : stop(); }, { threshold: 0.05 }).observe(root);
	else start();
})();

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
		  a: ['Send us a short project inquiry with your full name, wilaya, email, phone, project type and a description of what you want to build. We reply in minutes. If you prefer to talk, WhatsApp works too.',
			'أرسل لنا استفسارًا قصيرًا يتضمن اسمك الكامل وولايتك وبريدك الإلكتروني ورقم هاتفك ونوع المشروع ووصفًا لما تريد بناءه، وسنرد خلال دقائق. وإن فضّلت الحديث مباشرة فواتساب متاح أيضًا.'],
		  act: ['form', 'wa'], f: ['inquiryinfo', 'reply', 'price'] },

		{ id: 'inquiryinfo', q: ['What do I put in the inquiry form?', 'ماذا أكتب في نموذج الاستفسار؟'],
		  k: ['inquiry form', 'form', 'fields', 'what do i send', 'what to include', 'what information', 'what do i need to provide'],
		  ka: ['نموذج الاستفسار', 'نموذج التواصل', 'ماذا اكتب', 'ماذا اضع', 'المعلومات المطلوبة', 'حقول'],
		  a: ['The form asks for your full name, wilaya, email, phone (and whether it has WhatsApp), a project type and a description of your project. You can also add a promo code, the name of the person who invited you, and how you heard about us. The more specific the description, the better our reply.',
			'يطلب النموذج اسمك الكامل وولايتك وبريدك الإلكتروني ورقم هاتفك (وهل عليه واتساب) ونوع المشروع ووصفًا له. ويمكنك أيضًا إضافة رمز ترويجي واسم الشخص الذي دعاك وكيف عرفت عنا. وكلما كان الوصف أدق كان ردنا أفضل.'],
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

/* =====================================================
   4. SCROLL ASSEMBLY
   Every element starts "exploded": scattered in 3D, far from its slot, with dashed alignment lines and a
   labelled outline marking where it will land (like an exploded-view assembly drawing). As you scroll, the
   parts fly together, rotate and scale into place, then snap with a spark burst. Fully scrubbed by scroll
   position, so scrolling back up pulls everything apart again. Skipped for reduced motion.
   ===================================================== */
(function () {
	if (reduceMotion) return;
	const doc = document.documentElement, body = document.body;
	const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
	const easeBack = (x) => { const c1 = 1.35, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
	const mk = (tag, parent) => { const e = document.createElement(tag); parent.appendChild(e); return e; };
	let seed = 17;
	const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
	const PERSP = 1100;

	const GROUPS = [
		['#services > div > div:first-child > *', 'header'], ['#stack .layer-head', 'layer'], ['#stack .cap2', 'card'],
		['#process > div > div:first-child', 'header'], ['#proc-scroll', 'timeline'], ['#proc > div:last-child', 'panel'],
		['#values h2', 'heading'], ['#values .val-card', 'value'],
		['#contact > div > div:first-child > *', 'pitch'], ['#contact > div > div:last-child', 'form'],
		['footer > div > div:first-child > *', 'column'], ['footer > div > div:last-child', 'bar']
	];

	// where each kind of part comes from, so the assembly feels varied and intentional
	function fly(name, i) {
		const side = i % 2 ? 1 : -1, r = rnd, r2 = rnd(), r3 = rnd();
		switch (name) {
			case 'card': case 'value':
				return { tx: side * (300 + r() * 260), ty: 50 + r2 * 80, tz: -(320 + r3 * 300), rx: 22 + r() * 24, ry: side * (36 + r() * 26), rz: side * (9 + r() * 12) };
			case 'layer':
				return { tx: -(440 + r() * 160), ty: 30 + r2 * 50, tz: -260, rx: 4, ry: -64, rz: -5 };
			case 'header': case 'pitch': case 'heading':
				return { tx: -(340 + r() * 200), ty: 50 + r2 * 60, tz: -240, rx: 8, ry: -50, rz: -4 };
			default:
				return { tx: (r() - 0.5) * 320, ty: 140 + r2 * 90, tz: -520, rx: 48, ry: (r3 - 0.5) * 50, rz: (r() - 0.5) * 12 };
		}
	}

	const items = [], seen = new Set();
	GROUPS.forEach(([sel, name]) => document.querySelectorAll(sel).forEach((el) => {
		if (seen.has(el)) return; seen.add(el);
		items.push(Object.assign({ el, name, i: items.length, state: '', lp: -1, docTop: 0, docLeft: 0, w: 0, h: 0, sticky: !!el.closest('[class*="lg:sticky"]') }, fly(name, items.length)));
	}));
	if (!items.length) return;

	const lastSection = document.querySelector('body > footer');
	if (lastSection) lastSection.style.overflow = 'clip'; // parts rising into the footer must not stretch the page
	doc.classList.add('bx-on');

	const fx = mk('canvas', body); fx.id = 'bx-fx'; fx.setAttribute('aria-hidden', 'true');
	const g = fx.getContext && fx.getContext('2d');
	const top = mk('div', body); top.id = 'bx-top';
	let vw = innerWidth, vh = innerHeight, dpr = 1;
	function sizeFx() { if (!g) return; dpr = Math.min(2, devicePixelRatio || 1); fx.width = Math.round(vw * dpr); fx.height = Math.round(vh * dpr); fx.style.width = vw + 'px'; fx.style.height = vh + 'px'; g.setTransform(dpr, 0, 0, dpr, 0, 0); }

	/* ---- natural (untransformed) positions, measured in one batch ---- */
	function measure() {
		const sy = scrollY, sx = scrollX, saved = items.map((it) => it.el.style.transform);
		items.forEach((it) => { it.el.style.transform = 'none'; });
		const rects = items.map((it) => it.el.getBoundingClientRect());
		items.forEach((it, i) => { it.docTop = rects[i].top + sy; it.docLeft = rects[i].left + sx; it.w = rects[i].width; it.h = rects[i].height; it.el.style.transform = saved[i]; });
	}
	function liveRect(it) { const t = it.el.style.transform; it.el.style.transform = 'none'; const r = it.el.getBoundingClientRect(); it.el.style.transform = t; return r; }

	const sparks = [];
	let queued = false, lastT = performance.now(), time = 0;
	const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };

	function update(now) {
		queued = false;
		const dt = Math.min(0.05, (now - lastT) / 1000 || 0.016); lastT = now; time += dt;
		vw = innerWidth; vh = innerHeight;
		const sy = scrollY, sx = scrollX, maxS = Math.max(1, doc.scrollHeight - vh);
		const t = clamp(1 - (maxS - sy) / (vh * 0.9), 0, 1);
		const A0 = (vw < 1024 ? 0.58 : 0.5) * vh, A = A0 + ((vh - 20) - A0) * t * t; // parts are fully assembled when their top reaches this line
		const S = vh + 40;                                                         // and they start moving as their top enters the screen
		const narrow = vw < 700 ? 0.5 : 1;
		top.style.width = (sy / maxS) * 100 + '%';

		const active = [];
		items.forEach((it) => {
			let tp, lf, w = it.w, h = it.h;
			if (it.sticky) { const r = liveRect(it); tp = r.top; lf = r.left; w = r.width; h = r.height; } else { tp = it.docTop - sy; lf = it.docLeft - sx; }
			if (h < 2 || w < 2) return;
			const p = clamp((S - tp) / (S - A), 0, 1);
			if (p >= 0.999) {
				if (it.state !== 'done') {
					const was = it.state === 'building';
					it.el.style.transform = ''; it.el.style.opacity = ''; it.el.style.willChange = ''; it.el.removeAttribute('data-bx'); it.state = 'done'; it.lp = -1;
					if (was) {
						it.el.classList.remove('bx-snap'); void it.el.offsetWidth; it.el.classList.add('bx-snap'); setTimeout(() => it.el.classList.remove('bx-snap'), 650);
						[[lf, tp], [lf + w, tp], [lf, tp + h], [lf + w, tp + h]].forEach(([x, y]) => { for (let n = 0; n < 4; n++) { const a = Math.random() * 6.283, v = 60 + Math.random() * 150; sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.5 + Math.random() * 0.3 }); } });
					}
				}
				return;
			}
			if (it.state !== 'building' && it.state !== 'hidden') { it.el.setAttribute('data-bx', '1'); it.el.style.willChange = 'transform, opacity'; }
			const e = p <= 0 ? 0 : p * p * (3 - 2 * p), k = 1 - e; // smoothstep: parts stay visibly scattered while on screen
			if (p <= 0) { if (it.state !== 'hidden') { it.state = 'hidden'; it.lp = -1; } }
			else it.state = 'building';
			if (Math.abs(p - it.lp) > 0.0015 || it.state === 'hidden') {
				const tx = it.tx * k * narrow, ty = it.ty * k * narrow, tz = it.tz * k;
				it.el.style.transform = `perspective(${PERSP}px) translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,${tz.toFixed(1)}px) rotateX(${(it.rx * k).toFixed(2)}deg) rotateY(${(it.ry * k).toFixed(2)}deg) rotateZ(${(it.rz * k).toFixed(2)}deg) scale(${(1 - 0.1 * k).toFixed(3)})`;
				it.el.style.opacity = p <= 0 ? '0' : String(clamp(p * 2.6, 0, 1));
				it.lp = p;
			}
			if (p > 0 && tp < vh + 300 && tp + h > -300) active.push({ it, k, p, lf, tp, w, h, narrow });
		});

		drawFx(active, dt);
		if (sparks.length || active.length) schedule();
	}

	/* ---- the engineering overlay: slots, alignment lines, labels, sparks ---- */
	function drawFx(active, dt) {
		if (!g) return;
		g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, vw, vh);
		g.lineCap = 'round';
		active.forEach(({ it, k, p, lf, tp, w, h, narrow }) => {
			const kk = clamp(k, 0, 1), al = Math.min(1, kk * 1.4);
			if (al < 0.02) return;
			const f = PERSP / (PERSP - it.tz * k), dx = it.tx * k * narrow * f, dy = it.ty * k * narrow * f;
			const cx = lf + w / 2, cy = tp + h / 2, mx = cx + dx, my = cy + dy;
			// the slot where the part will land
			g.setLineDash([6, 5]); g.lineWidth = 1.2; g.strokeStyle = `rgba(0,190,165,${0.8 * al})`; g.fillStyle = `rgba(0,190,165,${0.06 * al})`;
			g.beginPath(); g.roundRect ? g.roundRect(lf, tp, w, h, 10) : g.rect(lf, tp, w, h); g.fill(); g.stroke();
			// alignment lines: slot corners to the flying part's corners (exploded-view guides)
			g.lineDashOffset = -time * 26; g.strokeStyle = `rgba(0,190,165,${0.5 * al})`;
			g.beginPath();
			[[lf, tp], [lf + w, tp], [lf, tp + h], [lf + w, tp + h]].forEach(([x, y]) => { g.moveTo(x, y); g.lineTo(x + dx, y + dy); });
			g.stroke(); g.lineDashOffset = 0; g.setLineDash([]);
			// target crosshair
			g.strokeStyle = `rgba(0,190,165,${al})`; g.lineWidth = 1.4; g.beginPath(); g.moveTo(cx - 9, cy); g.lineTo(cx + 9, cy); g.moveTo(cx, cy - 9); g.lineTo(cx, cy + 9); g.stroke();
			g.beginPath(); g.arc(cx, cy, 5, 0, 6.283); g.stroke();
			// label riding on the part
			const lbl = `${it.name.toUpperCase()}-${String(it.i + 1).padStart(2, '0')}`;
			g.font = '600 10px "JetBrains Mono", ui-monospace, monospace'; const tw = g.measureText(lbl).width;
			const lx = mx - w / 2, ly = my - h / 2 - 6;
			g.fillStyle = `rgba(0,230,200,${al})`; g.beginPath(); g.rect(lx, ly - 15, tw + 14, 15); g.fill();
			g.fillStyle = `rgba(4,20,28,${al})`; g.textBaseline = 'middle'; g.fillText(lbl, lx + 7, ly - 7);
			// how far it still has to travel
			const dist = Math.round(Math.hypot(dx, dy)); if (dist > 20) { g.fillStyle = `rgba(0,150,135,${al})`; g.fillText(`${dist}px to dock`, lx, ly + h + 18); }
		});
		// snap sparks
		g.globalCompositeOperation = 'lighter';
		for (let i = sparks.length - 1; i >= 0; i--) {
			const s = sparks[i]; s.life -= dt; if (s.life <= 0) { sparks.splice(i, 1); continue; }
			s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= 0.92; s.vy *= 0.92;
			g.strokeStyle = `rgba(120,255,235,${clamp(s.life * 2, 0, 1)})`; g.lineWidth = 1.6; g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(s.x - s.vx * 0.04, s.y - s.vy * 0.04); g.stroke();
		}
		g.globalCompositeOperation = 'source-over';
	}

	addEventListener('scroll', schedule, { passive: true });
	addEventListener('resize', () => { sizeFx(); measure(); schedule(); });
	addEventListener('load', () => { measure(); schedule(); });
	if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); schedule(); });
	if (typeof ResizeObserver !== 'undefined') { let to = 0; new ResizeObserver(() => { clearTimeout(to); to = setTimeout(() => { measure(); schedule(); }, 120); }).observe(body); }
	sizeFx(); measure(); requestAnimationFrame(update);
})();
