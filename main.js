
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
	const SUPABASE_URL = "https://iucwldheyynpfpmiigrc.supabase.co/functions/v1/super-worker";
	const SUPABASE_ANON_KEY = "sb_publishable_3Vd9pA5uzFpVYSjscuSiPg_e8alhTSG";

	const contactForm = document.getElementById('contact-form');
	const formSuccessMessage = document.getElementById('form-success-message');

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
				project_description: formData.get('project_description')
			};

			try {
				if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
					throw new Error("Supabase URL and Anon Key must be configured in the script.");
				}

				const response = await fetch(`${SUPABASE_URL}/functions/v1/contact`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"apikey": SUPABASE_ANON_KEY
					},
					body: JSON.stringify(payload)
				});

				if (!response.ok) {
					throw new Error(`Server returned status: ${response.status}`);
				}

				// Hide form, show success message
				contactForm.classList.add('hidden');
				formSuccessMessage.classList.remove('hidden');
				formSuccessMessage.classList.add('flex');
				
				// Scroll to the card header
				formSuccessMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			} catch (error) {
				console.error('Error submitting form:', error);
				alert(`Failed to submit inquiry: ${error.message}`);
				
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
