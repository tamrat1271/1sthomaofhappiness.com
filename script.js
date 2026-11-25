
document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 1. MOBILE HAMBURGER NAVIGATION
    // =========================================================

    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');

    function closeMenu() {
        if (!navLinks || !hamburgerBtn) return;

        navLinks.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
    }

    if (hamburgerBtn && navLinks) {

        hamburgerBtn.addEventListener('click', () => {
            const isExpanded = navLinks.classList.toggle('active');

            hamburgerBtn.setAttribute(
                'aria-expanded',
                String(isExpanded)
            );
        });

        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', (event) => {
            if (
                event.key === 'Escape' &&
                navLinks.classList.contains('active')
            ) {
                closeMenu();
                hamburgerBtn.focus();
            }
        });

        document.addEventListener('click', (event) => {
            if (
                navLinks.classList.contains('active') &&
                !navLinks.contains(event.target) &&
                !hamburgerBtn.contains(event.target)
            ) {
                closeMenu();
            }
        });
    }


    // =========================================================
    // 2. GOOGLE SHEETS + WEB3FORMS CONFIGURATION
    // =========================================================

    const googleScriptURL =
        'https://script.google.com/macros/s/AKfycbwIKsfBlNZ1GxigWRMq4h7Oiey907RzwLTbLhW2eeIvZLzzgkAKMryPoDmTI7lwz7Cn/exec';

    const WEB3FORMS_ACCESS_KEY =
        'e2efd23c-cab9-410e-9ca1-e3d9d7d8552d';

    const tourForm = document.getElementById('tourForm');
    const submitBtn = document.getElementById('submitBtn');
    const formStatus = document.getElementById('formStatus');


    // =========================================================
    // 3. FORM STATUS
    // =========================================================

    function setFormStatus(message, type) {

        if (!formStatus) return;

        formStatus.textContent = message;
        formStatus.className = `form-status form-status--${type}`;
    }


    // =========================================================
    // 4. FORM VALIDATION
    // =========================================================

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {

        const digits = phone.replace(/\D/g, '');

        return digits.length >= 7;
    }


    // =========================================================
    // 5. FORM SUBMISSION
    // =========================================================

    if (tourForm) {

        tourForm.addEventListener('submit', async (event) => {

            event.preventDefault();

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone');
            const messageInput = document.getElementById('message');
            const fileInput = document.getElementById('fileInput');

            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const phone = phoneInput ? phoneInput.value.trim() : '';
            const message = messageInput ? messageInput.value.trim() : '';
            const attachment = fileInput && fileInput.files ? fileInput.files[0] : null;


            // Required field validation

            if (!name || !email || !phone) {

                setFormStatus(
                    'Please fill in all required fields (Name, Email, and Phone Number).',
                    'error'
                );

                if (!name && nameInput) nameInput.focus();
                else if (!email && emailInput) emailInput.focus();
                else if (!phone && phoneInput) phoneInput.focus();

                return;
            }


            // Email validation

            if (!isValidEmail(email)) {

                setFormStatus(
                    'Please enter a valid email address.',
                    'error'
                );

                if (emailInput) emailInput.focus();

                return;
            }


            // Phone validation

            if (!isValidPhone(phone)) {

                setFormStatus(
                    'Please enter a valid phone number.',
                    'error'
                );

                if (phoneInput) phoneInput.focus();

                return;
            }


            // Optional attachment validation (single file, maximum 5 MB).

            if (attachment) {
                const allowedTypes = [
                    'application/pdf',
                    'image/jpeg',
                    'image/png',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ];
                const maxFileSize = 5 * 1024 * 1024;

                if (!allowedTypes.includes(attachment.type)) {
                    setFormStatus(
                        'Please attach a PDF, JPG, PNG, DOC, or DOCX file.',
                        'error'
                    );
                    if (fileInput) fileInput.focus();
                    return;
                }

                if (attachment.size > maxFileSize) {
                    setFormStatus(
                        'The attachment must be 5 MB or smaller.',
                        'error'
                    );
                    if (fileInput) fileInput.focus();
                    return;
                }
            }


            // Check Web3Forms key

            if (!WEB3FORMS_ACCESS_KEY) {

                setFormStatus(
                    'Web3Forms Access Key is missing.',
                    'error'
                );

                return;
            }


            // Disable button while submitting

            if (submitBtn) {

                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
            }

            setFormStatus(
                'Submitting your tour request...',
                'success'
            );


            // =================================================
            // 6. SEND DATA TO GOOGLE SHEETS
            // =================================================

            const googleFormData = new URLSearchParams();

            googleFormData.append('name', name);
            googleFormData.append('email', email);
            googleFormData.append('phone', phone);
            googleFormData.append('message', message);


            // =================================================
            // 7. SEND EMAIL USING WEB3FORMS
            // =================================================

            const emailFormData = new FormData();

            emailFormData.append(
                'access_key',
                WEB3FORMS_ACCESS_KEY
            );

            emailFormData.append(
                'subject',
                'New Tour Request - 1st Home of Happiness'
            );

            emailFormData.append(
                'from_name',
                '1st Home of Happiness Website'
            );

            emailFormData.append('name', name);
            emailFormData.append('email', email);
            emailFormData.append('phone', phone);
            emailFormData.append('message', message);

            if (attachment) {
                emailFormData.append('attachment', attachment, attachment.name);
            }

            emailFormData.append('replyto', email);


            // =================================================
            // 8. SUBMIT BOTH FORMS
            // =================================================

            try {

                const results = await Promise.allSettled([

                    // Google Sheets request

                    fetch(googleScriptURL, {
                        method: 'POST',
                        mode: 'no-cors',
                        body: googleFormData
                    }),

                    // Web3Forms email request

                    fetch(
                        'https://api.web3forms.com/submit',
                        {
                            method: 'POST',
                            headers: {
                                Accept: 'application/json'
                            },
                            body: emailFormData
                        }
                    )

                ]);


                // Google Sheets no-cors response cannot be read.
                // A fulfilled request does not confirm that a row was saved.

                const sheetsRequestSent =
                    results[0].status === 'fulfilled';


                // Check Web3Forms response

                let emailSent = false;

                if (results[1].status === 'fulfilled') {

                    const emailResponse = results[1].value;

                    try {

                        const emailResult =
                            await emailResponse.json();

                        emailSent =
                            emailResponse.ok &&
                            emailResult.success === true;

                        if (!emailSent) {
                            console.error(
                                'Web3Forms error:',
                                emailResult
                            );
                        }

                    } catch (parseError) {

                        console.error(
                            'Could not read Web3Forms response:',
                            parseError
                        );
                    }

                } else {

                    console.error(
                        'Web3Forms network error:',
                        results[1].reason
                    );
                }


                // =================================================
                // 9. SUCCESS AND ERROR MESSAGES
                // =================================================

                if (sheetsRequestSent && emailSent) {

                    setFormStatus(
                        'Thank you! Your tour request email was sent. The Google Sheets request was submitted, but the browser cannot confirm that the row was saved.',
                        'success'
                    );

                    tourForm.reset();

                } else if (sheetsRequestSent && !emailSent) {

                    setFormStatus(
                        'Google Sheets request was attempted, but email notification failed. Please contact us directly.',
                        'error'
                    );

                } else if (!sheetsRequestSent && emailSent) {

                    setFormStatus(
                        'Email notification was sent, but Google Sheets request failed. Please contact us.',
                        'error'
                    );

                } else {

                    setFormStatus(
                        'There was an error submitting your request. Please call us at +1 (360) 627-0167.',
                        'error'
                    );
                }


            } catch (error) {

                console.error(
                    'Tour form submission error:',
                    error
                );

                setFormStatus(
                    'There was an error submitting your request. Please call us at +1 (360) 627-0167.',
                    'error'
                );

            } finally {

                if (submitBtn) {

                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit Request';
                }
            }
        });
    }

});
