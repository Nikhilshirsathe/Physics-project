const canvas = document.getElementById("simulator-canvas");
const ctx = canvas.getContext("2d");

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const forces = [];
let currentRotation = 0;
let showNetMOFValue = false;

function drawStand() {
    // Draw base
    ctx.fillStyle = "#2c3e50";
    ctx.beginPath();
    ctx.moveTo(centerX - 100, centerY + 100);
    ctx.lineTo(centerX + 100, centerY + 100);
    ctx.lineTo(centerX + 80, centerY + 120);
    ctx.lineTo(centerX - 80, centerY + 120);
    ctx.closePath();
    ctx.fill();

    // Draw vertical support
    ctx.fillStyle = "#34495e";
    ctx.beginPath();
    ctx.moveTo(centerX - 20, centerY + 100);
    ctx.lineTo(centerX + 20, centerY + 100);
    ctx.lineTo(centerX + 15, centerY - 50);
    ctx.lineTo(centerX - 15, centerY - 50);
    ctx.closePath();
    ctx.fill();

    // Draw horizontal support
    ctx.fillStyle = "#34495e";
    ctx.beginPath();
    ctx.moveTo(centerX - 15, centerY - 50);
    ctx.lineTo(centerX + 15, centerY - 50);
    ctx.lineTo(centerX + 15, centerY - 40);
    ctx.lineTo(centerX - 15, centerY - 40);
    ctx.closePath();
    ctx.fill();
}

function drawLever() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw stand first (always fixed)
    drawStand();
    
    // Save the context before rotating
    ctx.save();
    
    // Translate to pivot point and rotate
    ctx.translate(centerX, centerY - 45);
    ctx.rotate(currentRotation * Math.PI / 180);
    
    // Draw lever
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(-350, 0);
    ctx.lineTo(350, 0);
    ctx.strokeStyle = "#7aa2f7";
    ctx.stroke();

    // Draw pivot point
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, 2 * Math.PI);
    ctx.fillStyle = "#bb9af7";
    ctx.fill();
    ctx.strokeStyle = "#7aa2f7";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw pivot connection
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(15, 0);
    ctx.lineTo(15, 5);
    ctx.lineTo(-15, 5);
    ctx.closePath();
    ctx.fillStyle = "#34495e";
    ctx.fill();

    // Draw forces
    drawForces();
    
    // Restore the context
    ctx.restore();
}

function drawForces() {
    forces.forEach(force => {
        const { distance, value, direction } = force;
        const posX = direction === "Clockwise" 
            ? distance * 3 
            : -distance * 3;
        
        // Draw weight
        ctx.fillStyle = "#f7768e";
        ctx.beginPath();
        ctx.moveTo(posX - 15, 0);
        ctx.lineTo(posX + 15, 0);
        ctx.lineTo(posX + 10, 25);
        ctx.lineTo(posX - 10, 25);
        ctx.closePath();
        ctx.fill();

        // Draw weight string
        ctx.beginPath();
        ctx.moveTo(posX, 0);
        ctx.lineTo(posX, 25);
        ctx.strokeStyle = "#f7768e";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Weight label
        ctx.fillStyle = "#7aa2f7";
        ctx.font = "bold 16px Poppins";
        ctx.textAlign = "center";
        ctx.fillText(`${value} kg`, posX, 30);
    });

    // Draw net force
    const netForce = calculateNetForce();
    const posX = netForce.direction === "Clockwise" ? 100 : -100;
    
    // Draw net force arrow
    ctx.beginPath();
    ctx.moveTo(posX, -55);
    ctx.lineTo(posX, -105);
    ctx.strokeStyle = "#4a90e2";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(posX - 10, -97);
    ctx.lineTo(posX, -105);
    ctx.lineTo(posX + 10, -97);
    ctx.stroke();

    // Net force label with background
    ctx.fillStyle = "rgba(74, 144, 226, 0.2)";
    ctx.beginPath();
    ctx.roundRect(posX - 80, -140, 160, 30, 8);
    ctx.fill();
    
    ctx.fillStyle = "#4a90e2";
    ctx.font = "bold 18px Poppins";
    ctx.textAlign = "center";
    ctx.fillText(`Net Force: ${netForce.total} kg`, posX, -125);
    
    // Draw direction indicator
    ctx.fillStyle = "#4a90e2";
    ctx.font = "bold 14px Poppins";
    ctx.fillText(`Direction: ${netForce.direction}`, posX, -105);

    // Draw net MOF if enabled
    if (showNetMOFValue) {
        const netMOF = calculateNetMOF();
        const mofX = netMOF.direction === "Clockwise" ? 200 : -200;
        
        // Draw MOF background
        ctx.fillStyle = "rgba(187, 154, 247, 0.2)";
        ctx.beginPath();
        ctx.roundRect(mofX - 100, -180, 200, 60, 8);
        ctx.fill();
        
        // Draw MOF value
        ctx.fillStyle = "#bb9af7";
        ctx.font = "bold 18px Poppins";
        ctx.textAlign = "center";
        ctx.fillText(`Net MOF: ${netMOF.total} N⋅m`, mofX, -160);
        
        // Draw MOF direction
        ctx.font = "bold 14px Poppins";
        ctx.fillText(`Direction: ${netMOF.direction}`, mofX, -140);
        
        // Draw MOF arrow
        ctx.beginPath();
        ctx.moveTo(mofX, -130);
        ctx.lineTo(mofX, -180);
        ctx.strokeStyle = "#bb9af7";
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(mofX - 10, -172);
        ctx.lineTo(mofX, -180);
        ctx.lineTo(mofX + 10, -172);
        ctx.stroke();
    }
}

