const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, 'community')));

// data 폴더를 정적 파일로 제공
app.use('/data', express.static(path.join(__dirname, 'data')));

// 첫 로딩 페이지를 login.html로 설정
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'community', 'html', 'login.html'));
});

// 로그인 페이지
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'community', 'html', 'login.html'));
});

// 회원가입 페이지
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'community', 'html', 'signup.html'));
});

// 게시글 목록 페이지
app.get('/posts', (req, res) => {
    res.sendFile(path.join(__dirname, 'community', 'html', 'posts.html'));
});

// 게시글 상세 페이지
app.get('/post/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'community', 'html', 'post.html'));
});

// 게시글 작성 페이지
app.get('/make-post', (req, res) => {
    res.sendFile(path.join(__dirname, 'community', 'html', 'make-post.html'));
});

// 게시글 수정 페이지
app.get('/edit-post/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'community', 'html', 'edit-post.html'));
});

// 프로필 수정 페이지
app.get('/edit-profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'community', 'html', 'edit-profile.html'));
});

// 비밀번호 수정 페이지
app.get('/edit-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'community', 'html', 'edit-password.html'));
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`✅ Frontend server running at http://localhost:${PORT}`);
});
