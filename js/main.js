jQuery(document).ready(function($) {
    'use strict';

    // ===========================
    // Hero Background Slideshow
    // ===========================
    var slideshowImages = document.querySelectorAll('.slideshow-image');
    var currentSlide = 0;
    var slideInterval = 3000; // 3 seconds - faster slideshow

    function showNextSlide() {
        // Hide current slide
        slideshowImages[currentSlide].style.opacity = '0';
        
        // Move to next slide
        currentSlide = (currentSlide + 1) % slideshowImages.length;
        
        // Show next slide
        slideshowImages[currentSlide].style.opacity = '1';
    }

    // Start automatic slideshow
    if (slideshowImages.length > 0) {
        setInterval(showNextSlide, slideInterval);
    }

    // ===========================
    // Mobile Menu Toggle (Enhanced 2025)
    // ===========================
    $('.menu-toggle, .mobile-toggle').on('click', function() {
        $('.main-navigation, .main-nav ul').toggleClass('active');
        $(this).toggleClass('active');
        
        // Toggle icon
        var $icon = $(this).find('i');
        if ($icon.hasClass('fa-bars')) {
            $icon.removeClass('fa-bars').addClass('fa-times');
        } else {
            $icon.removeClass('fa-times').addClass('fa-bars');
        }
    });

    // Close mobile menu when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.main-navigation, .main-nav, .menu-toggle, .mobile-toggle').length) {
            $('.main-navigation, .main-nav ul').removeClass('active');
            $('.menu-toggle, .mobile-toggle').removeClass('active');
            
            // Reset icon
            $('.menu-toggle i, .mobile-toggle i').removeClass('fa-times').addClass('fa-bars');
        }
    });
    
    // Close menu when clicking a link
    $('.main-nav a').on('click', function() {
        $('.main-nav ul').removeClass('active');
        $('.mobile-toggle').removeClass('active');
        $('.mobile-toggle i').removeClass('fa-times').addClass('fa-bars');
    });

    // ===========================
    // Sticky Header on Scroll
    // ===========================
    $(window).on('scroll', function() {
        if ($(window).scrollTop() > 100) {
            $('.site-header').addClass('scrolled');
        } else {
            $('.site-header').removeClass('scrolled');
        }
    });

    // ===========================
    // Scroll Animations
    // ===========================
    function isElementInViewport(el) {
        var rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
            rect.bottom >= 0
        );
    }

    function handleScrollAnimations() {
        $('.animate-on-scroll').each(function() {
            if (isElementInViewport(this) && !$(this).hasClass('animated')) {
                $(this).addClass('animated');
            }
        });
    }

    $(window).on('scroll', handleScrollAnimations);
    handleScrollAnimations(); // Run on page load

    // ===========================
    // Smooth Scroll for Anchor Links
    // ===========================
    $('a[href*="#"]:not([href="#"])').on('click', function(e) {
        if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && 
            location.hostname === this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            
            if (target.length) {
                e.preventDefault();
                $('html, body').animate({
                    scrollTop: target.offset().top - 80
                }, 800);
                
                // Close mobile menu if open
                $('.main-navigation').removeClass('active');
                $('.menu-toggle').removeClass('active');
            }
        }
    });

    // ===========================
    // Contact Form Submission
    // ===========================
    $('#contact-form').on('submit', function(e) {
        e.preventDefault();
        
        var $form = $(this);
        var $submitBtn = $form.find('.btn-submit');
        var $btnText = $submitBtn.find('.btn-text');
        var $btnLoading = $submitBtn.find('.btn-loading');
        var $message = $('#form-message');
        
        // Disable submit button
        $submitBtn.prop('disabled', true);
        $btnText.hide();
        $btnLoading.show();
        $message.hide().removeClass('success error');
        
        $.ajax({
            url: cmda_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'cmda_contact_form',
                nonce: cmda_ajax.nonce,
                name: $('#name').val(),
                email: $('#email').val(),
                subject: $('#subject').val(),
                message: $('#message').val()
            },
            success: function(response) {
                if (response.success) {
                    $message.addClass('success').text(response.data.message).show();
                    $form[0].reset();
                } else {
                    $message.addClass('error').text(response.data.message).show();
                }
            },
            error: function() {
                $message.addClass('error').text('Une erreur est survenue. Veuillez réessayer.').show();
            },
            complete: function() {
                $submitBtn.prop('disabled', false);
                $btnText.show();
                $btnLoading.hide();
            }
        });
    });

    // ===========================
    // Events Calendar
    // ===========================
    if ($('#calendar-grid').length) {
        var currentDate = new Date();
        var currentMonth = currentDate.getMonth();
        var currentYear = currentDate.getFullYear();
        var eventsData = window.eventsData || {};
        
        function renderCalendar(month, year) {
            var firstDay = new Date(year, month, 1);
            var lastDay = new Date(year, month + 1, 0);
            var daysInMonth = lastDay.getDate();
            var startingDayOfWeek = firstDay.getDay();
            
            // Update month/year display
            var monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
            $('#current-month-year').text(monthNames[month] + ' ' + year);
            
            // Clear calendar
            $('#calendar-grid').empty();
            
            // Add day headers
            var dayHeaders = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
            dayHeaders.forEach(function(day) {
                $('#calendar-grid').append('<div class="calendar-day-header">' + day + '</div>');
            });
            
            // Add blank days for alignment
            for (var i = 0; i < startingDayOfWeek; i++) {
                $('#calendar-grid').append('<div class="calendar-day-modern other-month"></div>');
            }
            
            // Add days of month
            for (var day = 1; day <= daysInMonth; day++) {
                var dateString = year + '-' + 
                    String(month + 1).padStart(2, '0') + '-' + 
                    String(day).padStart(2, '0');
                
                var dayElement = $('<div class="calendar-day-modern">' + day + '</div>');
                dayElement.attr('data-date', dateString);
                
                // Check if this day has events
                if (eventsData[dateString] && eventsData[dateString].length > 0) {
                    dayElement.addClass('has-event');
                    dayElement.attr('data-event-count', eventsData[dateString].length);
                    
                    // Make clickable
                    dayElement.css('cursor', 'pointer');
                    dayElement.on('click', function() {
                        var clickedDate = $(this).attr('data-date');
                        showEventsForDate(clickedDate);
                    });
                }
                
                // Highlight today
                if (day === currentDate.getDate() && 
                    month === currentDate.getMonth() && 
                    year === currentDate.getFullYear()) {
                    dayElement.addClass('today');
                }
                
                $('#calendar-grid').append(dayElement);
            }
        }
        
        function showEventsForDate(dateString) {
            var events = eventsData[dateString];
            if (!events || events.length === 0) return;
            
            var date = new Date(dateString);
            var dateFormatted = date.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            $('#selected-date').text(dateFormatted);
            $('#day-events-list').empty();
            
            events.forEach(function(event) {
                var eventCard = $('<div class="card-2025">');
                
                var eventTime = event.time ? '<p style="color: var(--secondary-color); font-weight: 600;"><i class="fas fa-clock"></i> ' + event.time + '</p>' : '';
                var eventLocation = event.location ? '<p style="color: var(--text-light);"><i class="fas fa-map-marker-alt"></i> ' + event.location + '</p>' : '';
                
                eventCard.html(
                    '<h3>' + event.title + '</h3>' +
                    eventTime +
                    eventLocation +
                    '<a href="' + event.permalink + '" class="btn-modern">Voir les détails</a>'
                );
                
                $('#day-events-list').append(eventCard);
            });
            
            $('#selected-day-events').fadeIn();
            
            // Scroll to events
            $('html, body').animate({
                scrollTop: $('#selected-day-events').offset().top - 100
            }, 500);
        }
        
        // Initial render
        renderCalendar(currentMonth, currentYear);
        
        // Navigation buttons
        $('#prev-month').on('click', function() {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar(currentMonth, currentYear);
        });
        
        $('#next-month').on('click', function() {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar(currentMonth, currentYear);
        });
    }

    // ===========================
    // Events View Toggle
    // ===========================
    $('.view-btn').on('click', function() {
        var view = $(this).data('view');
        
        $('.view-btn').removeClass('active');
        $(this).addClass('active');
        
        if (view === 'calendar') {
            $('#list-view').hide();
            $('#calendar-view').show();
        } else {
            $('#calendar-view').hide();
            $('#list-view').show();
        }
    });

    // ===========================
    // Resources Filter
    // ===========================
    $('#resource-type').on('change', function() {
        var selectedType = $(this).val();
        
        if (selectedType === '') {
            $('.resource-item').fadeIn(300);
        } else {
            $('.resource-item').each(function() {
                var itemType = $(this).data('type');
                if (itemType === selectedType) {
                    $(this).fadeIn(300);
                } else {
                    $(this).fadeOut(300);
                }
            });
        }
    });

    $('#resource-search').on('keyup', function() {
        var searchTerm = $(this).val().toLowerCase();
        
        $('.resource-item').each(function() {
            var itemText = $(this).text().toLowerCase();
            if (itemText.indexOf(searchTerm) > -1) {
                $(this).fadeIn(300);
            } else {
                $(this).fadeOut(300);
            }
        });
    });

    // ===========================
    // Logo Animation on Scroll
    // ===========================
    var $logo = $('.site-logo, .custom-logo');
    var lastScrollTop = 0;
    
    $(window).on('scroll', function() {
        var scrollTop = $(this).scrollTop();
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            $logo.css('transform', 'scale(0.8)');
        } else {
            // Scrolling up
            $logo.css('transform', 'scale(1)');
        }
        
        lastScrollTop = scrollTop;
    });

    // ===========================
    // Card Hover Effects
    // ===========================
    $('.card, .event-card, .resource-card').hover(
        function() {
            $(this).css('z-index', '10');
        },
        function() {
            $(this).css('z-index', '1');
        }
    );

    // ===========================
    // Parallax Effect for Hero Section
    // ===========================
    if ($('.hero-section').length) {
        $(window).on('scroll', function() {
            var scrolled = $(window).scrollTop();
            $('.hero-content').css('transform', 'translateY(' + (scrolled * 0.3) + 'px)');
        });
    }

    // ===========================
    // Back to Top Button
    // ===========================
    var $backToTop = $('<button class="back-to-top" aria-label="Retour en haut" title="Retour en haut" type="button"><i class="fas fa-arrow-up" aria-hidden="true"></i></button>');
    $('body').append($backToTop);

    function updateBackToTopVisibility(){
        // show when scrolled down, or when near bottom
        var st = $(window).scrollTop();
        var dh = $(document).height();
        var wh = $(window).height();
        if (st > 300 || (dh - (st + wh) < 200)) {
            $backToTop.addClass('visible');
        } else {
            $backToTop.removeClass('visible');
        }
        // hide on very short pages
        if (dh <= wh + 100) $backToTop.removeClass('visible');
    }

    $(window).on('scroll resize load', function() {
        updateBackToTopVisibility();
    });

    // Click or keyboard (enter/space) to go to top with respect for reduced motion
    function scrollToTop(){
        var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
            window.scrollTo(0,0);
        } else {
            $('html, body').animate({scrollTop: 0}, 600);
        }
    }

    $backToTop.on('click', function() { scrollToTop(); });
    $backToTop.on('keydown', function(e){ if(e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'){ e.preventDefault(); scrollToTop(); } });

    // ===========================
    // Lazy Load Images
    // ===========================
    if ('IntersectionObserver' in window) {
        var imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img.lazy').forEach(function(img) {
            imageObserver.observe(img);
        });
    }

    // ===========================
    // Add Current Menu Item Class
    // ===========================
    var currentUrl = window.location.pathname;
    $('.main-navigation a').each(function() {
        var linkUrl = $(this).attr('href');
        if (linkUrl && currentUrl.indexOf(linkUrl) !== -1 && linkUrl !== '/') {
            $(this).addClass('current');
        }
    });

    // ===========================
    // Counter Animation (if needed)
    // ===========================
    function animateCounter($element) {
        var target = parseInt($element.data('target'));
        var current = 0;
        var increment = target / 100;
        
        var timer = setInterval(function() {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            $element.text(Math.floor(current));
        }, 20);
    }

    $('.counter').each(function() {
        var $this = $(this);
        if (isElementInViewport(this)) {
            animateCounter($this);
        }
    });

    // ===========================
    // Form Validation Enhancement
    // ===========================
    $('input[required], textarea[required]').on('blur', function() {
        if (!$(this).val()) {
            $(this).addClass('error-field');
        } else {
            $(this).removeClass('error-field');
        }
    });

    // ===========================
    // Console Message
    // ===========================
    console.log('%cCMDA Theme by CMDA', 'color: #076b4e; font-size: 20px; font-weight: bold;');
    console.log('%cConseil Mondial de la Diaspora Algérienne', 'color: #dd3333; font-size: 14px;');
    
    // ===========================
    // Modern Carousel Functionality
    // ===========================
    $('.cmda-carousel').each(function() {
        var $carousel = $(this);
        var $container = $carousel.find('.carousel-container');
        var $slides = $carousel.find('.carousel-slide');
        var $controls = $carousel.find('.carousel-controls');
        var currentSlide = 0;
        var slideCount = $slides.length;
        var autoplayInterval;
        
        // Create dots
        for (var i = 0; i < slideCount; i++) {
            $controls.append('<div class="carousel-dot' + (i === 0 ? ' active' : '') + '" data-slide="' + i + '"></div>');
        }
        
        function goToSlide(index) {
            currentSlide = index;
            $container.css('transform', 'translateX(-' + (currentSlide * 100) + '%)');
            $controls.find('.carousel-dot').removeClass('active').eq(currentSlide).addClass('active');
        }
        
        function nextSlide() {
            currentSlide = (currentSlide + 1) % slideCount;
            goToSlide(currentSlide);
        }
        
        function prevSlide() {
            currentSlide = (currentSlide - 1 + slideCount) % slideCount;
            goToSlide(currentSlide);
        }
        
        // Controls
        $carousel.find('.carousel-arrow.next').on('click', nextSlide);
        $carousel.find('.carousel-arrow.prev').on('click', prevSlide);
        $controls.on('click', '.carousel-dot', function() {
            goToSlide($(this).data('slide'));
            resetAutoplay();
        });
        
        // Autoplay
        function startAutoplay() {
            autoplayInterval = setInterval(nextSlide, 5000);
        }
        
        function resetAutoplay() {
            clearInterval(autoplayInterval);
            startAutoplay();
        }
        
        startAutoplay();
        
        // Pause on hover
        $carousel.hover(
            function() { clearInterval(autoplayInterval); },
            function() { startAutoplay(); }
        );
    });
});

