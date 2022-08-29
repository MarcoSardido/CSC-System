// SIDEBAR MENU
const sideMenu = document.querySelector("aside");
const menuBtn = document.querySelector("#menu-btn");
const closeBtn = document.querySelector("#close-btn");
const themeToggler = document.querySelector(".theme-toggler");

//Show Sidebar
menuBtn.addEventListener('click', () => {
	sideMenu.style.display = 'block';
});
// Close Sidebar
closeBtn.addEventListener('click', () => {
	sideMenu.style.display = 'none';
});

//Change Theme
themeToggler.addEventListener('click', () => {
	document.body.classList.toggle('dark-theme-variables');

	themeToggler.querySelector('span:nth-child(1)').classList.toggle('active');
	themeToggler.querySelector('span:nth-child(2)').classList.toggle('active');
});


// Add / Remove Active Class
const currentLocation = location.href;
const sideLinks = document.querySelector('.sidebar').children;
let checkCurrentLocation = currentLocation.split('/');

for (const link of sideLinks) {
    if (link.href === currentLocation) {
        link.classList.add('active');
    }

    if (checkCurrentLocation.includes('orders')) {
        sideLinks[1].classList.add('active');
    }
}

// ============== SWEET ALERT (SIGNED IN SUCCESSFULLY) ==================
var toastMixin = Swal.mixin({
    toast: true,
    icon: 'success',
    title: 'General Title',
    animation: false,
    position: 'top-right',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
  });

    toastMixin.fire({
        animation: true,
        title: 'Signed in Successfully'
    });

// ================= USE THIS BLOCK OF CODE IF THE USER HAS BEEN SUCCESSFULLY LOGGED IN =====================
// ================= USING THE CORRECT CREDENTIALS  =================
// document.querySelector(".second").addEventListener('click', function(){
//   toastMixin.fire({
//     animation: true,
//     title: 'Signed in Successfully'
//   });
// });