function calculateNetForce() {
    let total = 0;
    let direction = "Balanced";
    
    forces.forEach(force => {
        if (force.direction === "Clockwise") {
            total += force.value;
        } else {
            total -= force.value;
        }
    });

    if (total > 0) {
        direction = "Clockwise";
    } else if (total < 0) {
        direction = "Anticlockwise";
        total = Math.abs(total);
    }

    return { total, direction };
}

function calculateNetMOF() {
    let total = 0;
    let direction = "Balanced";
    
    forces.forEach(force => {
        const moment = force.distance * force.value;
        if (force.direction === "Clockwise") {
            total += moment;
        } else {
            total -= moment;
        }
    });

    if (total > 0) {
        direction = "Clockwise";
    } else if (total < 0) {
        direction = "Anticlockwise";
        total = Math.abs(total);
    }

    return { total, direction };
}

function calculateMoments() {
    let cw = 0, acw = 0;
    forces.forEach(f => {
        const moment = f.distance * f.value;
        if (f.direction === "Clockwise") cw += moment;
        else acw += moment;
    });

    const momentDifference = cw - acw;
    const maxMoment = 100;
    currentRotation = (momentDifference / maxMoment) * 30;

    drawLever();
}

function addForce() {
    const distance = parseFloat(document.getElementById("weightPosition").value);
    const value = parseFloat(document.getElementById("weightValue").value);
    const direction = distance > 0 ? "Clockwise" : "Anticlockwise";

    if (isNaN(distance) || isNaN(value)) {
        alert("Please enter valid numbers");
        return;
    }

    forces.push({ 
        distance: Math.abs(distance), 
        value: value, 
        direction 
    });

    calculateMoments();
}

function showNetMOF() {
    showNetMOFValue = !showNetMOFValue;
    calculateMoments();
}

// Initialize
drawLever();

// Add hover effects
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Transform mouse coordinates to account for rotation
    const dx = x - centerX;
    const dy = y - (centerY - 45);
    const angle = -currentRotation * Math.PI / 180;
    const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
    const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);
    
    // Check if mouse is over any force
    forces.forEach(force => {
        const posX = force.direction === "Clockwise" 
            ? force.distance * 3 
            : -force.distance * 3;
        
        if (Math.abs(rotatedX - posX) < 20 && Math.abs(rotatedY) < 20) {
            canvas.style.cursor = 'pointer';
            return;
        }
    });
    canvas.style.cursor = 'default';
});

// Add click handler to remove forces
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Transform mouse coordinates to account for rotation
    const dx = x - centerX;
    const dy = y - (centerY - 45);
    const angle = -currentRotation * Math.PI / 180;
    const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
    const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);
    
    forces.forEach((force, index) => {
        const posX = force.direction === "Clockwise" 
            ? force.distance * 3 
            : -force.distance * 3;
        
        if (Math.abs(rotatedX - posX) < 20 && Math.abs(rotatedY) < 20) {
            forces.splice(index, 1);
            calculateMoments();
        }
    });
});

