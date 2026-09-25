/**
 * PEMILU DIGITAL NUSANTARA - VIBE CODING LOGIC ENGINE
 * End-to-End Cryptographic Verifiable E-Voting & Audit Explorer 
document.addEventListener('DOMContentLoaded', () => {
  initPrdTabs();
  initProblemSolvingAccordion();
  initCryptoVotingSimulator();
  initAuditChart();
  initConfidentialDocumentModal();
  initLiveTerminalSimulation();
});

/* ==========================================
   1. PRD (PRODUCT REQUIREMENT DOCUMENT) TABS
   ========================================== */
function initPrdTabs() {
  const tabBtns = document.querySelectorAll('.prd-tab-btn');
  const tabContents = document.querySelectorAll('.prd-tab-content');

  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('prd-tab-active', 'border-yellow-500', 'text-yellow-400'));
      tabContents.forEach(c => c.classList.add('hidden'));

      btn.classList.add('prd-tab-active', 'border-yellow-500', 'text-yellow-400');
      const activeContent = document.getElementById(`prd-tab-${targetTab}`);
      if (activeContent) {
        activeContent.classList.remove('hidden');
      }
    });
  });
}

/* ==========================================
   2. PROBLEM SOLVING ACCORDION / TOGGLES
   ========================================== */
function initProblemSolvingAccordion() {
  const cards = document.querySelectorAll('.problem-card');

  cards.forEach(card => {
    const header = card.querySelector('.problem-header');
    const body = card.querySelector('.problem-body');
    const icon = card.querySelector('.problem-icon-toggle');

    if (header && body) {
      header.addEventListener('click', () => {
        const isOpen = !body.classList.contains('hidden');
        
        // Close others
        document.querySelectorAll('.problem-body').forEach(b => b.classList.add('hidden'));
        document.querySelectorAll('.problem-icon-toggle').forEach(i => i && (i.style.transform = 'rotate(0deg)'));

        if (!isOpen) {
          body.classList.remove('hidden');
          if (icon) icon.style.transform = 'rotate(180deg)';
        }
      });
    }
  });
}

/* ==========================================
   3. CRYPTO VOTING SIMULATOR & ZKP HASHING
   ========================================== */
let globalVoteCounts = {
  paslon1: 42815,
  paslon2: 51240,
  paslon3: 38920
};
let totalVotesCast = 132975;
let auditChartInstance = null;

async function generateSHA256(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function initCryptoVotingSimulator() {
  const voteForm = document.getElementById('vote-simulator-form');
  const paslonSelects = document.querySelectorAll('input[name="paslon_choice"]');
  const generateProofBtn = document.getElementById('btn-generate-zkp');
  const resultContainer = document.getElementById('voting-receipt-result');

  if (!generateProofBtn) return;

  generateProofBtn.addEventListener('click', async () => {
    const selected = document.querySelector('input[name="paslon_choice"]:checked');
    const nikInput = document.getElementById('voter-nik-input');

    if (!selected) {
      alert('Silakan pilih salah satu Pasangan Calon Presiden terlebih dahulu!');
      return;
    }

    const nikVal = nikInput ? (nikInput.value.trim() || '3171012345670001') : '3171012345670001';
    const paslonVal = selected.value;
    const timestamp = new Date().toISOString();
    const nonce = Math.random().toString(36).substring(2, 15);

    // Cryptographic process:
    // 1. NIK is hashed with pepper to prevent reverse lookup (Zero Knowledge)
    const anonymousVoterHash = await generateSHA256(`NUSANTARA-NIK-${nikVal}-${nonce}`);
    // 2. Vote choice encrypted homomorphically
    const encryptedVoteToken = await generateSHA256(`BALLOT-${paslonVal}-${nonce}-${timestamp}`);
    // 3. ZKP Proof token
    const zkpProof = `ZKP-SNARK-v4:${encryptedVoteToken.substring(0, 16)}...${encryptedVoteToken.substring(48)}`;

    // Increment count
    if (globalVoteCounts[paslonVal] !== undefined) {
      globalVoteCounts[paslonVal]++;
      totalVotesCast++;
      updateAuditChart();
    }

    // Output UI receipt
    if (resultContainer) {
      resultContainer.classList.remove('hidden');
      resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

      document.getElementById('receipt-hash-id').textContent = encryptedVoteToken;
      document.getElementById('receipt-zkp-proof').textContent = zkpProof;
      document.getElementById('receipt-timestamp').textContent = timestamp;
      document.getElementById('receipt-block-index').textContent = `Block #${Math.floor(1849200 + Math.random() * 500)}`;
      document.getElementById('receipt-paslon-id').textContent = paslonVal.toUpperCase();

      logTerminalEvent(`[ZK-SNARK PROOF GENERATED] Anonymous Hash: ${anonymousVoterHash.substring(0, 18)}...`);
      logTerminalEvent(`[BYZANTINE MESH VALIDATION] Block verified by 1,024 Nodes (KPU, Bawaslu, PTN, CSIRT).`);
      logTerminalEvent(`[CONFIDENTIAL BALOT SEALED] Homomorphic ciphertext appended to immutable ledger.`);
    }
  });

  // Print receipt function
  const printBtn = document.getElementById('btn-print-receipt');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

/* ==========================================
   4. CHART.JS AUDIT GRAPH
   ========================================== */
function initAuditChart() {
  const ctx = document.getElementById('auditLiveChart');
  if (!ctx) return;

  auditChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [
        '01. Dr. Arya & Prof. Ratna',
        '02. Jend. Gajah & Tribhuwana',
        '03. Satria Piningit & Hayam Wuruk'
      ],
      datasets: [{
        label: 'Suara Terverifikasi ZKP (Cryptographic Ledger)',
        data: [globalVoteCounts.paslon1, globalVoteCounts.paslon2, globalVoteCounts.paslon3],
        backgroundColor: [
          'rgba(212, 175, 55, 0.85)',
          'rgba(192, 57, 43, 0.85)',
          'rgba(0, 242, 254, 0.85)'
        ],
        borderColor: [
          '#D4AF37',
          '#C0392B',
          '#00F2FE'
        ],
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#F0F4F8',
            font: { family: 'Plus Jakarta Sans', size: 13 }
          }
        },
        tooltip: {
          backgroundColor: '#121824',
          borderColor: '#D4AF37',
          borderWidth: 1,
          titleFont: { family: 'Cinzel', size: 14 },
          bodyFont: { family: 'Plus Jakarta Sans', size: 12 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#94A3B8' },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        x: {
          ticks: { color: '#F0F4F8', font: { family: 'Plus Jakarta Sans', weight: '600' } },
          grid: { display: false }
        }
      }
    }
  });

  updateAuditMetrics();
}

