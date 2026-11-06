// SEOULIS Global i18n — applied to all pages
(function() {
  const T = {
    EN: {},
    KO: {
      // Nav
      'Home':'홈','Articles':'기사','Weather':'날씨','Events':'이벤트','Essentials':'필수정보',
      'Courses':'코스','Live':'라이브','CAFÉ':'카페',
      // Sections
      'Latest from Seoul':'서울 최신 소식',
      "Today's Weather & What to Wear":'오늘의 날씨 & 스타일',
      'Upcoming Events':'다가오는 이벤트',
      'Korea Essentials for First-Timers':'처음 오는 분 필수 정보',
      'Must-Do Courses':'추천 코스',
      // Hero
      'Seoul Is Where You Belong':'서울이 당신의 집입니다',
      'Your insider guide to K-culture, travel & local life':'K-컬처, 여행, 현지 생활의 인사이더 가이드',
      'Explore Seoul →':'서울 탐색하기 →',
      // Common
      'Get Info →':'정보 보기 →','Explore →':'탐색하기 →','View Plans →':'요금제 보기 →',
      'Read More':'더 보기','min read':'분 읽기',
      // Events page
      'What\'s On in Korea':'한국 이벤트 일정',
      'Filter by Category':'카테고리 필터',
      // Articles
      'All Articles':'전체 기사','Latest':'최신','K-Pop':'K팝','K-Drama':'K드라마',
      'Food':'음식','Travel':'여행','Culture':'문화',
    },
    JA: {
      'Home':'ホーム','Articles':'記事','Weather':'天気','Events':'イベント','Essentials':'必須情報',
      'Courses':'コース','Live':'ライブ','CAFÉ':'カフェ',
      'Latest from Seoul':'ソウル最新情報',
      "Today's Weather & What to Wear":'今日の天気とスタイル',
      'Upcoming Events':'イベント情報',
      'Korea Essentials for First-Timers':'初めての方への必須情報',
      'Must-Do Courses':'おすすめコース',
      'Seoul Is Where You Belong':'ソウルはあなたの居場所',
      'Your insider guide to K-culture, travel & local life':'K-カルチャー・旅行・現地生活のインサイダーガイド',
      'Explore Seoul →':'ソウルを探索 →',
      'Get Info →':'情報を見る →','Explore →':'探索する →',
      'What\'s On in Korea':'韓国のイベント情報',
      'All Articles':'全記事','Latest':'最新','K-Pop':'K-ポップ','Food':'グルメ','Travel':'旅行','Culture':'文化',
    },
    ZH: {
      'Home':'首页','Articles':'文章','Weather':'天气','Events':'活动','Essentials':'必备信息',
      'Courses':'课程','Live':'直播','CAFÉ':'咖啡厅',
      'Latest from Seoul':'首尔最新资讯',
      "Today's Weather & What to Wear":'今日天气与穿搭',
      'Upcoming Events':'近期活动',
      'Korea Essentials for First-Timers':'初次到访必备信息',
      'Must-Do Courses':'推荐路线',
      'Seoul Is Where You Belong':'首尔是你的归属',
      'Your insider guide to K-culture, travel & local life':'K文化、旅行与本地生活的内部指南',
      'Explore Seoul →':'探索首尔 →',
      'Get Info →':'查看详情 →','Explore →':'探索 →',
      'What\'s On in Korea':'韩国活动一览',
      'All Articles':'全部文章','Latest':'最新','Food':'美食','Travel':'旅行','Culture':'文化',
    },
    VI: {
      'Home':'Trang chủ','Articles':'Bài viết','Weather':'Thời tiết','Events':'Sự kiện','Essentials':'Thông tin',
      'Courses':'Hành trình','Live':'Trực tiếp',
      'Latest from Seoul':'Tin tức mới nhất từ Seoul',
      "Today's Weather & What to Wear":'Thời tiết hôm nay & Phong cách',
      'Upcoming Events':'Sự kiện sắp tới',
      'Korea Essentials for First-Timers':'Thông tin cần thiết cho lần đầu',
      'Seoul Is Where You Belong':'Seoul là nơi bạn thuộc về',
      'Explore Seoul →':'Khám phá Seoul →',
      'Get Info →':'Xem thông tin →',
    },
    TH: {
      'Home':'หน้าแรก','Articles':'บทความ','Weather':'สภาพอากาศ','Events':'กิจกรรม','Essentials':'ข้อมูลจำเป็น',
      'Courses':'เส้นทาง','Live':'สด',
      'Latest from Seoul':'ข่าวล่าสุดจากโซล',
      "Today's Weather & What to Wear":'สภาพอากาศวันนี้และสไตล์',
      'Upcoming Events':'กิจกรรมที่กำลังจะมาถึง',
      'Seoul Is Where You Belong':'โซลคือที่ที่คุณเป็นของ',
      'Explore Seoul →':'สำรวจโซล →',
      'Get Info →':'ดูข้อมูล →',
    },
    ID: {
      'Home':'Beranda','Articles':'Artikel','Weather':'Cuaca','Events':'Acara','Essentials':'Info Penting',
      'Courses':'Rute','Live':'Siaran',
      'Latest from Seoul':'Terbaru dari Seoul',
      "Today's Weather & What to Wear":'Cuaca Hari Ini & Gaya',
      'Upcoming Events':'Acara Mendatang',
      'Seoul Is Where You Belong':'Seoul Adalah Tempat Anda',
      'Explore Seoul →':'Jelajahi Seoul →',
      'Get Info →':'Lihat Info →',
    },
  };

  let currentLang = localStorage.getItem('seoulis_lang') || 'EN';

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('seoulis_lang', lang);
    const t = T[lang] || {};

    // 모든 텍스트 노드 번역
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (t[key]) el.textContent = t[key];
      else if (lang === 'EN') el.textContent = key;
    });

    // nav 링크 텍스트
    document.querySelectorAll('nav a, .nav-links a').forEach(el => {
      const txt = el.textContent.trim();
      if (t[txt]) el.textContent = t[txt];
      else if (lang === 'EN' && T.KO[txt]) {
        const orig = Object.keys(T.KO).find(k => T.KO[k] === txt);
        if (orig) el.textContent = orig;
      }
    });

    // section-title
    document.querySelectorAll('.section-title span, .section-title').forEach(el => {
      const txt = el.textContent.trim();
      if (t[txt]) el.textContent = t[txt];
    });

    // 버튼 active 상태
    document.querySelectorAll('[data-lang]').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });

    document.documentElement.lang = lang.toLowerCase();
    showToast('✓ ' + lang);
  }

  function showToast(msg) {
    let t = document.getElementById('lang-toast');
    if (!t) { t = document.createElement('div'); t.id = 'lang-toast'; t.style.cssText = 'position:fixed;bottom:5rem;right:1.5rem;background:#c9a84c;color:#000;padding:6px 14px;border-radius:999px;font-size:.8rem;font-weight:700;z-index:9999;opacity:0;transition:opacity .3s'; document.body.appendChild(t); }
    t.textContent = msg;
    t.style.opacity = '1';
    setTimeout(() => t.style.opacity = '0', 1800);
  }

  // 모든 lang 버튼에 이벤트 연결
  function bindLangButtons() {
    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.addEventListener('click', () => applyLang(btn.dataset.lang));
    });
  }

  // DOM 로드 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { bindLangButtons(); if (currentLang !== 'EN') applyLang(currentLang); });
  } else {
    bindLangButtons();
    if (currentLang !== 'EN') applyLang(currentLang);
  }

  // 전역 노출
  window.seoulisLang = { apply: applyLang, current: () => currentLang };
})();
