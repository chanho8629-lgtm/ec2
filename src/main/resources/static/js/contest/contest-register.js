document.addEventListener("DOMContentLoaded", function () {

    /* ───── 태그 입력 ───── */
    var tagInput = document.getElementById("tagInput");
    var tagWrap = document.getElementById("tagWrap");
    var tags = [];

    tagInput.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        e.preventDefault();

        var value = tagInput.value.trim();
        if (!value) return;

        // #이 없으면 자동 추가
        if (value.charAt(0) !== "#") value = "#" + value;

        // 중복 방지
        if (tags.indexOf(value) !== -1) {
            tagInput.value = "";
            return;
        }

        tags.push(value);
        var chip = document.createElement("span");
        chip.className = "Register-Tag-Chip";
        chip.innerHTML = value + '<button class="Register-Tag-Remove" type="button">&times;</button>';

        chip.querySelector(".Register-Tag-Remove").addEventListener("click", function () {
            var idx = tags.indexOf(value);
            if (idx !== -1) tags.splice(idx, 1);
            chip.remove();
        });

        tagWrap.insertBefore(chip, tagInput);
        tagInput.value = "";
    });

    // 빈 영역 클릭 시 input에 포커스
    tagWrap.addEventListener("click", function () {
        tagInput.focus();
    });

    /* ───── 배너 이미지 업로드 ───── */
    var bannerFileInput = document.getElementById("bannerFileInput");
    var bannerUploadBtn = document.getElementById("bannerUploadBtn");
    var bannerChangeBtn = document.getElementById("bannerChangeBtn");
    var bannerImage = document.getElementById("bannerImage");
    var bannerPlaceholder = document.getElementById("bannerPlaceholder");

    bannerUploadBtn.addEventListener("click", function () {
        bannerFileInput.click();
    });

    bannerChangeBtn.addEventListener("click", function () {
        bannerFileInput.click();
    });

    bannerFileInput.addEventListener("change", function () {
        var file = bannerFileInput.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function (e) {
            bannerImage.src = e.target.result;
            bannerImage.style.display = "block";
            bannerPlaceholder.style.display = "none";
            bannerUploadBtn.style.display = "none";
            bannerChangeBtn.style.display = "inline-flex";
        };
        reader.readAsDataURL(file);
    });

    /* ───── 날짜 유효성 검사 ───── */
    var startDate = document.getElementById("startDate");
    var endDate = document.getElementById("endDate");
    var announceDate = document.getElementById("announceDate");

    endDate.addEventListener("change", function () {
        if (startDate.value && endDate.value && endDate.value < startDate.value) {
            alert("마감일은 시작일 이후여야 합니다.");
            endDate.value = "";
        }
    });

    startDate.addEventListener("change", function () {
        if (endDate.value && endDate.value < startDate.value) {
            alert("마감일은 시작일 이후여야 합니다.");
            endDate.value = "";
        }
    });

    announceDate.addEventListener("change", function () {
        if (endDate.value && announceDate.value && announceDate.value < endDate.value) {
            alert("결과 발표일은 마감일 이후여야 합니다.");
            announceDate.value = "";
        }
    });

});
