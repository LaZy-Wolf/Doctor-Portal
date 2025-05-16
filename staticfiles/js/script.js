document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const userSelectionPage = document.getElementById('user-selection-page');
    const authPage = document.getElementById('auth-page');
    const userTypeButtons = document.querySelectorAll('.user-type-btn');
    const portalTitle = document.getElementById('portal-title');
    const userIcon = document.getElementById('user-icon');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const authDescription = document.getElementById('auth-description');
    const backToSelectionBtn = document.getElementById('back-to-selection');
    const signInForm = document.getElementById('signin-form');
    const signUpForm = document.getElementById('signup-form');
    const profilePictureInput = document.getElementById('profilePicture');
    const profilePreviewImg = document.getElementById('profile-preview-img');
    const useDefaultBtn = document.getElementById('use-default');
    const useDefaultPicInput = document.getElementById('use-default-pic-input');
    const signInUserType = document.getElementById('signin-user-type');
    const signUpUserType = document.getElementById('signup-user-type');
    const passwordInput = document.getElementById('password1');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    // Current user type
    let currentUserType = 'patient';

    // Default profile picture
    const defaultProfilePic = profilePreviewImg.src; // Use the src from Django static
    let isUsingDefault = true;

    // Check if user is already logged in (from Django session)
    const checkLoginStatus = () => {
        fetch('/api/check-auth/', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': getCsrfToken()
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.isAuthenticated) {
                // Redirect to dashboard
                window.location.href = data.userType === 'doctor' ? '/doctor/dashboard/' : '/patient/dashboard/';
            }
        })
        .catch(error => console.error('Error checking auth status:', error));
    };

    // Check login status on page load
    checkLoginStatus();

    // Get CSRF token
    function getCsrfToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]').value;
    }

    // User type selection
    userTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentUserType = this.getAttribute('data-type');
            
            // Update UI based on user type
            if (currentUserType === 'doctor') {
                portalTitle.textContent = 'Doctor Portal';
                userIcon.className = 'fas fa-stethoscope';
            } else {
                portalTitle.textContent = 'Patient Portal';
                userIcon.className = 'fas fa-user';
            }
            
            // Update hidden form fields
            signInUserType.value = currentUserType;
            signUpUserType.value = currentUserType;
            
            // Show auth page
            userSelectionPage.classList.add('hidden');
            authPage.classList.remove('hidden');
        });
    });

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabId}-content`).classList.add('active');
            
            // Update description
            if (tabId === 'signin') {
                authDescription.textContent = 'Sign in to your account';
            } else {
                authDescription.textContent = 'Create a new account';
            }
        });
    });

    // Back to selection
    backToSelectionBtn.addEventListener('click', function(e) {
        e.preventDefault();
        authPage.classList.add('hidden');
        userSelectionPage.classList.remove('hidden');
        
        // Reset forms
        signInForm.reset();
        signUpForm.reset();
        resetFormErrors();
        
        // Reset profile picture
        profilePreviewImg.src = defaultProfilePic;
        isUsingDefault = true;
        useDefaultPicInput.value = "true";
        
        // Reset password strength
        strengthBar.className = 'strength-bar';
        strengthText.textContent = '';
    });

    // Profile picture handling
    profilePictureInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                profilePreviewImg.src = e.target.result;
                isUsingDefault = false;
                useDefaultPicInput.value = "false";
            };
            
            reader.readAsDataURL(this.files[0]);
        }
    });

    // Use default profile picture
    useDefaultBtn.addEventListener('click', function() {
        profilePreviewImg.src = defaultProfilePic;
        profilePictureInput.value = '';
        isUsingDefault = true;
        useDefaultPicInput.value = "true";
    });

    // Password strength meter
    document.getElementById('password1').addEventListener('input', function() {
        const password = this.value;
        let strength = 0;
        
        // Check password length
        if (password.length >= 8) {
            strength += 1;
        }
        
        // Check for mixed case
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) {
            strength += 1;
        }
        
        // Check for numbers
        if (password.match(/\d/)) {
            strength += 1;
        }
        
        // Check for special characters
        if (password.match(/[^a-zA-Z\d]/)) {
            strength += 1;
        }
        
        // Update strength meter
        strengthBar.className = 'strength-bar';
        if (password.length === 0) {
            strengthText.textContent = '';
        } else if (strength < 2) {
            strengthBar.classList.add('weak');
            strengthText.textContent = 'Weak password';
            strengthText.style.color = '#ef4444';
        } else if (strength < 4) {
            strengthBar.classList.add('medium');
            strengthText.textContent = 'Medium password';
            strengthText.style.color = '#f59e0b';
        } else {
            strengthBar.classList.add('strong');
            strengthText.textContent = 'Strong password';
            strengthText.style.color = '#10b981';
        }
    });

    // Form validation
    function validateSignUpForm() {
        let isValid = true;
        resetFormErrors();
        
        // Required fields
        const requiredFields = [
            'firstName', 'lastName', 'username', 'email', 
            'password1', 'password2', 'addressLine1', 
            'city', 'state', 'pincode'
        ];
        
        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            if (!input.value.trim()) {
                showError(input, 'This field is required');
                isValid = false;
            }
        });
        
        // Email validation
        const emailInput = document.getElementById('email');
        if (emailInput.value && !isValidEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }
        
        // Password match validation
        const passwordInput = document.getElementById('password1');
        const confirmPasswordInput = document.getElementById('password2');
        
        if (passwordInput.value && confirmPasswordInput.value && 
            passwordInput.value !== confirmPasswordInput.value) {
            showError(confirmPasswordInput, 'Passwords do not match');
            isValid = false;
        }
        
        return isValid;
    }

    function isValidEmail(email) {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    function showError(input, message) {
        input.classList.add('error');
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = message;
        }
    }

    function resetFormErrors() {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.classList.remove('error');
            const errorElement = input.nextElementSibling;
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.textContent = '';
            }
        });
    }

    // Form submission with loading state
    signInForm.addEventListener('submit', function(e) {
        if (!validateSignInForm()) {
            e.preventDefault();
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.spinner');
        
        btnText.textContent = 'Signing In...';
        spinner.classList.remove('hidden');
        submitBtn.classList.add('loading');
    });

    function validateSignInForm() {
        let isValid = true;
        resetFormErrors();
        
        const emailInput = document.getElementById('signin-email');
        const passwordInput = document.getElementById('signin-password');
        
        if (!emailInput.value.trim()) {
            showError(emailInput, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!passwordInput.value.trim()) {
            showError(passwordInput, 'Password is required');
            isValid = false;
        }
        
        return isValid;
    }

    signUpForm.addEventListener('submit', function(e) {
        if (!validateSignUpForm()) {
            e.preventDefault();
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.spinner');
        
        btnText.textContent = 'Signing Up...';
        spinner.classList.remove('hidden');
        submitBtn.classList.add('loading');
    });

    // Input validation on change
    const signupInputs = signUpForm.querySelectorAll('input');
    signupInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Clear error when user types
            this.classList.remove('error');
            const errorElement = this.nextElementSibling;
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.textContent = '';
            }
            
            // Check password match
            if (this.id === 'password1' || this.id === 'password2') {
                const passwordInput = document.getElementById('password1');
                const confirmPasswordInput = document.getElementById('password2');
                
                if (passwordInput.value && confirmPasswordInput.value) {
                    if (passwordInput.value !== confirmPasswordInput.value) {
                        showError(confirmPasswordInput, 'Passwords do not match');
                    }
                }
            }
        });
    });
});