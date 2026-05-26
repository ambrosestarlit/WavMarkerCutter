(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);

  const els = {
    audioFile: $("#audioFile"),
    scriptFile: $("#scriptFile"),
    scriptCharacterFilter: $("#scriptCharacterFilter"),
    scriptEditor: $("#scriptEditor"),
    scriptStats: $("#scriptStats"),
    fileInfo: $("#fileInfo"),
    playPauseBtn: $("#playPauseBtn"),
    stopBtn: $("#stopBtn"),
    addMarkerBtn: $("#addMarkerBtn"),
    clearMarkersBtn: $("#clearMarkersBtn"),
    currentTimeLabel: $("#currentTimeLabel"),
    durationLabel: $("#durationLabel"),
    zoomSlider: $("#zoomSlider"),
    zoomLabel: $("#zoomLabel"),
    waveScrollSlider: $("#waveScrollSlider"),
    waveScrollRangeLabel: $("#waveScrollRangeLabel"),
    waveViewport: $("#waveViewport"),
    waveCanvas: $("#waveCanvas"),
    emptyWave: $("#emptyWave"),
    markerCount: $("#markerCount"),
    markerList: $("#markerList"),
    fileNamesInput: $("#fileNamesInput"),
    fileNameCharacterFilter: $("#fileNameCharacterFilter"),
    exportScopeNote: $("#exportScopeNote"),
    exportAll: $("#exportAll"),
    exportSelected: $("#exportSelected"),
    exportNumberChecklist: $("#exportNumberChecklist"),
    fadeInEnabled: $("#fadeInEnabled"),
    fadeOutEnabled: $("#fadeOutEnabled"),
    fadeDuration: $("#fadeDuration"),
    fadeDurationValue: $("#fadeDurationValue"),
    useFolderSave: $("#useFolderSave"),
    trimSilentEdge: $("#trimSilentEdge"),
    exportBtn: $("#exportBtn"),
    exportStatus: $("#exportStatus"),
    segmentCount: $("#segmentCount"),
    segmentPreview: $("#segmentPreview"),
    openHelpBtn: $("#openHelpBtn"),
    closeHelpBtn: $("#closeHelpBtn"),
    languageSelect: $("#languageSelect"),
    helpDialog: $("#helpDialog"),
  };

  const state = {
    audioContext: null,
    audioBuffer: null,
    sourceNode: null,
    gainNode: null,
    sourceStartedAt: 0,
    sourceOffset: 0,
    isPlaying: false,
    currentTime: 0,
    markers: [],
    scriptText: "",
    scriptEntries: [],
    scriptCharacters: [],
    scriptNamesActive: false,
    isRenderingScript: false,
    isSyncingFileNames: false,
    isComposingScript: false,
    nextMarkerId: 1,
    zoomPxPerSec: 120,
    viewStartSec: 0,
    dragMarkerId: null,
    fileName: "",
    animationFrame: 0,
    previewEndTime: null,
    previewSegmentIndex: null,
    selectedExportKeys: new Set(),
    lang: getInitialLang(),
    lastStatusKey: "exportWaiting",
  };


  const I18N = {
    ja: {
      eyebrow: "Browser WAV Split Tool",
      lead: "WAVを読み込み、波形を見ながら右クリックでマーカー配置。マーカー間を自動で分割書き出しできます。",
      languageLabel: "言語",
      helpBtn: "取扱説明",
      waveEditTitle: "波形編集",
      filePrompt: "WAVファイルを読み込んでください。",
      scriptTitle: "台本",
      scriptDesc: "TXT読み込み、または貼り付けで台本を確認できます。",
      loadTxt: "TXTを読み込む",
      scriptFilterLabel: "絞込",
      allCharacters: "全キャラ",
      noCharacterName: "キャラ名なし",
      scriptPlaceholder: "ここに台本を貼り付け",
      scriptStatsSummary: (lines, numbered, chars) => `${lines}行 / 3桁番号 ${numbered}件 / キャラ ${chars}件`,
      scriptFilteredSummary: (name, count) => `${name}：${count}行を表示中`,
      scriptNoFilteredLines: "該当する台詞がありません。",
      scriptLoaded: (name) => `${name} を読み込みました。`,
      loadWav: "WAVを読み込む",
      play: "再生",
      pause: "一時停止",
      stop: "停止",
      addCurrentMarker: "現在位置にマーカー",
      clearMarkers: "全マーカー削除",
      zoom: "表示倍率",
      waveScrollLabel: "波形位置",
      waveHint: "左クリック：シーク / 右クリック：マーカー追加 / Ctrl+ホイール：ズーム / ホイール：左右スクロール",
      waveAreaLabel: "波形エリア",
      emptyWave: "ここに波形が表示されます",
      markersTitle: "マーカー",
      countUnit: "件",
      noMarkers: "まだマーカーがありません。",
      exportSettingsTitle: "書き出し設定",
      exportSettingsDesc: "1行につき1ファイル名。分割順に上から適用されます。",
      fileNameCharacterFilterLabel: "キャラ絞り込み",
      fileNameListLabel: "ファイル名リスト",
      fileNamePlaceholder: "001_serif.wav\n002_serif.wav\n003_serif.wav",
      exportTargetLabel: "書き出し対象",
      exportAllLabel: "表示中の候補を全部書き出す",
      exportSelectedLabel: "チェックした番号だけ書き出す",
      exportFilterNotice: (name, count) => `キャラ絞り込み中：${name} の絞り込み結果順で ${count}件が書き出し候補です。`,
      exportChecklistHint: "書き出す番号にチェックを入れてください。",
      exportChecklistEmpty: "表示できる番号がありません。",
      fadeOptionsTitle: "フェード処理",
      fadeInLabel: "フェードインを適用",
      fadeOutLabel: "フェードアウトを適用",
      fadeDurationLabel: "フェード時間",
      fadePreviewLabel: (seconds) => `フェード ${seconds.toFixed(2)}s`,
      folderSaveLabel: "ZIPではなく選択フォルダへ直接保存（Chrome/Edgeなど対応ブラウザのみ）",
      trimEdgeLabel: "マーカーが先頭・末尾ぴったりの場合の空ファイルを除外",
      exportBtn: "分割書き出し",
      exportWaiting: "書き出し待機中",
      previewTitle: "書き出しプレビュー",
      segmentUnit: "本",
      previewEmpty: "音声を読み込むと表示されます。",
      helpTitle: "取扱説明",
      helpBasicTitle: "基本操作",
      helpBasicText: "WAVファイルを読み込むと波形が表示されます。左クリックでその位置へシーク、右クリックでマーカーを追加できます。",
      helpLiSeek: "左クリック：再生位置を移動",
      helpLiMarker: "右クリック：クリック位置にマーカー追加",
      helpLiZoom: "Ctrl + ホイール：マウス位置を中心にズーム",
      helpLiScroll: "ホイールのみ：波形を左右スクロール",
      helpLiButton: "「現在位置にマーカー」：再生ヘッド位置にマーカー追加",
      helpExportTitle: "分割書き出し",
      helpExportText: "マーカーがある場合は「先頭〜マーカー1」「マーカー1〜マーカー2」「最後のマーカー〜末尾」の順に分割します。マーカーが無い場合はファイル全体を1本として書き出します。",
      helpNamesTitle: "ファイル名リスト",
      helpNamesText: "ファイル名は1行に1つずつ入力してください。上から順番に、分割番号の小さいファイルへ適用されます。空欄や足りない分は001.wav、002.wavのような自動連番名になります。",
      helpTargetTitle: "書き出し対象",
      helpTargetText: "全部を書き出すほか、『指定した番号だけ書き出す』を選ぶと、表示中の番号をチェックボックスで選択できます。キャラ絞込中は絞込結果の番号だけが表示されます。",
      helpFadeTitle: "フェード処理",
      helpFadeText: "フェードイン・フェードアウトをチェックで有効化できます。フェード時間はスライダーで指定し、プレビュー再生にも反映されます。",
      helpFolderTitle: "フォルダ保存について",
      helpFolderText: "ブラウザの仕様上、OSのフォルダを自動で開くことはできません。対応ブラウザでは、チェックを入れると選択したフォルダへ直接保存できます。非対応の場合はZIPで保存してください。",
      loading: "読み込み中...",
      analyzingFile: (name) => `${name} を解析しています。`,
      fileInfoLoaded: (name, duration, sampleRate, channels) => `${name} / ${duration} / ${sampleRate}Hz / ${channels}ch`,
      loadDone: "読み込み完了。マーカーを配置できます。",
      loadFailFileInfo: "WAVファイルの読み込みに失敗しました。",
      loadFailStatus: "読み込み失敗：ブラウザでデコードできるWAVか確認してください。",
      markerEdgeIgnored: "先頭・末尾ぴったりのマーカーは空ファイルになるため追加しませんでした。",
      markerNear: "ほぼ同じ位置にマーカーがあります。",
      markerAdded: (time) => `マーカーを追加しました：${time}`,
      allMarkersCleared: "全マーカーを削除しました。",
      markerLabel: (n) => `Marker ${n}`,
      seek: "移動",
      delete: "削除",
      previewBtn: "試聴",
      stopPreviewBtn: "停止",
      selectedTag: "対象",
      skippedTag: "対象外",
      noTargets: "書き出し対象がありません。",
      noSelectedTargets: "チェックされた書き出し対象がありません。",
      exportSelectionInvalid: "番号指定に無効な値があります。プレビュー番号に合わせて指定してください。",
      exportPreparing: (done, total) => `書き出し準備中... ${done} / ${total}`,
      exportCutting: (done, total) => `音声を切り出し中... ${done} / ${total}`,
      savedDirectory: (count) => `選択フォルダへ保存しました。${count}ファイル`,
      browserZipFallback: (count) => `このブラウザはフォルダ直接保存に非対応のため、ZIPで保存しました。 ${count}ファイル`,
      zipExported: (count) => `ZIPを書き出しました。 ${count}ファイル`,
      exportFailed: (message) => `書き出しに失敗しました：${message}`,
    },
    en: {
      eyebrow: "Browser WAV Split Tool",
      lead: "Load a WAV file, place markers on the waveform with right-click, and export each marker range automatically.",
      languageLabel: "Language",
      helpBtn: "Help",
      waveEditTitle: "Waveform Editor",
      filePrompt: "Load a WAV file to begin.",
      scriptTitle: "Script",
      scriptDesc: "Load a TXT file or paste a script while checking your lines.",
      loadTxt: "Load TXT",
      scriptFilterLabel: "Filter",
      allCharacters: "All characters",
      noCharacterName: "No character name",
      scriptPlaceholder: "Paste your script here",
      scriptStatsSummary: (lines, numbered, chars) => `${lines} lines / ${numbered} numbered / ${chars} characters`,
      scriptFilteredSummary: (name, count) => `${name}: showing ${count} lines`,
      scriptNoFilteredLines: "No matching lines.",
      scriptLoaded: (name) => `Loaded ${name}.`,
      loadWav: "Load WAV",
      play: "Play",
      pause: "Pause",
      stop: "Stop",
      addCurrentMarker: "Add marker at current position",
      clearMarkers: "Clear all markers",
      zoom: "Zoom",
      waveScrollLabel: "Wave position",
      waveHint: "Left click: seek / Right click: add marker / Ctrl + wheel: zoom / Wheel: horizontal scroll",
      waveAreaLabel: "Waveform area",
      emptyWave: "The waveform will appear here",
      markersTitle: "Markers",
      countUnit: " items",
      noMarkers: "No markers yet.",
      exportSettingsTitle: "Export Settings",
      exportSettingsDesc: "Enter one file name per line. Names are applied from top to bottom in split order.",
      fileNameCharacterFilterLabel: "Character filter",
      fileNameListLabel: "File name list",
      fileNamePlaceholder: "001_line.wav\n002_line.wav\n003_line.wav",
      exportTargetLabel: "Export target",
      exportAllLabel: "Export all visible candidates",
      exportSelectedLabel: "Export checked numbers only",
      exportFilterNotice: (name, count) => `Character filter is active: ${count} item(s) are export candidates in the filtered order for ${name}.`,
      exportChecklistHint: "Check the numbers you want to export.",
      exportChecklistEmpty: "No numbers to display.",
      fadeOptionsTitle: "Fade processing",
      fadeInLabel: "Apply fade in",
      fadeOutLabel: "Apply fade out",
      fadeDurationLabel: "Fade length",
      fadePreviewLabel: (seconds) => `fade ${seconds.toFixed(2)}s`,
      folderSaveLabel: "Save directly to a selected folder instead of ZIP (Chrome/Edge and supported browsers only)",
      trimEdgeLabel: "Exclude empty files when a marker is exactly at the start or end",
      exportBtn: "Export split files",
      exportWaiting: "Waiting to export",
      previewTitle: "Export Preview",
      segmentUnit: " files",
      previewEmpty: "The preview will appear after loading audio.",
      helpTitle: "Help",
      helpBasicTitle: "Basic controls",
      helpBasicText: "Load a WAV file to display its waveform. Left-click to seek, and right-click to add a marker.",
      helpLiSeek: "Left click: move the playhead",
      helpLiMarker: "Right click: add a marker at the clicked position",
      helpLiZoom: "Ctrl + wheel: zoom around the mouse position",
      helpLiScroll: "Wheel only: scroll the waveform horizontally",
      helpLiButton: "Add marker at current position: adds a marker at the playhead",
      helpExportTitle: "Split export",
      helpExportText: "When markers exist, files are split as start to marker 1, marker 1 to marker 2, and final marker to end. With no markers, the whole file is exported as one WAV.",
      helpNamesTitle: "File name list",
      helpNamesText: "Enter one file name per line. Names are applied from top to bottom to the split files. Missing names are auto-numbered as 001.wav, 002.wav, and so on.",
      helpTargetTitle: "Export target",
      helpTargetText: "Besides exporting all files, selecting ‘Export only selected numbers’ shows checkboxes for the currently displayed numbers. When a character filter is active, only the filtered numbers are shown.",
      helpFadeTitle: "Fade processing",
      helpFadeText: "Enable fade in and fade out with checkboxes. The fade length is controlled by the slider and is also applied to preview playback.",
      helpFolderTitle: "Folder saving",
      helpFolderText: "Browsers cannot automatically open an OS folder after export. In supported browsers, enabling this option lets you save directly to a selected folder. Otherwise, export as ZIP.",
      loading: "Loading...",
      analyzingFile: (name) => `Analyzing ${name}.`,
      fileInfoLoaded: (name, duration, sampleRate, channels) => `${name} / ${duration} / ${sampleRate}Hz / ${channels}ch`,
      loadDone: "Loaded. You can now place markers.",
      loadFailFileInfo: "Failed to load the WAV file.",
      loadFailStatus: "Load failed: check that the WAV can be decoded by your browser.",
      markerEdgeIgnored: "The marker was not added because a marker exactly at the start or end would create an empty file.",
      markerNear: "A marker already exists almost at the same position.",
      markerAdded: (time) => `Marker added: ${time}`,
      allMarkersCleared: "All markers were cleared.",
      markerLabel: (n) => `Marker ${n}`,
      seek: "Seek",
      delete: "Delete",
      previewBtn: "Preview",
      stopPreviewBtn: "Stop",
      selectedTag: "Target",
      skippedTag: "Skipped",
      noTargets: "There is nothing to export.",
      noSelectedTargets: "No export targets are checked.",
      exportSelectionInvalid: "Some selected numbers are invalid. Match the numbers shown in the preview list.",
      exportPreparing: (done, total) => `Preparing export... ${done} / ${total}`,
      exportCutting: (done, total) => `Cutting audio... ${done} / ${total}`,
      savedDirectory: (count) => `Saved ${count} files to the selected folder.`,
      browserZipFallback: (count) => `This browser does not support direct folder saving, so files were saved as ZIP. ${count} files`,
      zipExported: (count) => `ZIP exported. ${count} files`,
      exportFailed: (message) => `Export failed: ${message}`,
    },
    ko: {
      eyebrow: "Browser WAV Split Tool",
      lead: "WAV를 불러온 뒤 파형을 보면서 우클릭으로 마커를 배치하고, 마커 구간별로 자동 분할 내보내기를 할 수 있습니다.",
      languageLabel: "언어",
      helpBtn: "사용 설명",
      waveEditTitle: "파형 편집",
      filePrompt: "WAV 파일을 불러와 주세요.",
      scriptTitle: "대본",
      scriptDesc: "TXT를 불러오거나 붙여넣어서 대본을 확인할 수 있습니다.",
      loadTxt: "TXT 불러오기",
      scriptFilterLabel: "필터",
      allCharacters: "전체 캐릭터",
      noCharacterName: "캐릭터명 없음",
      scriptPlaceholder: "여기에 대본을 붙여넣기",
      scriptStatsSummary: (lines, numbered, chars) => `${lines}줄 / 3자리 번호 ${numbered}개 / 캐릭터 ${chars}명`,
      scriptFilteredSummary: (name, count) => `${name}: ${count}줄 표시 중`,
      scriptNoFilteredLines: "해당하는 대사가 없습니다.",
      scriptLoaded: (name) => `${name}을(를) 불러왔습니다.`,
      loadWav: "WAV 불러오기",
      play: "재생",
      pause: "일시정지",
      stop: "정지",
      addCurrentMarker: "현재 위치에 마커 추가",
      clearMarkers: "모든 마커 삭제",
      zoom: "표시 배율",
      waveScrollLabel: "파형 위치",
      waveHint: "좌클릭: 탐색 / 우클릭: 마커 추가 / Ctrl+휠: 확대·축소 / 휠: 좌우 스크롤",
      waveAreaLabel: "파형 영역",
      emptyWave: "여기에 파형이 표시됩니다",
      markersTitle: "마커",
      countUnit: "개",
      noMarkers: "아직 마커가 없습니다.",
      exportSettingsTitle: "내보내기 설정",
      exportSettingsDesc: "한 줄에 파일명 하나씩 입력하세요. 분할 순서대로 위에서부터 적용됩니다.",
      fileNameCharacterFilterLabel: "캐릭터 필터",
      fileNameListLabel: "파일명 목록",
      fileNamePlaceholder: "001_line.wav\n002_line.wav\n003_line.wav",
      exportTargetLabel: "내보내기 대상",
      exportAllLabel: "표시 중인 후보 모두 내보내기",
      exportSelectedLabel: "체크한 번호만 내보내기",
      exportFilterNotice: (name, count) => `캐릭터 필터 적용 중: ${name}의 필터 결과 순서대로 ${count}개 항목이 내보내기 후보입니다.`,
      exportChecklistHint: "내보낼 번호를 체크하세요.",
      exportChecklistEmpty: "표시할 번호가 없습니다.",
      fadeOptionsTitle: "페이드 처리",
      fadeInLabel: "페이드 인 적용",
      fadeOutLabel: "페이드 아웃 적용",
      fadeDurationLabel: "페이드 시간",
      fadePreviewLabel: (seconds) => `페이드 ${seconds.toFixed(2)}s`,
      folderSaveLabel: "ZIP 대신 선택한 폴더에 직접 저장(Chrome/Edge 등 지원 브라우저만)",
      trimEdgeLabel: "마커가 처음/끝에 딱 붙어 있을 때 생기는 빈 파일 제외",
      exportBtn: "분할 내보내기",
      exportWaiting: "내보내기 대기 중",
      previewTitle: "내보내기 미리보기",
      segmentUnit: "개",
      previewEmpty: "오디오를 불러오면 표시됩니다.",
      helpTitle: "사용 설명",
      helpBasicTitle: "기본 조작",
      helpBasicText: "WAV 파일을 불러오면 파형이 표시됩니다. 좌클릭으로 해당 위치로 이동하고, 우클릭으로 마커를 추가할 수 있습니다.",
      helpLiSeek: "좌클릭: 재생 위치 이동",
      helpLiMarker: "우클릭: 클릭 위치에 마커 추가",
      helpLiZoom: "Ctrl + 휠: 마우스 위치를 중심으로 확대·축소",
      helpLiScroll: "휠만 사용: 파형을 좌우로 스크롤",
      helpLiButton: "현재 위치에 마커 추가: 재생 헤드 위치에 마커 추가",
      helpExportTitle: "분할 내보내기",
      helpExportText: "마커가 있으면 ‘처음~마커1’, ‘마커1~마커2’, ‘마지막 마커~끝’ 순서로 분할합니다. 마커가 없으면 전체 파일을 1개 WAV로 내보냅니다.",
      helpNamesTitle: "파일명 목록",
      helpNamesText: "파일명은 한 줄에 하나씩 입력하세요. 위에서부터 분할 번호가 작은 파일에 적용됩니다. 부족한 이름은 001.wav, 002.wav처럼 자동 번호 이름으로 저장됩니다.",
      helpTargetTitle: "내보내기 대상",
      helpTargetText: "전체 내보내기 외에도 ‘지정한 번호만 내보내기’를 선택하면 현재 표시 중인 번호를 체크박스로 고를 수 있습니다. 캐릭터 필터 중에는 필터 결과의 번호만 표시됩니다.",
      helpFadeTitle: "페이드 처리",
      helpFadeText: "체크박스로 페이드 인/아웃을 켤 수 있습니다. 페이드 시간은 슬라이더로 설정하며 미리보기 재생에도 반영됩니다.",
      helpFolderTitle: "폴더 저장 안내",
      helpFolderText: "브라우저 사양상 내보내기 후 OS 폴더를 자동으로 열 수는 없습니다. 지원 브라우저에서는 옵션을 켜면 선택한 폴더에 직접 저장할 수 있습니다. 지원하지 않으면 ZIP으로 저장하세요.",
      loading: "불러오는 중...",
      analyzingFile: (name) => `${name} 분석 중입니다.`,
      fileInfoLoaded: (name, duration, sampleRate, channels) => `${name} / ${duration} / ${sampleRate}Hz / ${channels}ch`,
      loadDone: "불러오기 완료. 마커를 배치할 수 있습니다.",
      loadFailFileInfo: "WAV 파일을 불러오지 못했습니다.",
      loadFailStatus: "불러오기 실패: 브라우저에서 디코딩 가능한 WAV인지 확인하세요.",
      markerEdgeIgnored: "처음/끝에 딱 붙은 마커는 빈 파일을 만들 수 있어 추가하지 않았습니다.",
      markerNear: "거의 같은 위치에 이미 마커가 있습니다.",
      markerAdded: (time) => `마커를 추가했습니다: ${time}`,
      allMarkersCleared: "모든 마커를 삭제했습니다.",
      markerLabel: (n) => `Marker ${n}`,
      seek: "이동",
      delete: "삭제",
      previewBtn: "미리듣기",
      stopPreviewBtn: "정지",
      selectedTag: "대상",
      skippedTag: "제외",
      noTargets: "내보낼 대상이 없습니다.",
      noSelectedTargets: "체크된 내보내기 대상이 없습니다.",
      exportSelectionInvalid: "번호 지정에 올바르지 않은 값이 있습니다. 미리보기 번호에 맞춰 지정하세요.",
      exportPreparing: (done, total) => `내보내기 준비 중... ${done} / ${total}`,
      exportCutting: (done, total) => `오디오 분할 중... ${done} / ${total}`,
      savedDirectory: (count) => `선택한 폴더에 ${count}개 파일을 저장했습니다.`,
      browserZipFallback: (count) => `이 브라우저는 폴더 직접 저장을 지원하지 않아 ZIP으로 저장했습니다. ${count}개 파일`,
      zipExported: (count) => `ZIP을 내보냈습니다. ${count}개 파일`,
      exportFailed: (message) => `내보내기에 실패했습니다: ${message}`,
    },
  };

  function getInitialLang() {
    // 初期表示は必ず日本語。
    // 旧版の自動判定・保存値で韓国語表示になる事故を避けるため、
    // 新しい保存キーだけを参照する。
    const saved = localStorage.getItem("wmc_language_v2");
    if (["ja", "en", "ko"].includes(saved)) return saved;
    return "ja";
  }

  function t(key, ...args) {
    const value = (I18N[state.lang] && I18N[state.lang][key]) || I18N.ja[key] || key;
    return typeof value === "function" ? value(...args) : value;
  }

  function applyLanguage() {
    document.documentElement.lang = state.lang;
    if (els.languageSelect) els.languageSelect.value = state.lang;

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      const text = t(node.dataset.i18nPlaceholder);
      if ("placeholder" in node) node.placeholder = text;
      node.dataset.placeholder = text;
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
      node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel));
    });

    els.playPauseBtn.textContent = state.isPlaying ? t("pause") : t("play");
    updateFileInfo();
    updateFadeDurationLabel();
    updateExportSelectionUI();
    refreshCharacterFilters();
    renderScriptEditor(false);
    updateScriptStats();
    renderAll();
  }

  function updateFileInfo() {
    if (!state.audioBuffer) {
      els.fileInfo.textContent = t("filePrompt");
      return;
    }
    els.fileInfo.textContent = t(
      "fileInfoLoaded",
      state.fileName,
      formatTime(state.audioBuffer.duration),
      state.audioBuffer.sampleRate.toLocaleString(),
      state.audioBuffer.numberOfChannels
    );
  }


  const NO_CHARACTER_VALUE = "__wmc_no_character__";

  function normalizeScriptText(text) {
    return String(text || "").replace(/\r\n?/g, "\n");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getScriptLineInfo(line, index = 0) {
    const text = String(line || "");
    const numberMatch = text.match(/^(\d{3})(.*)$/);
    if (!numberMatch) {
      return { index, line: text, numbered: false, number: "", character: "" };
    }

    const characterMatch = text.match(/^\d{3}[\s\u3000]*([^「:：]+?)[\s\u3000]*(?=「|:|：)/);
    const character = characterMatch ? characterMatch[1].trim() : "";
    return {
      index,
      line: text,
      numbered: true,
      number: numberMatch[1],
      character,
    };
  }

  function parseScriptEntries() {
    const lines = normalizeScriptText(state.scriptText).split("\n");
    const entries = [];
    const characters = new Set();
    let hasNoCharacter = false;

    lines.forEach((line, index) => {
      const info = getScriptLineInfo(line, index);
      if (!info.numbered) return;
      entries.push({ ...info, order: entries.length });
      if (info.character) characters.add(info.character);
      else hasNoCharacter = true;
    });

    state.scriptEntries = entries;
    state.scriptCharacters = [...characters].sort((a, b) => a.localeCompare(b, "ja"));
    state.hasNoCharacterEntries = hasNoCharacter;
  }

  function getCharacterOptionLabel(value) {
    if (value === NO_CHARACTER_VALUE) return t("noCharacterName");
    return value;
  }

  function matchesCharacter(entry, filterValue) {
    if (!filterValue) return true;
    if (filterValue === NO_CHARACTER_VALUE) return !entry.character;
    return entry.character === filterValue;
  }

  function refreshCharacterFilters() {
    [els.scriptCharacterFilter, els.fileNameCharacterFilter].forEach((select) => {
      if (!select) return;
      const previous = select.value;
      const options = [
        { value: "", label: t("allCharacters") },
        ...state.scriptCharacters.map((name) => ({ value: name, label: name })),
      ];
      if (state.hasNoCharacterEntries) {
        options.push({ value: NO_CHARACTER_VALUE, label: t("noCharacterName") });
      }

      select.innerHTML = "";
      options.forEach((option) => {
        const node = document.createElement("option");
        node.value = option.value;
        node.textContent = option.label;
        select.appendChild(node);
      });

      const stillExists = options.some((option) => option.value === previous);
      select.value = stillExists ? previous : "";
    });
  }

  function getScriptEditorText() {
    if (!els.scriptEditor) return "";

    // contenteditable + innerText は、ブラウザによって <div> 行の間に
    // 余分な改行を混ぜることがあり、Backspace 入力時に行が増える原因になる。
    // 自前で .script-line 単位に読み取って、1表示行 = 1テキスト行として扱う。
    const lineNodes = Array.from(els.scriptEditor.querySelectorAll(":scope > .script-line"));
    if (lineNodes.length) {
      return normalizeScriptText(lineNodes.map((node) => node.textContent || "").join("\n"));
    }

    const text = els.scriptEditor.textContent || "";
    return normalizeScriptText(text).replace(/\n$/g, "");
  }

  function getCaretOffset(root) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return 0;
    const range = selection.getRangeAt(0);
    if (!root.contains(range.endContainer)) return 0;
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(root);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  }

  function restoreCaret(root, offset) {
    const selection = window.getSelection();
    if (!selection) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let currentOffset = 0;
    let node = walker.nextNode();

    while (node) {
      const nextOffset = currentOffset + node.nodeValue.length;
      if (offset <= nextOffset) {
        const range = document.createRange();
        range.setStart(node, Math.max(0, offset - currentOffset));
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }
      currentOffset = nextOffset;
      node = walker.nextNode();
    }

    const range = document.createRange();
    range.selectNodeContents(root);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function renderScriptEditor(preserveCaret = false) {
    if (!els.scriptEditor) return;
    const filterValue = els.scriptCharacterFilter ? els.scriptCharacterFilter.value : "";
    const isFiltered = Boolean(filterValue);
    const shouldRestoreCaret = preserveCaret && !isFiltered && document.activeElement === els.scriptEditor;
    const caretOffset = shouldRestoreCaret ? getCaretOffset(els.scriptEditor) : 0;
    const text = normalizeScriptText(state.scriptText);

    state.isRenderingScript = true;
    els.scriptEditor.contentEditable = isFiltered ? "false" : "true";
    els.scriptEditor.classList.toggle("is-filtered", isFiltered);

    if (!text) {
      els.scriptEditor.innerHTML = "";
      state.isRenderingScript = false;
      return;
    }

    const lines = text.split("\n");
    let shown = 0;
    const html = [];

    lines.forEach((line, index) => {
      const info = getScriptLineInfo(line, index);
      if (isFiltered && (!info.numbered || !matchesCharacter(info, filterValue))) return;
      shown += 1;

      const classes = ["script-line"];
      if (info.numbered) classes.push("is-numbered");

      let content = escapeHtml(line) || "<br>";
      if (info.numbered) {
        const number = escapeHtml(info.number);
        const rest = escapeHtml(line.slice(3)) || "";
        content = `<span class="script-line-num">${number}</span>${rest || "<br>"}`;
      }
      html.push(`<div class="${classes.join(" ")}" data-line="${index + 1}">${content}</div>`);
    });

    if (isFiltered && shown === 0) {
      html.push(`<div class="script-line is-hidden-result">${escapeHtml(t("scriptNoFilteredLines"))}</div>`);
    }

    els.scriptEditor.innerHTML = html.join("");
    state.isRenderingScript = false;

    if (shouldRestoreCaret) {
      restoreCaret(els.scriptEditor, caretOffset);
    }
  }

  function updateScriptStats() {
    if (!els.scriptStats) return;
    const text = normalizeScriptText(state.scriptText);
    if (!text) {
      els.scriptStats.textContent = t("scriptDesc");
      return;
    }

    const lines = text.split("\n");
    const filterValue = els.scriptCharacterFilter ? els.scriptCharacterFilter.value : "";
    if (filterValue) {
      const count = state.scriptEntries.filter((entry) => matchesCharacter(entry, filterValue)).length;
      els.scriptStats.textContent = t("scriptFilteredSummary", getCharacterOptionLabel(filterValue), count);
      return;
    }

    els.scriptStats.textContent = t(
      "scriptStatsSummary",
      lines.length,
      state.scriptEntries.length,
      state.scriptCharacters.length + (state.hasNoCharacterEntries ? 1 : 0)
    );
  }

  function getFileNameFilterValue() {
    return els.fileNameCharacterFilter ? els.fileNameCharacterFilter.value : "";
  }

  function isFileNameCharacterFiltered() {
    return Boolean(getFileNameFilterValue()) && state.scriptEntries.length > 0;
  }

  function updateExportScopeNote(count = 0) {
    if (!els.exportScopeNote) return;
    const filterValue = getFileNameFilterValue();
    if (filterValue && state.scriptEntries.length > 0) {
      els.exportScopeNote.hidden = false;
      els.exportScopeNote.textContent = t(
        "exportFilterNotice",
        getCharacterOptionLabel(filterValue),
        count
      );
    } else {
      els.exportScopeNote.hidden = true;
      els.exportScopeNote.textContent = "";
    }
  }

  function getFilteredScriptEntriesForFileNames() {
    const filterValue = getFileNameFilterValue();
    if (!filterValue) return state.scriptEntries;
    return state.scriptEntries.filter((entry) => matchesCharacter(entry, filterValue));
  }

  function getScriptFileNameLines() {
    return getFilteredScriptEntriesForFileNames().map((entry) => entry.number);
  }

  function syncFileNameListFromScript() {
    if (!state.scriptNamesActive || !state.scriptEntries.length) return;
    state.isSyncingFileNames = true;
    els.fileNamesInput.value = getScriptFileNameLines().join("\n");
    state.isSyncingFileNames = false;
    renderSegments();
  }

  function processScriptText({ syncFileNames = true, preserveCaret = false, renderEditor = true } = {}) {
    parseScriptEntries();
    refreshCharacterFilters();
    if (syncFileNames) {
      const wasScriptNamesActive = state.scriptNamesActive;
      state.scriptNamesActive = state.scriptEntries.length > 0;
      if (state.scriptNamesActive) {
        syncFileNameListFromScript();
      } else if (wasScriptNamesActive) {
        state.isSyncingFileNames = true;
        els.fileNamesInput.value = "";
        state.isSyncingFileNames = false;
        renderSegments();
      }
    }
    if (renderEditor) {
      renderScriptEditor(preserveCaret);
    }
    updateScriptStats();
  }

  async function loadScriptFile(file) {
    if (!file) return;
    try {
      state.scriptText = normalizeScriptText(await file.text());
      processScriptText({ syncFileNames: true, preserveCaret: false });
      els.scriptStats.textContent = t("scriptLoaded", file.name);
    } catch (error) {
      console.error(error);
    } finally {
      els.scriptFile.value = "";
    }
  }

  function insertPlainTextAtSelection(text) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);
    range.setStartAfter(node);
    range.setEndAfter(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function isTextEditingElement(element) {
    if (!element) return false;
    return ["TEXTAREA", "INPUT", "SELECT"].includes(element.tagName) || element.isContentEditable;
  }

  const WAVE_BG = "#ffffff";
  const WAVE_LINE = "#527d72";
  const WAVE_CENTER = "#d9e4df";
  const PLAYHEAD = "#5a86a5";
  const MARKER = "#b96b6b";
  const MARKER_TEXT = "#ffffff";
  const MIN_MARKER_GAP = 0.005;

  function ensureAudioContext() {
    if (!state.audioContext) {
      state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return state.audioContext;
  }

  function setEnabled(enabled) {
    els.playPauseBtn.disabled = !enabled;
    els.stopBtn.disabled = !enabled;
    els.addMarkerBtn.disabled = !enabled;
    els.clearMarkersBtn.disabled = !enabled;
    els.zoomSlider.disabled = !enabled;
    if (els.waveScrollSlider) els.waveScrollSlider.disabled = !enabled || Number(els.waveScrollSlider.max || 0) <= 0;
    els.exportBtn.disabled = !enabled;
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds - Math.floor(seconds)) * 1000);
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
  }

  function formatDuration(seconds) {
    if (seconds >= 60) return formatTime(seconds);
    return `${seconds.toFixed(3)}s`;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getDuration() {
    return state.audioBuffer ? state.audioBuffer.duration : 0;
  }

  function getViewportSeconds() {
    const width = els.waveCanvas.clientWidth || els.waveViewport.clientWidth || 1;
    return width / Math.max(1, state.zoomPxPerSec);
  }

  function getMaxViewStart() {
    const duration = getDuration();
    const visible = getViewportSeconds();
    return Math.max(0, duration - visible);
  }

  function getFitZoomPxPerSec() {
    const duration = getDuration();
    const width = els.waveCanvas.clientWidth || els.waveViewport.clientWidth || 1;
    if (!duration || duration <= 0) return 120;
    return Math.max(1, Math.floor((width / duration) * 0.98));
  }

  function updateZoomControls({ fitIfNeeded = false } = {}) {
    if (!els.zoomSlider) return;
    const duration = getDuration();
    const width = els.waveCanvas.clientWidth || els.waveViewport.clientWidth || 1;
    const minZoom = 1;
    const fitZoom = getFitZoomPxPerSec();
    const maxZoom = Math.max(2200, Math.ceil(width / Math.max(duration || 1, 0.001)), fitZoom);

    els.zoomSlider.min = String(minZoom);
    els.zoomSlider.max = String(maxZoom);
    els.zoomSlider.step = "1";

    if (!state.audioBuffer) {
      state.zoomPxPerSec = clamp(Number(els.zoomSlider.value) || 120, minZoom, maxZoom);
    } else if (fitIfNeeded) {
      state.zoomPxPerSec = clamp(Math.min(Number(els.zoomSlider.value) || 120, fitZoom), minZoom, maxZoom);
    } else {
      state.zoomPxPerSec = clamp(state.zoomPxPerSec, minZoom, maxZoom);
    }

    els.zoomSlider.value = String(Math.round(state.zoomPxPerSec));
    els.zoomLabel.textContent = `${Math.round(state.zoomPxPerSec)} px/sec`;
  }

  function updateWaveScrollSlider() {
    if (!els.waveScrollSlider || !els.waveScrollRangeLabel) return;
    const duration = getDuration();
    const visible = getViewportSeconds();
    const maxStart = getMaxViewStart();
    const visibleEnd = Math.min(duration, state.viewStartSec + visible);

    els.waveScrollSlider.min = "0";
    els.waveScrollSlider.max = String(maxStart);
    els.waveScrollSlider.step = "0.001";
    els.waveScrollSlider.value = String(clamp(state.viewStartSec, 0, maxStart));
    els.waveScrollSlider.disabled = !state.audioBuffer || maxStart <= 0;
    els.waveScrollRangeLabel.textContent = `${formatTime(state.viewStartSec)} - ${formatTime(visibleEnd)}`;
  }

  function clampViewStart() {
    state.viewStartSec = clamp(state.viewStartSec, 0, getMaxViewStart());
  }

  function timeToX(time) {
    return (time - state.viewStartSec) * state.zoomPxPerSec;
  }

  function xToTime(x) {
    return clamp(state.viewStartSec + x / state.zoomPxPerSec, 0, getDuration());
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = els.waveViewport.getBoundingClientRect();
    els.waveCanvas.width = Math.max(1, Math.floor(rect.width * dpr));
    els.waveCanvas.height = Math.max(1, Math.floor(rect.height * dpr));
    els.waveCanvas.style.width = `${rect.width}px`;
    els.waveCanvas.style.height = `${rect.height}px`;
    const ctx = els.waveCanvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    updateZoomControls();
    clampViewStart();
    updateWaveScrollSlider();
    drawWaveform();
  }

  function drawWaveform() {
    const canvas = els.waveCanvas;
    const ctx = canvas.getContext("2d");
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = WAVE_BG;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = WAVE_CENTER;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    if (!state.audioBuffer) return;

    const duration = getDuration();
    const sampleRate = state.audioBuffer.sampleRate;
    const channelCount = state.audioBuffer.numberOfChannels;
    const startSample = Math.floor(state.viewStartSec * sampleRate);
    const samplesPerPixel = Math.max(1, Math.floor(sampleRate / state.zoomPxPerSec));
    const halfHeight = height * 0.42;
    const centerY = height / 2;

    ctx.strokeStyle = WAVE_LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = 0; x < width; x++) {
      const sampleStart = startSample + Math.floor(x * samplesPerPixel);
      const sampleEnd = Math.min(state.audioBuffer.length, sampleStart + samplesPerPixel);
      if (sampleStart >= state.audioBuffer.length) break;

      let min = 1;
      let max = -1;
      for (let ch = 0; ch < channelCount; ch++) {
        const data = state.audioBuffer.getChannelData(ch);
        for (let i = sampleStart; i < sampleEnd; i++) {
          const v = data[i] || 0;
          if (v < min) min = v;
          if (v > max) max = v;
        }
      }

      const y1 = centerY + min * halfHeight;
      const y2 = centerY + max * halfHeight;
      ctx.moveTo(x + 0.5, y1);
      ctx.lineTo(x + 0.5, y2);
    }
    ctx.stroke();

    drawMarkers(ctx, width, height);
    drawPlayhead(ctx, width, height);

    if (duration > 0) drawTimeRuler(ctx, width, height);
  }

  function drawMarkers(ctx, width, height) {
    const sorted = getSortedMarkers();
    sorted.forEach((marker, index) => {
      const x = timeToX(marker.time);
      if (x < -20 || x > width + 20) return;

      ctx.strokeStyle = MARKER;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      ctx.fillStyle = MARKER;
      roundRect(ctx, x - 14, 10, 28, 24, 12);
      ctx.fill();

      ctx.fillStyle = MARKER_TEXT;
      ctx.font = "700 12px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(index + 1), x, 22);
    });
  }

  function drawPlayhead(ctx, width, height) {
    const x = timeToX(state.currentTime);
    if (x < 0 || x > width) return;

    ctx.strokeStyle = PLAYHEAD;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();

    ctx.fillStyle = PLAYHEAD;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - 7, 12);
    ctx.lineTo(x + 7, 12);
    ctx.closePath();
    ctx.fill();
  }

  function drawTimeRuler(ctx, width, height) {
    const visibleSeconds = getViewportSeconds();
    const rawStep = visibleSeconds / 8;
    const step = niceStep(rawStep);
    const firstTick = Math.ceil(state.viewStartSec / step) * step;

    ctx.strokeStyle = "rgba(109, 127, 121, 0.25)";
    ctx.fillStyle = "#6d7f79";
    ctx.font = "700 11px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    for (let t = firstTick; t <= state.viewStartSec + visibleSeconds; t += step) {
      const x = timeToX(t);
      ctx.beginPath();
      ctx.moveTo(x, height - 28);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.fillText(formatTime(t), x, height - 31);
    }
  }

  function niceStep(value) {
    const steps = [0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
    return steps.find((step) => step >= value) || 1200;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }

  async function loadAudioFile(file) {
    if (!file) return;
    stopPlayback();
    setEnabled(false);
    els.exportStatus.textContent = t("loading");
    els.fileInfo.textContent = t("analyzingFile", file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const ctx = ensureAudioContext();
      const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));

      state.audioBuffer = decoded;
      state.fileName = file.name;
      state.currentTime = 0;
      state.viewStartSec = 0;
      state.markers = [];
      state.nextMarkerId = 1;
      updateZoomControls({ fitIfNeeded: true });
      state.viewStartSec = 0;

      els.emptyWave.style.display = "none";
      els.durationLabel.textContent = formatTime(decoded.duration);
      els.currentTimeLabel.textContent = formatTime(0);
      updateFileInfo();
      els.exportStatus.textContent = t("loadDone");
      setEnabled(true);
      renderAll();
    } catch (error) {
      console.error(error);
      els.fileInfo.textContent = t("loadFailFileInfo");
      els.exportStatus.textContent = t("loadFailStatus");
      setEnabled(false);
    }
  }

  function playPause() {
    if (!state.audioBuffer) return;
    if (state.isPlaying) {
      pausePlayback();
    } else {
      startPlayback(state.currentTime);
    }
  }

  function startPlayback(offset) {
    const ctx = ensureAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    stopSourceOnly();
    state.previewEndTime = null;
    state.previewSegmentIndex = null;

    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = state.audioBuffer;
    source.connect(gain).connect(ctx.destination);
    source.onended = () => {
      if (!state.isPlaying) return;
      finishPlaybackAt(state.previewEndTime == null ? getDuration() : state.previewEndTime);
    };

    state.sourceNode = source;
    state.gainNode = gain;
    state.sourceOffset = clamp(offset, 0, Math.max(0, getDuration() - 0.001));
    state.sourceStartedAt = ctx.currentTime;
    state.isPlaying = true;
    source.start(0, state.sourceOffset);
    els.playPauseBtn.textContent = t("pause");
    tick();
  }

  function pausePlayback() {
    updateCurrentTimeFromPlayback();
    stopSourceOnly();
    state.isPlaying = false;
    state.previewEndTime = null;
    state.previewSegmentIndex = null;
    els.playPauseBtn.textContent = t("play");
    updateTimeLabels();
    renderSegments();
    drawWaveform();
  }

  function stopPlayback() {
    stopSourceOnly();
    state.isPlaying = false;
    state.currentTime = 0;
    state.sourceOffset = 0;
    state.previewEndTime = null;
    state.previewSegmentIndex = null;
    els.playPauseBtn.textContent = t("play");
    updateTimeLabels();
    renderSegments();
    drawWaveform();
  }

  function finishPlaybackAt(time) {
    stopSourceOnly();
    state.isPlaying = false;
    state.currentTime = clamp(time, 0, getDuration());
    state.previewEndTime = null;
    state.previewSegmentIndex = null;
    els.playPauseBtn.textContent = t("play");
    updateTimeLabels();
    renderSegments();
    drawWaveform();
  }

  function stopSourceOnly() {
    if (state.sourceNode) {
      state.sourceNode.onended = null;
      try {
        state.sourceNode.stop();
      } catch (error) {
        // already stopped
      }
    }
    state.sourceNode = null;
    if (state.animationFrame) cancelAnimationFrame(state.animationFrame);
  }

  function tick() {
    if (!state.isPlaying) return;
    updateCurrentTimeFromPlayback();

    if (state.previewEndTime != null && state.currentTime >= state.previewEndTime) {
      finishPlaybackAt(state.previewEndTime);
      return;
    }

    if (state.currentTime >= getDuration()) {
      finishPlaybackAt(getDuration());
      return;
    }

    keepPlayheadVisible();
    updateTimeLabels();
    drawWaveform();
    state.animationFrame = requestAnimationFrame(tick);
  }

  function updateCurrentTimeFromPlayback() {
    if (!state.isPlaying || !state.audioContext) return;
    state.currentTime = clamp(
      state.sourceOffset + (state.audioContext.currentTime - state.sourceStartedAt),
      0,
      getDuration()
    );
  }

  function seekTo(time) {
    if (!state.audioBuffer) return;
    const wasPlaying = state.isPlaying;
    if (wasPlaying) pausePlayback();
    state.currentTime = clamp(time, 0, getDuration());
    if (wasPlaying) startPlayback(state.currentTime);
    updateTimeLabels();
    drawWaveform();
  }

  function keepPlayheadVisible() {
    const width = els.waveCanvas.clientWidth;
    const x = timeToX(state.currentTime);
    if (x > width * 0.88) {
      state.viewStartSec = state.currentTime - (width * 0.35) / state.zoomPxPerSec;
      clampViewStart();
    }
  }

  function updateTimeLabels() {
    els.currentTimeLabel.textContent = formatTime(state.currentTime);
    els.durationLabel.textContent = formatTime(getDuration());
  }

  function addMarker(time) {
    if (!state.audioBuffer) return;
    const duration = getDuration();
    const markerTime = clamp(time, 0, duration);
    const edgeTrim = els.trimSilentEdge.checked;

    if (edgeTrim && (markerTime <= MIN_MARKER_GAP || markerTime >= duration - MIN_MARKER_GAP)) {
      els.exportStatus.textContent = t("markerEdgeIgnored");
      return;
    }

    const near = state.markers.some((marker) => Math.abs(marker.time - markerTime) < MIN_MARKER_GAP);
    if (near) {
      els.exportStatus.textContent = t("markerNear");
      return;
    }

    state.markers.push({ id: state.nextMarkerId++, time: markerTime });
    state.markers.sort((a, b) => a.time - b.time);
    renderAll();
    els.exportStatus.textContent = t("markerAdded", formatTime(markerTime));
  }

  function removeMarker(id) {
    state.markers = state.markers.filter((marker) => marker.id !== id);
    renderAll();
  }

  function clearMarkers() {
    state.markers = [];
    renderAll();
    els.exportStatus.textContent = t("allMarkersCleared");
  }

  function getSortedMarkers() {
    return [...state.markers].sort((a, b) => a.time - b.time);
  }

  function getPointerPosition(event) {
    const rect = els.waveCanvas.getBoundingClientRect();
    return {
      x: clamp(event.clientX - rect.left, 0, rect.width),
      y: clamp(event.clientY - rect.top, 0, rect.height),
    };
  }

  function findMarkerAtX(x) {
    const sorted = getSortedMarkers();
    return sorted.find((marker) => Math.abs(timeToX(marker.time) - x) <= 10) || null;
  }

  function renderMarkers() {
    const sorted = getSortedMarkers();
    els.markerCount.textContent = String(sorted.length);

    if (!sorted.length) {
      els.markerList.className = "marker-list empty-list";
      els.markerList.textContent = t("noMarkers");
      return;
    }

    els.markerList.className = "marker-list";
    els.markerList.innerHTML = "";

    sorted.forEach((marker, index) => {
      const item = document.createElement("div");
      item.className = "marker-item";

      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = String(index + 1).padStart(2, "0");

      const info = document.createElement("div");
      const label = document.createElement("div");
      label.textContent = t("markerLabel", index + 1);
      label.className = "segment-name";
      const time = document.createElement("div");
      time.className = "marker-time";
      time.textContent = formatTime(marker.time);
      info.append(label, time);

      const actions = document.createElement("div");
      actions.style.display = "flex";
      actions.style.gap = "6px";

      const seek = document.createElement("button");
      seek.type = "button";
      seek.className = "small-btn";
      seek.textContent = t("seek");
      seek.addEventListener("click", () => seekTo(marker.time));

      const del = document.createElement("button");
      del.type = "button";
      del.className = "small-btn";
      del.textContent = t("delete");
      del.addEventListener("click", () => removeMarker(marker.id));

      actions.append(seek, del);
      item.append(badge, info, actions);
      els.markerList.appendChild(item);
    });
  }

  function parseNameLines() {
    return els.fileNamesInput.value
      .split(/\r?\n/)
      .map((line) => line.trim());
  }

  function sanitizeFileName(name) {
    const fallback = "segment.wav";
    let safe = String(name || "").trim();
    if (!safe) return fallback;
    safe = safe.replace(/[\\/:*?"<>|]/g, "_");
    safe = safe.replace(/[\u0000-\u001f]/g, "");
    safe = safe.replace(/\s+$/g, "");
    safe = safe.replace(/^\.+$/g, "");
    if (!safe) safe = fallback;
    if (!/\.wav$/i.test(safe)) safe += ".wav";
    return safe;
  }

  function autoName(index) {
    return `${String(index + 1).padStart(3, "0")}.wav`;
  }

  function updateFadeDurationLabel() {
    const value = clamp(Number(els.fadeDuration.value) || 0, 0, Number(els.fadeDuration.max) || 5);
    els.fadeDurationValue.textContent = `${value.toFixed(2)}s`;
  }

  function getFadeSettings() {
    return {
      fadeIn: Boolean(els.fadeInEnabled.checked),
      fadeOut: Boolean(els.fadeOutEnabled.checked),
      seconds: clamp(Number(els.fadeDuration.value) || 0, 0, Number(els.fadeDuration.max) || 5),
    };
  }

  function getEffectiveFadeSeconds(duration) {
    const settings = getFadeSettings();
    if (!settings.fadeIn && !settings.fadeOut) return 0;
    const maxFade = settings.fadeIn && settings.fadeOut ? duration / 2 : duration;
    return clamp(settings.seconds, 0, Math.max(0, maxFade));
  }

  function getExportMode() {
    return els.exportSelected.checked ? "selected" : "all";
  }

  function updateExportSelectionUI() {
    const selectedMode = getExportMode() === "selected";
    if (els.exportNumberChecklist) {
      els.exportNumberChecklist.classList.toggle("is-disabled", !selectedMode);
    }
  }

  function getSegmentKey(segment, index = 0) {
    const base = Number.isFinite(segment.originalIndex) ? segment.originalIndex : index;
    return String(base);
  }

  function getExportNumberLabel(segment, index = 0) {
    const name = String(segment.name || "").replace(/\.wav$/i, "");
    const numbered = name.match(/^(\d{3})/);
    if (numbered) return numbered[1];
    const original = Number.isFinite(segment.originalIndex) ? segment.originalIndex : index;
    return String(original + 1).padStart(3, "0");
  }

  function parseExportSelection(segments = []) {
    const mode = getExportMode();
    const visibleKeys = new Set(segments.map((segment, index) => getSegmentKey(segment, index)));

    if (mode === "all") {
      return {
        mode,
        selectedKeys: new Set(visibleKeys),
        selectedNumbers: new Set(segments.map((_, index) => index + 1)),
        invalid: [],
      };
    }

    const selectedKeys = new Set(
      [...state.selectedExportKeys].filter((key) => visibleKeys.has(key))
    );

    return {
      mode,
      selectedKeys,
      selectedNumbers: new Set(
        segments
          .map((segment, index) => selectedKeys.has(getSegmentKey(segment, index)) ? index + 1 : null)
          .filter((number) => number !== null)
      ),
      invalid: [],
    };
  }

  function renderExportNumberChecklist(segments = [], selection = parseExportSelection(segments)) {
    if (!els.exportNumberChecklist) return;

    const selectedMode = selection.mode === "selected";
    els.exportNumberChecklist.classList.toggle("is-disabled", !selectedMode);
    els.exportNumberChecklist.innerHTML = "";

    if (!segments.length) {
      const empty = document.createElement("div");
      empty.className = "export-check-empty";
      empty.textContent = t("exportChecklistEmpty");
      els.exportNumberChecklist.appendChild(empty);
      return;
    }

    const hint = document.createElement("div");
    hint.className = "export-check-hint";
    hint.textContent = t("exportChecklistHint");
    els.exportNumberChecklist.appendChild(hint);

    const list = document.createElement("div");
    list.className = "export-check-list";

    segments.forEach((segment, index) => {
      const key = getSegmentKey(segment, index);
      const label = document.createElement("label");
      label.className = "export-check-row";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.disabled = !selectedMode;
      checkbox.checked = selectedMode ? state.selectedExportKeys.has(key) : true;
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) state.selectedExportKeys.add(key);
        else state.selectedExportKeys.delete(key);
        renderSegments();
      });

      const number = document.createElement("span");
      number.className = "export-check-number";
      number.textContent = getExportNumberLabel(segment, index);

      label.append(checkbox, number);
      list.appendChild(label);
    });

    els.exportNumberChecklist.appendChild(list);
  }

  function getExportTargets(segments = getSegments()) {
    const selection = parseExportSelection(segments);
    const targets = segments
      .map((segment, index) => ({ ...segment, visibleIndex: index }))
      .filter((segment, index) => selection.selectedKeys.has(getSegmentKey(segment, index)));
    return { targets, selection };
  }

  function buildSegmentRanges() {
    if (!state.audioBuffer) return [];
    const duration = getDuration();
    const markerTimes = getSortedMarkers()
      .map((marker) => marker.time)
      .filter((time) => Number.isFinite(time));

    const points = [0, ...markerTimes, duration]
      .map((time) => clamp(time, 0, duration))
      .sort((a, b) => a - b);

    const uniquePoints = [];
    points.forEach((time) => {
      if (!uniquePoints.length || Math.abs(uniquePoints[uniquePoints.length - 1] - time) >= MIN_MARKER_GAP) {
        uniquePoints.push(time);
      }
    });

    if (uniquePoints.length < 2) {
      return [{ start: 0, end: duration, originalIndex: 0 }];
    }

    const ranges = [];
    for (let i = 0; i < uniquePoints.length - 1; i++) {
      const start = uniquePoints[i];
      const end = uniquePoints[i + 1];
      if (els.trimSilentEdge.checked && end - start < MIN_MARKER_GAP) continue;
      ranges.push({ start, end, originalIndex: ranges.length });
    }

    if (!ranges.length) {
      ranges.push({ start: 0, end: duration, originalIndex: 0 });
    }

    return ranges;
  }

  function getSegments() {
    const ranges = buildSegmentRanges();
    if (!ranges.length) return [];

    const nameLines = parseNameLines();
    const segments = [];

    if (isFileNameCharacterFiltered()) {
      // キャラ絞り込み中に打ったマーカーは、絞り込み後の台詞順に対応させる。
      // 旧処理では台本全体での entry.order を使っていたため、
      // 例：全体の9番目以降にある台詞が ranges[9] 以降を参照し、
      // 実際に絞り込み後の順番で14個マーカーを打っても候補が欠けることがあった。
      getFilteredScriptEntriesForFileNames().forEach((entry, filteredIndex) => {
        const range = ranges[filteredIndex];
        if (!range) return;
        segments.push({
          start: range.start,
          end: range.end,
          originalIndex: filteredIndex,
          scriptOrder: entry.order,
          name: sanitizeFileName(nameLines[filteredIndex] || entry.number || autoName(filteredIndex)),
        });
      });
    } else {
      ranges.forEach((range, index) => {
        segments.push({
          start: range.start,
          end: range.end,
          originalIndex: range.originalIndex,
          name: sanitizeFileName(nameLines[index] || autoName(index)),
        });
      });
    }

    return ensureUniqueNames(segments);
  }

  function ensureUniqueNames(segments) {
    const used = new Map();
    return segments.map((segment) => {
      const original = sanitizeFileName(segment.name);
      const count = used.get(original.toLowerCase()) || 0;
      used.set(original.toLowerCase(), count + 1);
      if (count === 0) return { ...segment, name: original };

      const dot = original.lastIndexOf(".");
      const base = dot >= 0 ? original.slice(0, dot) : original;
      const ext = dot >= 0 ? original.slice(dot) : ".wav";
      return { ...segment, name: `${base}_${count + 1}${ext}` };
    });
  }

  function renderSegments() {
    const segments = getSegments();
    updateExportScopeNote(segments.length);
    const selection = parseExportSelection(segments);
    renderExportNumberChecklist(segments, selection);
    const selectedCount = selection.selectedNumbers.size;
    els.segmentCount.textContent = selection.mode === "selected"
      ? `${selectedCount} / ${segments.length}`
      : String(segments.length);

    if (!state.audioBuffer) {
      els.segmentPreview.className = "segment-preview empty-list";
      els.segmentPreview.textContent = t("previewEmpty");
      return;
    }

    if (!segments.length) {
      els.segmentPreview.className = "segment-preview empty-list";
      els.segmentPreview.textContent = t("noTargets");
      return;
    }

    els.segmentPreview.className = "segment-preview";
    els.segmentPreview.innerHTML = "";

    segments.forEach((segment, index) => {
      const number = index + 1;
      const isTarget = selection.selectedKeys.has(getSegmentKey(segment, index));
      const item = document.createElement("div");
      item.className = selection.mode === "selected" && !isTarget
        ? "segment-item is-muted"
        : "segment-item";

      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = String(number).padStart(2, "0");

      const info = document.createElement("div");
      const name = document.createElement("div");
      name.className = "segment-name";
      name.textContent = segment.name;
      const meta = document.createElement("div");
      meta.className = "segment-meta";
      const fadeSeconds = getEffectiveFadeSeconds(segment.end - segment.start);
      const fadeText = fadeSeconds > 0 ? ` / ${t("fadePreviewLabel", fadeSeconds)}` : "";
      meta.textContent = `${formatTime(segment.start)} → ${formatTime(segment.end)} / ${formatDuration(segment.end - segment.start)}${fadeText}`;
      info.append(name, meta);

      const actions = document.createElement("div");
      actions.className = "segment-actions";

      if (selection.mode === "selected") {
        const tag = document.createElement("span");
        tag.className = "segment-tag";
        tag.textContent = isTarget ? t("selectedTag") : t("skippedTag");
        actions.appendChild(tag);
      }

      const preview = document.createElement("button");
      preview.type = "button";
      preview.className = "small-btn";
      preview.textContent = state.isPlaying && state.previewSegmentIndex === index ? t("stopPreviewBtn") : t("previewBtn");
      preview.addEventListener("click", () => {
        if (state.isPlaying && state.previewSegmentIndex === index) {
          stopPlayback();
          renderSegments();
        } else {
          startSegmentPreview(segment, index);
        }
      });
      actions.appendChild(preview);

      item.append(badge, info, actions);
      els.segmentPreview.appendChild(item);
    });
  }

  function applyFadeEnvelope(gain, playbackDuration, startTime) {
    const settings = getFadeSettings();
    const fadeSeconds = getEffectiveFadeSeconds(playbackDuration);
    gain.gain.cancelScheduledValues(startTime);
    gain.gain.setValueAtTime(settings.fadeIn && fadeSeconds > 0 ? 0 : 1, startTime);

    if (settings.fadeIn && fadeSeconds > 0) {
      gain.gain.linearRampToValueAtTime(1, startTime + fadeSeconds);
    }

    if (settings.fadeOut && fadeSeconds > 0) {
      const fadeOutStart = Math.max(startTime, startTime + playbackDuration - fadeSeconds);
      gain.gain.setValueAtTime(1, fadeOutStart);
      gain.gain.linearRampToValueAtTime(0, startTime + playbackDuration);
    }
  }

  function startSegmentPreview(segment, index) {
    if (!state.audioBuffer) return;
    const duration = Math.max(0, segment.end - segment.start);
    if (duration <= 0) return;

    const ctx = ensureAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    stopSourceOnly();

    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = state.audioBuffer;
    source.connect(gain).connect(ctx.destination);
    applyFadeEnvelope(gain, duration, ctx.currentTime);
    source.onended = () => {
      if (!state.isPlaying) return;
      finishPlaybackAt(segment.end);
    };

    state.sourceNode = source;
    state.gainNode = gain;
    state.sourceOffset = segment.start;
    state.sourceStartedAt = ctx.currentTime;
    state.previewEndTime = segment.end;
    state.previewSegmentIndex = index;
    state.currentTime = segment.start;
    state.isPlaying = true;

    source.start(0, segment.start, duration);
    els.playPauseBtn.textContent = t("pause");
    renderSegments();
    tick();
  }

  function renderAll() {
    updateZoomControls();
    clampViewStart();
    updateWaveScrollSlider();
    updateTimeLabels();
    renderMarkers();
    renderSegments();
    drawWaveform();
  }

  function encodeWavSegment(audioBuffer, startSec, endSec, fadeSettings = getFadeSettings()) {
    const sampleRate = audioBuffer.sampleRate;
    const channels = audioBuffer.numberOfChannels;
    const startSample = clamp(Math.floor(startSec * sampleRate), 0, audioBuffer.length);
    const endSample = clamp(Math.ceil(endSec * sampleRate), startSample, audioBuffer.length);
    const frameCount = Math.max(1, endSample - startSample);
    const bytesPerSample = 2;
    const blockAlign = channels * bytesPerSample;
    const dataSize = frameCount * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, dataSize, true);

    let offset = 44;
    const channelData = Array.from({ length: channels }, (_, ch) => audioBuffer.getChannelData(ch));
    const duration = frameCount / sampleRate;
    const maxFade = fadeSettings.fadeIn && fadeSettings.fadeOut ? duration / 2 : duration;
    const fadeSamples = Math.min(frameCount, Math.round(clamp(fadeSettings.seconds || 0, 0, maxFade) * sampleRate));

    for (let i = startSample; i < endSample; i++) {
      const rel = i - startSample;
      let amp = 1;
      if (fadeSettings.fadeIn && fadeSamples > 0 && rel < fadeSamples) {
        amp = Math.min(amp, rel / fadeSamples);
      }
      if (fadeSettings.fadeOut && fadeSamples > 0 && frameCount - 1 - rel < fadeSamples) {
        amp = Math.min(amp, Math.max(0, (frameCount - 1 - rel) / fadeSamples));
      }

      for (let ch = 0; ch < channels; ch++) {
        const sample = clamp((channelData[ch][i] || 0) * amp, -1, 1);
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }

    return new Blob([buffer], { type: "audio/wav" });
  }

  function writeString(view, offset, value) {
    for (let i = 0; i < value.length; i++) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  }

  async function exportSegments() {
    if (!state.audioBuffer) return;
    const allSegments = getSegments();
    const { targets: segments, selection } = getExportTargets(allSegments);
    if (selection.invalid.length) {
      els.exportStatus.textContent = t("exportSelectionInvalid");
      return;
    }
    if (!segments.length) {
      els.exportStatus.textContent = t("noSelectedTargets");
      return;
    }

    els.exportBtn.disabled = true;
    els.exportStatus.textContent = t("exportPreparing", 0, segments.length);

    try {
      const files = [];
      const fadeSettings = getFadeSettings();
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const blob = encodeWavSegment(state.audioBuffer, segment.start, segment.end, fadeSettings);
        files.push({ name: segment.name, blob });
        els.exportStatus.textContent = t("exportCutting", i + 1, segments.length);
        await waitFrame();
      }

      if (els.useFolderSave.checked && window.showDirectoryPicker) {
        await saveFilesToDirectory(files);
        els.exportStatus.textContent = t("savedDirectory", files.length);
      } else {
        const zipBlob = await createZip(files);
        const baseName = sanitizeFileName(state.fileName || "wav_marker_cutter.wav").replace(/\.wav$/i, "");
        downloadBlob(zipBlob, `${baseName}_split.zip`);
        const note = els.useFolderSave.checked && !window.showDirectoryPicker
          ? t("browserZipFallback", files.length)
          : t("zipExported", files.length);
        els.exportStatus.textContent = note;
      }
    } catch (error) {
      console.error(error);
      els.exportStatus.textContent = t("exportFailed", error.message || error);
    } finally {
      els.exportBtn.disabled = false;
    }
  }

  async function saveFilesToDirectory(files) {
    const dirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    for (const file of files) {
      const handle = await dirHandle.getFileHandle(file.name, { create: true });
      const writable = await handle.createWritable();
      await writable.write(file.blob);
      await writable.close();
    }
  }

  function waitFrame() {
    return new Promise((resolve) => requestAnimationFrame(resolve));
  }

  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  async function createZip(files) {
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let offset = 0;

    for (const file of files) {
      const data = new Uint8Array(await file.blob.arrayBuffer());
      const nameBytes = encoder.encode(file.name);
      const crc = crc32(data);
      const mod = dosDateTime(new Date());

      const local = new ArrayBuffer(30 + nameBytes.length);
      const localView = new DataView(local);
      localView.setUint32(0, 0x04034b50, true);
      localView.setUint16(4, 20, true);
      localView.setUint16(6, 0x0800, true);
      localView.setUint16(8, 0, true);
      localView.setUint16(10, mod.time, true);
      localView.setUint16(12, mod.date, true);
      localView.setUint32(14, crc, true);
      localView.setUint32(18, data.length, true);
      localView.setUint32(22, data.length, true);
      localView.setUint16(26, nameBytes.length, true);
      localView.setUint16(28, 0, true);
      new Uint8Array(local, 30).set(nameBytes);

      localParts.push(local, data);

      const central = new ArrayBuffer(46 + nameBytes.length);
      const centralView = new DataView(central);
      centralView.setUint32(0, 0x02014b50, true);
      centralView.setUint16(4, 20, true);
      centralView.setUint16(6, 20, true);
      centralView.setUint16(8, 0x0800, true);
      centralView.setUint16(10, 0, true);
      centralView.setUint16(12, mod.time, true);
      centralView.setUint16(14, mod.date, true);
      centralView.setUint32(16, crc, true);
      centralView.setUint32(20, data.length, true);
      centralView.setUint32(24, data.length, true);
      centralView.setUint16(28, nameBytes.length, true);
      centralView.setUint16(30, 0, true);
      centralView.setUint16(32, 0, true);
      centralView.setUint16(34, 0, true);
      centralView.setUint16(36, 0, true);
      centralView.setUint32(38, 0, true);
      centralView.setUint32(42, offset, true);
      new Uint8Array(central, 46).set(nameBytes);

      centralParts.push(central);
      offset += local.byteLength + data.length;
    }

    const centralSize = centralParts.reduce((sum, part) => sum + part.byteLength, 0);
    const end = new ArrayBuffer(22);
    const endView = new DataView(end);
    endView.setUint32(0, 0x06054b50, true);
    endView.setUint16(4, 0, true);
    endView.setUint16(6, 0, true);
    endView.setUint16(8, files.length, true);
    endView.setUint16(10, files.length, true);
    endView.setUint32(12, centralSize, true);
    endView.setUint32(16, offset, true);
    endView.setUint16(20, 0, true);

    return new Blob([...localParts, ...centralParts, end], { type: "application/zip" });
  }

  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c >>> 0;
    }
    return table;
  })();

  function crc32(data) {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
      crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function dosDateTime(date) {
    const year = Math.max(1980, date.getFullYear());
    const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
    const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
    return { time: dosTime, date: dosDate };
  }

  function onWaveMouseDown(event) {
    if (!state.audioBuffer) return;
    const pos = getPointerPosition(event);
    const marker = findMarkerAtX(pos.x);

    if (event.button === 0 && marker) {
      state.dragMarkerId = marker.id;
      event.preventDefault();
      return;
    }

    if (event.button === 0) {
      seekTo(xToTime(pos.x));
    }
  }

  function onWaveMouseMove(event) {
    if (!state.audioBuffer || state.dragMarkerId == null) return;
    const pos = getPointerPosition(event);
    const time = xToTime(pos.x);
    const duration = getDuration();
    const marker = state.markers.find((item) => item.id === state.dragMarkerId);
    if (!marker) return;

    marker.time = clamp(time, MIN_MARKER_GAP, Math.max(MIN_MARKER_GAP, duration - MIN_MARKER_GAP));
    state.markers.sort((a, b) => a.time - b.time);
    renderAll();
  }

  function onWaveMouseUp() {
    state.dragMarkerId = null;
  }

  function onWaveContextMenu(event) {
    if (!state.audioBuffer) return;
    event.preventDefault();
    const pos = getPointerPosition(event);
    addMarker(xToTime(pos.x));
  }

  function onWaveWheel(event) {
    if (!state.audioBuffer) return;
    event.preventDefault();

    const pos = getPointerPosition(event);
    const beforeTime = xToTime(pos.x);

    if (event.ctrlKey) {
      const direction = event.deltaY < 0 ? 1 : -1;
      const factor = direction > 0 ? 1.16 : 1 / 1.16;
      const nextZoom = clamp(state.zoomPxPerSec * factor, Number(els.zoomSlider.min), Number(els.zoomSlider.max));
      state.zoomPxPerSec = nextZoom;
      els.zoomSlider.value = String(Math.round(nextZoom));
      els.zoomLabel.textContent = `${Math.round(nextZoom)} px/sec`;
      state.viewStartSec = beforeTime - pos.x / state.zoomPxPerSec;
    } else {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      state.viewStartSec += delta / state.zoomPxPerSec;
    }

    renderAll();
  }

  function onZoomSliderInput() {
    if (!state.audioBuffer) return;
    const width = els.waveCanvas.clientWidth || els.waveViewport.clientWidth || 1;
    const centerTime = state.viewStartSec + (width / 2) / Math.max(1, state.zoomPxPerSec);
    state.zoomPxPerSec = clamp(Number(els.zoomSlider.value) || 1, Number(els.zoomSlider.min) || 1, Number(els.zoomSlider.max) || 2200);
    els.zoomLabel.textContent = `${Math.round(state.zoomPxPerSec)} px/sec`;
    state.viewStartSec = centerTime - (width / 2) / state.zoomPxPerSec;
    renderAll();
  }

  function onWaveScrollSliderInput() {
    if (!state.audioBuffer || !els.waveScrollSlider) return;
    state.viewStartSec = clamp(Number(els.waveScrollSlider.value) || 0, 0, getMaxViewStart());
    renderAll();
  }

  function bindEvents() {
    els.audioFile.addEventListener("change", (event) => loadAudioFile(event.target.files[0]));
    els.scriptFile.addEventListener("change", (event) => loadScriptFile(event.target.files[0]));
    els.scriptEditor.addEventListener("compositionstart", () => {
      state.isComposingScript = true;
    });
    els.scriptEditor.addEventListener("compositionend", () => {
      state.isComposingScript = false;
      state.scriptText = getScriptEditorText();
      // 入力中に innerHTML を作り直すと、Backspace で行が増える場合があるため
      // 編集中は解析・ファイル名同期だけ行い、装飾の再描画は blur / paste / 読み込み時に限定する。
      processScriptText({ syncFileNames: true, renderEditor: false });
    });
    els.scriptEditor.addEventListener("input", () => {
      if (state.isRenderingScript || state.isComposingScript || els.scriptEditor.contentEditable === "false") return;
      state.scriptText = getScriptEditorText();
      processScriptText({ syncFileNames: true, renderEditor: false });
    });
    els.scriptEditor.addEventListener("blur", () => {
      if (els.scriptEditor.contentEditable === "false") return;
      state.scriptText = getScriptEditorText();
      processScriptText({ syncFileNames: true, preserveCaret: false, renderEditor: true });
    });
    els.scriptEditor.addEventListener("paste", (event) => {
      if (els.scriptEditor.contentEditable === "false") return;
      event.preventDefault();
      insertPlainTextAtSelection(event.clipboardData.getData("text/plain"));
      state.scriptText = getScriptEditorText();
      processScriptText({ syncFileNames: true, preserveCaret: true, renderEditor: true });
    });
    els.scriptCharacterFilter.addEventListener("change", () => {
      renderScriptEditor(false);
      updateScriptStats();
    });
    els.fileNameCharacterFilter.addEventListener("change", () => {
      if (state.scriptNamesActive) syncFileNameListFromScript();
      renderSegments();
    });
    els.playPauseBtn.addEventListener("click", playPause);
    els.stopBtn.addEventListener("click", stopPlayback);
    els.addMarkerBtn.addEventListener("click", () => addMarker(state.currentTime));
    els.clearMarkersBtn.addEventListener("click", clearMarkers);
    els.zoomSlider.addEventListener("input", onZoomSliderInput);
    if (els.waveScrollSlider) els.waveScrollSlider.addEventListener("input", onWaveScrollSliderInput);
    els.fileNamesInput.addEventListener("input", () => {
      if (!state.isSyncingFileNames) state.scriptNamesActive = false;
      renderSegments();
    });
    els.exportAll.addEventListener("change", () => {
      updateExportSelectionUI();
      renderSegments();
    });
    els.exportSelected.addEventListener("change", () => {
      updateExportSelectionUI();
      renderSegments();
    });
    if (els.exportNumberChecklist) renderExportNumberChecklist(getSegments());
    els.fadeInEnabled.addEventListener("change", renderSegments);
    els.fadeOutEnabled.addEventListener("change", renderSegments);
    els.fadeDuration.addEventListener("input", () => {
      updateFadeDurationLabel();
      renderSegments();
    });
    els.languageSelect.addEventListener("change", () => {
      state.lang = els.languageSelect.value;
      localStorage.setItem("wmc_language_v2", state.lang);
      applyLanguage();
    });
    els.trimSilentEdge.addEventListener("change", renderAll);
    els.exportBtn.addEventListener("click", exportSegments);

    els.waveViewport.addEventListener("mousedown", onWaveMouseDown);
    window.addEventListener("mousemove", onWaveMouseMove);
    window.addEventListener("mouseup", onWaveMouseUp);
    els.waveViewport.addEventListener("contextmenu", onWaveContextMenu);
    els.waveViewport.addEventListener("wheel", onWaveWheel, { passive: false });

    window.addEventListener("resize", resizeCanvas);

    els.openHelpBtn.addEventListener("click", () => els.helpDialog.showModal());
    els.closeHelpBtn.addEventListener("click", () => els.helpDialog.close());
    els.helpDialog.addEventListener("click", (event) => {
      if (event.target === els.helpDialog) els.helpDialog.close();
    });

    window.addEventListener("keydown", (event) => {
      if (!state.audioBuffer) return;
      if (event.code === "Space" && !isTextEditingElement(document.activeElement)) {
        event.preventDefault();
        playPause();
      }
      if (event.key.toLowerCase() === "m" && !isTextEditingElement(document.activeElement)) {
        addMarker(state.currentTime);
      }
    });
  }

  bindEvents();
  resizeCanvas();
  applyLanguage();
})();
