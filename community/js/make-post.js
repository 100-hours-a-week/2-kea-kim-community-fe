document.addEventListener('DOMContentLoaded', async () => {
    const myProfileImg = document.querySelector('.myProfile');

    // try {
    //     // 현재 사용자 정보 가져오기
    //     const response = await fetch('/api/profile');
    //     if (response.ok) {
    //         const user = await response.json();

    //         // 헤더에 프로필 이미지와 닉네임 표시
    //         myProfileImg.src = user.profilePic || '/images/profile_img.webp';
    //     } else {
    //         console.warn('로그인되지 않은 상태입니다.');
    //         myProfileImg.src = '/images/profile_img.webp';
    //         headerTitle.textContent = '로그인 후 이용해 주세요.';
    //     }
    // } catch (error) {
    //     console.error('Error fetching profile data:', error);
    // }

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

                const profileImageUrl = user.profilePic 
                    ? `${BASE_URL}${user.profilePic}` 
                    : '/images/profile_img.webp';

                myProfileImg.src = profileImageUrl;
                myProfileImg.title = `${user.nickname} 님의 프로필`;
            } else if (response.status === 401) {
                console.warn('Unauthorized: 로그인 필요');
                myProfileImg.src = '/images/profile_img.webp';
                myProfileImg.title = '로그인이 필요합니다.';
                // alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
                // window.location.href = '/html/login.html';
            } else {
                throw new Error('Failed to fetch profile');
            }
        } catch (error) {
            console.error('Error fetching profile data:', error.message);
            myProfileImg.src = '/images/profile_img.webp';
            myProfileImg.title = '오류 발생';
        }
    }

    // 프로필 정보 로드
    await loadProfile();


    // 게시글 작성 처리
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const submitButton = document.getElementById('submit');
    const profileInput = document.getElementById('profile'); 
    const helperText = document.querySelector('.helperText');

    

    // 제목 글자 수 제한
    titleInput.addEventListener('input', () => {
        if (titleInput.value.length > 26) {
            alert('제목은 최대 26글자까지 입력 가능합니다.');
            titleInput.value = titleInput.value.substring(0, 26);
        }
        updateButtonState();
    });

    const updateButtonState = () => {
        if (titleInput.value.trim() && contentInput.value.trim()) {
            submitButton.classList.add('active');
            helperText.style.display = 'none';
        } else {
            submitButton.classList.remove('active');
        }
        submitButton.disabled = false;
    };

    titleInput.addEventListener('input', updateButtonState);
    contentInput.addEventListener('input', updateButtonState);

    submitButton.addEventListener('click', async (event) => {
        event.preventDefault();

        if (!titleInput.value.trim() || !contentInput.value.trim()) {
            helperText.style.display = 'block';
            return;
        }

        const formData = new FormData();
        formData.append('title', titleInput.value);
        formData.append('content', contentInput.value);

        if (profileInput.files[0]) {
            formData.append('image', profileInput.files[0]);
        }

        try {
            const response = await fetch(`${BASE_URL}/api/posts`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message);
                // 게시글 작성 후 프로필 갱신 및 게시글 목록 리다이렉트
                await loadProfile();
                window.location.href = '/html/posts.html';
            } else {
                const error = await response.json();
                alert(error.message || '게시글 작성 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('서버와의 연결에 문제가 발생했습니다.');
        }
    });
});