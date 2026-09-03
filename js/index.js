// render guitar sections from data.js
var currentLang = 'en';
var guitarSections = [];
var applyOrientation = function() {};
var applyTypeFilter = function() {};

(function() {
    window.renderGuitars = function(guitarsToRender) {
        var section = document.getElementById('guitars-section');
        var dataToRender = guitarsToRender || window.guitarData;
        if (section && dataToRender && Array.isArray(dataToRender) && window.translations) {
            section.innerHTML = ''; // clear existing
            guitarSections = [];
            dataToRender.forEach(function(g) {
                var div = document.createElement('div');
                div.className = 'guitar-section relative inline-block m-[10px] overflow-hidden outline-none contain-layout ' +
  'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--color-outline)] focus-visible:outline-offset-2 ' +
  'h-[600px] w-[400px]'; // h-[533px] 
                div.tabIndex = 0;
                div.setAttribute('role','group');
                div.dataset.type = g.type;
                var trans = window.translations[currentLang].guitars[g.index];
                div.dataset.description = trans.description;
                div.setAttribute('aria-label', trans.description);

                var wrap = document.createElement('div');
                wrap.className = 'guitar-section__img-wrap overflow-hidden absolute inset-0 pointer-events-none'; //maybe without absolute inset-0 pointer-events-none

                wrap.dataset.description = trans.description;

                var img = document.createElement('img');
                img.src = g.img;
                img.alt = trans.alt;
                img.width = 400;
                img.height = 533;
                img.dataset.guitarIndex = g.index;
				img.className = 'block w-full h-full object-contain';

                wrap.appendChild(img);
                div.appendChild(wrap);

                section.appendChild(div);
                guitarSections.push(div);
            });
            // Trigger lazy loading observer
            if (window.observeImages) {
                window.observeImages();
            }
        }
    };
    window.renderGuitars();

    // Language switcher
    var langFilter = document.getElementById('language-filter');
    if (langFilter) {
        function updateLanguage() {
            currentLang = langFilter.value;
            // Update page title
            if (document.getElementById('page-title')) {
                document.getElementById('page-title').textContent = window.translations[currentLang].page_title;
            } else {
                document.title = window.translations[currentLang].page_title;
            }
            // Update header text
            var headerText = document.getElementById('page-header-text');
            if (headerText) {
                headerText.textContent = window.translations[currentLang].header_text;
            }
            // Update synopsis
            var synopsisEl = document.querySelector('.synopsis');
            if (synopsisEl) {
                synopsisEl.innerHTML = window.translations[currentLang].synopsis;
            }
            // Update labels
            var orientationLabel = document.querySelector('label[for="orientation-filter"]');
            if (orientationLabel) {
                orientationLabel.innerHTML = '<strong>' + window.translations[currentLang].orientation_label + '</strong>';
            }
            var typeLabel = document.querySelector('label[for="type-filter"]');
            if (typeLabel) {
                typeLabel.innerHTML = '<strong>' + window.translations[currentLang].type_label + '</strong>';
            }
            // Update options
            var orientationSelect = document.getElementById('orientation-filter');
            if (orientationSelect) {
                var opts = orientationSelect.options;
                for (var i = 0; i < opts.length; i++) {
                    var val = opts[i].value;
                    opts[i].textContent = window.translations[currentLang].orientation_options[val];
                }
            }
            var typeSelect = document.getElementById('type-filter');
            if (typeSelect) {
                var opts = typeSelect.options;
                for (var i = 0; i < opts.length; i++) {
                    var val = opts[i].value;
                    opts[i].textContent = window.translations[currentLang].type_options[val];
                }
            }
            // Update disclaimer
            var disclaimerEl = document.querySelector('.disclaimer');
            if (disclaimerEl) {
                disclaimerEl.innerHTML = '<strong><i>' + window.translations[currentLang].disclaimer + '</i></strong>';
            }
            // Update footer
            var footerEl = document.getElementById('footer-text');
            if (footerEl) {
                footerEl.innerHTML = window.translations[currentLang].footer_text;
            }
            // Update search placeholder
            var searchInput = document.getElementById('search-filter');
            if (searchInput) {
                searchInput.placeholder = window.translations[currentLang].search_placeholder;
            }
            // Update sort label
            var sortLabel = document.querySelector('label[for="sort-filter"]');
            if (sortLabel) {
                sortLabel.innerHTML = '<strong>' + window.translations[currentLang].sort_label + '</strong>';
            }
            // Update sort options
            var sortSelect = document.getElementById('sort-filter');
            if (sortSelect) {
                var opts = sortSelect.options;
                for (var i = 0; i < opts.length; i++) {
                    var val = opts[i].value;
                    opts[i].textContent = window.translations[currentLang].sort_options[val];
                }
            }
            // Update year and age
            updateYearAndAge();
            // Re-render guitars
            window.renderGuitars();
            // Re-apply filters
            applyOrientation();
            applyTypeFilter();
            // Save to localStorage
            try { localStorage.setItem('guitar-language', currentLang); } catch (e) {}
        }
        // Load from localStorage
        try {
            var savedLang = localStorage.getItem('guitar-language');
            if (savedLang && window.translations[savedLang]) {
                currentLang = savedLang;
                langFilter.value = savedLang;
            }
        } catch (e) {}
        updateLanguage();
        langFilter.addEventListener('change', updateLanguage);
    }
})();

