document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('id');
    const passwordInput = document.getElementById('pw');
    const loginButton = document.getElementById('login');
    const helperText = document.getElementById('helperText');

    // 이메일 유효성 검사 함수
    function validateEmail() {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput.value.trim() === '') {
            helperText.textContent = '*이메일을 입력해주세요.';
            helperText.style.display = 'block';
            return false;
        } else if (!emailPattern.test(emailInput.value.trim())) {
            helperText.textContent = '*올바른 이메일 주소 형식을 입력해주세요.';
            helperText.style.display = 'block';
            return false;
        }
        helperText.style.display = 'none';
        return true;
    }

    // 비밀번호 유효성 검사 함수
    function validatePassword() {
        if (passwordInput.value.trim() === '') {
            helperText.textContent = '*비밀번호를 입력해주세요.';
            helperText.style.display = 'block';
            return false;
        }
        helperText.style.display = 'none';
        return true;
    }

    // 전체 유효성 검사 함수
    function validateForm() {
        if (validateEmail() && validatePassword()) {
            loginButton.disabled = false;
            loginButton.classList.add('active');
        } else {
            loginButton.disabled = true;
            loginButton.classList.remove('active');
        }
    }

    // 입력 이벤트에 유효성 검사 연결
    emailInput.addEventListener('input', validateForm);
    passwordInput.addEventListener('input', validateForm);

    // 로그인 버튼 클릭 시 서버로 로그인 요청
    loginButton.addEventListener('click', () => {
        const email = emailInput.value;
        const password = passwordInput.value;

        console.log('Login Attempt:', { email, password });

        // 서버로 로그인 요청 보내기
        fetch(`${BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // 세션 쿠키를 함께 전송
            body: JSON.stringify({ email, password })
        })
            .then(response => {
                console.log('Server Response:', response);
                if (response.ok) {
                    return response.json();
                } else if (response.status === 401) {
                    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
                } else {
                    throw new Error('서버 오류가 발생했습니다.');
                }
            })
            .then(data => {
                alert(`로그인에 성공하였습니다.`);
                // 로그인 성공 시 다른 페이지로 이동
                window.location.href = '/html/posts.html';
            })
            .catch(error => {
                console.error('Error:', error.message);
                helperText.textContent = error.message;
                helperText.style.display = 'block';
            });
        });

     // 로그인 버튼 클릭 시 서버로 로그인 요청 (Mock데이터)
    // loginButton.addEventListener('click', async () => {
    //     const email = emailInput.value;
    //     const password = passwordInput.value;

    //     console.log('Login Attempt:', { email, password });

    //     try {
    //         // JSON 파일에서 Mock 데이터 가져오기
    //         const response = await fetch('/data/users.json');
            
    //         if (!response.ok) {
    //             throw new Error('사용자 데이터를 불러올 수 없습니다.');
    //         }

    //         const users = await response.json(); // JSON 데이터 파싱
    //         console.log('Fetched Users:', users);

    //         // 사용자 검증
    //         const user = users.find(u => u.email === email && u.password === password);
    //         if (user) {
    //             alert(`${user.nickname}님, 환영합니다!`);
    //             window.location.href = '/html/posts.html'; // 성공 시 이동
    //         } else {
    //             helperText.textContent = '이메일 또는 비밀번호가 일치하지 않습니다.';
    //             helperText.style.display = 'block';
    //         }
    //     } catch (error) {
    //         console.error('Error:', error.message);
    //         helperText.textContent = '로그인 처리 중 오류가 발생했습니다.';
    //         helperText.style.display = 'block';
    //     }
    // });
});
