async function reorderPDF(fileBytes) {
    const { PDFDocument } = PDFLib;
    
    // 원본 PDF 로드
    const pdfDoc = await PDFDocument.load(fileBytes);
    const totalPages = pdfDoc.getPageCount();
    
    if (totalPages < 2) {
        throw new Error('페이지 수가 2장 미만입니다. 재정렬이 필요하지 않습니다.');
    }
    
    // 새 PDF 생성
    const newPdfDoc = await PDFDocument.create();
    
    const reorderedIndices = [];
    
    for (let i = 0; i < totalPages; i++) {
        if (i % 2 === 0) {
            // 새 PDF의 짝수 인덱스(0, 2, 4...) -> 원본 앞부분 (홀수 페이지, 정방향)
            reorderedIndices.push(i / 2);
        } else {
            // 새 PDF의 홀수 인덱스(1, 3, 5...) -> 원본 뒷부분 (짝수 페이지, 역방향)
            reorderedIndices.push(totalPages - 1 - Math.floor(i / 2));
        }
    }
    
    // 원본 페이지들을 재정렬된 순서에 맞게 복사
    const copiedPages = await newPdfDoc.copyPages(pdfDoc, reorderedIndices);
    
    // 새 문서에 추가
    copiedPages.forEach((page) => {
        newPdfDoc.addPage(page);
    });
    
    // 저장하여 Uint8Array 반환
    return await newPdfDoc.save();
}
