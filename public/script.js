(function() {
    'use strict';

    const fileInput = document.getElementById('fileInput');
    const chooseBtn = document.getElementById('chooseBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileRemove = document.getElementById('fileRemove');
    const progressFill = document.getElementById('progressFill');
    const progressStatus = document.getElementById('progressStatus');
    const resultCard = document.getElementById('resultCard');
    const resultUrl = document.getElementById('resultUrl');
    const copyBtn = document.getElementById('copyBtn');
    const uploadMoreBtn = document.getElementById('uploadMoreBtn');
    const errorMessage = document.getElementById('errorMessage');
    const toast = document.getElementById('toast');
    const resultLabel = document.querySelector('.result-label');

    let selectedFile = null;
    let toastTimeout = null;

    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function resetUI() {
        selectedFile = null;
        fileInput.value = '';
        fileInfo.classList.add('hidden');
        fileName.textContent = '𝐍𝐎 𝐅𝐈𝐋𝐄 𝐒𝐄𝐋𝐄𝐂𝐓𝐄𝐃';
        fileSize.textContent = '';
        uploadBtn.disabled = true;
        progressFill.style.width = '0%';
        progressStatus.textContent = '𝐑𝐄𝐀𝐃𝐘';
        resultCard.classList.remove('visible');
        errorMessage.classList.remove('visible');
        errorMessage.textContent = '';
        hideToast();
    }

    function showError(msg) {
        errorMessage.textContent = msg || '❌ 𝐔𝐏𝐋𝐎𝐀𝐃 𝐅𝐀𝐈𝐋𝐄𝐃';
        errorMessage.classList.add('visible');
    }

    function handleFile(file) {
        if (!file) { resetUI(); return; }
        selectedFile = file;
        fileName.textContent = file.name;
        fileSize.textContent = formatSize(file.size);
        fileInfo.classList.remove('hidden');
        uploadBtn.disabled = false;
        errorMessage.classList.remove('visible');
        resultCard.classList.remove('visible');
        progressFill.style.width = '0%';
        progressStatus.textContent = '𝐑𝐄𝐀𝐃𝐘';
    }

    function showToast(message) {
        if (toastTimeout) {
            clearTimeout(toastTimeout);
            toastTimeout = null;
        }
        toast.textContent = message || '✅ 𝐋𝐈𝐍𝐊 𝐂𝐎𝐏𝐈𝐄𝐃';
        toast.classList.remove('hidden');
        toast.classList.add('show');
        toastTimeout = setTimeout(() => {
            hideToast();
        }, 2500);
    }

    function hideToast() {
        toast.classList.remove('show');
        toast.classList.add('hidden');
        if (toastTimeout) {
            clearTimeout(toastTimeout);
            toastTimeout = null;
        }
    }

    async function uploadFile() {
        if (!selectedFile) return;
        const formData = new FormData();
        formData.append('file', selectedFile);

        uploadBtn.disabled = true;
        progressStatus.textContent = '𝐔𝐏𝐋𝐎𝐀𝐃𝐈𝐍𝐆...';
        errorMessage.classList.remove('visible');
        resultCard.classList.remove('visible');

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/upload', true);

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    progressFill.style.width = percent + '%';
                    progressStatus.textContent = `𝐔𝐏𝐋𝐎𝐀𝐃𝐈𝐍𝐆... ${percent}%`;
                }
            });

            const promise = new Promise((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            resolve(data);
                        } catch {
                            reject(new Error('❌ 𝐈𝐍𝐕𝐀𝐋𝐈𝐃 𝐒𝐄𝐑𝐕𝐄𝐑 𝐑𝐄𝐒𝐏𝐎𝐍𝐒𝐄'));
                        }
                    } else {
                        let errMsg = '❌ 𝐔𝐏𝐋𝐎𝐀𝐃 𝐅𝐀𝐈𝐋𝐄𝐃';
                        try {
                            const errData = JSON.parse(xhr.responseText);
                            if (errData.message) errMsg = `❌ ${errData.message}`;
                            else if (errData.error) errMsg = `❌ ${errData.error}`;
                        } catch {
                            errMsg = `❌ 𝐄𝐑𝐑𝐎𝐑 ${xhr.status}: ${xhr.statusText}`;
                        }
                        reject(new Error(errMsg));
                    }
                };
                xhr.onerror = () => reject(new Error('❌ 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐈𝐎𝐍 𝐅𝐀𝐈𝐋𝐄𝐃'));
                xhr.ontimeout = () => reject(new Error('❌ 𝐑𝐄𝐐𝐔𝐄𝐒𝐓 𝐓𝐈𝐌𝐄𝐃 𝐎𝐔𝐓'));
                xhr.send(formData);
            });

            const data = await promise;
            progressFill.style.width = '100%';
            progressStatus.textContent = '𝐔𝐏𝐋𝐎𝐀𝐃𝐄𝐃 ✅';
            resultUrl.value = data.url || '';
            if (resultLabel) {
                resultLabel.textContent = '✅ 𝐅𝐈𝐋𝐄 𝐔𝐏𝐋𝐎𝐀𝐃𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘!';
            }
            resultCard.classList.add('visible');
            uploadBtn.disabled = false;
        } catch (err) {
            showError(err.message || '❌ 𝐔𝐏𝐋𝐎𝐀𝐃 𝐅𝐀𝐈𝐋𝐄𝐃');
            progressStatus.textContent = '𝐔𝐏𝐋𝐎𝐀𝐃 𝐅𝐀𝐈𝐋𝐄𝐃 ❌';
            uploadBtn.disabled = false;
        }
    }

    // ===== EVENTS =====
    chooseBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        } else {
            resetUI();
        }
    });
    
    fileRemove.addEventListener('click', resetUI);
    uploadBtn.addEventListener('click', uploadFile);
    
    copyBtn.addEventListener('click', () => {
        if (!resultUrl.value) return;
        navigator.clipboard.writeText(resultUrl.value)
            .then(() => showToast('✅ 𝐋𝐈𝐍𝐊 𝐂𝐎𝐏𝐈𝐄𝐃'))
            .catch(() => {
                resultUrl.select();
                document.execCommand('copy');
                showToast('✅ 𝐋𝐈𝐍𝐊 𝐂𝐎𝐏𝐈𝐄𝐃');
            });
    });
    
    uploadMoreBtn.addEventListener('click', resetUI);

    resetUI();
})();