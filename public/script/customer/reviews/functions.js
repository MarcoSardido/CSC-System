//REVIEWS
let review_All = document.getElementById('reviewFilterAll');
let review_History = document.getElementById('reviewFilterHistory');
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