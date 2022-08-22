import { firebase } from './firebaseConfig.js';
import { getAuth, setPersistence, inMemoryPersistence, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, sendEmailVerification, sendPasswordResetEmail  } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";

$(document).ready(() => {

    //ANCHOR: START OF AUTHENTICATION CODE//

    const auth = getAuth(firebase);
    setPersistence(auth, inMemoryPersistence);

    onAuthStateChanged(auth, (loggedUser) =>  {

        if (loggedUser) {
            // console.log(loggedUser.getIdTokenResult().then(idTokenResult => {
            //     console.log(idTokenResult.claims)
            // }))

            if (loggedUser.emailVerified) {
                console.log('Seller is already verified');
            } else {
                sendEmailVerification(loggedUser).then(() => {
                    console.log('Email verification sent');
                });
            }
        } else {
            console.log('No user');
        }
    });

    // Login
    $('#seller_SignInForm').submit((e) => {
        e.preventDefault();

        let signInEmail = $('#signIn-Email').val();
        let signInPassword = $('#signIn-password').val();

        signInWithEmailAndPassword(auth, signInEmail, signInPassword).then(user => {
            user.user.getIdToken().then(idToken => {
            window.location.assign('auth/sessionLogin?token='+idToken);
            });
        }).then(() => {
            return signOut(auth).then(() => {
            }).catch(error => {
                console.log(error.message);
            })
        });
    })

    // Reset Password
    const inputResetPassword = document.getElementById('inputResetPassword');
    $('#btnResetPassword').click(() => {
        if (!inputResetPassword.value) return alert('Please enter email address');
        sendPasswordResetEmail(auth, inputResetPassword.value).then(() => {
            alert('Password Reset Link Sent Successfully.');
            inputResetPassword.value = null;
            $('#resetPasswordModal').modal('hide');
        }).catch(error => {
            console.error(`Firebase Auth Error: @ResetPassword: ${error.message}`)
        })
    })

    //ANCHOR: END OF AUTHENTICATION CODE//


    const sellerForm = document.getElementById("sellerRegistrationForm");
    const checkEmail = document.getElementById('validatorText1');
    const tab = document.getElementsByClassName("tab");
    const stepImage = document.querySelector('.progress-footer');

    const tabSwitcher = document.querySelectorAll('.switch');

    let currentTab = 0;
    showTab(currentTab);

    function showTab(tabNum) {

        tab[tabNum].style.display = "block";

        if (tabNum == 0) {
            $('#prevBtn').hide();
            $('#mid-header').hide();

        } else {
            $('#prevBtn').css('display', 'inline');
            $('#mid-header').show();
        }

        if (tabNum == (tab.length - 1)) {
            $('#nextBtn').text('Gets Started');
        } else if (tabNum == 0) {
            $('#nextBtn').text('Get Started');
            $("#nextBtn").attr('class', 'footer btnNext getStarted');
        } else {
            $('#nextBtn').text('Next');
            $("#nextBtn").attr('class', 'footer btnNext');
        }

        stepAndProgressIndicator(tabNum);
    }

    $('#prevBtn').click(() => {
        nextPrev(-1);
    })

    $('#nextBtn').click(() => {
        nextPrev(1);
    })

    $('#chkInputEmail').keyup(() => {
        const checkInputEmail = document.getElementById('chkInputEmail').value;
        const createEmail = document.getElementById('createSellerEmail');
        const sellerForm = document.getElementById("sellerRegistrationForm");
        const checkEmail = document.getElementById('validatorText1');
    
        const pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        
        if (checkInputEmail.match(pattern)) {
            sellerForm.classList.add('valid');
            sellerForm.classList.remove('invalid');
            checkEmail.innerText = 'Your email address is valid.';
    
        } else if (checkInputEmail === '') {
            sellerForm.classList.remove('valid');
            sellerForm.classList.add('invalid');
            checkEmail.innerText = '';
    
        } else {
            sellerForm.classList.remove('valid');
            sellerForm.classList.add('invalid');
            checkEmail.innerText = 'Please enter a valid email address.';
        }

        createEmail.value = checkInputEmail;
    })

    $('#inputCreatePassword').keyup(() => {
        const checkInputPassword = document.getElementById('inputCreatePassword').value;
        const checkPasswordLabel = document.getElementById('checkPassword');

        //NOTE: To check a password between 8 to 15 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character.
        const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;

        if (checkInputPassword.match(pattern)) {
            checkPasswordLabel.classList.add('valid');
            checkPasswordLabel.classList.remove('invalid');
            checkPasswordLabel.innerText = 'Your password is strong. 🔥';

        } else if (checkInputPassword === '') {
            checkPasswordLabel.classList.remove('valid');
            checkPasswordLabel.classList.add('invalid');
            checkPasswordLabel.innerText = '';

        } else {
            checkPasswordLabel.classList.remove('valid');
            checkPasswordLabel.classList.add('invalid');
            checkPasswordLabel.innerText = 'Please enter a strong password.';
        }

    })

    $('#togglePassword').click(() => {
        const checkInputPassword = document.getElementById('inputCreatePassword');
        const passwordIcon = document.getElementById('togglePassword');

        const type = checkInputPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        checkInputPassword.setAttribute('type', type);

        passwordIcon.classList.toggle('fa-eye-slash');
    })

    function nextPrev (tabNum) {
        if (tabNum == 1 && !validateForm()) return false;

        tab[currentTab].style.display = "none";

        currentTab = currentTab + tabNum;

        if (currentTab >= tab.length) {
            $('.panel-footer').hide();
            $("#nextBtn").attr('data-toggle', 'modal');
            $("#nextBtn").attr('data-target', '#verifyEmailModal');

            document.getElementById('redirectToDashboard').onclick = async () => {
                await document.getElementById('sellerRegistrationForm').submit();
            }

            return false;
        }

        showTab(currentTab);
    }
    
    function validateForm () {

        let totalNumberOfInput, inputChecker, valid = true;
        
        totalNumberOfInput = tab[currentTab].getElementsByTagName("input");

        for (inputChecker = 0; inputChecker < totalNumberOfInput.length; inputChecker++) {

            if (sellerForm.classList.contains('invalid')) {

                if (totalNumberOfInput[inputChecker].value == "") {
                    sellerForm.classList.add('invalid');
                    checkEmail.innerText = 'This field is required.';
                }
                valid = false;
            }
        }

        return valid;
    }

    function fixStepIndicator(tabNum) {
        // This function removes the "active" class of all steps...
        let stepLoop, totalStep = document.getElementsByClassName("step");

        for (stepLoop = 0; stepLoop < totalStep.length; stepLoop++) {

            totalStep[stepLoop].className = totalStep[stepLoop].className.replace(" active", "");
        }
        totalStep[tabNum].className += " active";
    }

    function fixProgressIndicator(tabNum) {
        let totalProgress = document.getElementsByClassName("progress");
        let subProgressLoop, totalSubProgress = document.getElementsByClassName("subTopic");
        

        for (subProgressLoop = 0; subProgressLoop < totalSubProgress.length; subProgressLoop++) {
            totalSubProgress[subProgressLoop].className = totalSubProgress[subProgressLoop].className.replace(" active", "");
        }

        switch(tabNum) {

            case 3:
                totalProgress[1].className = totalProgress[1].className.replace("finished", "active");
                totalProgress[2].className = totalProgress[2].className.replace("active", "pending");
            break;
            
            case 4:
                totalProgress[1].className = totalProgress[1].className.replace("active", "finished");
                totalProgress[2].className = totalProgress[2].className.replace("pending", "active");
            break;

            case 5:
                totalProgress[3].className = totalProgress[3].className.replace("active", "pending");
                totalProgress[2].className = totalProgress[2].className.replace("finished", "active");
            break;
            
            case 6:
                totalProgress[2].className = totalProgress[2].className.replace("active", "finished");
                totalProgress[3].className = totalProgress[3].className.replace("pending", "active");
                stepImage.className = `progress-footer stepImage${tabNum-1}`;
            break;
            
        }

        if (tabNum < 6) {
            totalSubProgress[tabNum-2].className += " active";
            stepImage.className = `progress-footer stepImage${tabNum-1}`;
        }
    }

    function stepAndProgressIndicator(tabNum) {

        if (tabNum < 3) {
            fixStepIndicator(tabNum);
        }
    
        if (tabNum >= 2) {
            fixProgressIndicator(tabNum);
        }
    }


    for (let i = 0; i < tabSwitcher.length; i++) {
        tabSwitcher[i].onclick = () => {

            let j = 0;
            while(j < tabSwitcher.length) {
                tabSwitcher[j++].className = 'nav-cont switch';
            };

            if ([i] == 0) {
                $('#signIn').show();
                $('#signUp').hide();
            } else {
                $('#signIn').hide();
                $('#signUp').show();
            };

            tabSwitcher[i].className = 'nav-cont switch active';
        };
    };
});