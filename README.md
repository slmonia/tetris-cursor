# tetris-cursor

Cursor Agent로 만든 **교육용 브라우저 테트리스** 프로젝트입니다.  
HTML, CSS, JavaScript만 사용하며 빌드 도구와 외부 라이브러리는 없습니다.

## 라이브 데모

GitHub Pages 배포 후 아래 주소에서 플레이할 수 있습니다.

```
https://<GitHub아이디>.github.io/tetris-cursor/
```

> 저장소 이름을 `tetris-cursor`로 만들어야 위 URL이 동작합니다.

## 실행 방법

### 방법 1: 파일 직접 열기

1. 이 폴더를 연다.
2. `index.html`을 더블클릭하거나 브라우저로 드래그한다.
3. **시작** 버튼을 누른 뒤 키보드로 조작한다.

### 방법 2: VS Code Live Server (선택)

1. VS Code에서 이 폴더를 연다.
2. `index.html` 우클릭 → **Open with Live Server**

### 방법 3: GitHub Pages

아래 [GitHub Pages 배포 방법](#github-pages-배포-방법)을 참고한다.

## 조작법

| 키 | 동작 |
|----|------|
| `ArrowLeft` | 왼쪽 이동 |
| `ArrowRight` | 오른쪽 이동 |
| `ArrowDown` | 한 칸 빠르게 내리기 |
| `ArrowUp` | 회전 |
| `Space` | 즉시 낙하 (Hard Drop) |

- **시작**을 누르기 전에는 키보드 조작이 동작하지 않습니다.
- 충돌이 발생하는 이동·회전은 적용되지 않습니다.
- **재시작**으로 보드와 점수를 초기화합니다. (재시작 후 **시작**을 다시 눌러야 합니다.)
- 게임 오버 후에는 **재시작** → **시작** 순서로 다시 플레이합니다.

## 구현 기능

| 기능 | 설명 |
|------|------|
| 게임 보드 | 10열 × 20행 CSS Grid |
| 블록 | I, O, T, S, Z, J, L 7종 |
| 자동 낙하 | 0.8초 간격 |
| 충돌 판정 | `canMove()` — 경계·고정 블록 검사 |
| 키보드 조작 | 이동, 회전, 소프트/하드 드롭 |
| 라인 삭제 | 가득 찬 줄 제거 후 위 줄 하강 |
| 점수 | 삭제 줄 수에 따라 가산 (아래 표 참고) |
| 게임 오버 | 새 블록 스폰 불가 시 종료 + 오버레이 |
| 재시작 | 보드·점수·타이머·상태 초기화 |

### 점수 규칙

| 삭제 줄 수 | 점수 |
|-----------|------|
| 1줄 | 100 |
| 2줄 | 300 |
| 3줄 | 500 |
| 4줄 (테트리스) | 800 |

## 파일 구조

```
tetris-cursor/
├── index.html          # 페이지 구조
├── style.css           # 스타일
├── script.js           # 게임 로직
├── README.md           # 프로젝트 문서
├── .gitignore
└── .cursor/commands/   # Cursor 품질 점검 Command (선택)
```

## 품질 점검 방법

Cursor 채팅(Agent 모드)에서 `/` + Command 이름으로 품질 게이트를 실행합니다.

### 4장 — 핵심 기능

| Command | 점검 내용 |
|---------|-----------|
| `/review-structure` | 프로젝트 골격·파일 분리 |
| `/code-review` | 보드·블록 렌더링 |
| `/review-game-logic` | 낙하·충돌·조작 |
| `/qa-playtest` | 라인삭제·점수·게임오버 |
| `/bug-hunt` | 고위험 버그 탐색 |
| `/refactor-safe` | 기능 유지 구조 개선 |
| `/release-check` | 배포 전 최종 점검 |

### 5장 — 고도화 (선택)

| Command | 점검 내용 |
|---------|-----------|
| `/review-audio` | BGM·효과음 |
| `/review-mobile` | 모바일·터치 |
| `/perf-audit` | 성능 |
| `/a11y-check` | 접근성 |

### 수동 스모크 테스트

1. **시작** → 블록이 자동으로 내려오는지 확인
2. 방향키·Space로 조작되는지 확인
3. 한 줄을 채워 점수 +100 확인
4. 보드를 가득 채워 게임 오버 확인
5. **재시작** → **시작**으로 재개 확인
6. F12 Console에 오류가 없는지 확인

## GitHub Pages 배포 방법

### 1. 저장소 생성

1. GitHub에서 새 저장소를 만든다.
2. Repository name: **`tetris-cursor`**
3. Public 선택, README는 추가하지 않는다 (로컬에 있음).

### 2. 로컬에서 Git 초기화 및 푸시

```bash
cd tetris-cursor
git init
git add index.html style.css script.js README.md .gitignore
git add .cursor/commands/
git commit -m "Add tetris-cursor browser game"
git branch -M main
git remote add origin https://github.com/<GitHub아이디>/tetris-cursor.git
git push -u origin main
```

### 3. Pages 설정

1. 저장소 → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **`main`** / **`/ (root)`**
4. Save

1~2분 후 `https://<GitHub아이디>.github.io/tetris-cursor/` 에서 확인한다.

### 배포 시 주의사항

- CSS/JS는 **상대 경로**(`style.css`, `script.js`)를 사용해야 합니다. (`/style.css`처럼 루트 절대 경로는 저장소 이름이 URL에 포함될 때 깨질 수 있습니다.)
- `index.html`은 저장소 **루트**에 있어야 합니다.

## 라이선스

교육용 프로젝트입니다.
