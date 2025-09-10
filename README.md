# 다이어트 캘린더 (PWA · Vercel 배포용 완성본)

- React + Vite + Tailwind
- PWA (오프라인 지원, 홈화면 설치)
- 6개월(24주) 식단/운동 플랜 내장
- 캘린더, 일간 상세, 진행 차트, 체크기록(LocalStorage)

## 로컬 실행
```bash
npm install
npm run dev
```

## 프로덕션 빌드
```bash
npm run build
npm run preview
```

## Vercel 배포
```bash
npm i -g vercel
vercel
```
최초 1회 후 `vercel --prod`로 본 배포.

## 주요 기능
- 시작일 설정(기본: 오늘) → 주차 자동 계산
- 날짜 선택 → 해당 주차의 식단/운동 표시 + 체크 기록
- 체중 기록 → 그래프 시각화
- PWA 설치/오프라인 지원
