# 수능 응원 페이지 템플릿

선생님, 후배, 학부모님이 쓴 응원 편지를 모아 3학년 학생들에게 보여 주는 웹페이지입니다. 수능 날 준비물, 시간표, 4교시 순서 안내도 들어 있습니다. 2027학년도 수능(2026년 11월 19일)에 맞춰 만들었습니다.

- 예시 페이지: https://dossamlab.github.io/suneung-cheer-kit/
- 사용설명서(1쪽): https://dossamlab.github.io/suneung-cheer-kit/guide.html · [PDF](guide.pdf)
- 설정 만들기: https://dossamlab.github.io/suneung-cheer-kit/make.html
- 직접 만들어 보기(프롬프트 가이드): https://dossamlab.github.io/suneung-cheer-kit/prompt-guide.html

## 만드는 순서

1. 템플릿 시트를 복사합니다.
   https://docs.google.com/spreadsheets/d/17wH9hABh8IRBjUlfn_y-Z1ZqmSGrqwPA-zwBa6zo3sI/copy
2. 복사된 시트의 메뉴 「수능 응원 → 설문 만들기」를 누릅니다. 처음 한 번 권한을 승인하면 설문이 만들어져 시트에 연결되고, 설문 응답자 링크가 나옵니다. 스크립트 원본은 [apps-script/Code.gs](apps-script/Code.gs)에 있습니다.
3. 시트의 「공개용」 탭 하나만 「웹에 게시」(CSV)하고 주소를 복사합니다.
4. 이 저장소에서 **Use this template → Create a new repository**로 내 저장소를 만듭니다(Public).
5. 설정 만들기 화면에서 만든 내용을 내 저장소의 `config.js`에 붙여 넣고 저장합니다.
6. 내 저장소의 **Settings → Pages**에서 Branch를 `main`, 폴더를 `/ (root)`로 두고 저장합니다.

편지는 응답 시트의 「반영」 칸에 체크한 것만 페이지에 붙습니다.

## 바꾸는 파일

저장소에서는 `config.js` 하나만 바꾸면 됩니다. 시간표와 수능 안내는 한국교육과정평가원 「2027학년도 대학수학능력시험 시행세부계획 공고」(2026. 7. 1.)와 교육부 수험생 유의사항을 따랐습니다.
