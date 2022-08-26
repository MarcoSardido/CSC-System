//REVIEWS
let review_All = document.getElementById('all');
let review_History = document.getElementById('history');
// Links
let review_TabLinks = document.querySelectorAll(".nav-item");

for (let i = 0; i < review_TabLinks.length; i++) {
	 review_TabLinks[i].onclick = () => {
	 	let j = 0;
	 	while(j < review_TabLinks.length) {
        	review_TabLinks[j++].className = 'nav-item';
        };
        //ALL[0], HISTORY[1]
        if([i] == 0) {
            review_All.style.display = "block";
            review_History.style.display = "none";
        }else if ([i] == 1) {
        	review_All.style.display = "none";
            review_History.style.display = "block";
        }

        review_TabLinks[i].className = 'nav-item active';
     };
};

// ============== MODAL =================
let modal_btn = document.querySelector(".modal-btn");
let main = document.querySelector(".main");
let close_btn = document.querySelectorAll(".close-btn");

modal_btn.addEventListener("click", function(){
    main.classList.add("active");
});
close_btn.forEach(function(btn){
        btn.addEventListener("click", function(){
        main.classList.remove("active");
    });
});

// SWEET ALERT
document.querySelector(".submit-btn").addEventListener('click', function(){
  main.classList.remove("active");  
  Swal.fire("Rated Successfully", "Thank you for purchasing this product", "success");
});