// ===========================
// Toggle Card Details (Global Function)
// ===========================
function toggleCardDetails(detailsId) {
    var panel = document.getElementById(detailsId);
    if (panel) {
        // Close other panels first
        var allPanels = document.querySelectorAll('.card-detail-panel');
        allPanels.forEach(function(p) {
            if (p.id !== detailsId && p.classList.contains('active')) {
                p.classList.remove('active');
                // Reset button icon
                var prevButton = p.previousElementSibling;
                if (prevButton && prevButton.tagName === 'BUTTON') {
                    var prevIcon = prevButton.querySelector('i');
                    if (prevIcon) {
                        prevIcon.className = 'fas fa-plus';
                    }
                }
            }
        });
        
        // Toggle current panel
        panel.classList.toggle('active');
        
        // Toggle button icon
        var button = panel.previousElementSibling;
        if (button && button.tagName === 'BUTTON') {
            var icon = button.querySelector('i');
            if (icon) {
                if (panel.classList.contains('active')) {
                    icon.className = 'fas fa-minus';
                    // Smooth scroll to panel
                    setTimeout(function() {
                        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 100);
                } else {
                    icon.className = 'fas fa-plus';
                }
            }
        }
    }
}

// ===========================
// Modern Flip Card Functionality
// ===========================
function flipCard(cardElement) {
    // Close any other flipped cards first
    var allFlippedCards = document.querySelectorAll('.flip-card-modern.flipped');
    allFlippedCards.forEach(function(flippedCard) {
        if (flippedCard !== cardElement) {
            flippedCard.classList.remove('flipped');
        }
    });

    // Toggle the clicked card
    cardElement.classList.toggle('flipped');
}

// Prevent card flip when clicking on social links
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to social links to prevent card flip
    var socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent the card flip when clicking social links
        });
    });
});
