//SETTINGS NAV
let settings_account = document.getElementById('account-tab');
let settings_addresses = document.getElementById('addresses-tab');
let settings_banksCards = document.getElementById('finance-tab');
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
		//Account[0], Addresses[1], Finance[2], Feedback[3], Help[4], CSC Policies[5]
		if ([i] == 0) {
			settings_account.style.display = "block";
			settings_addresses.style.display = "none";
			settings_banksCards.style.display = "none";
			settings_feedback.style.display = "none";
			settings_help.style.display = "none";
			settings_policy.style.display = "none";
		} else if ([i] == 1) {
			settings_account.style.display = "none";
			settings_addresses.style.display = "block";
			settings_banksCards.style.display = "none";
			settings_feedback.style.display = "none";
			settings_help.style.display = "none";
			settings_policy.style.display = "none";
		} else if ([i] == 2) {
			settings_account.style.display = "none";
			settings_addresses.style.display = "none";
			settings_banksCards.style.display = "block";
			settings_feedback.style.display = "none";
			settings_help.style.display = "none";
			settings_policy.style.display = "none";
		} else if ([i] == 3) {
			settings_account.style.display = "none";
			settings_addresses.style.display = "none";
			settings_banksCards.style.display = "none";
			settings_feedback.style.display = "block";
			settings_help.style.display = "none";
			settings_policy.style.display = "none";
		} else if ([i] == 4) {
			settings_account.style.display = "none";
			settings_addresses.style.display = "none";
			settings_banksCards.style.display = "none";
			settings_feedback.style.display = "none";
			settings_help.style.display = "block";
			settings_policy.style.display = "none";
		} else if ([i] == 5) {
			settings_account.style.display = "none";
			settings_addresses.style.display = "none";
			settings_banksCards.style.display = "none";
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
	close_btn.forEach(function (btn) {
		btn.addEventListener("click", function () {
			main.classList.remove("active-edit");
		});
	});
}
if (modal_btn_card) {
	// ADD NEW CARD MODAL
	modal_btn_card.addEventListener("click", function () {
		main.classList.add("active-card");
	});
	close_btn.forEach(function (btn) {
		btn.addEventListener("click", function () {
			main.classList.remove("active-card");
		});
	});
}
if (modal_edit_card) {
	// EDIT CARD MODAL
	modal_edit_card.forEach(function (btn) {
		btn.addEventListener("click", function () {
			main.classList.add("active-edit-card");
		});
	});
	close_btn.forEach(function (btn) {
		btn.addEventListener("click", function () {
			main.classList.remove("active-edit-card");
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


// SWEET ALERT (Add new address modal)
document.querySelector(".submit-btn").addEventListener('click', function () {
	main.classList.remove("active");
	Swal.fire("Added Successfully", "Your new address has been added", "success");
});

// SWEET ALERT (Edit address modal)
document.querySelector(".update-btn").addEventListener('click', function () {
	main.classList.remove("active-edit");
	Swal.fire("Updated Successfully", "Your address has been updated", "success");
});

// SWEET ALERT (Delete address)
document.querySelectorAll(".delete-btn").forEach(function (btn) {
	btn.addEventListener('click', function () {
		Swal.fire({
			title: 'Delete Address?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#6875e3',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Delete'
		}).then((result) => {
			if (result.isConfirmed) {
				Swal.fire(
					'Deleted!',
					'Your address has been deleted.',
					'success'
				)
			}
		});
	});
});


// SWEET ALERT (Add new card modal)
document.querySelector(".submit-card-btn").addEventListener('click', function () {
	main.classList.remove("active-card");
	Swal.fire("Added Successfully", "Your new credit/debit card has been added", "success");
});
// SWEET ALERT (Edit card modal)
document.querySelector(".update-card-btn").addEventListener('click', function () {
	main.classList.remove("active-edit-card");
	Swal.fire("Updated Successfully", "Your card details has been updated", "success");
});
// SWEET ALERT (Delete credit/debit card)
document.querySelectorAll(".delete-card-btn").forEach(function (btn) {
	btn.addEventListener('click', function () {
		Swal.fire({
			title: 'Delete card?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#6875e3',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Delete'
		}).then((result) => {
			if (result.isConfirmed) {
				Swal.fire(
					'Deleted!',
					'Your credit/debit card has been deleted.',
					'success'
				)
			}
		});
	});
});