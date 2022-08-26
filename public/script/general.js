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

// ============ ORDER SCRIPT ===============
let order_All = document.getElementById('all');
let order_ToShip = document.getElementById('toShip');
let order_ToReceive = document.getElementById('toReceive');
let order_Delivered = document.getElementById('delivered');
// Links
let order_TabLinks = document.querySelectorAll(".nav-item");

for (let i = 0; i < order_TabLinks.length; i++) {
	 order_TabLinks[i].onclick = () => {
	 	let j = 0;
	 	while(j < order_TabLinks.length) {
        	order_TabLinks[j++].className = 'nav-item';
        };
        //ALL[0], TO SHIP[1], TO RECEIVE[2], TO DELIVER[3]
         if([i] == 0) {
            order_All.style.display = "block";
            order_ToShip.style.display = "none";
            order_ToReceive.style.display = "none";
            order_Delivered.style.display = "none";
        }else if ([i] == 1) {
        	order_All.style.display = "none";
            order_ToShip.style.display = "block";
            order_ToReceive.style.display = "none";
            order_Delivered.style.display = "none";
        }else if ([i] == 2) {
        	order_All.style.display = "none";
            order_ToShip.style.display = "none";
            order_ToReceive.style.display = "block";
            order_Delivered.style.display = "none";
        }else if ([i] == 3) {
        	order_All.style.display = "none";
            order_ToShip.style.display = "none";
            order_ToReceive.style.display = "none";
            order_Delivered.style.display = "block";
        }

        order_TabLinks[i].className = 'nav-item active';
	 };
};

// ============== SWEET ALERT (SIGNED IN SUCCESSFULLY) ==================
var toastMixin = Swal.mixin({
    toast: true,
    icon: 'success',
    title: 'General Title',
    animation: false,
    position: 'top-right',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
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