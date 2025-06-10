# InnerPrompt - 감정 기반 저널링 도구

InnerPrompt는 사용자의 감정을 입력받아 맞춤형 저널링 질문을 제공하는 웹 애플리케이션입니다.

## 주요 기능

- 감정 키워드 기반 맞춤형 질문 생성
- 캐시된 감정에 대한 즉각적인 응답
- PDF 다운로드 및 이메일 전송 기능
- 반응형 디자인

## 기술 스택

- Next.js
- React
- Tailwind CSS
- Framer Motion
- html2pdf.js
- EmailJS

## 시작하기

1. 저장소 클론
```bash
git clone [repository-url]
cd inner-prompt
```

2. 의존성 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm run dev
```

4. 브라우저에서 확인
```
http://localhost:3000
```

## 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
OPENAI_API_KEY=your_openai_api_key
```

## 라이선스

MIT License 