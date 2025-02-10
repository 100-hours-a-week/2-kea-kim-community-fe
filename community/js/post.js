document.addEventListener('DOMContentLoaded', async () => {
    const postContainer = document.querySelector('.post-container');
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id'); // URL에서 id 파라미터 추출
    const myProfileImg = document.querySelector('.myProfile'); // 프로필 이미지
    let currentUserId = null;

    const commentsSection = document.querySelector('.comments');
    const commentTextarea = document.getElementById('comment');
    const commentButton = document.getElementById('makeCommentButton');


    // 사용자 프로필 불러오기
    async function loadProfile() {
        if (currentUserId !== null) return; // 이미 불러온 경우 재호출 방지

        try {
            const response = await fetch(`${BASE_URL}/api/users/profile`, {
                method: 'GET',
                credentials: 'include' // 세션 쿠키 전송
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

    // 게시글 상세 데이터 렌더링
    if (!postId) {
        alert('유효하지 않은 게시글입니다.');
        history.back();
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/posts/${postId}`, {
            method: 'GET',
            credentials: 'include',
        });
        console.log('Fetching post data:', `${BASE_URL}/api/posts/${postId}`);
        if (response.ok) {
            const post = await response.json();
            console.log('Post data fetched successfully:', post);
            renderPost(post); // 게시글 데이터 렌더링
        } else {
            console.error('Failed to fetch post data:', response.status, response.statusText);
            alert('게시글을 불러오지 못했습니다.');
        }
    } catch (error) {
        console.error('Error fetching post data:', error);
    }

    // 댓글 불러오기
    try {
        const response = await fetch(`${BASE_URL}/api/posts/${postId}/comments`);
        if (response.ok) {
            const comments = await response.json();
            comments.forEach(renderComment);
        
        } else {
            console.warn('댓글을 불러오지 못했습니다.');
        }
    } catch (error) {
        console.error('Error fetching comments:', error);
    }

    // 댓글 등록 버튼 활성화/비활성화 로직
    commentTextarea.addEventListener('input', () => {
        const commentValue = commentTextarea.value.trim();
        if (commentValue.length > 0) {
            commentButton.style.backgroundColor = '#7F6AEE';
            commentButton.disabled = false;
        } else {
            commentButton.style.backgroundColor = '#ACA0EB';
            commentButton.disabled = true;
        }
    });

    // 댓글 등록/수정 로직
    commentButton.addEventListener('click', async () => {
        const text = commentTextarea.value.trim();
        if (text.length === 0) return;

        console.log('isEditing:', isEditing); // 디버깅 로그
        console.log('editCommentId:', editCommentId); // 디버깅 로그
    

        await loadProfile(); // 필요 시 사용자 정보를 다시 로드

        if (!currentUserId) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (isEditing) {
            // 댓글 수정 로직
            try {
                console.log('Editing comment with ID:', editCommentId); // 디버깅 로그

                const response = await fetch(`${BASE_URL}/api/posts/comments/${editCommentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ text }),
                });
    
                if (response.ok) {
                    alert("댓글이 수정되었습니다.");
                    const updatedComment = await response.json();
    
                    // 수정된 댓글 업데이트
                    const commentElement = document.querySelector(`.singleComment[data-id="${editCommentId}"]`);
                    if (commentElement) {
                        const commentTextElement = commentElement.querySelector('.comment-text');
                        commentTextElement.textContent = updatedComment.text;
                    }
    
                    resetCommentForm(); // 댓글 폼 초기화
                } else {
                    console.error('댓글 수정 실패:', await response.json());
                    alert('댓글 수정에 실패했습니다.');
                }
            } catch (error) {
                console.error('Error updating comment:', error);
            }
        } else {

    
        // 댓글 등록
        // postId를 숫자로 변환
        const numericPostId = parseInt(postId, 10);
        
        try {
            const response = await fetch(`${BASE_URL}/api/posts/${numericPostId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    text: text,
                    userId: currentUserId,
                }),
            });

            if (response.ok) {
                const newComment = await response.json();
                renderComment(newComment); // 새 댓글 렌더링
    
                commentTextarea.value = '';
                commentButton.style.backgroundColor = '#ACA0EB';
                commentButton.disabled = true;
    
                // 댓글 수 업데이트
                const commentCountElement = document.getElementById('comment-count');
                if (commentCountElement) {
                    const currentCount = parseInt(commentCountElement.textContent, 10) || 0;
                    commentCountElement.textContent = currentCount + 1; // 댓글 수 증가
                }
            } else {
                console.error('Response Error:', await response.json());

                alert('댓글 등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            }
        }
    });

    // 댓글 폼 초기화 함수
    function resetCommentForm() {
        console.log('Resetting comment form'); // 디버깅 로그

        isEditing = false;
        editCommentId = null;
        commentTextarea.value = '';
        commentButton.textContent = '댓글 등록';
        commentButton.style.backgroundColor = '#ACA0EB';
        commentButton.disabled = true;
    }


    // 게시글 렌더링
    async function renderPost(post) {
        const formattedContent = post.content.replace(/\r\n|\n/g, '<br>');
        const authorImageUrl = post.author?.profilePic 
            ? `${BASE_URL}${post.author.profilePic}` 
            : '/images/profile_img.webp';
        const postImageUrl = post.image 
            ? `${BASE_URL}${post.image}` 
            : '/images/default-post.jpg';

        // 작성자와 현재 로그인 사용자가 같은지 비교
        const isAuthor = post.author?.id === currentUserId;

        // 댓글 수 불러오기
        const commentCount = await fetchCommentCount(post.id);

        // 좋아요 상태 불러오기
        const isLiked = post.isLiked || false;


        postContainer.innerHTML = `
            <div class="singlePost">
                <div class="post-title">
                    <strong>${truncateTitle(post.title)}</strong>
                </div>
                <div class="post-header">
                    <span class="post-data">
                    <span class="post-meta">
                        <div class="post-author">
                            <img class="writerProfile" src="${authorImageUrl}" alt="${post.author?.nickname || '알 수 없음'}">
                            <span>${post.author?.nickname || '알 수 없음'}</span>
                        </div>
                    </span>
                    <span class="post-date">${formatDate(post.createdAt)}</span>
                    </span>
                    ${isAuthor ? `
                    <span class="updateDelete">
                        <div class="postButtons">
                            <button class="updatePost" id="editButton">수정</button>
                        </div>
                        <div class="postButtons">
                            <button class="deletePost" onclick="openModal('게시글을 삭제하시겠습니까?', '삭제한 내용은 복구할 수 없습니다.', () => deletePost(${post.id}))">삭제</button>
                        </div>
                    </span>` : ''}
                </div>
                ${post.image ? `<div class="post-image"><img class="postImage" src="${postImageUrl}" alt="Post Image"></div>` : ''}
                 <div class="post-content">
                    <span>${formattedContent}</span>
                </div>
                <div class="post-count">
                    <button class="counts" id="likeButton" 
                            style="background-color: ${isLiked ? '#ACA0EB' : '#D9D9D9'}"
                            onclick="toggleLike(${post.id}, ${post.likes || 0}, ${isLiked})">
                            <span class="count" id="like-count">${formatNumber(post.likes || 0)}</span>
                            <span class="label">좋아요</span>                        
                        </button>
                    <div class="counts"><span class="count" id="view-count">${formatNumber(post.views || 0)}</span><span class="label">조회 수</span></div>
                    <div class="counts"><span class="count" id="comment-count">${commentCount}</span><span class="label">댓글</span></div>
                </div>
            </div>
        `;
        // "수정" 버튼 이벤트
        if (isAuthor) {
            const editButton = document.getElementById("editButton");
            editButton.addEventListener("click", () => {
                localStorage.setItem("currentPostId", post.id);
                localStorage.setItem("currentPostData", JSON.stringify(post));
                window.location.href = "/html/edit-post.html";
            });
        }
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
                console.error(`Failed to fetch comments: ${response.status}`);
                return 0;
            }
        } catch (error) {
            console.error('Error fetching comment count:', error);
            return 0;
        }
    }

    // 댓글 렌더링
    async function renderComment(comment) {
        try {
            // 작성자 정보 가져오기
            const response = await fetch(`${BASE_URL}/api/users/${comment.userId}`);
            let author = { nickname: '알수 없음', profilePic: '/images/profile_img.webp' }; // 기본값 설정
            if (response.ok) {
                const data = await response.json();
                console.log('Author data fetched:', data); // 디버깅
                author = data;
            } else {
                console.error(`Failed to fetch author data: ${response.status}`);
            }
            
         // 로그인한 사용자와 작성자 비교
        const isAuthor = comment.userId === currentUserId;

        // 프로필 이미지 URL 설정
        const profilePicUrl = author.profilePic ? `${BASE_URL}${author.profilePic}` : '/images/profile_img.webp';

         // 댓글 HTML 생성
        const commentHTML = `
            <div class="singleComment" data-id="${comment.id}">
                <div class="comment-header">
                    <span class="post-data">
                        <span class="post-meta">
                            <div class="post-author">
                                <img class="writerProfile" src="${profilePicUrl}" alt="${author.nickname}">
                                <span>${author.nickname}</span>
                            </div>
                        </span>
                        <span class="post-date">${formatDate(comment.createdAt)}</span>
                    </span>
                </div>
                <div class="comment-body">
                    <span class="comment-text">${comment.text}</span>
                    ${
                        isAuthor
                            ? `
                        <span class="updateDelete-comment">
                            <div class="commentButtons">
                                <button class="updateComment" 
                                    onclick="startEditComment('${comment.id}', document.getElementById('comment'), document.getElementById('makeCommentButton'))">
                                    수정
                                </button>                            
                            </div>
                            <div class="commentButtons">
                                <button class="deleteComment" onclick="openModal('댓글을 삭제하시겠습니까?', '삭제한 내용은 복구할 수 없습니다.', () => deleteComment('${comment.id}'))">삭제</button>
                            </div>
                        </span>
                        `
                            : ''
                    }
                </div>
            </div>
        `;
        commentsSection.insertAdjacentHTML('beforeend', commentHTML);
    } catch (error) {
        console.error('Error fetching author data:', error);
}
    }

    function truncateTitle(title) {
        return title.length > 26 ? `${title.substring(0, 26)}...` : title;
    }

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

    // 숫자 포맷 함수
    function formatNumber(num) {
        if (num >= 100000) return `${(num / 1000 / 100).toFixed(0)}00k`;
        if (num >= 10000) return `${(num / 1000).toFixed(0)}k`;
        if (num >= 1000) return `${Math.floor(num / 1000)}k`;
        return num;
    }

    
});

async function deletePost(id) {
    if (confirm('게시글을 삭제하시겠습니까?')) {
        try {
            const response = await fetch(`${BASE_URL}/api/posts/${id}`, { method: 'DELETE', credentials: 'include' });
            if (response.ok) {
                alert('게시글이 삭제되었습니다.');
                history.back();
            } else {
                alert('게시글 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    }
}

async function deleteComment(id) {
    try {
        const response = await fetch(`${BASE_URL}/api/posts/comments/${id}`, { 
            method: 'DELETE', 
            credentials: 'include' 
        });

        if (response.ok) {
            alert('댓글이 삭제되었습니다.');
            
            // 삭제된 댓글 요소를 DOM에서 제거
            const commentElement = document.querySelector(`.singleComment[data-id="${id}"]`);
            if (commentElement) {
                commentElement.remove();
            }

            // 댓글 수 업데이트
            const commentCountElement = document.getElementById('comment-count');
            if (commentCountElement) {
                const currentCount = parseInt(commentCountElement.textContent, 10) || 0;
                commentCountElement.textContent = Math.max(currentCount - 1, 0); // 댓글 수 감소
            }

        } else {
            const errorData = await response.json();
            alert(`댓글 삭제에 실패했습니다: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        alert('댓글 삭제 중 오류가 발생했습니다.');
    }
}


let isEditing = false; // 수정 모드인지 여부
let editCommentId = null; // 수정 중인 댓글 ID

// 댓글 수정 시작 함수
function startEditComment(commentId, textarea, button) {
    console.log('Start editing comment:', commentId); // 디버깅 로그

    // DOM에서 해당 댓글 요소를 찾음
    const commentElement = document.querySelector(`.singleComment[data-id="${commentId}"]`);
    if (!commentElement) {
        console.error('댓글 요소를 찾을 수 없습니다.');
        return;
    }

    // 최신 댓글 내용을 DOM에서 가져와서 표시
    const commentText = commentElement.querySelector('.comment-text').textContent.trim();

    // 댓글 입력창에 기존 댓글 내용 표시
    textarea.value = commentText;
    // 수정 상태 활성화
    isEditing = true;
    editCommentId = commentId;

    // 버튼 텍스트 변경 및 스타일 업데이트
    button.textContent = '댓글 수정';
    button.style.backgroundColor = '#7F6AEE';
    button.disabled = false;
}

async function toggleLike(postId, currentLikes, isLiked) {
    try {
        const response = await fetch(`${BASE_URL}/api/posts/${postId}/like`, {
            method: isLiked ? 'DELETE' : 'POST', // 좋아요 상태에 따라 POST 또는 DELETE 요청
            credentials: 'include',
        });

        if (response.ok) {
            const likeButton = document.getElementById('likeButton');
            const likeCountElement = document.getElementById('like-count');

            // 좋아요 수 업데이트
            const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1;

            likeCountElement.textContent = newLikes;
            likeButton.style.backgroundColor = isLiked ? '#D9D9D9' : '#ACA0EB';
            
            // 좋아요 상태 업데이트
            likeButton.setAttribute('onclick', `toggleLike(${postId}, ${newLikes}, ${!isLiked})`);

            // 상태 동기화
            isLiked = !isLiked; 
        } else {
            const errorData = await response.json();
            alert(`좋아요 상태 변경에 실패했습니다: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        alert('좋아요 상태 변경 중 오류가 발생했습니다.');
    }
}