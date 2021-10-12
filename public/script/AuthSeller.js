$(document).ready(() => {
    const first_leftPanel = document.getElementById('first_leftPanel');
    const first_rightPanel = document.getElementById('first_rightPanel');
    const getStarted = document.getElementById('btnGetStarted');
    const email = document.getElementById('emailGetStarted');

    const headers_rightPanel = document.getElementById('headers_rightPanel');
    const second_leftPanel = document.getElementById('second_leftPanel');
    const second_rightPanel = document.getElementById('second_rightPanel');
    const individualType = document.getElementById('individualType');
    const corporateType = document.getElementById('corporateType');

    const third_leftPanel = document.getElementById('third_leftPanel');
    const third_rightPanel = document.getElementById('third_rightPanel');
    const businessAbout = document.querySelector('.businessAbout');
    const businessRequirement = document.querySelector('.businessRequirement');

    const fourth_rightPanel = document.getElementById('fourth_rightPanel');
    const personalInfo = document.querySelector('.personal-info');
    const mailingInfo = document.querySelector('.mailing-info');

    const last_rightPanel = document.getElementById('last_rightPanel');
    const createEmail = document.getElementById('createSellerEmail');

    let progressSwitch_Business = document.querySelector('.businessInfo');
    let progressSwitch_Personal = document.querySelector('.personalInfo');
    let progressSwitch_Create = document.querySelector('.createAcc');

    let progressSwitch_subBusiness1 = document.querySelector('.subBusiness1');
    let progressSwitch_subBusiness2 = document.querySelector('.subBusiness2');
    let progressSwitch_subPersonal1 = document.querySelector('.subPersonal1');
    let progressSwitch_subPersonal2 = document.querySelector('.subPersonal2');

    let progressSwitch_Image = document.querySelector('.progress-footer');

    const btnPrevPanel = document.getElementById('btnPrevPanel');
    const btnNextPanel = document.getElementById('btnNextPanel');
    const panelButton = document.querySelector('.panel-footer');
    

    let isIndividual = false;
    let isCorporate = false;
    let panelCounter = 0;

    getStarted.addEventListener('click', () => {
        if(email.value === '') return alert('Enter your email address');
        
        let getEmail = email.value;
        createEmail.value = getEmail;

        first_leftPanel.style.display="none";
        first_rightPanel.style.display="none";

        headers_rightPanel.style.display="block";
        second_leftPanel.style.display="block";
    })

    individualType.addEventListener('click', () => {
        isIndividual = true;

        second_rightPanel.style.display="none";
        second_leftPanel.style.display="none";

        panelButton.style.opacity="1";
        third_rightPanel.style.display="block";
        third_leftPanel.style.display="block";
    });

    corporateType.addEventListener('click', () => {
        isCorporate = true;

        second_rightPanel.style.display="none";
        second_leftPanel.style.display="none";

        panelButton.style.opacity="1";
        third_rightPanel.style.display="block";
        third_leftPanel.style.display="block";
    });

    btnNextPanel.addEventListener('click', () => {

        if (panelCounter === 0) { //Business Documents
            panelCounter++;

            progressSwitch_subBusiness1.className = 'subTopic subBusiness1';
            progressSwitch_subBusiness2.className = 'subTopic subBusiness2 current-progress';
            progressSwitch_Image.className = 'progress-footer businessInfo2';
    
            businessAbout.style.display="none";
            businessRequirement.style.display="block";
    
        } else if (panelCounter === 1) { //About you
            panelCounter++;
            progressSwitch_subBusiness2.className = 'subTopic subBusiness2';
            progressSwitch_subPersonal1.className = 'subTopic subPersonal1 current-progress';
            progressSwitch_Image.className = 'progress-footer personalInfo1';

            progressSwitch_Business.className = 'progress businessInfo progress-done';
            progressSwitch_Personal.className = 'progress personalInfo current-progress';

            third_rightPanel.style.display="none";
            fourth_rightPanel.style.display="block";
    
        } else if (panelCounter === 2) { //Mailing address
            panelCounter++;
            progressSwitch_subPersonal1.className = 'subTopic subPersonal1';
            progressSwitch_subPersonal2.className = 'subTopic subPersonal2 current-progress';
            progressSwitch_Image.className = 'progress-footer personalInfo2';

            personalInfo.style.display="none";
            mailingInfo.style.display="block";
    
        } else if (panelCounter === 3) {
            panelCounter++;
            
            progressSwitch_Image.className = 'progress-footer getStarted';

            progressSwitch_Personal.className = 'progress personalInfo progress-done';
            progressSwitch_Create.className = 'progress createAcc current-progress';
    
            fourth_rightPanel.style.display="none";
            last_rightPanel.style.display="block";
        } 
    
    });
});