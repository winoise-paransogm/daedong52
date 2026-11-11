/**
 * 수능 응원 편지 템플릿 시트용 스크립트
 * 메뉴 「수능 응원 → 설문 만들기」를 누르면
 *   1) 응원 편지 설문을 내 드라이브에 만들고
 *   2) 이 시트에 연결하고
 *   3) 「반영」 체크 칸과 「공개용」 탭 수식을 맞춰 넣습니다.
 * 이 스크립트는 선생님 계정으로 이 시트 안에서만 동작하고, 바깥으로 정보를 보내지 않습니다.
 */

var RESP_NAME = '설문지 응답 시트1';
var PUB_NAME = '공개용';
var TITLES = {
  type: '어떤 편지를 쓸까요?',
  group: '누가 쓰는 편지인가요?',
  from: '보내는 사람',
  text: '편지 내용'
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('수능 응원')
    .addItem('설문 만들기', 'createCheerForm')
    .addItem('설문 주소 다시 보기', 'showFormLinks')
    .addToUi();
}

/* 설문이 연결된 탭을 찾는다 */
function linkedSheet_(ss) {
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getFormUrl()) return sheets[i];
  }
  return null;
}

function createCheerForm() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (linkedSheet_(ss)) {
    showFormLinks();
    return;
  }
  var ok = ui.alert(
    '수능 응원',
    '응원 편지 설문을 새로 만들어 이 시트에 연결할까요?\n설문은 내 구글 드라이브에 만들어져요. 30초쯤 걸려요.',
    ui.ButtonSet.OK_CANCEL
  );
  if (ok !== ui.Button.OK) return;

  // 1) 사본에 딸려 온 빈 응답 탭(설문이 연결되지 않은 탭)을 정리
  ss.getSheets().forEach(function (sh) {
    if (sh.getName().indexOf('설문지 응답') !== 0 || sh.getFormUrl()) return;
    var rows = Math.max(sh.getMaxRows() - 1, 1);
    var stamps = sh.getRange(2, 1, rows, 1).getValues();
    var empty = stamps.every(function (r) { return r[0] === '' || r[0] === null; });
    if (empty) ss.deleteSheet(sh);
  });

  // 2) 설문 만들기
  var form = FormApp.create('수능 응원 편지 쓰기');
  form.setDescription(
    '수능을 앞둔 3학년 학생들에게 응원과 축하 편지를 남겨 주세요. 선생님, 후배, 학부모님 누구나 쓸 수 있어요. ' +
    '남긴 글은 담당 선생님이 확인한 뒤 수능 응원 페이지의 응원 벽에 붙어요.'
  );
  form.setCollectEmail(false);
  try { form.setRequireLogin(false); } catch (e) { /* 개인 계정에는 없는 설정 */ }
  form.addMultipleChoiceItem()
    .setTitle(TITLES.type)
    .setChoiceValues(['수능 전 응원 (확인 후 응원 벽에 붙어요)', '시험 끝난 뒤 축하 (11월 19일 16:37에 열려요)'])
    .setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle(TITLES.group)
    .setChoiceValues(['선생님', '후배', '학부모', '그 밖 (졸업생, 가족, 친구 등)'])
    .setRequired(true);
  form.addTextItem()
    .setTitle(TITLES.from)
    .setHelpText("이름 대신 '3반 담임', '2학년 후배', '3학년 학부모'처럼 적어 주세요.")
    .setRequired(true);
  form.addParagraphTextItem()
    .setTitle(TITLES.text)
    .setRequired(true);
  form.setConfirmationMessage('편지가 잘 도착했어요. 담당 선생님이 확인한 뒤 응원 벽에 붙어요. 고맙습니다.');
  form.setAcceptingResponses(true);
  try { if (typeof form.setPublished === 'function') form.setPublished(true); } catch (e) { /* 예전 방식 설문 */ }

  // 3) 이 시트에 연결하고, 새로 생긴 응답 탭을 찾는다
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  var resp = null;
  for (var t = 0; t < 15 && !resp; t++) {
    SpreadsheetApp.flush();
    Utilities.sleep(1000);
    resp = linkedSheet_(SpreadsheetApp.openById(ss.getId()));
  }
  if (!resp) {
    ui.alert('수능 응원', '설문은 만들었지만 시트 연결을 확인하지 못했어요. 잠시 뒤 메뉴의 「설문 만들기」를 한 번 더 눌러 주세요.', ui.ButtonSet.OK);
    return;
  }
  if (resp.getName() !== RESP_NAME && !ss.getSheetByName(RESP_NAME)) resp.setName(RESP_NAME);

  // 4) 머리글에서 열 위치를 찾고 「반영」 체크 칸을 붙인다
  var lastCol = Math.max(resp.getLastColumn(), 5);
  var head = resp.getRange(1, 1, 1, lastCol).getValues()[0];
  function colOf(title) {
    var i = head.indexOf(title);
    if (i < 0) throw new Error('응답 시트에서 「' + title + '」 열을 찾지 못했어요.');
    return i + 1;
  }
  var c = { type: colOf(TITLES.type), group: colOf(TITLES.group), from: colOf(TITLES.from), text: colOf(TITLES.text) };
  var check = head.indexOf('반영') >= 0 ? head.indexOf('반영') + 1 : lastCol + 1;
  resp.getRange(1, check).setValue('반영').setFontWeight('bold');
  // 값을 미리 채우지 않고 체크 칸 모양만 걸어 둔다. 새 응답이 들어오는 줄을 밀어내지 않게 하려는 것.
  resp.getRange(2, check, 999, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());
  resp.setColumnWidth(c.text, 420);
  resp.setFrozenRows(1);

  // 5) 「공개용」 탭: 반영에 체크한 편지만 보내는 사람·내용·종류·분류로 모은다
  var pub = ss.getSheetByName(PUB_NAME) || ss.insertSheet(PUB_NAME);
  pub.clear();
  var q = "'" + resp.getName().replace(/'/g, "''") + "'!";
  function rng(col) { var L = colLetter_(col); return q + L + '2:' + L + '1000'; }
  var formula =
    '=ARRAYFORMULA({"from","text","type","group";IFERROR(FILTER({' +
    rng(c.from) + ',' + rng(c.text) + ',' +
    'IF(REGEXMATCH(' + rng(c.type) + ',"시험 끝난"),"after","before"),' +
    'IF(REGEXMATCH(' + rng(c.group) + ',"선생님"),"teacher",IF(REGEXMATCH(' + rng(c.group) + ',"후배"),"junior",IF(REGEXMATCH(' + rng(c.group) + ',"학부모"),"parent","other")))},' +
    rng(check) + '=TRUE),{"","","",""})})';
  pub.getRange('A1').setFormula(formula);
  pub.getRange('F1').setValue('이 탭은 고치지 마세요. 응답 시트에서 「반영」에 체크한 편지만 여기에 모여요. 이 탭 하나만 「웹에 게시」해요.');
  ss.setActiveSheet(resp);

  showFormLinks();
}