var currentYear = new Date().getFullYear();

function getAge(birthDate) {
	var today = new Date();
	var birth = new Date(birthDate);
	var age = today.getFullYear() - birth.getFullYear();
	var monthDiff = today.getMonth() - birth.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
		age--;
	}
	return age;
}

function updateYearAndAge() {
	document.getElementById('year').textContent = currentYear;
	var ageEl = document.getElementById('age');
	if (ageEl) ageEl.textContent = getAge('1995-02-26');
}

/* Orientation: εφαρμογή + αποθήκευση στο localStorage */
(function () {
	var filter = document.getElementById('orientation-filter');
	var section = document.getElementById('guitars-section');
	if (!filter || !section) return;

	var STORAGE_KEY = 'guitars-orientation';
	var splideInstance = null;
	var originalHTML = null;

	function destroySplide() {
		if (splideInstance) {
			splideInstance.destroy();
			splideInstance = null;
		}
	}

	function initSplide() {
		destroySplide();
		section.classList.add('orientation-slideshow');
		
		// store original HTML if not already done
		if (!originalHTML) {
			originalHTML = section.innerHTML;
		}
		
		// clear and build Splide structure
		section.innerHTML = '';
		section.classList.add('splide');
		section.setAttribute('aria-label', 'Guitar Carousel');
		
		// create track
		var track = document.createElement('div');
		track.className = 'splide__track';
		
		// create list
		var list = document.createElement('ul');
		list.className = 'splide__list';
		
		// collect all visible guitar sections from original HTML
		var temp = document.createElement('div');
		temp.innerHTML = originalHTML;
		var items = temp.querySelectorAll('.guitar-section');
		var slideCount = 0;
		
		items.forEach(function (item) {
			if (!item.classList.contains('type-hidden')) {
				var li = document.createElement('li');
				li.className = 'splide__slide';
				
				// extract just the img-wrap for cleaner slides
				var imgWrap = item.querySelector('.guitar-section__img-wrap');
				if (imgWrap) {
					var wrap = imgWrap.cloneNode(true);
					wrap.style.position = 'relative';
					wrap.style.display = 'flex';
					wrap.style.alignItems = 'center';
					wrap.style.justifyContent = 'center';
					li.appendChild(wrap);
					list.appendChild(li);
					slideCount++;
				}
			}
		});
		
		track.appendChild(list);
		section.appendChild(track);
		
		// create pagination
		var pagination = document.createElement('ul');
		pagination.className = 'splide__pagination';
		section.appendChild(pagination);
		
		// create arrows
		var arrows = document.createElement('div');
		arrows.className = 'splide__arrows';
		var prevBtn = document.createElement('button');
		prevBtn.className = 'splide__arrow splide__arrow--prev';
		prevBtn.type = 'button';
		prevBtn.setAttribute('aria-label', 'Previous slide');
		prevBtn.textContent = '❮';
		var nextBtn = document.createElement('button');
		nextBtn.className = 'splide__arrow splide__arrow--next';
		nextBtn.type = 'button';
		nextBtn.setAttribute('aria-label', 'Next slide');
		nextBtn.textContent = '❯';
		arrows.appendChild(prevBtn);
		arrows.appendChild(nextBtn);
		section.appendChild(arrows);
		
		if (slideCount === 0) {
			console.warn('No visible guitar sections found for slideshow');
			return;
		}
		
		try {
			splideInstance = new Splide(section, {
				type: 'fade',
				perPage: 1,
				rewind: true,
				arrows: 'slider',
				pagination: 'slider'
			}).mount();
			console.log('Splide mounted with ' + slideCount + ' slides');
			
			// Update slide counter
			if (window.updateSlideCounter) {
				window.updateSlideCounter(0, slideCount);
				splideInstance.on('move', function(newIndex) {
					window.updateSlideCounter(newIndex, slideCount);
				});
			}
		} catch (e) {
			console.error('Splide initialization failed:', e);
		}
	}

	function restoreGrid() {
		destroySplide();
		if (originalHTML) {
			section.innerHTML = originalHTML;
			section.classList.remove('splide');
		}
	}

	applyOrientation = function() {
		var value = filter.value;
		var typeFilterControl = document.querySelector('.type-filter-control');
		
		if (value === 'slideshow') {
			initSplide();
			section.classList.remove('orientation-vertical', 'orientation-horizontal');
			section.classList.add('orientation-slideshow');
			// hide type filter in slideshow
			if (typeFilterControl) {
				typeFilterControl.style.display = 'none';
			}
		} else {
			if (section.classList.contains('orientation-slideshow')) {
				restoreGrid();
				// reapply type filter after restoring grid
				if (applyTypeFilter) {
					applyTypeFilter();
				}
			}
			section.classList.remove('orientation-slideshow');
			section.classList.remove('orientation-horizontal', 'orientation-vertical');
			section.classList.add('orientation-' + value);
			// show type filter in grid modes
			if (typeFilterControl) {
				typeFilterControl.style.display = '';
			}
		}
		try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
	};

	try {
		var saved = localStorage.getItem(STORAGE_KEY);
		if (saved === 'horizontal' || saved === 'vertical' || saved === 'slideshow') {
			filter.value = saved;
		}
	} catch (e) {}
	applyOrientation();
	filter.addEventListener('change', applyOrientation);
})();

