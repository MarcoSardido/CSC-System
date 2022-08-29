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