# EyeMatch Extension

EyeMatch는 사용자의 웹페이지 시선 데이터를 기반으로, 시선이 오래 머무른 영역을 자동으로 수집하고 요약하는 크롬 확장 프로그램이다.

이미지에는 캡셔닝을 적용하고, 텍스트에는 요약을 적용하여 사용자의 관심 정보를 지능적으로 가공한다.

---

## 주요 기능

- 시선 기반 DOM 요소 추적 (Seeso SDK 연동)
- 오래 머문 요소 자동 수집 (이미지/텍스트 분류)
- 이미지에 대한 캡셔닝 수행 (BLIP 기반 PyTorch 모델 사용)
- LLM 기반 요약 기능 (LangChain 활용)
- IndexedDB에 요소 및 요약 결과 저장
- 요약 결과를 콘솔에 출력 (향후 UI 연동 예정)

---

## 기술 스택

### Frontend (Chrome Extension)

- Manifest V3
- Seeso SDK
- IndexedDB
- PostMessage (iframe cross-origin 우회)
- getBoundingClientRect, MutationObserver 등

### Backend (Flask API)

- Python 3.10+
- Flask
- BLIP (이미지 캡셔닝)
- LangChain

### Infrastructure

- NVIDIA RTX 2080 Ti × 8
- CUDA 12.1 + PyTorch 2.x
- VSCode (원격 Linux 서버 환경에서 개발)

---

## 프로젝트 구조
```
EyeMatch/
├── extension/             # 크롬 확장 프로그램
│   ├── background.js      # 백그라운드 서비스 워커
│   ├── content.js         # 콘텐츠 스크립트 (시선 데이터 수집 및 전송)
│   ├── getDOM.js          # DOM 구조 추출 스크립트
│   ├── icon.png           # 확장 프로그램 아이콘
│   ├── manifest.json      # 확장 프로그램 설정 파일 (Manifest V3)
│   ├── popup.html         # 확장 프로그램 팝업 UI
│   └── popup.js           # 팝업 UI 로직
│
└── server/                # 서버 측 캡셔닝 및 요약 기능
   ├── server.py          # Flask 기반 서버 엔트리 포인트
   ├── test.py            # 테스트 스크립트 또는 예제 요청 코드
   └── image.jpg          # 예제 이미지 (캡셔닝 테스트용)
```
## 설치 및 실행 방법

### 1. 크롬 확장 프로그램 설치

1. 크롬 브라우저를 실행한다
2. `chrome://extensions/`에 접속한다
3. 우측 상단에서 "개발자 모드"를 활성화한다
4. `extension/` 폴더를 "압축해제된 확장 프로그램"으로 로드한다

### 2. 서버 실행 (Flask)

```bash
cd server
python server.py
```

※ BLIP 모델 및 GPU 환경이 필요한 경우, 사전 모델 다운로드 및 CUDA 설치가 필요하다

## 작동 방식 요약

1. 사용자가 웹페이지를 탐색하면 시선 데이터가 수집된다
2. 시선이 오래 머문 DOM 요소가 자동으로 탐지된다
3. 이미지 요소는 서버로 전송되어 캡셔닝이 수행된다
4. ~~수집된 요소가 10개 이상일 경우~~ 서버에 요약 요청을 보낸다 (구현중)
5. 생성된 요약 결과는 콘솔에 출력되고 IndexedDB에 저장된다

## 향후 계획

- 요약 결과를 UI에 연동 (콘솔 출력 → 팝업 페이지)
- 시선 히트맵 시각화 기능 추가
- 사용자 피드백 기반 요약 품질 개선
- PDF 및 뉴스 페이지 등 특수 콘텐츠 대응 기능 추가

## 라이선스

MIT License를 따른다.

단, GPT API 및 Seeso SDK는 각각의 라이선스 조건을 따른다.
