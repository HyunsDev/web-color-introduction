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

- [x] CIE 1931 visible locus를 3D Solid Models reference 색역으로 추가
- [x] xyY 좌표계를 3D Solid Models에 추가
- [x] 공통 색 좌표/표기/색역 기반 정리
- [x] 색 좌표 2D 단면 조절기
- [x] 3D Solid Models 단면 보기
- [x] 원통형 색 공간 펼쳐 보기
- [x] 색 보간 경로 비교
- [x] CSS 색상 표기 실험실
- [ ] 색역과 Clipping
- [ ] 같은 숫자, 다른 체감

## 0. CIE 1931 visible locus를 3D Solid Models reference 색역으로 추가

위치: 기존 `/color-space-solid-models`

목적: sRGB, Display P3, BT.2020 같은 device gamut과 구분되는 CIE 1931 기준 가시 색 경계를 reference 색역으로 보여준다.

구현 범위:

- `ColorGamutControls`에 device gamut과 reference gamut 그룹 분리
- reference 옵션으로 `CIE 1931 visible locus` 추가
- CIE 1931 spectral locus/xy 말발굽 데이터를 기반으로 boundary geometry 생성
- `xyY` 모델에서는 xy 색도도 위에 휘도 `Y` 축을 세운 visible volume으로 표시
- `XYZ` 모델에서는 CIE 1931 기준 visible boundary를 XYZ 방향/정규화 구조와 연결해 표시
- RGB/HSL/HSV/LCH/OKLCH 등 device-gamut 기반 모델에서 CIE reference 선택 시 지원 범위와 fallback 정책 정의
- 현재 출력 장치가 표현하지 못하는 색은 clipped/simulated 색과 out-of-gamut 패턴 또는 반투명 표시로 구분
- 설명 문구에 CIE 1931은 display gamut이 아니라 standard observer/reference boundary라는 점 명시

구현 판단:

- sRGB, Display P3, BT.2020과 같은 줄에 단순 추가하지 않고 `Device gamuts`와 `Reference`를 UI에서 분리한다.
- 첫 구현은 `xyY`와 가장 강하게 연결하고, 다른 모델은 이후 확장 가능하도록 명시적 fallback을 둔다.
- “CIE 1931 자체 색 공간”이라는 표현보다 “CIE 1931 visible locus/reference gamut”으로 라벨링한다.

검증:

- `pnpm typecheck`
- `pnpm build`
- 데스크톱에서 CIE reference 선택 시 visible locus/volume이 nonblank로 렌더링되는지 확인
- 모바일 폭에서 색역 그룹, reference 설명, 모델 선택 버튼이 겹치지 않는지 확인
- out-of-gamut 표시가 현재 출력 색역과 혼동되지 않는지 확인

진행 로그:

- 2026-06-15: `Device gamuts`와 `Reference` 그룹을 분리하고, CIE 1931 reference를 XYZ/xyY 전용 solid mesh로 추가했다.
- 2026-06-15: `pnpm typecheck`, `pnpm build`, `pnpm lint` 통과. Playwright로 데스크톱/390px 모바일에서 xyY/XYZ reference 렌더링, RGB fallback, 콘솔 warning/error 없음 확인.

커밋 예시:

```text
feat(fe): add CIE 1931 reference gamut
```

## 1. xyY 좌표계를 3D Solid Models에 추가

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

## 2. 공통 색 좌표/표기/색역 기반 정리

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

진행 로그:

- 2026-06-15: RGB/HSL/HSV/LCH/OKLCH 축 스펙, 기본 좌표, `culori` 변환, CSS formatter, gamut 판정, canvas 픽셀 샘플링 helper를 공통 유틸로 추가했다.
- 2026-06-15: Node 내장 test runner 기반 `pnpm test`를 추가하고 유틸 단위 테스트 5개를 작성했다. `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build` 통과.

커밋 예시:

```text
feat(fe): add shared color coordinate utilities
```

## 3. 색 좌표 2D 단면 조절기

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

진행 로그:

