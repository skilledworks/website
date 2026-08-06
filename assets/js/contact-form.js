/**
 * Skilled Works - Contact Form Handler
 * Form validation and submission
 */

(function() {
    'use strict';

    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const formMessage = document.getElementById('form-message');

    // Validation functions
    function showError(fieldId, message) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        const inputElement = document.getElementById(fieldId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        inputElement.classList.add('is-invalid');
    }

    function clearError(fieldId) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        const inputElement = document.getElementById(fieldId);
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        inputElement.classList.remove('is-invalid');
    }

    function clearAllErrors() {
        ['name', 'phone', 'email', 'message'].forEach(clearError);
    }

    function showFormMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = `form-message form-message-${type}`;
        formMessage.style.display = 'block';

        // Scroll to message
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideFormMessage() {
        formMessage.style.display = 'none';
        formMessage.className = 'form-message';
    }

    function validateForm() {
        clearAllErrors();
        hideFormMessage();
        let isValid = true;

        // Name validation
        const name = document.getElementById('name').value.trim();
        if (!name) {
            showError('name', 'Please enter your name');
            isValid = false;
        }

        // Phone validation
        const phone = document.getElementById('phone').value.trim();
        if (!phone) {
            showError('phone', 'Please enter your phone number');
            isValid = false;
        }

        // Email validation
        const email = document.getElementById('email').value.trim();
        if (!email) {
            showError('email', 'Please enter your email address');
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }

        // Message validation
        const message = document.getElementById('message').value.trim();
        if (!message) {
            showError('message', 'Please enter a message');
            isValid = false;
        }

        return isValid;
    }

    // Clear errors on input
    ['name', 'phone', 'email', 'message'].forEach(fieldId => {
        document.getElementById(fieldId).addEventListener('input', () => {
            clearError(fieldId);
            hideFormMessage();
        });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showFormMessage('Please fix the errors below', 'error');
            return;
        }

        const formData = new FormData(form);
        const originalText = submitBtn.textContent;

        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;
        hideFormMessage();

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                showFormMessage('Success! Your message has been sent. We\'ll get back to you soon.', 'success');
                form.reset();
            } else {
                showFormMessage('Error: ' + (data.message || 'Something went wrong'), 'error');
            }

        } catch (error) {
            showFormMessage('Something went wrong. Please try again or contact us directly.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
})();
