const C = window.CAMPAIGN;
const GOAL = C.goalAmount;
const API = '/api/donations';

let selectedAmount = C.defaultSelected || 100;
let donations = [];
let pendingDonation = null;

document.addEventListener('DOMContentLoaded', () => {
    applyConfig();
    buildAmountGrid();
    buildTeamGrid();
    startCountdown();
    loadDonations();
});

function applyConfig() {
    const eyebrow = document.getElementById('hero-eyebrow');
    eyebrow.textContent = `Berlin Marathon · ${formatDate(C.raceDate)}`;

    const heroBg = document.getElementById('hero-bg');
    if (C.heroBannerUrl) {
        heroBg.style.backgroundImage = `url('${C.heroBannerUrl}')`;
    } else {
        heroBg.style.backgroundImage = `url('https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1400&q=80')`;
        const notice = document.getElementById('hero-notice');
        if (notice) notice.style.display = 'block';
    }

    document.getElementById('hero-charity-name').textContent = C.charityName;
    document.getElementById('story-charity-name').textContent = C.charityName;
    document.getElementById('charity-btn').href = C.charityUrl;
    document.getElementById('charity-btn-text').textContent =
        `Visit the ${C.charityName}`;
    document.getElementById('footer-charity-link').textContent = C.charityName;
    document.getElementById('footer-charity-link').href = C.charityUrl;
    document.getElementById('footer-charity-blurb').textContent =
        C.charityBlurb;

    document.getElementById('story-goal').textContent =
        '$' + GOAL.toLocaleString();
    document.getElementById('goal-display').textContent =
        'of $' + GOAL.toLocaleString();

    document.getElementById('modal-handle').textContent = C.venmoHandle;

    const dl = new Date(C.fundraisingDeadline);
    document.getElementById('cd-deadline-text').textContent =
        dl.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    document.getElementById('footer-deadline').textContent =
        dl.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    document.getElementById('footer-race-date').textContent = formatDate(
        C.raceDate,
    );
}

function formatDate(str) {
    const d = new Date(str + 'T12:00:00');
    return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function startCountdown() {
    function tick() {
        const deadline = new Date(C.fundraisingDeadline);
        const now = new Date();
        const diff = deadline - now;

        if (diff <= 0) {
            ['cd-d', 'cd-h', 'cd-m', 'cd-s'].forEach(
                (id) => (document.getElementById(id).textContent = '0'),
            );
            return;
        }

        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        document.getElementById('cd-d').textContent = d;
        document.getElementById('cd-h').textContent = h;
        document.getElementById('cd-m').textContent = m;
        document.getElementById('cd-s').textContent = String(s).padStart(
            2,
            '0',
        );
    }

    tick();
    setInterval(tick, 1000);
}

function buildAmountGrid() {
    const grid = document.getElementById('amount-grid');
    const amounts = [...C.defaultAmounts, 'Custom'];

    grid.innerHTML = amounts
        .map((a) => {
            const isCustom = a === 'Custom';
            const active =
                !isCustom && a === C.defaultSelected ? ' active' : '';
            return `<button class="amount-btn${active}" onclick="selectAmount(${isCustom ? "'custom'" : a}, this)">${isCustom ? 'Custom' : '$' + a}</button>`;
        })
        .join('');

    selectedAmount = C.defaultSelected;
}

function selectAmount(val, btn) {
    document
        .querySelectorAll('.amount-btn')
        .forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const wrap = document.getElementById('custom-wrap');
    if (val === 'custom') {
        wrap.style.display = 'block';
        document.getElementById('custom-amount').focus();
        selectedAmount = null;
    } else {
        wrap.style.display = 'none';
        selectedAmount = val;
    }
}

function getAmount() {
    if (selectedAmount) return selectedAmount;
    const v = parseFloat(document.getElementById('custom-amount').value);
    return isNaN(v) || v < 1 ? null : Math.round(v);
}

document.getElementById('anon-check').addEventListener('change', function () {
    const nameInput = document.getElementById('donor-name');
    nameInput.disabled = this.checked;
    nameInput.placeholder = this.checked ? 'Anonymous' : 'Mac Miller';
    nameInput.style.opacity = this.checked ? '0.45' : '1';
    if (this.checked) nameInput.value = '';
});

function openModal() {
    const amt = getAmount();
    if (!amt) {
        showToast('Please choose a donation amount first.');
        return;
    }

    const isAnon = document.getElementById('anon-check').checked;
    const name = document.getElementById('donor-name').value.trim();
    const message = document.getElementById('donor-message').value.trim();

    pendingDonation = {
        amount: amt,
        name,
        message,
        anonymous: isAnon,
    };

    const fmt = '$' + amt.toLocaleString();
    document.getElementById('modal-amount').textContent = fmt;
    document.getElementById('modal-amount-2').textContent = fmt;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const base = C.venmoNote || 'Berlin Marathon Fundraiser';
    const suffix =
        name && message
            ? `${name} — ${message}`
            : name
              ? name
              : message
                ? message
                : null;
    const venmoNote = suffix ? `${base} | ${suffix}` : base;
    document.getElementById('venmo-deep-link').href = isMobile
        ? `venmo://paycharge?txn=pay&recipients=${C.venmoHandle}&amount=${amt}&note=${encodeURIComponent(venmoNote)}`
        : `https://account.venmo.com/payment-link?amount=${amt}&note=${encodeURIComponent(venmoNote)}&recipients=${C.venmoHandle}&txn=pay`;

    document.getElementById('modal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('modal').classList.remove('open');
    document.body.style.overflow = '';
}

async function confirmDonation() {
    if (!pendingDonation) {
        closeModal();
        return;
    }

    const btn = document.getElementById('confirm-btn');
    btn.textContent = 'Saving…';
    btn.disabled = true;

    try {
        const res = await fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pendingDonation),
        });

        if (!res.ok) throw new Error('Server error');

        await loadDonations();
        closeModal();
        resetForm();
        showToast("🎉 thank you! you've been added to our donor wall :D");
    } catch (err) {
        showToast('could not save — please try again 😭');
        btn.textContent = '✓ I sent it !';
        btn.disabled = false;
    }

    pendingDonation = null;
}