// Add video popup HTML to the body
document.body.insertAdjacentHTML('beforeend', `
    <div class="video-popup" id="videoPopup">
        <div class="video-popup-content">
            <button class="close-popup" onclick="closeVideoPopup()">×</button>
            <iframe src="https://drive.google.com/embeddedfolderview?id=1qheQ6j6j1fop7ZiFKrbN-bSHM_kgtlS_#grid" 
                    style="width:100%; height:100%; border:none;"></iframe>
        </div>
    </div>
`);

function openVideoPopup() {
    // Calculate center position
    const width = 1000;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    // Open Google Drive folder in a centered popup window
    const popupWindow = window.open(
        'https://drive.google.com/drive/folders/1qheQ6j6j1fop7ZiFKrbN-bSHM_kgtlS_?usp=sharing',
        'Google Drive',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );
    
    // Focus the popup window
    if (popupWindow) {
        popupWindow.focus();
    } else {
        // If popup is blocked, show error message
        alert('Please allow popups for this website to view the videos.');
    }
}

function closeVideoPopup() {
    const popup = document.getElementById('videoPopup');
    popup.classList.remove('active');
    document.body.style.overflow = '';
}

// Close popup when clicking outside
document.getElementById('videoPopup').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        closeVideoPopup();
    }
});

// Close popup with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeVideoPopup();
    }
});

// Add PDF popup HTML to the body
document.body.insertAdjacentHTML('beforeend', `
    <div class="pdf-popup" id="pdfPopup">
        <div class="pdf-popup-content">
            <button class="close-popup" onclick="closePDFPopup()">×</button>
            <div class="pdf-container">
                <div class="pdf-error" style="display: none;">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Unable to load PDF. Please try the following:</p>
                    <ul>
                        <li>Make sure the PDF file is properly shared</li>
                        <li>Check your internet connection</li>
                        <li>Try opening in a new tab</li>
                    </ul>
                    <a href="MOF.pdf" target="_blank" class="btn btn-primary">Open PDF in New Tab</a>
                </div>
                <iframe id="pdfViewer" 
                        src="about:blank"
                        style="width:100%; height:100%; border:none;"
                        onload="handlePDFLoad(this)"
                        onerror="handlePDFError(this)"></iframe>
            </div>
        </div>
    </div>
`);

function openPDFPopup() {
    // Calculate center position
    const width = 800;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    // Open PDF in a centered popup window
    const popupWindow = window.open('MOF.pdf', 'PDF Viewer', 
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`);
    
    // Focus the popup window
    if (popupWindow) {
        popupWindow.focus();
    } else {
        // If popup is blocked, show error message
        alert('Please allow popups for this website to view the PDF.');
    }
}

function handlePDFLoad(iframe) {
    // Check if the PDF loaded successfully
    try {
        if (iframe.contentWindow.document.body.innerHTML.includes('Unable to display PDF')) {
            handlePDFError(iframe);
        }
    } catch (error) {
        handlePDFError(iframe);
    }
}

function handlePDFError(iframe) {
    iframe.style.display = 'none';
    const pdfError = document.querySelector('.pdf-error');
    pdfError.style.display = 'flex';
}

function closePDFPopup() {
    const popup = document.getElementById('pdfPopup');
    popup.classList.remove('active');
    document.body.style.overflow = '';
}

// Close PDF popup when clicking outside
document.getElementById('pdfPopup').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        closePDFPopup();
    }
});

// Close PDF popup with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePDFPopup();
    }
});

// Mobile menu functionality
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.remove('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const navLinks = document.querySelector('.nav-links');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        navLinks.classList.remove('active');
    }
});

function adjustPosition(change) {
    const positionInput = document.getElementById('weightPosition');
    const currentValue = parseInt(positionInput.value) || 0;  // Default to 0 if NaN
    
    // If change is -1 (minus button), make the value negative
    // If change is 1 (plus button), make the value positive
    const newValue = change === -1 ? -Math.abs(currentValue) : Math.abs(currentValue);
    
    // Ensure the new value stays within the min/max range
    if (newValue >= parseInt(positionInput.min) && newValue <= parseInt(positionInput.max)) {
        positionInput.value = newValue;
        // Trigger the input event to update any listeners
        positionInput.dispatchEvent(new Event('input'));
    }
} 