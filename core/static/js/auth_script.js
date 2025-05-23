document.addEventListener('DOMContentLoaded', function() {
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
    const passwordConfirm = document.getElementById('password2');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    let currentUserType = signUpUserType ? signUpUserType.value : 'patient';
    const defaultProfilePic = profilePreviewImg ? profilePreviewImg.src : '';
    let isUsingDefault = true;

    function getCsrfToken() {
        const token = document.querySelector('[name=csrfmiddlewaretoken]');
        return token ? token.value : '';
    }

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
                window.location.href = data.userType === 'doctor' ? '/doctor/dashboard/' : '/patient/dashboard/';
            }
        })
        .catch(error => console.error('Error checking auth status:', error));
    };

    if (userSelectionPage || authPage) {
        checkLoginStatus();
    }

    userTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentUserType = this.getAttribute('data-type');
            console.log('User type clicked:', currentUserType);
            
            // Update title and icon immediately
            portalTitle.textContent = currentUserType === 'doctor' ? 'Doctor Portal' : 'Patient Portal';
            userIcon.className = 'fas ' + (currentUserType === 'doctor' ? 'fa-stethoscope' : 'fa-user');
            
            if (signInUserType) signInUserType.value = currentUserType;
            if (signUpUserType) signUpUserType.value = currentUserType;
            
            userSelectionPage.classList.add('hidden');
            authPage.classList.remove('hidden');

            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            document.querySelector('.tab[data-tab="signin"]').classList.add('active');
            document.getElementById('signin-content').classList.add('active');
            authDescription.textContent = 'Sign in to your account';
        });
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            console.log('Tab clicked:', this.getAttribute('data-tab'));
            const tabId = this.getAttribute('data-tab');
            
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabId}-content`).classList.add('active');
            
            authDescription.textContent = tabId === 'signin' ? 'Sign in to your account' : 'Create a new account';
        });
    });

    if (backToSelectionBtn) {
        backToSelectionBtn.addEventListener('click', function(e) {
            e.preventDefault();
            authPage.classList.add('hidden');
            userSelectionPage.classList.remove('hidden');
            
            signInForm.reset();
            signUpForm.reset();
            resetFormErrors();
            
            if (profilePreviewImg) {
                profilePreviewImg.src = defaultProfilePic;
                isUsingDefault = true;
                useDefaultPicInput.value = "true";
            }
            
            if (strengthBar && strengthText) {
                strengthBar.className = 'strength-bar';
                strengthText.textContent = '';
            }
            
            if (passwordConfirm) {
                passwordConfirm.classList.remove('error');
                document.querySelector('#password2 + .error-message').textContent = '';
            }
        });
    }

    if (profilePictureInput && profilePreviewImg) {
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

        useDefaultBtn.addEventListener('click', function() {
            profilePreviewImg.src = defaultProfilePic;
            profilePictureInput.value = '';
            isUsingDefault = true;
            useDefaultPicInput.value = "true";
        });
    }

    if (passwordInput && strengthBar && strengthText) {
        console.log('Password strength elements found:', { passwordInput, strengthBar, strengthText });
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            
            if (password.length >= 8) strength += 1;
            if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
            if (password.match(/\d/)) strength += 1;
            if (password.match(/[^a-zA-Z\d]/)) strength += 1;
            
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
            console.log('Password strength updated:', strengthText.textContent);
        });
    } else {
        console.warn('Password strength elements missing:', { passwordInput, strengthBar, strengthText });
    }

    if (passwordInput && passwordConfirm) {
        console.log('Password match elements found:', { passwordInput, passwordConfirm });
        passwordConfirm.addEventListener('input', function() {
            const errorElement = document.querySelector('#password2 + .error-message');
            if (passwordInput.value !== this.value) {
                this.classList.add('error');
                errorElement.textContent = 'Passwords do not match';
            } else {
                this.classList.remove('error');
                errorElement.textContent = '';
            }
            console.log('Password match checked:', errorElement.textContent);
        });
    } else {
        console.warn('Password match elements missing:', { passwordInput, passwordConfirm });
    }

    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const email = this.value;
            const errorElement = document.querySelector('#email + .error-message');
            if (email) {
                fetch('/api/check-email/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCsrfToken()
                    },
                    body: JSON.stringify({ email })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.exists) {
                        showError(this, 'This email is already registered');
                    } else {
                        errorElement.textContent = '';
                        this.classList.remove('error');
                    }
                })
                .catch(error => {
                    console.error('Error checking email:', error);
                    // Allow form submission even if email check fails
                    errorElement.textContent = '';
                    this.classList.remove('error');
                });
            } else {
                errorElement.textContent = '';
                this.classList.remove('error');
            }
        });
    }

    if (signUpForm) {
        signUpForm.addEventListener('submit', function(e) {
            if (!validateSignUpForm()) {
                e.preventDefault();
                return;
            }
            
            const submitBtn = this.querySelector('.submit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const spinner = submitBtn.querySelector('.spinner');
            
            btnText.textContent = 'Signing Up...';
            spinner.classList.remove('hidden');
            submitBtn.classList.add('loading');
        });

        function validateSignUpForm() {
            let isValid = true;
            resetFormErrors();
            
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
            
            const emailInput = document.getElementById('email');
            if (emailInput.value && !isValidEmail(emailInput.value)) {
                showError(emailInput, 'Please enter a valid email address');
                isValid = false;
            }
            
            if (passwordInput.value && passwordConfirm.value && passwordInput.value !== passwordConfirm.value) {
                showError(passwordConfirm, 'Passwords do not match');
                isValid = false;
            }
            
            return isValid;
        }
    }

    if (signInForm) {
        signInForm.addEventListener('submit', function(e) {
            if (!validateSignInForm()) {
                e.preventDefault();
                return;
            }
            
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
            
            const usernameInput = document.getElementById('signin-username');
            const passwordInput = document.getElementById('signin-password');
            
            if (!usernameInput.value.trim()) {
                showError(usernameInput, 'Username is required');
                isValid = false;
            }
            
            if (!passwordInput.value.trim()) {
                showError(passwordInput, 'Password is required');
                isValid = false;
            }
            
            return isValid;
        }
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
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.classList.remove('error');
            const errorElement = input.nextElementSibling;
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.textContent = '';
            }
        });
    }

    if (signUpForm) {
        const signupInputs = signUpForm.querySelectorAll('input');
        signupInputs.forEach(input => {
            input.addEventListener('input', function() {
                this.classList.remove('error');
                const errorElement = this.nextElementSibling;
                if (errorElement && errorElement.classList.contains('error-message')) {
                    errorElement.textContent = '';
                }
            });
        });
    }
});