function resetForm() {
    document.getElementById('donor-name').value = '';
    document.getElementById('donor-message').value = '';
    document.getElementById('anon-check').checked = false;
    document.getElementById('donor-name').disabled = false;
    document.getElementById('donor-name').placeholder = 'Mac Miller';
    document.getElementById('donor-name').style.opacity = '1';
    const btns = document.querySelectorAll('.amount-btn');
    btns.forEach((b) => b.classList.remove('active'));
    btns.forEach((b) => {
        if (b.textContent === '$' + C.defaultSelected)
            b.classList.add('active');
    });
    selectedAmount = C.defaultSelected;
    document.getElementById('custom-wrap').style.display = 'none';
}

async function loadDonations() {
    try {
        const res = await fetch(API);
        const data = await res.json();
        donations = Array.isArray(data) ? data : [];
    } catch {
        donations = [];
    }
    renderDonors();
    updateProgress();
}

setInterval(loadDonations, 30000);

function renderDonors() {
    const list = document.getElementById('donor-list');
    const count = donations.length;

    document.getElementById('donor-count').textContent = count;
    document.getElementById('donors-stat').textContent = count;

    if (count === 0) {
        list.innerHTML = `<p class="donor-loading">no donations yet :0 be the first! 🤓</p>`;
        return;
    }

    list.innerHTML = donations
        .map((d) => {
            const initials = d.anonymous
                ? '♡'
                : (d.name || '?')
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
            return `
      <div class="donor-card">
        <div class="donor-avatar">${esc(initials)}</div>
        <div class="donor-info">
          <div class="donor-name">${d.anonymous ? 'Anonymous' : esc(d.name || 'Friend')}</div>
          ${d.message ? `<div class="donor-message">"${esc(d.message)}"</div>` : ''}
        </div>
        <div class="donor-amount">$${Number(d.amount).toLocaleString()}</div>
      </div>`;
        })
        .join('');
}

function updateProgress() {
    const total = donations.reduce((s, d) => s + Number(d.amount || 0), 0);
    const pct = Math.min((total / GOAL) * 100, 100);
    const remaining = Math.max(0, GOAL - total);

    document.getElementById('raised-display').textContent =
        '$' + total.toLocaleString();
    document.getElementById('pct-display').textContent = Math.round(pct) + '%';
    document.getElementById('remaining-display').textContent =
        '$' + remaining.toLocaleString();
    document.getElementById('progress-fill').style.width = pct.toFixed(2) + '%';
}

function buildTeamGrid() {
    const grid = document.getElementById('team-grid');
    grid.innerHTML = C.team
        .map((member) => {
            const initials = member.name
                .split(' ')
                .map((w) => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
            const photoEl = member.photo
                ? `<img src="${esc(member.photo)}" alt="${esc(member.name)}">`
                : esc(initials);
            return `
      <div class="team-card">
        <div class="team-photo">${photoEl}</div>
        <div class="team-name">${esc(member.name)}</div>
        <div class="team-role">${esc(member.role)}</div>
        <a href="https://instagram.com/${esc(member.instagram)}" target="_blank" class="ig-link">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
          @${esc(member.instagram)}
        </a>
      </div>`;
        })
        .join('');
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3500);
}

function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
