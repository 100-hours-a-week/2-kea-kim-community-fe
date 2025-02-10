// modal.js

// DOMContentLoaded 이벤트로 모달 HTML 구조와 스타일을 동적으로 생성
document.addEventListener('DOMContentLoaded', () => {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'modalOverlay';
    modalOverlay.style.display = 'none'; // 기본적으로 숨김

    modalOverlay.innerHTML = `
        <div class="modal">
            <h2 id="modalTitle">제목</h2>
            <p id="modalContent">내용</p>
            <div class="modal-buttons">
                <button class="cancel" onclick="closeModal()">취소</button>
                <button class="confirm" id="modalConfirmButton">확인</button>
            </div>
        </div>
    `;
    document.body.appendChild(modalOverlay); // body에 추가
});

// 모달 열기 함수 (다른 페이지에서 호출)
function openModal(title, content, confirmAction) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalContent').innerText = content;
    document.getElementById('modalOverlay').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지

    const confirmButton = document.getElementById('modalConfirmButton');
    confirmButton.onclick = function() {
        confirmAction(); // 확인 버튼 클릭 시 실행할 동작
        closeModal();
    };
}

// 모달 닫기 함수
function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.body.style.overflow = 'auto'; // 배경 스크롤 허용
}
