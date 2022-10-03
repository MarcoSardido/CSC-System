//SETTINGS NAV
let settings_account = document.getElementById('account-tab');
let settings_addresses = document.getElementById('addresses-tab');
let settings_feedback = document.getElementById('feedback-tab');
let settings_help = document.getElementById('help-tab');
let settings_policy = document.getElementById('policy-tab');
// Links
let settings_TabLinks = document.querySelectorAll(".nav-item");

for (let i = 0; i < settings_TabLinks.length; i++) {
	settings_TabLinks[i].onclick = () => {
		let j = 0;
		while (j < settings_TabLinks.length) {
			settings_TabLinks[j++].className = 'nav-item';
		};
		//Account[0], Addresses[1], Feedback[3], Help[4], CSC Policies[5]
		if ([i] == 0) {
			settings_account.style.display = "block";
			settings_addresses.style.display = "none";
			settings_feedback.style.display = "none";
			settings_help.style.display = "none";
			settings_policy.style.display = "none";
		} else if ([i] == 1) {
			settings_account.style.display = "none";
			settings_addresses.style.display = "block";
			settings_feedback.style.display = "none";
			settings_help.style.display = "none";
			settings_policy.style.display = "none";
		} else if ([i] == 2) {
			settings_account.style.display = "none";
			settings_addresses.style.display = "none";
			settings_feedback.style.display = "block";
			settings_help.style.display = "none";
			settings_policy.style.display = "none";
		} else if ([i] == 3) {
			settings_account.style.display = "none";
			settings_addresses.style.display = "none";
			settings_feedback.style.display = "none";
			settings_help.style.display = "block";
			settings_policy.style.display = "none";
		} else if ([i] == 4) {
			settings_account.style.display = "none";
			settings_addresses.style.display = "none";
			settings_feedback.style.display = "none";
			settings_help.style.display = "none";
			settings_policy.style.display = "block";
		}

		settings_TabLinks[i].className = 'nav-item active';
	};
};


const displayProfile = document.querySelector('.profile-photo');
const changeProfile = document.querySelector('.input-file');

const btnChangeToUpdate = document.getElementById('btnProfile');
btnChangeToUpdate.addEventListener('click', () => {
	displayProfile.style.display = 'none';
	changeProfile.style.display = 'block';
})

const btnChangeToDisplay = document.getElementById('btnCancelChangePhoto');
btnChangeToDisplay.addEventListener('click', () => {
	displayProfile.style.display = 'block';
	changeProfile.style.display = 'none';
})


// ============== MODAL =================
var modal_btn = document.querySelector(".modal-btn");
var modal_edit_btn = document.querySelectorAll(".edit-btn");
var modal_btn_card = document.querySelector(".modal-btn-card");
var modal_edit_card = document.querySelectorAll(".edit-card-btn");
var main = document.querySelector(".main");
var close_btn = document.querySelectorAll(".close-btn");


if (modal_btn) {
	// ADD NEW ADDRESS MODAL
	modal_btn.addEventListener("click", function () {
		main.classList.add("active");
	});
	close_btn.forEach(function (btn) {
		btn.addEventListener("click", function () {
			main.classList.remove("active");
		});
	});
}
if (modal_edit_btn) {
	// EDIT ADDRESS MODAL
	modal_edit_btn.forEach(function (btn) {
		btn.addEventListener("click", function () {
			main.classList.add("active-edit");
		});
	});
}


//LABEL from MODAL (HOME/WORK)
let label_container = document.getElementById('label-types');
let labels = label_container.getElementsByClassName("label-type");

for (let i = 0; i < labels.length; i++) {
	labels[i].addEventListener("click", function () {
		let current = document.getElementsByClassName("label-active");
		current[0].className = current[0].className.replace("label-active", "");
		this.className += " label-active";
	});
}


// SWEET ALERT (Account Settings)
document.querySelector(".save-btn").addEventListener('click', function () {
	Swal.fire({
		title: 'Updated Successfully',
		text: "Your profile has been updated",
		icon: 'success',
		showCancelButton: false,
		showConfirmButton: false
	})
});