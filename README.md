# 사무실 자재 관리 앱 — 완전 초보자용 설치 가이드

낯선 용어 하나도 없이, 클릭하는 순서까지 다 적어놨어요. 순서대로만 따라오시면 돼요.
프로젝트 ID(`sk-gangnam-center-ms`)는 이미 파일에 넣어놨어요.

---

## 준비물 설치 (한 번만 하면 됨)

### 1) Node.js 설치
- https://nodejs.org 접속
- 초록색 큰 버튼 (LTS 라고 써있는 것) 눌러서 다운로드
- 다운로드된 파일 더블클릭 → "다음, 다음, 설치" 눌러서 그냥 기본값으로 설치

### 2) Git 설치
- https://git-scm.com/downloads 접속
- 본인 컴퓨터(Windows/Mac)에 맞는 걸 다운로드 → 설치 (역시 그냥 다음, 다음)

### 3) 코드 에디터 설치 (파일 내용을 수정할 때 씀)
- https://code.visualstudio.com 접속 → 다운로드 → 설치
- "VS Code" 라는 프로그램이에요. 메모장보다 편해서 이걸 추천해요.

### 4) GitHub 계정 만들기
- https://github.com 접속 → 우측 상단 "Sign up" → 이메일로 가입

---

## 1단계. 압축 파일 풀기
- 제가 드린 `asset-manager-app.zip` 파일을 다운로드
- 바탕화면에 압축 풀기 (마우스 우클릭 → "압축 풀기" 또는 "Extract Here")
- `asset-manager-app` 이라는 폴더가 바탕화면에 생겨요

## 2단계. VS Code로 폴더 열기
- VS Code 프로그램 실행
- 왼쪽 위 `File` (또는 `파일`) 메뉴 → `Open Folder` (`폴더 열기`)
- 바탕화면의 `asset-manager-app` 폴더 선택

왼쪽에 파일 목록이 쭉 보이면 성공이에요.

## 3단계. Firebase에서 나머지 값 3개 받아오기
지금 파일엔 `projectId`만 미리 넣어놨고, 3개 값(`apiKey`, `messagingSenderId`, `appId`)은 본인 Firebase 프로젝트에서 직접 복사해와야 해요.

1. https://console.firebase.google.com 접속 (Google 계정으로 로그인)
2. `sk-gangnam-center-ms` 프로젝트가 이미 있으면 클릭해서 들어가고, 없으면 "프로젝트 추가"로 똑같은 이름으로 새로 만드세요
3. 왼쪽 메뉴에서 **Firestore Database** 클릭 → 아직 없으면 "데이터베이스 만들기" → **테스트 모드**로 시작 (다음, 다음 눌러서 그냥 진행)
4. 왼쪽 위 톱니바퀴 아이콘 클릭 → **프로젝트 설정** 클릭
5. 화면을 아래로 내리면 "내 앱" 이라는 부분이 나와요
   - 이미 앱이 등록되어 있으면 그 앱 클릭
   - 없으면 `</>` 모양(웹) 아이콘 클릭 → 앱 이름 아무거나 입력 → "앱 등록" 클릭
6. 화면에 이런 식으로 나오는 코드가 보일 거예요:
```js
const firebaseConfig = {
  apiKey: "AIzaSy....",
  authDomain: "sk-gangnam-center-ms.firebaseapp.com",
  projectId: "sk-gangnam-center-ms",
  storageBucket: "sk-gangnam-center-ms.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```
여기서 **apiKey, messagingSenderId, appId** 세 줄의 값(따옴표 안의 내용)을 복사하세요.

## 4단계. 복사한 값 붙여넣기
- VS Code 왼쪽 파일 목록에서 `src` 폴더 클릭 → `firebase.js` 파일 클릭
- 화면에 열린 내용에서 `YOUR_API_KEY`, `YOUR_SENDER_ID`, `YOUR_APP_ID` 라고 써있는 부분을 3단계에서 복사한 값으로 바꿔치기 (따옴표는 그대로 두고 안의 내용만 교체)
- 다 바꿨으면 키보드 `Ctrl + S` (Mac은 `Cmd + S`) 눌러서 저장

