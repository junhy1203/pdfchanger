document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const processBtn = document.getElementById('processBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const resultSection = document.getElementById('resultSection');
    const downloadBtn = document.getElementById('downloadBtn');
    
    let currentFile = null;
    let processedBytes = null;
    
    // 파일 선택/드래그앤드롭 이벤트 바인딩
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });
    
    function handleFile(file) {
        if (file.type !== 'application/pdf') {
            alert('PDF 파일만 업로드 가능합니다.');
            return;
        }
        currentFile = file;
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileInfo').style.display = 'block';
        resultSection.style.display = 'none';
        processBtn.disabled = false;
        processedBytes = null;
        
        // 초기화
        progressContainer.style.display = 'none';
        progressBar.style.width = '0%';
    }
    
    processBtn.addEventListener('click', async () => {
        if (!currentFile) return;
        
        processBtn.disabled = true;
        progressContainer.style.display = 'block';
        updateProgress(10, '파일 읽는 중...');
        
        try {
            const arrayBuffer = await currentFile.arrayBuffer();
            
            updateProgress(40, 'PDF 페이지 재정렬 중...');
            
            // 약간의 딜레이를 주어 UI 업데이트를 원활하게 함
            setTimeout(async () => {
                try {
                    processedBytes = await reorderPDF(arrayBuffer);
                    
                    updateProgress(90, '파일 생성 중...');
                    
                    setTimeout(() => {
                        updateProgress(100, '완료!');
                        resultSection.style.display = 'flex';
                    }, 500);
                } catch (err) {
                    handleError(err);
                }
            }, 300);
            
        } catch (error) {
            handleError(error);
        }
    });
    
    downloadBtn.addEventListener('click', () => {
        if (!processedBytes) return;
        
        const blob = new Blob([processedBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // 원본 파일명에 _reordered 추가
        const originalName = currentFile.name;
        const newName = originalName.replace(/\.pdf$/i, '') + '_reordered.pdf';
        
        a.download = newName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    function updateProgress(percent, text) {
        progressBar.style.width = percent + '%';
        progressText.textContent = text;
    }

    function handleError(error) {
        console.error(error);
        alert('오류가 발생했습니다: ' + error.message);
        progressContainer.style.display = 'none';
        processBtn.disabled = false;
    }
});
