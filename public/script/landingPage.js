import { firebase } from './firebaseConfig.js';
import { getAuth, setPersistence, inMemoryPersistence, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendEmailVerification, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";


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

  const loginForm = document.getElementById('sellerLoginForm')
  const loginButton = document.getElementById('btnLogin')
  const sellerEmail = document.getElementById('loginSellerEmail')
  const sellerPassword = document.getElementById('loginSellerPassword')
  const iconTogglePassword = document.getElementById('togglePassword')
  const checkPasswordLabel = document.getElementById('lblCheckPassword')

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

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault()

    let signInEmail = sellerEmail.value;
    let signInPassword = sellerPassword.value;

    signInWithEmailAndPassword(auth, signInEmail, signInPassword).then(user => {
      user.user.getIdToken().then(idToken => {
        window.location.assign(`sellercenter/auth/sessionLogin?token=${idToken}&uid=${user.user.uid}&live=true`);
      });
    }).then(() => {
      return signOut(auth).then(() => {
      }).catch(error => {
        console.log(error.message);
      })
    }).catch(error => {
      checkPasswordLabel.classList.remove('valid');
      checkPasswordLabel.classList.add('invalid');
      checkPasswordLabel.innerText = 'Please enter a strong password.';
      loginButton.setAttribute('disabled', '');
      
      alert(errorHandler(error.code));
      sellerEmail.value = null;
      sellerPassword.value = null;
    });
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