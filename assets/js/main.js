/**
 * Skilled Works - Main JavaScript
 * Gallery Strip Animation & Interaction
 *
 * Desktop: Click strip to expand, close button to return
 * Mobile: Tap or swipe left/right to change featured strip
 */

(function() {
  'use strict';

  // ==========================================================================
  // Animation Timing Constants
  // Keep in sync with CSS --transition-gallery (600ms) and --transition-base (300ms)
  // ==========================================================================
  var TIMING = {
    GALLERY_ANIMATION: 600,  // Matches --transition-gallery
    FADE_TRANSITION: 300,    // Matches --transition-base
    CLOSE_START_DELAY: 50,   // Brief delay before close animation starts
    NAVIGATE_FADE: 200       // Image crossfade during navigation
  };

  // ==========================================================================
  // Gallery Data
  // Paths are relative - baseurl is prepended at runtime from data attribute
  // ==========================================================================
  var galleryDataRaw = [
    {
      image: '/assets/images/homepage/photo05.jpg',
      strip: '/assets/images/homepage/strips/photo05.jpg',
      caption: 'White Temple Installation — MONA, Hobart'
    },
    {
      image: '/assets/images/homepage/photo03.jpg',
      strip: '/assets/images/homepage/strips/photo03.jpg',
      caption: 'White Temple Structure — MONA, Hobart'
    },
    {
      image: '/assets/images/homepage/photo08.jpg',
      strip: '/assets/images/homepage/strips/photo08.jpg',
      caption: 'Gallery Wall Arrangement — Residential collection'
    },
    {
      image: '/assets/images/homepage/photo15.jpg',
      strip: '/assets/images/homepage/strips/photo15.jpg',
      caption: 'Sidney Nolan Exhibition — Ned Kelly series'
    },
    {
      image: '/assets/images/homepage/photo01.jpg',
      strip: '/assets/images/homepage/strips/photo01.jpg',
      caption: 'Portrait Installation — Residential'
    },
    {
      image: '/assets/images/homepage/photo13.jpg',
      strip: '/assets/images/homepage/strips/photo13.jpg',
      caption: 'Geometric Tapestry — National Gallery of Australia'
    },
    {
      image: '/assets/images/homepage/photo16.jpg',
      strip: '/assets/images/homepage/strips/photo16.jpg',
      caption: 'Gallery Interior — Residential'
    },
    {
      image: '/assets/images/homepage/photo21.jpg',
      strip: '/assets/images/homepage/strips/photo21.jpg',
      caption: 'Lead Book Sculpture — National Gallery of Australia'
    },
    {
      image: '/assets/images/homepage/photo04.jpg',
      strip: '/assets/images/homepage/strips/photo04.jpg',
      caption: 'Green Screen Installation'
    }
  ];

  // Processed gallery data with baseurl prepended (set during init)
  var galleryData = [];

  // ==========================================================================
  // DOM Elements
  // ==========================================================================
  var galleryStrips;
  var strips;
  var galleryExpanded;
  var expandedImage;
  var galleryClose;
  var galleryCaption;
  var mobileCaption;

  // ==========================================================================
  // State
  // ==========================================================================
  var currentIndex = -1;
  var featuredIndex = 0;
  var isExpanded = false;
  var isAnimating = false;
  var isMobile = false;

  // Touch start coordinates for swipe detection
  var touchStartX = 0;
  var touchStartY = 0;

  // Animation timeout IDs for cancellation
  var animationTimeouts = [];

  // ==========================================================================
  // Constants
  // ==========================================================================
  var MOBILE_BREAKPOINT = 600;
  var SWIPE_THRESHOLD = 50; // Min horizontal px to count as a swipe

  // ==========================================================================
  // Utility Functions
  // ==========================================================================

  /**
   * Clear all pending animation timeouts
   * Prevents race conditions when rapidly opening/closing
   */
  function clearAnimationTimeouts() {
    animationTimeouts.forEach(function(id) {
      clearTimeout(id);
    });
    animationTimeouts = [];
  }

  /**
   * Schedule a timeout and track it for cancellation
   * @param {Function} fn - Function to execute
   * @param {number} delay - Delay in milliseconds
   * @returns {number} Timeout ID
   */
  function scheduleTimeout(fn, delay) {
    var id = setTimeout(function() {
      // Remove from tracking array when executed
      var index = animationTimeouts.indexOf(id);
      if (index > -1) {
        animationTimeouts.splice(index, 1);
      }
      fn();
    }, delay);
    animationTimeouts.push(id);
    return id;
  }

  /**
   * Debounce helper for resize events
   */
  function debounce(func, wait) {
    var timeout;
    return function() {
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(null, args);
      }, wait);
    };
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================

  /**
   * Initialize the gallery
   */
  function init() {
    galleryStrips = document.querySelector('.gallery-strips');
    strips = document.querySelectorAll('.strip');
    galleryExpanded = document.querySelector('.gallery-expanded');
    expandedImage = document.querySelector('.expanded-image');
    galleryClose = document.querySelector('.gallery-close');
    galleryCaption = document.querySelector('.gallery-caption');
    mobileCaption = document.querySelector('.mobile-caption');

    if (!galleryStrips || strips.length === 0) return;

    // Get baseurl from data attribute (set by Jekyll)
    var baseurl = galleryStrips.dataset.baseurl || '';

    // Build galleryData with baseurl prepended to paths
    galleryData = galleryDataRaw.map(function(item) {
      return {
        image: baseurl + item.image,
        strip: baseurl + item.strip,
        caption: item.caption
      };
    });

    checkViewport();
    window.addEventListener('resize', debounce(checkViewport, 150));

    strips.forEach(function(strip, index) {
      strip.addEventListener('click', function() {
        handleStripClick(index);
      });
    });

    if (galleryClose) {
      galleryClose.addEventListener('click', closeGallery);
    }

    // Passive listeners: swipe detection never calls preventDefault,
    // so vertical page scrolling stays smooth over the gallery
    galleryStrips.addEventListener('touchstart', handleTouchStart, { passive: true });
    galleryStrips.addEventListener('touchend', handleTouchEnd, { passive: true });

    document.addEventListener('keydown', handleKeydown);
  }

  // ==========================================================================
  // Viewport Handling
  // ==========================================================================

  /**
   * Check viewport and initialize appropriate mode
   */
  function checkViewport() {
    var wasMobile = isMobile;
    isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

    if (isMobile !== wasMobile) {
      if (isMobile) {
        initMobileMode();
      } else {
        initDesktopMode();
      }
    }
  }

  /**
   * Initialize mobile mode
   * Uses full images instead of strips for better display on small screens
   */
  function initMobileMode() {
    closeGallery();

    // Swap strip images for full images on mobile
    strips.forEach(function(strip, index) {
      var stripImage = strip.querySelector('.strip-image');
      var data = galleryData[index];
      if (stripImage && data) {
        stripImage.style.backgroundImage = 'url(' + data.image + ')';
      }
    });

    featuredIndex = Math.floor(Math.random() * galleryData.length);
    updateFeaturedStrip();
  }

  /**
   * Initialize desktop mode
   * Restores strip images for the strip effect
   */
  function initDesktopMode() {
    // Restore strip images from galleryData
    strips.forEach(function(strip, index) {
      strip.classList.remove('is-featured');
      var stripImage = strip.querySelector('.strip-image');
      var data = galleryData[index];
      if (stripImage && data) {
        stripImage.style.backgroundImage = 'url(' + data.strip + ')';
      }
    });

    if (mobileCaption) {
      mobileCaption.classList.remove('is-visible');
      mobileCaption.textContent = '';
    }
    featuredIndex = 0;
  }

  /**
   * Update featured strip (mobile)
   */
  function updateFeaturedStrip() {
    strips.forEach(function(strip, index) {
      strip.classList.toggle('is-featured', index === featuredIndex);
    });

    var data = galleryData[featuredIndex];
    if (mobileCaption && data) {
      mobileCaption.textContent = data.caption;
      mobileCaption.classList.add('is-visible');
    }
  }

  // ==========================================================================
  // Strip Interaction
  // ==========================================================================

  /**
   * Handle strip click
   */
  function handleStripClick(index) {
    if (isAnimating) return;

    if (isMobile) {
      if (index !== featuredIndex) {
        featuredIndex = index;
        updateFeaturedStrip();
      }
    } else {
      currentIndex = index;
      expandGallery(index);
    }
  }

  // ==========================================================================
  // Touch Swipe Navigation (mobile)
  // ==========================================================================

  /**
   * Record touch start position for swipe detection
   */
  function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }

  /**
   * Detect a horizontal swipe on touch end and advance one photo
   * Ignores mostly-vertical gestures so page scrolling isn't hijacked
   */
  function handleTouchEnd(e) {
    if (!isMobile) return;

    var deltaX = e.changedTouches[0].clientX - touchStartX;
    var deltaY = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
    if (Math.abs(deltaX) < Math.abs(deltaY)) return;

    // Swipe left = next photo, swipe right = previous, wrapping at the ends
    var direction = deltaX < 0 ? 1 : -1;
    featuredIndex = (featuredIndex + direction + galleryData.length) % galleryData.length;
    updateFeaturedStrip();
  }

  // ==========================================================================
  // Gallery Expand/Close Animations
  // ==========================================================================

  /**
   * Expand gallery to show full image (desktop)
   * Animation sequence:
   * 1. Immediately reveal full image behind strips
   * 2. Strip image fades out (CSS handles this via .is-active)
   * 3. Flex animation collapses other strips
   * 4. After animation, bring expanded view to front with controls
   */
  function expandGallery(index) {
    if (isAnimating || !galleryExpanded) return;

    // Cancel any pending animations
    clearAnimationTimeouts();

    isAnimating = true;
    isExpanded = true;
    currentIndex = index;

    var data = galleryData[index];
    if (!data) return;

    // Set the full image immediately
    expandedImage.style.backgroundImage = 'url(' + data.image + ')';
    galleryCaption.textContent = data.caption;

    // Reveal full image behind strips
    galleryExpanded.classList.add('is-revealed');

    // Start the strip animation - active strip's image fades out via CSS
    galleryStrips.classList.add('is-animating');
    strips[index].classList.add('is-active');

    // After flex animation completes, bring expanded view to front
    scheduleTimeout(function() {
      galleryExpanded.classList.remove('is-revealed');
      galleryExpanded.classList.add('is-visible');
      galleryExpanded.setAttribute('aria-hidden', 'false');
      isAnimating = false;
    }, TIMING.GALLERY_ANIMATION);
  }

  /**
   * Close gallery and return to strip view
   * Animation sequence:
   * 1. Move expanded image behind strips (stays static)
   * 2. Strips animate back over the full image (active strip stays transparent)
   * 3. After flex animation, strip image fades in
   * 4. After fade completes, hide expanded view
   */
  function closeGallery() {
    if (isAnimating || !isExpanded || !galleryExpanded) return;

    // Cancel any pending animations
    clearAnimationTimeouts();

    isAnimating = true;

    // Step 1: Move expanded behind strips (controls hide instantly)
    galleryExpanded.classList.remove('is-visible');
    galleryExpanded.classList.add('is-revealed');

    // Step 2: Start close animation after brief delay
    scheduleTimeout(function() {
      galleryStrips.classList.remove('is-animating');
      galleryStrips.classList.add('is-closing');
    }, TIMING.CLOSE_START_DELAY);

    // Step 3: After flex animation, start strip image fade-in
    var flexAnimationEnd = TIMING.CLOSE_START_DELAY + TIMING.GALLERY_ANIMATION;
    scheduleTimeout(function() {
      galleryStrips.classList.remove('is-closing');
      strips.forEach(function(strip) {
        strip.classList.remove('is-active');
      });

      // Step 4: After strip image has faded in, hide expanded view
      scheduleTimeout(function() {
        galleryExpanded.classList.remove('is-revealed');
        galleryExpanded.setAttribute('aria-hidden', 'true');

        isExpanded = false;
        currentIndex = -1;
        isAnimating = false;

        if (isMobile) {
          updateFeaturedStrip();
        }
      }, TIMING.FADE_TRANSITION);
    }, flexAnimationEnd);
  }

  // ==========================================================================
  // Keyboard Navigation
  // ==========================================================================

  /**
   * Handle keyboard navigation (desktop only)
   */
  function handleKeydown(e) {
    if (isMobile || !isExpanded) return;

    if (e.key === 'Escape') {
      closeGallery();
    } else if (e.key === 'ArrowLeft') {
      navigateDesktop(-1);
    } else if (e.key === 'ArrowRight') {
      navigateDesktop(1);
    }
  }

  /**
   * Navigate in desktop expanded view
   */
  function navigateDesktop(direction) {
    if (isAnimating || !isExpanded) return;

    var newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= galleryData.length) return;

    isAnimating = true;
    currentIndex = newIndex;

    strips.forEach(function(strip) {
      strip.classList.remove('is-active');
    });
    strips[currentIndex].classList.add('is-active');

    galleryCaption.style.opacity = '0';
    expandedImage.style.opacity = '0';

    scheduleTimeout(function() {
      var data = galleryData[currentIndex];
      if (data) {
        expandedImage.style.backgroundImage = 'url(' + data.image + ')';
        galleryCaption.textContent = data.caption;
      }
      expandedImage.style.opacity = '1';
      galleryCaption.style.opacity = '1';
      isAnimating = false;
    }, TIMING.NAVIGATE_FADE);
  }

  // ==========================================================================
  // Bootstrap
  // ==========================================================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