## 5단계. 터미널 열고 명령어 입력하기
"터미널"은 글자로 명령어를 입력하는 검은 창이에요. VS Code 안에 이미 있어요.

- VS Code 위쪽 메뉴에서 `Terminal` (`터미널`) → `New Terminal` (`새 터미널`) 클릭
- 화면 아래에 입력창이 하나 생겨요. 여기에 아래 명령어들을 한 줄씩 입력하고 Enter를 누르세요 (실행이 끝날 때까지 기다렸다가 다음 줄 입력)

```
npm install
```
(여러 파일 다운받는 과정이라 1~2분 걸려요. 끝날 때까지 기다리세요)

```
npm run dev
```
이 명령을 실행하면 화면에 `http://localhost:5173` 같은 주소가 떠요. 그 주소를 마우스로 클릭하거나 복사해서 브라우저에 붙여넣으면 지금까지 만든 화면이 실제로 뜨는지 확인할 수 있어요.

확인했으면 터미널에서 `Ctrl + C` 눌러서 멈추세요.

## 6단계. Firebase 명령어 도구 설치 + 로그인
터미널에 아래 순서로 입력하세요.

```
npm install -g firebase-tools
```

```
firebase login
```
브라우저가 자동으로 열리면서 Google 로그인 화면이 떠요. Firebase 계정으로 로그인하고 "허용"을 눌러주세요.

## 7단계. Firestore 보안 규칙 배포
```
firebase deploy --only firestore:rules
```
"Deploy complete!" 라고 뜨면 성공이에요.

## 8단계. GitHub에 코드 올리기
1. https://github.com 접속 → 로그인 → 우측 상단 `+` 버튼 → `New repository`
2. Repository name에 `office-asset-manager` 입력 → `Create repository` 클릭
3. 만들어진 페이지에 나오는 주소를 복사해두세요 (예: `https://github.com/본인아이디/office-asset-manager.git`)
4. VS Code 터미널로 돌아와서 아래를 한 줄씩 입력 (마지막 줄의 주소는 3번에서 복사한 본인 주소로 바꾸세요):

```
git init
git add .
git commit -m "start"
git branch -M main
git remote add origin https://github.com/본인아이디/office-asset-manager.git
git push -u origin main
```
중간에 GitHub 아이디/비밀번호를 물어보면 입력하세요 (비밀번호 대신 "토큰"을 요구하면, GitHub가 화면에 안내하는 절차를 따라가면 돼요).

## 9단계. Firebase Hosting 연결 (자동 배포 설정)
터미널에 입력:
```
firebase init hosting
```
질문들이 순서대로 나와요, 이렇게 답하시면 돼요:
- `Please select an option` → 이미 있는 프로젝트 사용 (Use an existing project) 선택 → `sk-gangnam-center-ms` 선택
- `What do you want to use as your public directory?` → `dist` 입력 후 Enter
- `Configure as a single-page app?` → `y` (Yes) 입력
- `Set up automatic builds and deploys with GitHub?` → `y` (Yes) 입력
- GitHub 로그인 창이 뜨면 로그인 → 방금 만든 저장소(`office-asset-manager`) 선택
- 나머지 질문은 그냥 Enter (기본값)로 넘어가도 돼요

이 과정이 끝나면 GitHub에 자동으로 배포 설정 파일이 생기고, 앞으로 `git push` 할 때마다 자동으로 사이트가 업데이트돼요.

## 10단계. 완성된 주소 확인
- https://console.firebase.google.com → `sk-gangnam-center-ms` 프로젝트 → 왼쪽 메뉴 `Hosting`
- 여기 나오는 주소 (`https://sk-gangnam-center-ms.web.app` 형태)가 완성된 사이트예요
- 이 주소를 직원분들께 카톡/메신저로 보내주시면 바로 접속해서 쓸 수 있어요

---

## 막히는 부분이 생기면
어느 단계에서 막혔는지, 터미널이나 화면에 뭐라고 떴는지 캡처해서 알려주시면 그거 보고 바로 도와드릴게요.
