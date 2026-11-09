(function () {
  'use strict';

  var progress = document.querySelector('.progress');
  var progressBar = document.querySelector('.progress__bar');
  var hero = document.querySelector('.hero');
  var heroBg = document.querySelector('.hero__bg');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================
     [효과 1] 스크롤 페이드인 (아래 → 위)
     - IntersectionObserver로 요소가 화면에 들어오면 .is-visible 추가
     - 같은 섹션 안의 요소들은 순서대로 0.15초씩 지연을 줘서
       제목 → 문장 → 이미지 순으로 자연스럽게 등장
     ========================================= */
  var groups = document.querySelectorAll('.hero__content, .section');
  groups.forEach(function (group) {
    group.querySelectorAll('.reveal').forEach(function (el, i) {
      el.style.setProperty('--delay', (i * 0.15) + 's');
    });
  });

  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !reduceMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // 한 번만 실행
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -10% 0px'     // 화면 하단보다 조금 위에서 시작
    });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    // 미지원 브라우저 / 움직임 줄이기 설정 시 바로 표시
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* =========================================
     스크롤 이벤트 처리
     - requestAnimationFrame으로 한 프레임에 한 번만 계산 (성능 최적화)
     ========================================= */
  var ticking = false;

  function onScroll() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;

    /* [효과 3] 프로그래스 바: 전체 스크롤 가능한 높이 대비 현재 위치 비율 */
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
    progressBar.style.transform = 'scaleX(' + ratio + ')';

    // 히어로 영역 위에서는 프로그래스 바를 흰색으로 표시
    progress.classList.toggle('is-on-hero', scrollY < hero.offsetHeight - 3);

    /* [효과 2] 히어로 패럴랙스
       - 스크롤 양의 30%만 이동시켜 콘텐츠보다 느리게 움직이는 느낌
       - 히어로가 화면에 보일 때만 계산 */
    if (!reduceMotion && scrollY <= hero.offsetHeight) {
      heroBg.style.transform = 'translate3d(0, ' + (scrollY * 0.3) + 'px, 0)';
    }

    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);
  onScroll(); // 첫 로드 시 초기값 반영
})();
