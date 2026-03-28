const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');

if (!token || !userStr) {
    window.location.href = '/index.html';
}

const user = JSON.parse(userStr);

// Init User Profile
document.getElementById('userNameDisplay').textContent = `${user.username} (${user.role})`;
document.getElementById('userAvatar').textContent = user.username.charAt(0).toUpperCase();

if (user.role === 'Admin') {
    document.getElementById('nav-doctors').classList.remove('hidden');
}

// Navigation Logic
const navItems = document.querySelectorAll('.nav-item');
const viewSections = document.querySelectorAll('.view-section');

// Function to switch active tab
window.switchTab = function(target) {
    // Update Active Nav
    navItems.forEach(nav => {
        if(nav.getAttribute('data-target') === target) nav.classList.add('active');
        else nav.classList.remove('active');
    });

    // Show View
    viewSections.forEach(section => {
        if(section.id === target) section.classList.remove('hidden');
        else section.classList.add('hidden');
    });

    // Update Page Title
    document.getElementById('pageTitle').textContent = target.charAt(0).toUpperCase() + target.slice(1);

    // Call fetch logic based on tab
    if (target === 'dashboard') fetchDashboardStats();
    if (target === 'doctors') fetchDoctors();
    if (target === 'patients') fetchPatients();
    if (target === 'appointments') { fetchAppointments(); populateSelects(); }
    if (target === 'billing') { fetchBills(); populateAptSelect(); }
}

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = item.getAttribute('data-target');
        switchTab(target);
    });
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
});

// Generic Fetch Wrapper
async function apiFetch(url, options = {}) {
    const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    try {
        const res = await fetch(url, { ...options, headers });
        if (res.status === 401 || res.status === 403) {
            alert('Session expired or unauthorized attempt. Please login again or as Admin.');
            if(res.status === 401) {
                document.getElementById('logoutBtn').click();
            }
            return null;
        }
        return await res.json();
    } catch(err) {
        console.error('API Error:', err);
        return null;
    }
}

// ======================= FETCHING DATA =======================
async function fetchDashboardStats() {
    const data = await apiFetch('/api/dashboard/stats');
    if (!data) return;

    document.getElementById('stat-patients').textContent = data.total_patients;
    document.getElementById('stat-doctors').textContent = data.total_doctors;
    document.getElementById('stat-appointments').textContent = data.total_appointments;
    document.getElementById('stat-revenue').textContent = `$${data.total_revenue.toFixed(2)}`;

    const tbody = document.querySelector('#recentPatientsTable tbody');
    if(data.recent_patients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center">No recent patients</td></tr>';
    } else {
        tbody.innerHTML = data.recent_patients.map(p => `
            <tr><td>#${p.id}</td><td><strong>${p.name}</strong></td><td>${p.age}</td></tr>
        `).join('');
    }
}

