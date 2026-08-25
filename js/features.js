// Enhanced features: search, sort, favorites, dark mode, keyboard navigation, swipe, lazy loading

// ===== DARK MODE =====
(function () {
	const darkModeToggle = document.getElementById('dark-mode-toggle');
	const darkModeKey = 'guitars-dark-mode';

	function setDarkMode(isDark) {
		document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
		if (darkModeToggle) {
			darkModeToggle.textContent = isDark ? '🌙' : '☀️';
			darkModeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
			darkModeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
		}
		try {
			localStorage.setItem(darkModeKey, isDark ? 'true' : 'false');
		} catch (e) {}
	}

	// Check saved preference or system preference
	let isDark = false;
	try {
		const saved = localStorage.getItem(darkModeKey);
		if (saved !== null) {
			isDark = saved === 'true';
		} else {
			isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		}
	} catch (e) {}

	setDarkMode(isDark);

	if (darkModeToggle) {
		darkModeToggle.addEventListener('click', function () {
			isDark = !isDark;
			setDarkMode(isDark);
		});
	}
})();

// ===== SEARCH & SORT =====
(function () {
	const searchInput = document.getElementById('search-filter');
	const sortSelect = document.getElementById('sort-filter');
	let guitarData = window.guitarData ? [...window.guitarData] : [];

	function applyFiltersAndSort() {
		const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
		const sortValue = sortSelect ? sortSelect.value : 'default';

		let filtered = window.guitarData.filter(function (g) {
			if (!searchTerm) return true;
			const desc = window.translations[window.currentLang].guitars[g.index].description.toLowerCase();
			return desc.includes(searchTerm);
		});

		// Sort
		if (sortValue === 'newest') {
			filtered.sort(function (a, b) { return b.index - a.index; });
		} else if (sortValue === 'type') {
			filtered.sort(function (a, b) { return a.type.localeCompare(b.type); });
		} else if (sortValue === 'name') {
			filtered.sort(function (a, b) {
				const aDesc = window.translations[window.currentLang].guitars[a.index].description;
				const bDesc = window.translations[window.currentLang].guitars[b.index].description;
				return aDesc.localeCompare(bDesc);
			});
		}

		// Re-render guitars
		if (window.renderGuitars) {
			window.renderGuitars(filtered);
		}

		// Hide non-matching type-filter items
		if (window.applyTypeFilter) {
			window.applyTypeFilter();
		}
	}

	if (searchInput) {
		searchInput.addEventListener('input', applyFiltersAndSort);
	}
	if (sortSelect) {
		sortSelect.addEventListener('change', applyFiltersAndSort);
	}
})();

// ===== FAVORITES SYSTEM =====
(function () {
	const favoritesKey = 'guitars-favorites';
	window.favorites = new Set();

	try {
		const saved = localStorage.getItem(favoritesKey);
		if (saved) {
			window.favorites = new Set(JSON.parse(saved));
		}
	} catch (e) {}

	window.toggleFavorite = function (index) {
		if (window.favorites.has(index)) {
			window.favorites.delete(index);
		} else {
			window.favorites.add(index);
		}
		try {
			localStorage.setItem(favoritesKey, JSON.stringify([...window.favorites]));
		} catch (e) {}
		updateFavoriteIcons();
	};

	window.isFavorite = function (index) {
		return window.favorites.has(index);
	};

	function updateFavoriteIcons() {
		document.querySelectorAll('.guitar-favorite-btn').forEach(function (btn) {
			const index = parseInt(btn.dataset.guitarIndex, 10);
			btn.classList.toggle('favorite-active', window.isFavorite(index));
			btn.textContent = window.isFavorite(index) ? '❤️' : '🤍';
		});
	}

	window.updateFavoriteIcons = updateFavoriteIcons;

	// Hook into renderGuitars to update favorite icons after rendering
	const originalRender = window.renderGuitars;
	window.renderGuitars = function(guitarsToRender) {
		originalRender(guitarsToRender);
		updateFavoriteIcons();
	};
})();

// ===== LAZY LOADING WITH INTERSECTION OBSERVER =====
(function () {
	const imageObserver = new IntersectionObserver(function (entries, observer) {
		entries.forEach(function (entry) {
			if (entry.isIntersecting) {
				const img = entry.target;
				if (img.dataset.src) {
					img.src = img.dataset.src;
					img.removeAttribute('data-src');
					observer.unobserve(img);
				}
			}
		});
	}, { rootMargin: '50px' });

	window.observeImages = function () {
		document.querySelectorAll('img[data-src]').forEach(function (img) {
			imageObserver.observe(img);
		});
	};
})();

// ===== SLIDESHOW COUNTER & SWIPE =====
(function () {
	let currentSlide = 0;
	let totalSlides = 0;

	window.updateSlideCounter = function (current, total) {
		currentSlide = current;
		totalSlides = total;
		const counter = document.getElementById('slideshow-counter');
		if (counter && total > 0) {
			counter.textContent = (current + 1) + ' / ' + total;
		}
	};

	// Swipe support for carousel
	let touchStartX = 0;
	let touchEndX = 0;

	document.addEventListener('touchstart', function (e) {
		touchStartX = e.changedTouches[0].screenX;
	}, false);

	document.addEventListener('touchend', function (e) {
		touchEndX = e.changedTouches[0].screenX;
		handleSwipe();
	}, false);

	function handleSwipe() {
		if (touchEndX < touchStartX - 50) {
			// Swipe left -> next slide
			const nextBtn = document.querySelector('.splide__arrow--next');
			if (nextBtn) nextBtn.click();
		}
		if (touchEndX > touchStartX + 50) {
			// Swipe right -> prev slide
			const prevBtn = document.querySelector('.splide__arrow--prev');
			if (prevBtn) prevBtn.click();
		}
	}
})();

// ===== KEYBOARD NAVIGATION =====
(function () {
	document.addEventListener('keydown', function (e) {
		const lightbox = document.getElementById('lightbox');
		const isLightboxOpen = lightbox && !lightbox.hidden;

		if (e.key === 'Escape' && isLightboxOpen) {
			// Close lightbox
			lightbox.hidden = true;
			document.body.style.overflow = '';
		} else if (e.key === 'ArrowLeft') {
			const gallery = document.getElementById('guitars-section');
			if (gallery && gallery.classList.contains('orientation-slideshow')) {
				const prevBtn = document.querySelector('.splide__arrow--prev');
				if (prevBtn) prevBtn.click();
				e.preventDefault();
			}
		} else if (e.key === 'ArrowRight') {
			const gallery = document.getElementById('guitars-section');
			if (gallery && gallery.classList.contains('orientation-slideshow')) {
				const nextBtn = document.querySelector('.splide__arrow--next');
				if (nextBtn) nextBtn.click();
				e.preventDefault();
			}
		} else if (e.key === '/') {
			const searchInput = document.getElementById('search-filter');
			if (searchInput && e.target !== searchInput) {
				searchInput.focus();
				e.preventDefault();
			}
		}
	});
})();

// ===== FOCUS MANAGEMENT & VISIBILITY =====
(function () {
	document.querySelectorAll('.guitar-section').forEach(function (section) {
		section.addEventListener('focus', function () {
			section.style.outline = '2px solid #1a1a1a';
			section.style.outlineOffset = '2px';
		}, true);

		section.addEventListener('blur', function () {
			section.style.outline = '';
		}, true);
	});
})();
