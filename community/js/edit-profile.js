document.addEventListener("DOMContentLoaded", async () => {
    const changeButton = document.getElementById("changeProfile");
    const profileInput = document.getElementById("profile");
    const profileImagePreview = document.getElementById("previewImage");
    const emailElement = document.getElementById("email");
    const nicknameInput = document.getElementById("nickname");
    const helperText = document.getElementById("nicknameHelperText");
    const updateButton = document.getElementById("update");
    const finishButton = document.getElementById("finish");
    const myProfileImg = document.querySelector(".myProfile");
    const profileImage = document.querySelector(".myProfile");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const logoutButton = document.getElementById("logoutButton");
    const deleteAccountButton = document.getElementById("deleteAccount");

    let newProfileImage = null;
    let currentUserId = null;


    // 드롭다운 토글
    profileImage.addEventListener("click", (e) => {
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
                window.location.href = "/html/login.html";
            } else {
                alert("로그아웃에 실패했습니다.");
            }
        } catch (error) {
            console.error("Error logging out:", error);
            alert("로그아웃 중 오류가 발생했습니다.");
        }
    });
    

    // 사용자 프로필 데이터 가져오기
    try {
        const response = await fetch(`${BASE_URL}/api/users/profile`, {
            method: "GET",
            credentials: "include",
        });
        if (response.ok) {
            const user = await response.json();
            currentUserId = user.id; // 현재 사용자 ID 저장
            myProfileImg.src = user.profilePic 
            ? `${BASE_URL}${user.profilePic}` 
            : '/images/profile_img.webp';
            profileImagePreview.src = user.profilePic 
            ? `${BASE_URL}${user.profilePic}` 
            : '/images/profile_img.webp';
            emailElement.textContent = user.email || "-";
            nicknameInput.value = user.nickname || "";
        } else {
            alert("사용자 정보를 가져올 수 없습니다.");
        }
    } catch (error) {
        console.error("Error fetching profile data:", error);
        alert("프로필 데이터를 불러오는 중 오류가 발생했습니다.");
    }

    // 닉네임 중복 확인 함수
    const isNicknameDuplicate = async (nickname) => {
        try {
            const response = await fetch(`/api/profile/check-nickname?nickname=${encodeURIComponent(nickname)}`);
            if (response.ok) {
                const { isDuplicate } = await response.json();
                return isDuplicate;
            } else {
                console.warn("닉네임 중복 확인에 실패했습니다.");
                return false;
            }
        } catch (error) {
            console.error("Error checking nickname duplication:", error);
            return false;
        }
    };

    // 헬퍼 텍스트 표시 함수
    const showHelperText = (message) => {
        helperText.textContent = message;
        helperText.style.visibility = "visible";
        helperText.style.opacity = "1";
    };

    // 헬퍼 텍스트 숨기기 함수
    const hideHelperText = () => {
        helperText.textContent = "";
        helperText.style.visibility = "hidden";
        helperText.style.opacity = "0";
    };

    // 프로필 사진 변경
    changeButton.addEventListener("click", () => {
        profileInput.click();
    });

    profileInput.addEventListener("change", () => {
        const file = profileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                newProfileImage = e.target.result; // 새 이미지 저장
                profileImagePreview.src = newProfileImage; // 미리보기 업데이트
            };
            reader.readAsDataURL(file);
        } else {
            alert("이미지를 선택하지 않았습니다.");
        }
    });

    // 수정하기 버튼 클릭
    updateButton.addEventListener("click", async () => {
        const nickname = nicknameInput.value.trim();

        // 닉네임 유효성 검사
        if (!nickname) {
            showHelperText("*닉네임을 입력해주세요.");
            return;
        }

        if (nickname.length > 10) {
            showHelperText("*닉네임은 최대 10자까지 작성 가능합니다.");
            return;
        }

        const isDuplicate = await isNicknameDuplicate(nickname);
        if (isDuplicate) {
            showHelperText("*중복된 닉네임 입니다.");
            return;
        }

        // 유효성 검사 통과
        hideHelperText();

        try {
            // 서버로 데이터 전송
            const formData = new FormData();
            formData.append("nickname", nickname);
            if (profileInput.files[0]) {
                formData.append("profilePic", profileInput.files[0]);
            }

            const updateResponse = await fetch(`${BASE_URL}/api/users/profile/update`, {
                method: 'PUT',
                body: formData,
                credentials: 'include',
            });

            if (updateResponse.ok) {
                const updatedUser = await updateResponse.json();
                myProfileImg.src = updatedUser.profilePic || "/images/profile_img.webp"; // 헤더 이미지 업데이트
                alert("프로필이 성공적으로 수정되었습니다.");

                // 수정 완료 버튼 표시
                finishButton.style.opacity = "1";
                finishButton.style.visibility = "visible";

                // 3초 후 수정 완료 버튼 숨기기
                setTimeout(() => {
                    finishButton.style.opacity = "0";
                    finishButton.style.visibility = "hidden";
                }, 3000);

                // 드롭다운 메뉴의 프로필 정보도 업데이트
                updateProfile(updatedUser);
            } else {
                alert("프로필 수정에 실패했습니다.");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("프로필 수정 중 오류가 발생했습니다.");
        }
    });


    // 회원 탈퇴
    deleteAccountButton.addEventListener("click", () => {
        openModal(
            "회원탈퇴 하시겠습니까?",
            "작성된 게시글과 댓글은 삭제됩니다.",
            async () => {
                try {
                    const response = await fetch(`${BASE_URL}/api/users/profile/delete`, {
                        method: "DELETE",
                        credentials: "include",
                    });

                    if (response.ok) {
                        alert("회원 탈퇴가 완료되었습니다.");
                        window.location.href = "/html/login.html"; // 로그인 페이지로 이동
                    } else {
                        const { message } = await response.json();
                        alert(`회원 탈퇴 실패: ${message}`);
                    }
                } catch (error) {
                    console.error("회원 탈퇴 중 오류 발생:", error);
                    alert("회원 탈퇴 중 오류가 발생했습니다.");
                }
            }
        );
    });
});

// 프로필 업데이트 함수
function updateProfile(user) {
    const updateProfileImg = document.querySelector(".myProfile");
    const updateNickname = document.getElementById("dropdownNickname");

    if (updateProfileImg) {
        const updatedProfilePic = user.profilePic 
        ? `${BASE_URL}${user.profilePic}` 
        : "/images/profile_img.webp";
    updateProfileImg.src = updatedProfilePic;    }

    if (updateNickname) {
        updateNickname.textContent = user.nickname || "닉네임 없음";
    }
}