/* Φίλτρο τύπου (electric / bass / acoustic) */
(function () {
	var filter = document.getElementById('type-filter');
	if (!filter) return;

	applyTypeFilter = function() {
		var value = filter.value;
		guitarSections.forEach(function (el) {
			var typeAttr = el.getAttribute('data-type') || '';
			var types = typeAttr.split(/\s+/).filter(Boolean);
			var match = value === 'all' || types.indexOf(value) !== -1;
			el.classList.toggle('type-hidden', !match);
		});
	};
	filter.addEventListener('change', applyTypeFilter);
	applyTypeFilter();
})();

/* Lightbox: κλικ σε εικόνα κιθάρας για μεγέθυνση */
(function () {
	var lightbox = document.getElementById('lightbox');
	var lightboxImg = lightbox && lightbox.querySelector('.lightbox__img');
	var lightboxCaption = lightbox && lightbox.querySelector('.lightbox__caption');
	var closeBtn = lightbox && lightbox.querySelector('.lightbox__close');
	if (!lightbox || !lightboxImg) return;

	var previousFocus = null;
	var focusableElements = [];
	function updateFocusableElements() {
		focusableElements = Array.prototype.slice.call(lightbox.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
			.filter(function (el) { return !el.disabled && el.offsetParent !== null; });
	}

	function trapFocus(event) {
		if (event.key !== 'Tab') return;
		updateFocusableElements();
		if (!focusableElements.length) return;
		var first = focusableElements[0];
		var last = focusableElements[focusableElements.length - 1];
		if (event.shiftKey) {
			if (document.activeElement === first || document.activeElement === lightbox) {
				event.preventDefault();
				last.focus();
			}
		} else {
			if (document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		}
	}

	function openLightbox(src, caption) {
		previousFocus = document.activeElement;
		lightboxImg.src = src;
		lightboxImg.alt = caption || '';
		lightboxCaption.textContent = caption || '';
		
		// rotate if the main gallery itself is in horizontal mode
		var gallery = document.getElementById('guitars-section');
		if (gallery && gallery.classList.contains('orientation-horizontal')) {
			lightbox.classList.add('orientation-horizontal');
		} else {
			lightbox.classList.remove('orientation-horizontal');
		}
		
		lightbox.hidden = false;
		updateFocusableElements();
		if (closeBtn) {
			closeBtn.focus();
		} else if (focusableElements.length) {
			focusableElements[0].focus();
		}
		document.addEventListener('keydown', trapFocus, true);
		document.body.style.overflow = 'hidden';
	}

	function closeLightbox() {
		lightbox.hidden = true;
		lightboxImg.removeAttribute('src');
		lightbox.classList.remove('orientation-horizontal');
		document.body.style.overflow = '';
		document.removeEventListener('keydown', trapFocus, true);
		if (previousFocus && previousFocus.focus) {
			previousFocus.focus();
		}
	}

	// Use event delegation
	var section = document.getElementById('guitars-section');
	if (section) {
		section.addEventListener('click', function (e) {
			var guitarSection = e.target.closest('.guitar-section');
			if (!guitarSection) return;
			e.preventDefault();
			var img = guitarSection.querySelector('img');
			if (!img) return;
			// toggle overlay on click
			guitarSection.classList.toggle('active');
			// remove active class from siblings
			document.querySelectorAll('.guitar-section.active').forEach(function (el) {
				if (el !== guitarSection) el.classList.remove('active');
			});
			openLightbox(img.src, guitarSection.getAttribute('data-description') || img.alt);
		});
	}
	
	// close overlay when clicking elsewhere
	document.addEventListener('click', function (e) {
		if (!e.target.closest('.guitar-section')) {
			document.querySelectorAll('.guitar-section.active').forEach(function (section) {
				section.classList.remove('active');
			});
		}
	});

	if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
	lightbox.addEventListener('click', function (e) {
		if (e.target === lightbox) closeLightbox();
	});
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
	});
})();