async function fetchDoctors() {
    const data = await apiFetch('/api/doctors');
    if (!data || data.error) return;

    const tbody = document.querySelector('#doctorsTable tbody');
    if(data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No doctors found</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(d => `
        <tr>
            <td>#${d.id}</td>
            <td><strong>${d.name}</strong></td>
            <td><span class="badge badge-primary">${d.specialty}</span></td>
            <td>${d.phone || 'N/A'}</td>
            <td>
                <button class="btn-sm btn-danger" onclick="deleteEntity('/api/doctors/${d.id}', fetchDoctors)">Remove</button>
            </td>
        </tr>
    `).join('');
}

async function fetchPatients() {
    const data = await apiFetch('/api/patients');
    if (!data) return;

    const tbody = document.querySelector('#patientsTable tbody');
    if(data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No patients found</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(p => `
        <tr>
            <td>#${p.id}</td>
            <td><strong>${p.name}</strong></td>
            <td>${p.age} / ${p.gender}</td>
            <td>${p.phone || 'N/A'}</td>
            <td>
                <button class="btn-sm btn-danger" onclick="deleteEntity('/api/patients/${p.id}', fetchPatients)">Remove</button>
            </td>
        </tr>
    `).join('');
}

async function fetchAppointments() {
    const data = await apiFetch('/api/appointments');
    if (!data) return;

    const tbody = document.querySelector('#appointmentsTable tbody');
    if(data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">No appointments found</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(a => `
        <tr>
            <td>#${a.id}</td>
            <td><strong>${a.patient_name || 'Unknown'}</strong></td>
            <td>${a.doctor_name || 'Unknown'}</td>
            <td>${a.appointment_date} at ${a.appointment_time}</td>
            <td><span class="badge ${a.status==='Completed'?'badge-success':'badge-warning'}">${a.status}</span></td>
            <td class="action-btns">
                ${a.status !== 'Completed' ? `<button class="btn-sm btn-success" onclick="updateAptStatus(${a.id}, 'Completed')"><i class="fa-solid fa-check"></i> Complete</button>` : '<em>Completed</em>'}
            </td>
        </tr>
    `).join('');
}

async function fetchBills() {
    const data = await apiFetch('/api/billing');
    if (!data) return;

    const tbody = document.querySelector('#billingTable tbody');
    if(data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No bills found</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(b => `
        <tr>
            <td>#${b.id}</td>
            <td>Apt ID: ${b.appointment_id} - ${b.patient_name} (${b.appointment_date})</td>
            <td><strong>$${b.amount.toFixed(2)}</strong></td>
            <td><span class="badge ${b.status==='Paid'?'badge-success':'badge-warning'}">${b.status}</span></td>
            <td>
                ${b.status !== 'Paid' ? `<button class="btn-sm btn-success" onclick="payBill(${b.id})"><i class="fa-solid fa-dollar-sign"></i> Mark Paid</button>` : '<em>Paid</em>'}
            </td>
        </tr>
    `).join('');
}

// ======================= ACTIONS =======================

window.deleteEntity = async function(url, refreshFn) {
    if(confirm('Are you sure you want to delete this record?')) {
        await apiFetch(url, { method: 'DELETE' });
        refreshFn();
    }
}

window.updateAptStatus = async function(id, status) {
    await apiFetch(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    });
    fetchAppointments();
}

window.payBill = async function(id) {
    await apiFetch(`/api/billing/${id}/pay`, { method: 'PATCH' });
    fetchBills();
}

// Helpers for Populating Selects
async function populateSelects() {
    const pts = await apiFetch('/api/patients');
    // Admin gets all doctors, Receptionist gets them through stats
    const drs = user.role==='Admin' ? await apiFetch('/api/doctors') : await apiFetch('/api/dashboard/stats').then(d=>d.doctors_list);
    
    document.getElementById('aptPatient').innerHTML = pts && pts.length ? pts.map(p=>`<option value="${p.id}">${p.name}</option>`).join('') : '<option value="">No patients available</option>';
    document.getElementById('aptDoctor').innerHTML = drs && drs.length ? drs.map(d=>`<option value="${d.id}">Dr. ${d.name} (${d.specialty})</option>`).join('') : '<option value="">No doctors available</option>';
}

async function populateAptSelect() {
    const apts = await apiFetch('/api/appointments');
    document.getElementById('billApt').innerHTML = apts && apts.length ? apts.map(a=>`<option value="${a.id}">ID: #${a.id} - ${a.patient_name} on ${a.appointment_date}</option>`).join('') : '<option value="">No appointments available</option>';
}

// ======================= MODAL LOGIC =======================
window.openModal = function(id) { document.getElementById(id).classList.add('active'); }
window.closeModal = function(id) { document.getElementById(id).classList.remove('active'); }

// Forms Submit Handlers
document.getElementById('formAddDoctor').addEventListener('submit', async(e)=>{
    e.preventDefault();
    const data = {
        name: document.getElementById('drName').value,
        specialty: document.getElementById('drSpecialty').value,
        phone: document.getElementById('drPhone').value
    };
    await apiFetch('/api/doctors', { method: 'POST', body: JSON.stringify(data) });
    closeModal('doctorModal'); document.getElementById('formAddDoctor').reset(); fetchDoctors();
});

document.getElementById('formAddPatient').addEventListener('submit', async(e)=>{
    e.preventDefault();
    const data = {
        name: document.getElementById('ptName').value,
        age: parseInt(document.getElementById('ptAge').value),
        gender: document.getElementById('ptGender').value,
        phone: document.getElementById('ptPhone').value
    };
    await apiFetch('/api/patients', { method: 'POST', body: JSON.stringify(data) });
    closeModal('patientModal'); document.getElementById('formAddPatient').reset(); fetchPatients();
});

document.getElementById('formBookApt').addEventListener('submit', async(e)=>{
    e.preventDefault();
    const data = {
        patient_id: document.getElementById('aptPatient').value,
        doctor_id: document.getElementById('aptDoctor').value,
        appointment_date: document.getElementById('aptDate').value,
        appointment_time: document.getElementById('aptTime').value
    };
    await apiFetch('/api/appointments', { method: 'POST', body: JSON.stringify(data) });
    closeModal('appointmentModal'); document.getElementById('formBookApt').reset(); fetchAppointments();
});

document.getElementById('formGenBill').addEventListener('submit', async(e)=>{
    e.preventDefault();
    const data = {
        appointment_id: document.getElementById('billApt').value,
        amount: parseFloat(document.getElementById('billAmount').value)
    };
    await apiFetch('/api/billing', { method: 'POST', body: JSON.stringify(data) });
    closeModal('billingModal'); document.getElementById('formGenBill').reset(); fetchBills();
});

// Initial Load
fetchDashboardStats();
