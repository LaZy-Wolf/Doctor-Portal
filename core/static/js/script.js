document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    const blogForm = document.getElementById('blog-form');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            console.log('Mobile menu toggled:', mobileMenu.classList.contains('active'));
        });

        document.addEventListener('click', (event) => {
            if (!mobileMenuButton.contains(event.target) && !mobileMenu.contains(event.target)) {
                mobileMenu.classList.remove('active');
                console.log('Mobile menu closed');
            }
        });
    }

    if (blogForm) {
        blogForm.addEventListener('submit', function(e) {
            if (!validateBlogForm()) {
                e.preventDefault();
                console.log('Blog form validation failed');
                return;
            }
            
            const submitBtn = this.querySelector('.btn-primary');
            const btnText = submitBtn.querySelector('.btn-text') || submitBtn;
            const spinner = submitBtn.querySelector('.spinner');
            
            btnText.textContent = 'Creating Post...';
            if (spinner) spinner.classList.remove('hidden');
            submitBtn.classList.add('loading');
        });

        function validateBlogForm() {
            let isValid = true;
            resetFormErrors();
            
            const requiredFields = ['title', 'category', 'summary', 'content'];
            
            requiredFields.forEach(field => {
                const input = document.getElementById(field);
                if (!input.value.trim()) {
                    showError(input, 'This field is required');
                    isValid = false;
                }
            });
            
            const imageInput = document.getElementById('image');
            if (imageInput.files && imageInput.files[0]) {
                if (imageInput.files[0].size > 2 * 1024 * 1024) {
                    showError(imageInput, 'Image file too large (max 2MB)');
                    isValid = false;
                } else if (!['image/jpeg', 'image/png', 'image/gif'].includes(imageInput.files[0].type)) {
                    showError(imageInput, 'Only JPG, PNG, or GIF files are allowed');
                    isValid = false;
                }
            }
            
            return isValid;
        }

        function showError(input, message) {
            input.classList.add('error');
            const errorElement = input.nextElementSibling;
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.textContent = message;
            }
        }

        function resetFormErrors() {
            const inputs = blogForm.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.classList.remove('error');
                const errorElement = input.nextElementSibling;
                if (errorElement && errorElement.classList.contains('error-message')) {
                    errorElement.textContent = '';
                }
            });
        }
    }
});