- 2026-06-15: `/color-coordinate-planes` 라우트와 홈 링크를 추가하고, RGB/HSL/HSV/LCH/OKLCH 모델별 2D plane 선택, 고정축 slider, canvas crosshair 조작, 현재 색 swatch/CSS 표기/gamut badge를 구현했다.
- 2026-06-15: `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build` 통과. Playwright로 데스크톱/390px 모바일에서 canvas nonblank, RGB 모델 전환, canvas 클릭 좌표 갱신, 콘솔 warning/error 없음 확인.

커밋 예시:

```text
feat(fe): add color coordinate plane picker
```

## 4. 3D Solid Models 단면 보기

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

진행 로그:

- 2026-06-15: `/color-space-solid-models`에 `Slice` 토글, 모델별 고정축 선택, 고정값 slider, 반투명 shell, 별도 slice mesh overlay를 추가했다.
- 2026-06-15: RGB/HSL/HSV/LCH/OKLCH slice mesh를 구현하고, unsupported 모델은 slice 컨트롤에서 안내한다. `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build` 통과. Playwright로 RGB/OKLCH slice 활성화, 데스크톱/390px 모바일, 콘솔 warning/error 없음 확인.

커밋 예시:

```text
feat(fe): add slice mode to solid color models
```

## 5. 원통형 색 공간 펼쳐 보기

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

진행 로그:

- 2026-06-15: `/color-space-unwrapped` 라우트와 홈 링크를 추가하고, HSL/HSV/LCH/OKLCH unwrapped sheet, fixed L/V slider, seam marker, radius 0 gray axis, gamut 밖 반투명 표시를 구현했다.
- 2026-06-15: `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build` 통과. Playwright로 데스크톱/390px 모바일에서 canvas nonblank, HSL 모델 전환, seam/gray axis 표시, 콘솔 warning/error 없음 확인.

커밋 예시:

```text
feat(fe): add unwrapped cylindrical color spaces
```

## 6. 색 보간 경로 비교

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

진행 로그:

- 2026-06-15: `/color-interpolation` 라우트와 홈 링크를 추가하고, 시작/끝 색 입력, RGB/HSL/Lab/LCH/OKLCH gradient strip, 단계별 swatch grid, hue 방향(shorter/longer/increasing/decreasing), OKLCH lightness mini path를 구현했다.
- 2026-06-15: hue 방향별 보간 row 생성 테스트를 추가했다. `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build` 통과. Playwright/Chrome으로 데스크톱/390px 모바일에서 overflow 없음, `Longer` 전환, 콘솔 warning/error 없음 확인.

커밋 예시:

```text
feat(fe): add color interpolation comparison
```

## 7. CSS 색상 표기 실험실

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

진행 로그:

- 2026-06-15: `/css-color-notations` 라우트와 홈 링크를 추가하고, text/color input, preset swatches, hex/rgb/hsl/lab/lch/oklab/oklch/display-p3 출력, copy 상태, gamut badge, invalid input 패널을 구현했다.
- 2026-06-15: CSS formatter와 parse/notation row 테스트를 확장했다. `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build` 통과. Playwright/Chrome으로 copy 버튼, invalid 입력, 데스크톱/390px 모바일 줄바꿈과 overflow 없음, 콘솔 warning/error 없음 확인.

커밋 예시:

```text
feat(fe): add css color notation lab
```

## 8. 색역과 Clipping

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

## 9. 같은 숫자, 다른 체감

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

1. CIE 1931 visible locus를 3D Solid Models reference 색역으로 추가
2. xyY 좌표계를 3D Solid Models에 추가
3. 공통 색 좌표/표기/색역 기반 정리
4. 색 좌표 2D 단면 조절기
5. 3D Solid Models 단면 보기
6. 원통형 색 공간 펼쳐 보기
7. 색 보간 경로 비교
8. CSS 색상 표기 실험실
9. 색역과 Clipping
10. 같은 숫자, 다른 체감

## 작업 로그

- 2026-06-15: 구현 후보와 작업 단위 계획을 `PLAN.md`로 정리했다.
- 2026-06-15: `xyY` 좌표계 추가를 첫 번째 작업 후보로 올렸다.
- 2026-06-15: `xyY` 좌표계를 3D Solid Models에 추가하고 검증했다.
- 2026-06-15: CIE 1931 visible locus reference 색역 추가를 첫 번째 작업 후보로 올렸다.
