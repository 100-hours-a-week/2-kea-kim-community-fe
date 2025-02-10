document.addEventListener("DOMContentLoaded", async () => {
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const submitButton = document.getElementById("submit");
    const passwordHelperText = document.getElementById("passwordHelperText");
    const confirmPasswordHelperText = document.getElementById("confirmPasswordHelperText");
    const finishButton = document.getElementById("finish"); // 수정 완료 버튼
    const myProfileImg = document.querySelector(".myProfile");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const logoutButton = document.getElementById("logoutButton");

    // 드롭다운 토글
    myProfileImg.addEventListener("click", (e) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        dropdownMenu.classList.toggle("show");
    });

    // 페이지 다른 영역 클릭 시 드롭다운 닫기
    window.addEventListener("click", () => {
        if (dropdownMenu.classList.contains("show")) {
            dropdownMenu.classList.remove("show");
        }
    });

   // 로그아웃 기능
   logoutButton.addEventListener("click", async (e) => {
        e.preventDefault(); // 기본 동작 방지

        try {
            const response = await fetch(`${BASE_URL}/api/users/logout`, {
                method: "POST",
                credentials: "include",
            });

            if (response.ok) {
                alert("로그아웃 되었습니다.");
                window.location.href = "/html/login.html"; // 로그인 페이지로 이동
            } else {
                alert("로그아웃에 실패했습니다.");
            }
        } catch (error) {
            console.error("Error logging out:", error);
            alert("로그아웃 중 오류가 발생했습니다.");
        }
    });

    // 사용자 프로필 불러오기
    async function loadProfile() {
        try {
            const response = await fetch(`${BASE_URL}/api/users/profile`, {
                method: 'GET',
                credentials: 'include', // 세션 쿠키 전송
            });

            if (response.ok) {
                const user = await response.json();
                console.log('User Profile:', user);

                // 현재 사용자 ID 저장
                currentUserId = user.id;

                const profileImageUrl = user.profilePic 
                    ? `${BASE_URL}${user.profilePic}` 
                    : '/images/profile_img.webp';

                myProfileImg.src = profileImageUrl;
                myProfileImg.title = `${user.nickname} 님의 프로필`;
            } else if (response.status === 401) {
                console.warn('Unauthorized: 로그인 필요');
                myProfileImg.src = '/images/profile_img.webp';
                myProfileImg.title = '로그인이 필요합니다.';
            } else {
                throw new Error('Failed to fetch profile');
            }
        } catch (error) {
            console.error('Error fetching profile data:', error.message);
            myProfileImg.src = '/images/profile_img.webp';
            myProfileImg.title = '오류 발생';
        }
    }

    await loadProfile();

    // 비밀번호 유효성 검사 함수
    function validatePassword(password) {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
        return regex.test(password);
    }

    // 비밀번호 필드 유효성 검사
    function validatePasswordField() {
        const password = passwordInput.value.trim();

        if (!password) {
            passwordHelperText.textContent = "*비밀번호를 입력해주세요";
            return false;
        } else if (!validatePassword(password)) {
            passwordHelperText.textContent =
                "*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
            return false;
        } else {
            passwordHelperText.textContent = "";
            return true;
        }
    }

    // 비밀번호 확인 필드 유효성 검사
    function validateConfirmPasswordField() {
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (confirmPassword.length > 0) { // 글씨를 입력하기 시작했을 때만 확인
            if (password !== confirmPassword) {
                confirmPasswordHelperText.textContent = "*비밀번호 확인과 다릅니다.";
                return false;
            } else {
                confirmPasswordHelperText.textContent = "";
                return true;
            }
        } else {
            confirmPasswordHelperText.textContent = "";
            return false;
        }
    }

    // 전체 입력값 유효성 검사 및 버튼 활성화/비활성화
    function validateInputs() {
        const isPasswordValid = validatePasswordField();
        const isConfirmPasswordValid = validateConfirmPasswordField();

        const isValid = isPasswordValid && isConfirmPasswordValid;

        submitButton.disabled = !isValid;
        submitButton.style.backgroundColor = isValid ? "#7f6aee" : "#aca0eb";
    }

    // 수정 완료 버튼 표시
    function showFinishButton() {
        finishButton.style.opacity = "1";
        finishButton.style.visibility = "visible";

        // 3초 후 수정 완료 버튼 숨기기
        setTimeout(() => {
            finishButton.style.opacity = "0";
            finishButton.style.visibility = "hidden";
        }, 3000);
    }

    // 이벤트 리스너 등록
    passwordInput.addEventListener("input", () => {
        validatePasswordField(); // 비밀번호 필드만 검증
        validateInputs(); // 전체 입력값 유효성 검사
    });

    confirmPasswordInput.addEventListener("input", () => {
        validateConfirmPasswordField(); // 비밀번호 확인 필드만 검증
        validateInputs(); // 전체 입력값 유효성 검사
    });

    submitButton.addEventListener("click", async (e) => {
    e.preventDefault(); // 기본 동작 방지

    const newPassword = passwordInput.value.trim();

    // 서버에 비밀번호 저장 요청
    try {
        const response = await fetch(`${BASE_URL}/api/users/profile/password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ newPassword }),
            credentials: 'include', // 세션 쿠키 전송

        });
            if (response.ok) {
                // 비밀번호 저장 성공 시 수정 완료 버튼 표시
                showFinishButton();
            } else {
                const { message } = await response.json();
                alert(`비밀번호 수정에 실패했습니다: ${message}`);
            }
        } catch (error) {
            console.error("Error updating password:", error);
            alert("비밀번호 수정 중 오류가 발생했습니다.");
        }
    });
});