function colLetter_(n) {
  var s = '';
  while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

function showFormLinks() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var resp = linkedSheet_(ss);
  if (!resp) {
    SpreadsheetApp.getUi().alert('수능 응원', '아직 연결된 설문이 없어요. 메뉴의 「설문 만들기」를 먼저 눌러 주세요.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var form = FormApp.openByUrl(resp.getFormUrl());
  var live = form.getPublishedUrl();
  var edit = form.getEditUrl();
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var html =
    '<div style="font-family:sans-serif;font-size:14px;line-height:1.6">' +
    '<p><b>설문이 준비됐어요.</b></p>' +
    '<p>설문 응답자 링크 (설정 만들기 화면에 붙여 넣을 주소)<br>' +
    '<textarea readonly style="width:100%;height:64px" onclick="this.select()">' + esc(live) + '</textarea></p>' +
    '<p>설문 수정 링크 (문구를 고칠 때만)<br><a href="' + esc(edit) + '" target="_blank">설문 편집 화면 열기</a></p>' +
    '<p><b>다음 할 일</b>: 이 시트의 「파일 → 공유 → 웹에 게시」에서 <b>「공개용」 탭 하나만</b> 골라 CSV로 게시하세요.</p>' +
    '</div>';
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(460).setHeight(360), '수능 응원');
}
