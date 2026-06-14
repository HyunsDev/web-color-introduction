# Web Color Introduction Plan

이 문서는 색 시각화 페이지/기능 후보와 진행 상태를 관리한다. 각 작업은 가능한 한 작은 단위로 구현하고, 작업 단위마다 검증과 커밋을 마친다.

## 진행 원칙

- 각 작업은 `계획 확인 -> 구현 -> 홈 목록 연결 -> 검증 -> 브라우저 QA -> 커밋` 순서로 닫는다.
- TypeScript, 라우팅, 색 계산, Three.js/canvas를 건드리면 최소 `pnpm typecheck` 또는 `pnpm build`를 실행한다.
- 3D/canvas 시각화 변경은 데스크톱과 모바일 폭에서 빈 화면, 라벨 겹침, 컨트롤 동작을 확인한다.
- 색 계산과 변환은 `culori`와 공통 도메인 유틸을 우선 사용한다.
- `src/routeTree.gen.ts`는 직접 편집하지 않는다.
- 커밋은 기능 단위로 나누고 Conventional Commits 형식을 따른다.

## 전체 진행 상태

- [x] xyY 좌표계를 3D Solid Models에 추가
- [ ] 공통 색 좌표/표기/색역 기반 정리
- [ ] 색 좌표 2D 단면 조절기
- [ ] 3D Solid Models 단면 보기
- [ ] 원통형 색 공간 펼쳐 보기
- [ ] 색 보간 경로 비교
- [ ] CSS 색상 표기 실험실
- [ ] 색역과 Clipping
- [ ] 같은 숫자, 다른 체감

## 0. xyY 좌표계를 3D Solid Models에 추가

위치: 기존 `/color-space-solid-models`

목적: CIE XYZ와 같은 색 정보를 `x`, `y`, `Y`로 다시 좌표화해, xy 색도도 위에 휘도 `Y`를 세운 3D 색역 볼륨을 보여준다.

구현 범위:

- `xyY` 모델을 3D Solid Models 선택 목록에 추가
- RGB/P3/Rec.2020 gamut 표면 샘플을 `xyz65`로 변환
- `XYZ -> xyY` 변환:
  - `x = X / (X + Y + Z)`
  - `y = Y / (X + Y + Z)`
  - `Y = Y`
- 3D 위치 매핑:
  - scene X: chromaticity `x`
  - scene Y: luminance `Y`
  - scene Z: chromaticity `y`
- `x / y / Y` 축 라벨과 frame 정의
- 검정 근처 `X + Y + Z = 0` singularity 처리
- 설명 문구에 `XYZ`와 `xyY`의 차이 명시

구현 판단:

- 우선 `3D Solid Models` 전용 모델로 추가한다.
- 안정화 후 `3D Color Coordinates` 점군 모델에도 확장할지 검토한다.
- 검정처럼 색도 좌표가 정의되지 않는 영역은 작은 epsilon 기준으로 D65 white point 쪽 수렴 또는 생략 처리한다.

검증:

- `pnpm typecheck`
- `pnpm build`
- 데스크톱에서 `xyY` 모델이 nonblank로 렌더링되는지 확인
- 모바일 폭에서 축 라벨과 모델 선택 버튼 겹침 확인

커밋 예시:

```text
feat(fe): add xyY solid color model
```

## 1. 공통 색 좌표/표기/색역 기반 정리

목적: 이후 페이지들이 색 좌표, CSS 표기, gamut 판정, canvas 샘플링을 같은 방식으로 사용하게 만든다.

구현 범위:

- RGB, HSL, HSV, LCH, OKLCH 모델별 축 정의
- 축 범위, 단위, 기본값, 표시 라벨 정의
- `culori` 기반 색 변환 유틸
- sRGB, Display P3, Rec.2020 색역 판정 유틸
- hex, rgb, hsl, lch, oklch 등 CSS 표기 formatter
- canvas 픽셀 샘플링 helper

검증:

- `pnpm typecheck`
- 유틸 로직은 가능하면 작은 테스트 추가

커밋 예시:

```text
feat(fe): add shared color coordinate utilities
```

## 2. 색 좌표 2D 단면 조절기

추천 라우트: `/color-coordinate-planes`

목적: Color Picker처럼 3차원 색 좌표계에서 두 축을 2D 평면으로 조작하고, 나머지 한 축은 slider로 조절한다.

구현 범위:

- `ColorCoordinatePlanesPage`
- `ColorPlaneCanvas`
- 모델 선택 tabs
- 평면 선택 컨트롤
- 고정 축 slider
- crosshair drag interaction
- 현재 색 swatch
- 현재 색의 CSS 표기와 gamut 상태 표시

기본 평면:

- RGB: `R x G`, 고정축 `B`
- HSL: `H x S`, 고정축 `L`
- HSV: `H x S`, 고정축 `V`
- LCH: `H x C`, 고정축 `L`
- OKLCH: `H x C`, 고정축 `L`

확장 평면:

- RGB: `R x G`, `R x B`, `G x B`
- HSL: `H x S`, `H x L`, `S x L`
- HSV: `H x S`, `H x V`, `S x V`
- LCH: `H x C`, `H x L`, `C x L`
- OKLCH: `H x C`, `H x L`, `C x L`

검증:

- `pnpm typecheck`
- 브라우저 데스크톱 QA
- 모바일 폭 QA
- canvas nonblank 확인

커밋 예시:

```text
feat(fe): add color coordinate plane picker
```

## 3. 3D Solid Models 단면 보기

위치: 기존 `/color-space-solid-models`

목적: 현재 3D solid shell에서 특정 축 값을 고정한 단면을 색 면으로 보여준다.

구현 범위:

