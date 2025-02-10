document.addEventListener('DOMContentLoaded', async () => {
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const updateButton = document.getElementById('update');
    const contentHelperText = document.getElementById('contentHelperText');
    const profileInput = document.getElementById('profile');
    const myProfileImg = document.querySelector('.myProfile');
    const urlParams = new URLSearchParams(window.location.search);
    let currentUserId = null;

    let postId = new URLSearchParams(window.location.search).get('id');

    if (!postId) {
        postId = localStorage.getItem("currentPostId");
        console.log(`Loaded postId from localStorage: ${postId}`);
    }

    if (!postId) {
        alert('게시글 ID를 찾을 수 없습니다.');
        history.back();
        return;
    }

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

    // 게시글 데이터 렌더링
    function renderPost(post) {
        titleInput.value = post.title || "";
        contentInput.value = post.content || "";

        if (post.image) {
            // 파일 이름 표시
            const fileNameDisplay = document.createElement("span");
            fileNameDisplay.textContent = post.image.split('/').pop(); // 이미지 파일명 추출
            fileNameDisplay.style.display = "block";
            fileNameDisplay.style.marginTop = "10px";
            fileNameDisplay.style.color = "#333";
            profileInput.insertAdjacentElement("afterend", fileNameDisplay);
    
        }
    }

    // 게시글 데이터 가져오기
    async function loadPost() {
        try {
            const response = await fetch(`${BASE_URL}/api/posts/${postId}`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const post = await response.json();
                if (post.userId !== currentUserId) {
                    alert("수정 권한이 없습니다.");
                    history.back();
                    return;
                }
                renderPost(post);
            } else {
                alert("게시글을 불러오지 못했습니다.");
                history.back();
            }
        } catch (error) {
            console.error("Error fetching post data:", error.message);
        }
    }

    await loadProfile();
    await loadPost();

    // 입력값 유효성 검사
    function validateForm() {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        const isTitleValid = title.length > 0 && title.length <= 26;
        const isContentValid = content.length > 0;

        contentHelperText.textContent = isTitleValid && isContentValid
            ? ""
            : "*제목, 내용을 모두 작성해주세요.";

        const isValid = isTitleValid && isContentValid;
        updateButton.disabled = !isValid;
        updateButton.style.backgroundColor = isValid ? "#7f6aee" : "#aca0eb";
    }

    titleInput.addEventListener("input", validateForm);
    contentInput.addEventListener("input", validateForm);

    // 수정 버튼 클릭 이벤트
    updateButton.addEventListener("click", async () => {
        if (!updateButton.disabled) {
            const formData = new FormData();
            formData.append("title", titleInput.value.trim());
            formData.append("content", contentInput.value.trim());
            if (profileInput.files[0]) {
                formData.append("image", profileInput.files[0]);
            }

            try {
                const response = await fetch(`${BASE_URL}/api/posts/${postId}`, {
                    method: "PUT",
                    body: formData,
                    credentials: "include", // 세션 정보 포함
                });

                if (response.ok) {
                    const { post } = await response.json();
                    alert("게시글이 수정되었습니다.");
                    window.location.href = `/html/post.html?id=${post.id}`;
                } else {
                    alert("게시글 수정에 실패했습니다.");
                }
            } catch (error) {
                console.error("Error updating post:", error);
            }
        }
    });

    validateForm(); // 초기 유효성 검사
});