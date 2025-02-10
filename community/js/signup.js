const profileInput = document.getElementById('profile');
const profileIcon = document.querySelector('.profileIcon');
const emailInput = document.getElementById('id');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('pwCheck');
const nicknameInput = document.getElementById('nickname');
const signupButton = document.getElementById('signupButton');

const profileHelper = document.getElementById('profileHelper');
const emailHelper = document.getElementById('emailHelper');
const passwordHelper = document.getElementById('passwordHelper');
const confirmPasswordHelper = document.getElementById('checkPasswordHelper');
const nicknameHelper = document.getElementById('nicknameHelper');

// 미리보기 설정
profileInput.addEventListener('change', () => {
    const file = profileInput.files[0];
    const imageBox = document.querySelector('.imageBox');
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageBox.style.backgroundImage = `url(${e.target.result})`;
            imageBox.style.backgroundSize = 'cover';
            imageBox.style.backgroundPosition = 'center';
            profileIcon.style.display = 'none'; // 이미지가 있을 때 plus 아이콘 숨김
        };
        reader.readAsDataURL(file);
    } else {
        imageBox.style.backgroundImage = ''; // 파일이 없을 때 초기화
        profileIcon.style.display = 'block'; // 이미지가 없으면 plus 아이콘 표시
    }
    validateProfile();
    checkFormValidity();
});

// 유효성 검사 함수들
function validateProfile() {
    if (!profileInput.files.length) {
        profileHelper.style.display = 'block';
        return false;
    }
    profileHelper.style.display = 'none';
    return true;
}

function validateEmail() {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailInput.value) {
        emailHelper.textContent = '*이메일을 입력해주세요.';
        emailHelper.style.display = 'block';
        return false;
    } else if (!emailPattern.test(emailInput.value)) {
        emailHelper.textContent = '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)';
        emailHelper.style.display = 'block';
        return false;
    }
    emailHelper.style.display = 'none';
    return true;
}

function validatePassword() {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (!passwordInput.value) {
        passwordHelper.textContent = '*비밀번호를 입력해주세요.';
        passwordHelper.style.display = 'block';
        return false;
    } else if (!passwordPattern.test(passwordInput.value)) {
        passwordHelper.textContent = '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
        passwordHelper.style.display = 'block';
        return false;
    }
    passwordHelper.style.display = 'none';
    return true;
}

function validateConfirmPassword() {
    if (!confirmPasswordInput.value) {
        confirmPasswordHelper.textContent = '*비밀번호를 한번 더 입력해주세요';
        confirmPasswordHelper.style.display = 'block';
        return false;
    } else if (confirmPasswordInput.value !== passwordInput.value) {
        confirmPasswordHelper.textContent = '*비밀번호가 다릅니다.';
        confirmPasswordHelper.style.display = 'block';
        return false;
    }
    confirmPasswordHelper.style.display = 'none';
    return true;
}

function validateNickname() {
    const nicknamePattern = /^[^\s]{1,10}$/;
    if (!nicknameInput.value) {
        nicknameHelper.textContent = '*닉네임을 입력해주세요.';
        nicknameHelper.style.display = 'block';
        return false;
    } else if (/\s/.test(nicknameInput.value)) {
        nicknameHelper.textContent = '*띄어쓰기를 없애주세요';
        nicknameHelper.style.display = 'block';
        return false;
    } else if (nicknameInput.value.length > 10) {
        nicknameHelper.textContent = '*닉네임은 최대 10자 까지 작성 가능합니다.';
        nicknameHelper.style.display = 'block';
        return false;
    }
    nicknameHelper.style.display = 'none';
    return true;
}

// 회원가입 버튼 활성화
function checkFormValidity() {
    if (validateProfile() && validateEmail() && validatePassword() && validateConfirmPassword() && validateNickname()) {
        signupButton.disabled = false;
        signupButton.classList.add('active');
    } else {
        signupButton.disabled = true;
        signupButton.classList.remove('active');
    }
}

// 개별 유효성 검사 실행
profileInput.addEventListener('change', () => {
    validateProfile();
    checkFormValidity();
});

emailInput.addEventListener('input', () => {
    validateEmail();
    checkFormValidity();
});

passwordInput.addEventListener('input', () => {
    validatePassword();
    checkFormValidity();
});

confirmPasswordInput.addEventListener('input', () => {
    validateConfirmPassword();
    checkFormValidity();
});

nicknameInput.addEventListener('input', () => {
    validateNickname();
    checkFormValidity();
});

// 회원가입 버튼 클릭 시 회원 정보 저장 및 로그인 페이지로 이동
signupButton.addEventListener('click', () => {
    // FormData 생성
    const formData = new FormData();
    formData.append('email', emailInput.value);
    formData.append('password', passwordInput.value);
    formData.append('nickname', nicknameInput.value);
    if (profileInput.files[0]) {
        formData.append('profilePic', profileInput.files[0]); // 프로필 사진 추가
    }

    // 서버로 데이터 전송
    fetch(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        body: formData,
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(err => {
                    throw new Error(err.message || '회원가입에 실패하였습니다.');
                });
            }
        })
        .then(data => {
            alert(data.message);
            window.location.href = '/html/login.html'; // 회원가입 성공 시 로그인 페이지로 이동
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message);
        });
});