- `Slice` 토글
- 모델별 축 선택 컨트롤
- 고정값 slider
- 기존 solid shell 반투명 표시
- 별도 slice mesh 생성
- 단면 grid/wireframe 표시
- 현재 단면 값 badge/code 표시

구현 판단:

- Three.js clipping plane보다 실제 slice mesh 생성 방식을 우선한다.
- clipping은 표면을 잘라 보이게 할 수 있지만, 내부 단면 색을 채워 보여주기에는 부족하다.

우선 구현 순서:

- RGB 단면
- HSL/HSV 단면
- LCH/OKLCH 단면과 gamut 밖 영역 처리
- Lab/OKLab/XYZ 단면은 후속 확장으로 검토

검증:

- `pnpm typecheck`
- `pnpm build`
- 데스크톱에서 slice, wireframe, orbit 동작 확인
- 모바일 폭에서 라벨과 컨트롤 겹침 확인

커밋 예시:

```text
feat(fe): add slice mode to solid color models
```

## 4. 원통형 색 공간 펼쳐 보기

추천 라우트: `/color-space-unwrapped`

목적: HSL, HSV, LCH, OKLCH의 원통형/원뿔형 좌표를 직육면체 좌표처럼 펼쳐서 좌표 왜곡 자체를 학습 포인트로 보여준다.

구현 범위:

- HSL, HSV, LCH, OKLCH 모델 선택
- `Hue -> X`
- `Saturation/Chroma -> Y`
- `Lightness/Value -> Z`
- seam 표시: `0deg`와 `360deg`가 양 끝으로 나뉘는 지점
- saturation/chroma 0에서 hue가 의미 없어지는 회색축 중복 표시
- LCH/OKLCH gamut 밖 영역 패턴 또는 투명 처리

시각화 방식:

- 3D unwrapped box
- 필요하면 2D slice stack 또는 heatmap을 보조로 사용

검증:

- `pnpm typecheck`
- Three.js/canvas nonblank 확인
- 데스크톱/모바일 QA

커밋 예시:

```text
feat(fe): add unwrapped cylindrical color spaces
```

## 5. 색 보간 경로 비교

추천 라우트: `/color-interpolation`

목적: 같은 시작색과 끝색도 보간하는 색 공간에 따라 중간색이 달라진다는 점을 보여준다.

구현 범위:

- 시작색/끝색 선택
- RGB, HSL, Lab, LCH, OKLCH 보간 비교
- 색 공간별 gradient strip
- 단계별 swatch grid
- hue 보간 방향 옵션: shorter, longer, increasing, decreasing
- 가능하면 2D 또는 3D 경로 미니 뷰

검증:

- `pnpm typecheck`
- invalid color, NaN, gamut 밖 결과 처리 확인
- 모바일에서 swatch와 라벨 overflow 확인

커밋 예시:

```text
feat(fe): add color interpolation comparison
```

## 6. CSS 색상 표기 실험실

추천 라우트: `/css-color-notations`

목적: 한 색을 여러 CSS 색상 문법으로 읽고 변환하며, 최신 CSS 색상 표기의 차이를 확인한다.

구현 범위:

- 색 입력: text input, picker, preset swatches
- 출력: hex, rgb, hsl, lab, lch, oklab, oklch, `color(display-p3 ...)`
- copy button
- gamut 경고
- 파싱 실패/표현 불가 상태 표시

검증:

- `pnpm typecheck`
- 대표 입력 파싱 성공/실패 확인
- 브라우저에서 copy button 동작 확인
- 모바일에서 긴 CSS 표기 줄바꿈 확인

커밋 예시:

```text
feat(fe): add css color notation lab
```

## 7. 색역과 Clipping

추천 라우트: `/color-gamut-clipping`

목적: sRGB, Display P3, Rec.2020 안팎과 clipping이 색을 어떻게 바꾸는지 보여준다.

구현 범위:

- 색역 선택: sRGB, Display P3, Rec.2020
- LCH/OKLCH chroma slider
- 원본 좌표와 clipped/mapped 결과 비교
- out-of-gamut 영역 패턴 표시
- 기존 3D shell 또는 2D gamut mask와 연결

검증:

- `pnpm typecheck`
- wide gamut 미지원 환경 fallback 확인
- 데스크톱/모바일 색역 컨트롤 QA

커밋 예시:

```text
feat(fe): add gamut clipping visualization
```

## 8. 같은 숫자, 다른 체감

추천 라우트: `/perceptual-color-steps`

목적: 수치상 같은 간격이 사람 눈에는 균일하게 보이지 않을 수 있음을 비교한다.

구현 범위:

- RGB/HSL 일정 간격 palette
- OKLCH 일정 간격 palette
- lightness, chroma, hue step 비교
- grayscale ramp와 brand color ramp 예제
- 후속으로 Delta E 표시 검토

검증:

- `pnpm typecheck`
- 데스크톱/모바일에서 swatch, 라벨, 수치 겹침 확인

커밋 예시:

```text
feat(fe): add perceptual color step comparison
```

## 추천 진행 순서

1. xyY 좌표계를 3D Solid Models에 추가
2. 공통 색 좌표/표기/색역 기반 정리
3. 색 좌표 2D 단면 조절기
4. 3D Solid Models 단면 보기
5. 원통형 색 공간 펼쳐 보기
6. 색 보간 경로 비교
7. CSS 색상 표기 실험실
8. 색역과 Clipping
9. 같은 숫자, 다른 체감

## 작업 로그

- 2026-06-15: 구현 후보와 작업 단위 계획을 `PLAN.md`로 정리했다.
- 2026-06-15: `xyY` 좌표계 추가를 첫 번째 작업 후보로 올렸다.
- 2026-06-15: `xyY` 좌표계를 3D Solid Models에 추가하고 검증했다.