function updateAuditChart() {
  if (auditChartInstance) {
    auditChartInstance.data.datasets[0].data = [
      globalVoteCounts.paslon1,
      globalVoteCounts.paslon2,
      globalVoteCounts.paslon3
    ];
    auditChartInstance.update();
  }
  updateAuditMetrics();
}

function updateAuditMetrics() {
  const totalEl = document.getElementById('metric-total-votes');
  const nodeCountEl = document.getElementById('metric-active-nodes');
  const zkpRateEl = document.getElementById('metric-zkp-rate');

  if (totalEl) totalEl.textContent = totalVotesCast.toLocaleString('id-ID');
  if (nodeCountEl) nodeCountEl.textContent = '1,024 Node Sync';
  if (zkpRateEl) zkpRateEl.textContent = '100% Zero-K Fraud Proof';
}

/* ==========================================
   5. CONFIDENTIAL DOCUMENT MODAL VIEWER
   ========================================== */
function initConfidentialDocumentModal() {
  const modal = document.getElementById('confidential-doc-modal');
  const openBtns = document.querySelectorAll('.btn-open-doc');
  const closeBtn = document.getElementById('btn-close-doc-modal');

  if (!modal) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const docTitle = btn.getAttribute('data-doc-title') || 'DOKUMEN DEKRIT PEMILU DIGITAL';
      const docCode = btn.getAttribute('data-doc-code') || 'SECRET-KPU-2026-NUSA';
      const docBody = btn.getAttribute('data-doc-body') || 'Dokumen rahasia ini dilindungi oleh Protokol Homomorphic Cryptography UUD 1945 Pasal 22E.';

      document.getElementById('modal-doc-title').textContent = docTitle;
      document.getElementById('modal-doc-code').textContent = docCode;
      document.getElementById('modal-doc-content').textContent = docBody;

      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });
  }

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  });
}

/* ==========================================
   6. LIVE TERMINAL LOG SIMULATOR
   ========================================== */
function initLiveTerminalSimulation() {
  const terminalLogs = document.getElementById('terminal-logs-body');
  if (!terminalLogs) return;

  const initialLogs = [
    "[INIT] Cyber-Nusantara BFT Protocol initialized.",
    "[AUTH] Connecting 1,024 Decentralized Validator Nodes across 38 Provinces...",
    "[ZKP-KEY] RSA-4096 & Dilithium Quantum-Resistant Key Pair Active.",
    "[STATUS] UUD 1945 Article 22E LUBER JURDIL Compliance: VERIFIED.",
    "[LEDGER] Block #1849199 appended. Hash: 0x9f8a...c3e1",
    "[LISTEN] Waiting for confidential cryptographic ballots..."
  ];

  initialLogs.forEach(msg => logTerminalEvent(msg));

  // Periodic heartbeat log
  setInterval(() => {
    const randomTx = Math.random().toString(36).substring(2, 10);
    const nodeIds = ['KPU-JKT-01', 'BAWASLU-SUB-04', 'PTN-UGM-02', 'CSIRT-NUSA-09'];
    const randomNode = nodeIds[Math.floor(Math.random() * nodeIds.length)];
    logTerminalEvent(`[SYNC] Node ${randomNode} verified batch ZKP proof (Tx: 0x${randomTx}...)`);
  }, 7000);
}

function logTerminalEvent(msg) {
  const terminalLogs = document.getElementById('terminal-logs-body');
  if (!terminalLogs) return;

  const timeStr = new Date().toLocaleTimeString('id-ID');
  const line = document.createElement('div');
  line.className = 'py-0.5 font-code text-xs flex items-start gap-2 border-b border-gray-900';
  line.innerHTML = `<span class="text-gray-500">[${timeStr}]</span> <span class="text-cyan-400 font-medium">${msg}</span>`;

  terminalLogs.appendChild(line);
  terminalLogs.scrollTop = terminalLogs.scrollHeight;

  // Limit max DOM children to avoid overflow
  while (terminalLogs.children.length > 40) {
    terminalLogs.removeChild(terminalLogs.firstChild);
  }
}
