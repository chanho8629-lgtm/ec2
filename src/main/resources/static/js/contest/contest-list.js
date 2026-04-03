const ContestListModule = (function () {

    /* ───── 샘플 데이터 (20개) ───── */
    const ITEMS_DATA = [
        {
            title: "2026 신인 영상 크리에이터 공모전",
            host: "BIDEO 공식",
            banner: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            avatar: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            status: "모집중",
            period: "2026.03.01 ~ 2026.04.30",
            entries: "128개",
            views: "2,340",
            prize: "총 500만원",
            announce: "2026.05.15",
            desc: "영상 제작에 관심 있는 누구나 참가할 수 있는 공모전입니다. 자유 주제로 3분 이내의 영상을 제출해 주세요.",
            tags: ["#영상공모전", "#크리에이터", "#신인", "#BIDEO"],
            duration: "1:47",
            thumb: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            createdAt: "2026-03-01",
            deadlineDate: "2026-04-30",
            viewCount: 2340,
            scope: "joined"
        },
        {
            title: "감성 뮤직비디오 챌린지",
            host: "Yebit 예빗",
            banner: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            avatar: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            status: "모집중",
            period: "2026.02.15 ~ 2026.05.15",
            entries: "56개",
            views: "1,919",
            prize: "총 300만원",
            announce: "2026.06.01",
            desc: "좋아하는 음악에 직접 뮤직비디오를 만들어 보세요. 감성적인 영상미와 스토리텔링을 평가합니다.",
            tags: ["#뮤직비디오", "#감성", "#챌린지"],
            duration: "3:49",
            thumb: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            createdAt: "2026-02-15",
            deadlineDate: "2026-05-15",
            viewCount: 1919,
            scope: "joined"
        },
        {
            title: "다큐멘터리 단편 영화제",
            host: "인간개조 용광로",
            banner: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            avatar: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            status: "마감임박",
            period: "2026.01.10 ~ 2026.04.10",
            entries: "312개",
            views: "5,830",
            prize: "총 1,000만원",
            announce: "2026.05.01",
            desc: "일상 속 숨겨진 이야기를 다큐멘터리로 담아보세요. 10분 이내의 단편 다큐멘터리를 모집합니다.",
            tags: ["#다큐멘터리", "#단편영화", "#영화제"],
            duration: "12:47",
            thumb: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            createdAt: "2026-01-10",
            deadlineDate: "2026-04-10",
            viewCount: 5830,
            scope: "mine"
        },
        {
            title: "경제 교육 영상 콘테스트",
            host: "EBS",
            banner: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            avatar: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            status: "모집중",
            period: "2026.03.15 ~ 2026.06.15",
            entries: "45개",
            views: "890",
            prize: "총 200만원",
            announce: "2026.07.10",
            desc: "경제 개념을 쉽고 재미있게 설명하는 교육 영상을 만들어 주세요.",
            tags: ["#경제교육", "#EBS", "#콘테스트"],
            duration: "5:20",
            thumb: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            createdAt: "2026-03-15",
            deadlineDate: "2026-06-15",
            viewCount: 890
        },
        {
            title: "토크쇼 형식 인터뷰 영상 공모",
            host: "짠한형 신동엽",
            banner: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            avatar: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            status: "접수마감",
            period: "2026.01.01 ~ 2026.03.01",
            entries: "203개",
            views: "7,120",
            prize: "총 800만원",
            announce: "2026.04.01",
            desc: "주변의 흥미로운 인물을 인터뷰하여 토크쇼 형식의 영상을 만들어 보세요.",
            tags: ["#토크쇼", "#인터뷰", "#영상공모"],
            duration: "59:56",
            thumb: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            createdAt: "2026-01-01",
            deadlineDate: "2026-03-01",
            viewCount: 7120
        },
        {
            title: "환경 보호 캠페인 영상 공모전",
            host: "그린피스 코리아",
            banner: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            avatar: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            status: "모집중",
            period: "2026.04.01 ~ 2026.06.30",
            entries: "32개",
            views: "1,250",
            prize: "총 400만원",
            announce: "2026.07.20",
            desc: "환경 보호의 중요성을 알리는 2분 이내의 캠페인 영상을 제작해 주세요.",
            tags: ["#환경", "#캠페인", "#그린피스"],
            duration: "2:15",
            thumb: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            createdAt: "2026-04-01",
            deadlineDate: "2026-06-30",
            viewCount: 1250,
            scope: "joined"
        },
        {
            title: "대학생 브이로그 챌린지",
            host: "유니브 미디어",
            banner: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            avatar: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            status: "모집중",
            period: "2026.03.20 ~ 2026.05.20",
            entries: "89개",
            views: "3,410",
            prize: "총 150만원",
            announce: "2026.06.10",
            desc: "대학 생활의 하루를 브이로그로 담아보세요. 개성 있는 편집과 스토리가 핵심입니다.",
            tags: ["#브이로그", "#대학생", "#챌린지"],
            duration: "8:32",
            thumb: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            createdAt: "2026-03-20",
            deadlineDate: "2026-05-20",
            viewCount: 3410
        },
        {
            title: "AI 기술 소개 영상 콘테스트",
            host: "테크 코리아",
            banner: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            avatar: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            status: "마감임박",
            period: "2026.02.01 ~ 2026.04.05",
            entries: "178개",
            views: "6,200",
            prize: "총 700만원",
            announce: "2026.05.10",
            desc: "AI 기술을 일반인도 이해할 수 있게 쉽게 설명하는 영상을 만들어 주세요.",
            tags: ["#AI", "#기술", "#테크"],
            duration: "7:10",
            thumb: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            createdAt: "2026-02-01",
            deadlineDate: "2026-04-05",
            viewCount: 6200
        },
        {
            title: "여행 숏폼 영상 페스티벌",
            host: "한국관광공사",
            banner: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            avatar: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            status: "모집중",
            period: "2026.03.10 ~ 2026.07.10",
            entries: "67개",
            views: "4,580",
            prize: "총 600만원",
            announce: "2026.08.01",
            desc: "한국의 아름다운 여행지를 60초 이내 숏폼으로 표현해 주세요.",
            tags: ["#여행", "#숏폼", "#관광공사"],
            duration: "0:58",
            thumb: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            createdAt: "2026-03-10",
            deadlineDate: "2026-07-10",
            viewCount: 4580
        },
        {
            title: "반려동물 일상 영상 공모",
            host: "펫프렌즈",
            banner: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            avatar: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            status: "접수마감",
            period: "2025.12.01 ~ 2026.02.28",
            entries: "445개",
            views: "9,870",
            prize: "총 350만원",
            announce: "2026.03.20",
            desc: "반려동물과 함께하는 일상을 영상으로 기록해 주세요. 재미와 감동 모두 환영합니다.",
            tags: ["#반려동물", "#펫", "#일상"],
            duration: "4:22",
            thumb: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            createdAt: "2025-12-01",
            deadlineDate: "2026-02-28",
            viewCount: 9870
        },
        {
            title: "독립영화 시나리오 영상화 공모",
            host: "서울독립영화제",
            banner: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            avatar: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            status: "모집중",
            period: "2026.04.01 ~ 2026.08.01",
            entries: "15개",
            views: "780",
            prize: "총 1,500만원",
            announce: "2026.09.01",
            desc: "제공되는 시나리오를 바탕으로 15분 이내 단편 영화를 제작해 주세요.",
            tags: ["#독립영화", "#시나리오", "#단편"],
            duration: "15:00",
            thumb: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            createdAt: "2026-04-01",
            deadlineDate: "2026-08-01",
            viewCount: 780,
            scope: "mine"
        },
        {
            title: "K-POP 커버 댄스 영상 공모전",
            host: "케이팝 월드",
            banner: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            avatar: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            status: "마감임박",
            period: "2026.02.10 ~ 2026.04.08",
            entries: "520개",
            views: "12,300",
            prize: "총 900만원",
            announce: "2026.05.01",
            desc: "K-POP 아티스트의 안무를 커버하여 영상으로 촬영해 주세요. 개인/팀 모두 참가 가능합니다.",
            tags: ["#KPOP", "#커버댄스", "#댄스"],
            duration: "3:30",
            thumb: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            createdAt: "2026-02-10",
            deadlineDate: "2026-04-08",
            viewCount: 12300,
            scope: "joined"
        },
        {
            title: "요리 레시피 영상 콘테스트",
            host: "쿡방 TV",
            banner: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            avatar: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            status: "모집중",
            period: "2026.03.25 ~ 2026.05.25",
            entries: "73개",
            views: "2,100",
            prize: "총 250만원",
            announce: "2026.06.15",
            desc: "5분 이내로 완성하는 간단 레시피 영상을 제출해 주세요. 창의적인 요리를 기대합니다.",
            tags: ["#요리", "#레시피", "#쿡방"],
            duration: "4:55",
            thumb: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            createdAt: "2026-03-25",
            deadlineDate: "2026-05-25",
            viewCount: 2100
        },
        {
            title: "게임 하이라이트 편집 공모",
            host: "게임즈 코리아",
            banner: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            avatar: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            status: "모집중",
            period: "2026.03.05 ~ 2026.05.05",
            entries: "198개",
            views: "8,450",
            prize: "총 500만원",
            announce: "2026.06.01",
            desc: "게임 플레이 하이라이트를 재미있게 편집한 영상을 모집합니다. 장르 무관.",
            tags: ["#게임", "#하이라이트", "#편집"],
            duration: "6:12",
            thumb: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            createdAt: "2026-03-05",
            deadlineDate: "2026-05-05",
            viewCount: 8450
        },
        {
            title: "사회 공익 광고 영상 공모전",
            host: "공익광고협의회",
            banner: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            avatar: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            status: "접수마감",
            period: "2025.11.01 ~ 2026.01.31",
            entries: "387개",
            views: "11,200",
            prize: "총 1,200만원",
            announce: "2026.03.01",
            desc: "사회 문제를 다루는 30초~1분 길이의 공익 광고 영상을 제출해 주세요.",
            tags: ["#공익광고", "#사회", "#캠페인"],
            duration: "0:45",
            thumb: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            createdAt: "2025-11-01",
            deadlineDate: "2026-01-31",
            viewCount: 11200
        },
        {
            title: "패션 룩북 영상 챌린지",
            host: "스타일 매거진",
            banner: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            avatar: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            status: "모집중",
            period: "2026.03.28 ~ 2026.06.28",
            entries: "41개",
            views: "1,680",
            prize: "총 300만원",
            announce: "2026.07.15",
            desc: "자신만의 패션 스타일을 룩북 영상으로 표현해 주세요. 시즌별 코디 추천도 좋습니다.",
            tags: ["#패션", "#룩북", "#스타일"],
            duration: "2:40",
            thumb: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            createdAt: "2026-03-28",
            deadlineDate: "2026-06-28",
            viewCount: 1680
        },
        {
            title: "우주 과학 다큐 영상 공모",
            host: "한국천문연구원",
            banner: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            avatar: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            status: "모집중",
            period: "2026.04.02 ~ 2026.07.02",
            entries: "22개",
            views: "950",
            prize: "총 600만원",
            announce: "2026.08.10",
            desc: "우주와 천문학에 관한 다큐멘터리 스타일 영상을 제작해 주세요. 10분 이내.",
            tags: ["#우주", "#과학", "#다큐"],
            duration: "9:45",
            thumb: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            createdAt: "2026-04-02",
            deadlineDate: "2026-07-02",
            viewCount: 950
        },
        {
            title: "스포츠 하이라이트 영상 콘테스트",
            host: "스포츠 코리아",
            banner: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            avatar: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            status: "마감임박",
            period: "2026.01.20 ~ 2026.04.06",
            entries: "265개",
            views: "7,890",
            prize: "총 450만원",
            announce: "2026.05.05",
            desc: "스포츠 경기의 명장면을 편집하여 하이라이트 영상을 만들어 주세요.",
            tags: ["#스포츠", "#하이라이트", "#편집"],
            duration: "3:15",
            thumb: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            createdAt: "2026-01-20",
            deadlineDate: "2026-04-06",
            viewCount: 7890
        },
        {
            title: "ASMR 힐링 영상 공모전",
            host: "힐링 사운드",
            banner: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            avatar: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            status: "모집중",
            period: "2026.03.18 ~ 2026.06.18",
            entries: "58개",
            views: "3,200",
            prize: "총 200만원",
            announce: "2026.07.01",
            desc: "자연, 일상, 음식 등 다양한 소재의 ASMR 영상을 제출해 주세요. 고음질 녹음 필수.",
            tags: ["#ASMR", "#힐링", "#사운드"],
            duration: "10:30",
            thumb: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            createdAt: "2026-03-18",
            deadlineDate: "2026-06-18",
            viewCount: 3200
        },
        {
            title: "애니메이션 단편 공모전",
            host: "애니 월드",
            banner: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            avatar: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            status: "모집중",
            period: "2026.04.03 ~ 2026.09.03",
            entries: "8개",
            views: "620",
            prize: "총 1,000만원",
            announce: "2026.10.01",
            desc: "2D/3D 애니메이션 단편을 제작해 주세요. 5분 이내, 장르 자유.",
            tags: ["#애니메이션", "#단편", "#2D", "#3D"],
            duration: "5:00",
            thumb: "https://i.ytimg.com/vi/nLD84OB7rO0/hqdefault.jpg",
            createdAt: "2026-04-03",
            deadlineDate: "2026-09-03",
            viewCount: 620,
            scope: "mine"
        }
    ];

    /* ───── 상태 ───── */
    var PAGE_SIZE = 5;
    var currentSort = "latest";
    var currentScope = null; // null = 전체, "joined" = 내가 참여한, "mine" = 내가 올린
    var sortedData = [];
    var displayedCount = 0;
    var selectedIndex = -1;
    var isLoading = false;
    var observer = null;

    /* ───── 필터링 + 정렬 ───── */
    function filterAndSort(sortType, scope) {
        var copy = ITEMS_DATA.slice();

        // 스코프 필터
        if (scope) {
            copy = copy.filter(function (item) { return item.scope === scope; });
        }

        // 정렬
        if (sortType === "latest") {
            copy.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
        } else if (sortType === "popular") {
            copy.sort(function (a, b) { return b.viewCount - a.viewCount; });
        } else if (sortType === "deadline") {
            copy.sort(function (a, b) { return new Date(a.deadlineDate) - new Date(b.deadlineDate); });
        }
        return copy;
    }

    /* ───── 아이템 HTML 생성 ───── */
    function createItemEl(data, displayIdx, dataIdx) {
        var div = document.createElement("div");
        div.className = "Contest-List-Item";
        div.setAttribute("data-index", dataIdx);

        div.innerHTML =
            '<div class="Contest-Item-Index">' + (displayIdx + 1) + '</div>' +
            '<div class="Contest-Item-Thumbnail">' +
                '<a class="Contest-Thumbnail-Link" href="#">' +
                    '<img class="Contest-Thumbnail-Image" alt="" src="' + data.thumb + '" />' +
                '</a>' +
            '</div>' +
            '<div class="Contest-Item-Info">' +
                '<h3 class="Contest-Item-Title">' + data.title + '</h3>' +
                '<div class="Contest-Item-Meta">' +
                    '<span class="Contest-Item-Channel">' + data.host + '</span>' +
                    '<span class="Contest-Item-Separator">·</span>' +
                    '<span class="Contest-Item-Views">조회수 ' + data.views + '</span>' +
                    '<span class="Contest-Item-Separator">·</span>' +
                    '<span class="Contest-Item-Date">' + data.status + '</span>' +
                '</div>' +
            '</div>';

        div.addEventListener("click", function () {
            selectItem(dataIdx, div);
        });

        return div;
    }

    /* ───── 아이템 배치 렌더링 ───── */
    function renderBatch() {
        if (isLoading || displayedCount >= sortedData.length) return;
        isLoading = true;

        var list = document.getElementById("contestList");
        var end = Math.min(displayedCount + PAGE_SIZE, sortedData.length);

        for (var i = displayedCount; i < end; i++) {
            var item = sortedData[i];
            var originalIdx = ITEMS_DATA.indexOf(item);
            list.appendChild(createItemEl(item, i, originalIdx));
        }
        displayedCount = end;
        isLoading = false;

        // 모두 로드 시 로더 숨김
        var loader = document.getElementById("contestLoader");
        if (displayedCount >= sortedData.length) {
            loader.style.display = "none";
            if (observer) observer.disconnect();
        } else {
            loader.style.display = "flex";
        }
    }

    /* ───── 리스트 초기화 ───── */
    function resetList() {
        var list = document.getElementById("contestList");
        list.innerHTML = "";
        displayedCount = 0;
        selectedIndex = -1;

        // 상세 패널 닫기
        var panel = document.getElementById("contestDetailPanel");
        panel.classList.remove("Contest-Detail-Panel--visible", "Contest-Detail-Panel--closing");

        sortedData = filterAndSort(currentSort, currentScope);
        renderBatch();
        setupObserver();
    }

    /* ───── IntersectionObserver (무한스크롤) ───── */
    function setupObserver() {
        if (observer) observer.disconnect();

        var loader = document.getElementById("contestLoader");
        observer = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) {
                renderBatch();
            }
        }, { rootMargin: "200px" });

        observer.observe(loader);
    }

    /* ───── 정렬 필터 클릭 ───── */
    function initFilters() {
        var sortBtns = document.querySelectorAll(".Contest-Filter-Btn[data-sort]");
        sortBtns.forEach(function (btn) {
            btn.addEventListener("click", function () {
                if (btn.getAttribute("data-sort") === currentSort) return;

                sortBtns.forEach(function (b) { b.classList.remove("Contest-Filter-Btn--active"); });
                btn.classList.add("Contest-Filter-Btn--active");

                currentSort = btn.getAttribute("data-sort");
                resetList();
            });
        });

        // 스코프 토글 필터
        var scopeBtns = document.querySelectorAll(".Contest-Filter-Btn--toggle");
        scopeBtns.forEach(function (btn) {
            btn.addEventListener("click", function () {
                var scope = btn.getAttribute("data-scope");

                // 같은 버튼 다시 클릭 → 해제 (null로 복귀)
                if (currentScope === scope) {
                    btn.classList.remove("Contest-Filter-Btn--selected");
                    currentScope = null;
                } else {
                    scopeBtns.forEach(function (b) { b.classList.remove("Contest-Filter-Btn--selected"); });
                    btn.classList.add("Contest-Filter-Btn--selected");
                    currentScope = scope;
                }
                resetList();
            });
        });
    }

    /* ───── 상세 패널 표시 ───── */
    function selectItem(dataIndex, clickedEl) {
        var panel = document.getElementById("contestDetailPanel");
        var data = ITEMS_DATA[dataIndex];
        if (!data) return;

        var items = document.querySelectorAll(".Contest-List-Item");
        items.forEach(function (item) { item.classList.remove("Contest-List-Item--active"); });

        // 같은 항목 클릭 → 닫기
        if (selectedIndex === dataIndex) {
            selectedIndex = -1;
            panel.classList.remove("Contest-Detail-Panel--visible");
            panel.classList.add("Contest-Detail-Panel--closing");
            panel.addEventListener("animationend", function handler() {
                panel.classList.remove("Contest-Detail-Panel--closing");
                panel.removeEventListener("animationend", handler);
            });
            return;
        }

        selectedIndex = dataIndex;
        clickedEl.classList.add("Contest-List-Item--active");

        // 데이터 바인딩
        document.getElementById("detailBanner").src = data.banner;
        document.getElementById("detailAvatar").src = data.avatar;
        document.getElementById("detailTitle").textContent = data.title;
        document.getElementById("detailHost").textContent = data.host;
        document.getElementById("detailStatus").textContent = data.status;
        document.getElementById("detailPeriod").textContent = data.period;
        document.getElementById("detailEntries").textContent = data.entries;
        document.getElementById("detailViews").textContent = data.views;
        document.getElementById("detailDesc").textContent = data.desc;
        document.getElementById("detailPrize").textContent = data.prize;
        document.getElementById("detailAnnounce").textContent = data.announce;

        // 태그
        var tagsContainer = document.getElementById("detailTags");
        tagsContainer.innerHTML = "";
        data.tags.forEach(function (tag) {
            var span = document.createElement("span");
            span.className = "Contest-Detail-Tag";
            span.textContent = tag;
            tagsContainer.appendChild(span);
        });

        // 상태 뱃지
        var statusEl = document.getElementById("detailStatus");
        statusEl.className = "Contest-Detail-InfoValue Contest-Detail-Status";
        if (data.status === "모집중") {
            statusEl.classList.add("Contest-Detail-Status--open");
        } else if (data.status === "마감임박") {
            statusEl.classList.add("Contest-Detail-Status--closing");
        } else {
            statusEl.classList.add("Contest-Detail-Status--closed");
        }

        // 열기 애니메이션
        panel.classList.remove("Contest-Detail-Panel--visible", "Contest-Detail-Panel--closing");
        void panel.offsetWidth;
        panel.classList.add("Contest-Detail-Panel--visible");
    }

    /* ───── 초기화 ───── */
    function init() {
        initFilters();
        resetList();
    }

    return { init: init };

})();

document.addEventListener("DOMContentLoaded", ContestListModule.init);
