document.addEventListener('DOMContentLoaded', async () => {
    const myProfileImg = document.querySelector('.myProfile');
    const postContainer = document.getElementById('post-container');

    // 드롭다운
    const profileImage = document.querySelector(".myProfile");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const logoutButton = document.getElementById("logoutButton");

    // 드롭다운 토글
    profileImage.addEventListener("click", (e) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        dropdownMenu.classList.toggle("show");
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

    // 페이지 다른 영역 클릭 시 드롭다운 닫기
    window.addEventListener("click", () => {
        if (dropdownMenu.classList.contains("show")) {
            dropdownMenu.classList.remove("show");
        }
    });

    // 숫자 단위 변환 함수
    function formatCount(count) {
        if (count >= 100000) return Math.floor(count / 100000) + 'K';
        if (count >= 10000) return Math.floor(count / 10000) + 'K';
        if (count >= 1000) return Math.floor(count / 1000) + 'K';
        return count;
    }

    // 날짜 단위 변환 함수
    function formatDate(dateString) {
        const date = new Date(dateString);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    }

    // 사용자 정보 캐싱 (중복 호출 방지)
    const userCache = new Map();

    // 사용자 정보 불러오기
    async function loadUser(userId) {
        if (userCache.has(userId)) {
            return userCache.get(userId); // 캐시된 사용자 정보 반환
        }
        try {
            const response = await fetch(`${BASE_URL}/api/users/${userId}`);
            if (response.ok) {
                const user = await response.json();
                user.profilePic = user.profilePic 
                ? `${BASE_URL}${user.profilePic}` 
                : '/images/profile_img.webp';
                userCache.set(userId, user); // 캐시에 사용자 정보 저장
                return user;
            }
        } catch (error) {
        console.error(`❌ 사용자 정보 요청 오류 (userId: ${userId}):`, error);
        }
        return { nickname: '알 수 없는 사용자', profilePic: '/images/profile_img.webp' }; // 오류 시 기본값 반환
    }

    // 댓글 수 불러오기
    async function fetchCommentCount(postId) {
        try {
            const response = await fetch(`${BASE_URL}/api/posts/${postId}/comments`, {
                method: 'GET',
                credentials: 'include',
            });
            if (response.ok) {
                const comments = await response.json();
                return comments.length; // 댓글 수 반환
            } else {
                console.error(`Failed to fetch comments for post ${postId}: ${response.status}`);
                return 0;
            }
        } catch (error) {
            console.error(`Error fetching comment count for post ${postId}:`, error);
            return 0;
        }
    }

    // 게시글 렌더링 함수
    async function renderPosts(posts) {
        for (const post of posts) {
            const author = await loadUser(post.userId); // userId를 통해 사용자 정보 불러오기
            const commentCount = await fetchCommentCount(post.id); // 댓글 수 가져오기

            const postElement = document.createElement('div');
            postElement.classList.add('singlePost');
            postElement.innerHTML = `
                <div class="post-content">
                    <div class="post-title">
                        <strong class="post-title-text">${truncateTitle(post.title)}</strong>
                    </div>
                    <div class="post-header">
                        <span class="post-meta">
                            좋아요 ${formatCount(post.likes || 0)} · 댓글 ${formatCount(commentCount)} · 조회수 ${formatCount(post.views || 0)}
                        </span>
                        <span class="post-date">${formatDate(post.createdAt)}</span>
                    </div>
                </div>
                <div class="post-author">
                    <img class="writerProfile" src="${author.profilePic}" alt="${author.nickname}">
                    <span>${author.nickname}</span>
                </div>
            `;
            postElement.addEventListener('click', () => {
                location.href = `post.html?id=${post.id}`;
            });
            postContainer.appendChild(postElement);
        }
    }

    // 게시글 제목 길이 제한 
    function truncateTitle(title) {
        if (title.length > 26) {
            return title.substring(0, 26) + '...';
        }
        return title;
    }

    // 사용자 프로필 불러오기
    async function loadProfile() {
        try {
            const response = await fetch(`${BASE_URL}/api/users/profile`, {
                method: 'GET',
                credentials: 'include' // 세션 쿠키 전송
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
            } else {
                throw new Error('Failed to fetch profile');
            }
        } catch (error) {
            console.error('Error fetching profile data:', error.message);
            myProfileImg.src = '/images/profile_img.webp';
            myProfileImg.title = '오류 발생';
        }
    }
    
    // 게시글 데이터 불러오기
    async function loadPosts() {
        try {
            const response = await fetch(`${BASE_URL}/api/posts`, {
                method: 'GET',
                credentials: 'include' // 세션 쿠키 전송
            });

            if (response.ok) {
                const posts = await response.json();
                console.log('Posts Data:', posts);
                renderPosts(posts);
            } else {
                throw new Error('Failed to fetch posts');
            }
        } catch (error) {
            console.error('Error fetching posts:', error.message);
            postContainer.innerHTML = '<p>게시글을 불러오는 데 실패했습니다. 다시 시도해주세요.</p>';
        }
    }

    // 초기 데이터 로드
    await loadProfile();
    await loadPosts();
});