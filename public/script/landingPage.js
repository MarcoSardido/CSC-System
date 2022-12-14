import { firebase } from './firebaseConfig.js';
import { getAuth, setPersistence, inMemoryPersistence, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendEmailVerification, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
import { getFirestore, doc, collection, getDocs, getDoc, setDoc, query, orderBy, limit, where } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

import { startLiveSelling } from './seller/dashboard/Api/startLive.js'

(function () {
  "use strict";

  //! CSURF TEST 
  // console.log(document.cookie.split(';'));

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select('#header')
    let offset = header.offsetHeight

    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    })
  }

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
      }
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function (e) {
    select('#navbar').classList.toggle('navbar-mobile')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Mobile nav dropdowns activate
   */
  on('click', '.navbar .dropdown > a', function (e) {
    if (select('#navbar').classList.contains('navbar-mobile')) {
      e.preventDefault()
      this.nextElementSibling.classList.toggle('dropdown-active')
    }
  }, true)

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '.scrollto', function (e) {
    if (select(this.hash)) {
      e.preventDefault()

      let navbar = select('#navbar')
      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });

  /**
   * Preloader
   */
  let preloader = select('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove()
    });
  }

  /**
   * Initiate  glightbox 
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Skills animation
   */
  let skilsContent = select('.skills-content');
  if (skilsContent) {
    new Waypoint({
      element: skilsContent,
      offset: '80%',
      handler: function (direction) {
        let progress = select('.progress .progress-bar', true);
        progress.forEach((el) => {
          el.style.width = el.getAttribute('aria-valuenow') + '%'
        });
      }
    })
  }

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener('load', () => {
    let portfolioContainer = select('.portfolio-container');
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item'
      });

      let portfolioFilters = select('#portfolio-flters li', true);

      on('click', '#portfolio-flters li', function (e) {
        e.preventDefault();
        portfolioFilters.forEach(function (el) {
          el.classList.remove('filter-active');
        });
        this.classList.add('filter-active');

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        portfolioIsotope.on('arrangeComplete', function () {
          AOS.refresh()
        });
      }, true);
    }

  });

  /**
   * Initiate portfolio lightbox 
   */
  const portfolioLightbox = GLightbox({
    selector: '.portfolio-lightbox'
  });

  /**
   * Portfolio details slider
   */
  new Swiper('.portfolio-details-slider', {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  });

  /**
   * Animation on scroll
   */
  window.addEventListener('load', () => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      mirror: false
    });
  });


  // Live Sell Login
  const auth = getAuth(firebase);
  const db = getFirestore(firebase);

  const loginForm = document.getElementById('sellerLoginForm')
  const loginButton = document.getElementById('btnLogin')
  const sellerEmail = document.getElementById('loginSellerEmail')
  const sellerPassword = document.getElementById('loginSellerPassword')
  const iconTogglePassword = document.getElementById('togglePassword')
  const checkPasswordLabel = document.getElementById('lblCheckPassword')

  const showStartLiveModal = document.getElementById('btnLiveSellNow')
  showStartLiveModal.addEventListener('click', () => {
    $('#modalLoginLiveSell').modal('show')
  })

  // Modal elements
  const storeModalTitle = document.getElementById('store')
  const formModal = document.getElementById('preview-form')

  //NOTE: To check a password between 8 to 15 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character.
  const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
  sellerPassword.addEventListener('keyup', () => {
    if (sellerPassword.value.match(pattern)) {
      checkPasswordLabel.classList.add('valid');
      checkPasswordLabel.classList.remove('invalid');
      checkPasswordLabel.innerText = 'Your password is strong. 🔥';
      loginButton.removeAttribute('disabled');

    } else {
      if (checkPasswordLabel.classList.contains('invalid')) return

      checkPasswordLabel.classList.remove('valid');
      checkPasswordLabel.classList.add('invalid');
      checkPasswordLabel.innerText = 'Please enter a strong password.';
      loginButton.setAttribute('disabled', '');
    }
  })
  iconTogglePassword.addEventListener('click', () => {
    const type = sellerPassword.getAttribute('type') === 'password' ? 'text' : 'password';
    sellerPassword.setAttribute('type', type);

    iconTogglePassword.classList.toggle('fa-eye-slash');
  })

  const startTime = document.getElementById('inputStartTime');
    const checkTimeSelection = [];
    
    startTime.addEventListener('change', () => {
        const date = new Date();
        const hours = date.getHours();
        const splitTimeValue = startTime.value.split(':')[0];

        if (splitTimeValue > hours) {
            const rooms = checkTimeSelection;
            const selectedTime = `${splitTimeValue}:00`;

            if (rooms.length > 0) {
                for (const roomIndex of rooms) {
                    if (roomIndex.time === selectedTime) {
                        if (roomIndex.numberOfRooms !== 5) {
                            startTime.value = selectedTime;
                            break;
                        } else {
                            alert(`Time: ${roomIndex.time} already has ${roomIndex.numberOfRooms} waiting rooms. Please select another time.`);
                            startTime.value = `${hours}:00`;
                            break;
                        }
                    }
                }
                startTime.value = selectedTime;
            } else {
                startTime.value = selectedTime;
            }

            

        } else {
            alert('Please select ahead of time');
            startTime.value = `${hours}:00`;
        }
    })

    const computeTime = (start, duration) => {
        let getHour = start.split(':')[0];
        let startTime = Number(getHour);
        let endTime = Number(duration);
        let computedTime;

        if (endTime === 30) {
            computedTime = `${startTime}:${endTime}`;
        } else {
            computedTime = startTime + endTime;
            if (computedTime > 12) {
                computedTime = computedTime - 12;
            }
            computedTime = `${computedTime}:00`;
        }
        return computedTime;
    }

  const previewContent = (data) => {
    const container = document.querySelector('.prevCont');
    let content = `
        <div class="preview" style="background-image: url('${data.eventBanner}')">
            <div class="upperCont">
                <div class="logo">
                    <img src="${data.eventLogo}" alt="">
                </div>
            </div>
            <div class="lowerCont">
                <div class="storeNameCont">
                    <p class="fixedLiveStatus">Live</p>
                    <p class="storeName">${data.storeName} (${data.eventName})</p>
                </div>
                <div class="storeDescCont">
                    <p class="storeDesc">${data.eventDesc}</p>
                </div>
            </div>
        </div>
    `;
    $('.preview').remove()
    container.insertAdjacentHTML('beforeend', content)
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    let signInEmail = sellerEmail.value;
    let signInPassword = sellerPassword.value;

    let sellerUID;
    const sellerObj = {};
    try {
      const user = await signInWithEmailAndPassword(auth, signInEmail, signInPassword);
      const sellerToken = await user.user.getIdToken();
      sellerUID = user.user.uid;

      // COLLECTION: Sellers -> SUB-COLLECTION: Business Information
      const businessInfoSubColRef = collection(db, `Sellers/${sellerUID}/Business Information`);
      const businessInfoSubCollection = await getDocs(businessInfoSubColRef);
      businessInfoSubCollection.forEach(seller => sellerObj.storeName = seller.id)

      // COLLECTION: Sellers -> SUB-COLLECTION: Products
      const productsSubColRef = collection(db, `Sellers/${sellerUID}/Products`);
      const productsSubCollection = await getDocs(productsSubColRef);

      if (productsSubCollection.size !== 0) {
        // Seller has products proceed to live streaming settings
        storeModalTitle.textContent = sellerObj.storeName

        $('#modalLoginLiveSell').modal('hide')
        $('#modalStartLiveSell').modal('show')

        const firstPart = document.querySelector('.first-part');
        const secondPart = document.querySelector('.second-part');
        const slideButtons = document.querySelectorAll('.btnSlide');

        formModal.addEventListener('submit', (e) => {
          e.preventDefault()

          const onlyInputs = document.querySelectorAll('#preview-form input');
          const imgDataLogo = JSON.parse(onlyInputs[3].value)
          const imgDataBanner = JSON.parse(onlyInputs[5].value)

          sellerObj.eventName = onlyInputs[0].value;
          sellerObj.eventDesc = onlyInputs[1].value;
          sellerObj.eventLogo = `data:${imgDataLogo.type};base64,${imgDataLogo.data}`;
          sellerObj.eventBanner = `data:${imgDataBanner.type};base64,${imgDataBanner.data}`;

          previewContent(sellerObj);
        })

        // Second Part
        for (const [buttonIndex, buttonValue] of slideButtons.entries()) {
          buttonValue.addEventListener('click', () => {

            if (buttonIndex === 1) {
              firstPart.style.display = 'none';
              secondPart.style.display = 'block';
              buttonValue.classList.add('complete');
              buttonValue.innerText = 'Create Room';
              slideButtons[0].removeAttribute('disabled');
              slideButtons[0].classList.remove('disabled')
            } else {
              firstPart.style.display = 'block';
              secondPart.style.display = 'none';
              slideButtons[1].classList.remove('complete');
              slideButtons[1].innerText = 'Next';
              buttonValue.removeAttribute('disabled');
              buttonValue.classList.add('disabled')
            }

            if (buttonValue.classList.contains('complete')) {
              const secondPartInput = document.querySelectorAll('[name="formInput2"]');
              const lblEndTime = document.getElementById('currentTime');

              secondPartInput[1].addEventListener('change', () => {
                lblEndTime.textContent = '';
                lblEndTime.innerText = computeTime(secondPartInput[0].value, secondPartInput[1].value);
              })

              document.querySelector('.complete').addEventListener('click', () => {
                sellerObj.eventStart = secondPartInput[0].value;
                sellerObj.eventDuration = secondPartInput[1].value;
                sellerObj.eventEnd = computeTime(secondPartInput[0].value, secondPartInput[1].value);

                startLiveSelling(sellerUID, sellerObj).then(res => {
                  window.location.assign(`sellercenter/auth/sessionLogin?token=${sellerToken}&uid=${sellerUID}&path=live&room=${res}`);
                })
              })


            }
          })
        }
        


      } else {
        // Seller doesn't have products redirect to product page
        alert(`You have no products. Redirecting to product page`)
        window.location.assign(`sellercenter/auth/sessionLogin?token=${sellerToken}&uid=${sellerUID}&path=products`);
      }

    } catch (error) {
      checkPasswordLabel.classList.remove('valid');
      checkPasswordLabel.classList.add('invalid');
      checkPasswordLabel.innerText = 'Please enter a strong password.';
      loginButton.setAttribute('disabled', '');

      alert(errorHandler(error.code));
      sellerEmail.value = null;
      sellerPassword.value = null;
    }
  })

  const errorHandler = (code) => {
    let errMessage = '';

    if (code === 'auth/invalid-email') {
      errMessage = `You've entered an invalid email address!`;
    } else if (code === 'auth/wrong-password') {
      errMessage = `You've entered an invalid password!`;
    } else if (code === 'auth/user-not-found') {
      errMessage = `There are no users matching that email!`;
    } else {
      errMessage = code;
    }
    return errMessage
  }



})()