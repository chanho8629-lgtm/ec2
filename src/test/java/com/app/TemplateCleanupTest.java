package com.app;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

class TemplateCleanupTest {

    @Test
    void loginAndSignupStandaloneTemplatesAreRemovedWhileModalAssetsStayReferenced() throws IOException {
        assertFalse(resourceExists("templates/main/login.html"));
        assertFalse(resourceExists("templates/main/sign-up.html"));

        String mainTemplate = readResource("templates/main/main.html");
        String introTemplate = readResource("templates/main/intro-main.html");

        assertTrue(mainTemplate.contains("/css/main/auth-modal.css"));
        assertTrue(mainTemplate.contains("/css/main/signup-modal.css"));
        assertTrue(mainTemplate.contains("/js/main/auth-modal.js"));
        assertTrue(mainTemplate.contains("/js/main/signup-modal.js"));

        assertTrue(introTemplate.contains("/css/main/auth-modal.css"));
        assertTrue(introTemplate.contains("/css/main/signup-modal.css"));
        assertTrue(introTemplate.contains("/js/main/auth-modal.js"));
        assertTrue(introTemplate.contains("/js/main/signup-modal.js"));
    }

    @Test
    void introMainUsesPageScopedVanillaScriptContract() throws IOException {
        String introTemplate = readResource("templates/main/intro-main.html");
        String introScript = readResource("static/js/main/intro-main.js");

        assertTrue(introTemplate.contains("data-intro-main-root"));
        assertTrue(introTemplate.contains("/js/main/intro-main.js"));

        assertTrue(introScript.contains("DOMContentLoaded"));
        assertTrue(introScript.contains("data-intro-main-root"));
        assertFalse(introScript.contains("lit-html"));
        assertFalse(introScript.contains("LBHeader"));
        assertFalse(introScript.contains("YTCCreatorSpotlight"));
    }

    @Test
    void introMainSnapshotIsFullyPopulatedAndUsesLocalCreatorMedia() throws IOException {
        String introTemplate = readResource("templates/main/intro-main.html");
        String layoutTemplate = readResource("templates/layout/youtube-shell.html");
        String introStyles = readResource("static/css/main/intro-main.css");

        assertTrue(layoutTemplate.contains("홈"));
        assertTrue(layoutTemplate.contains("Shorts"));
        assertTrue(layoutTemplate.contains("시청 기록"));
        assertTrue(layoutTemplate.contains("/images/logo.png"));

        assertFalse(introTemplate.contains("[일러스트]"));
        assertFalse(introTemplate.contains("[아이콘]"));
        assertFalse(introTemplate.contains("[학습 아이콘]"));
        assertFalse(introTemplate.contains("[지원 아이콘]"));
        assertFalse(introTemplate.contains("[연결 아이콘]"));
        assertFalse(introTemplate.contains("/creators/static/images/"));
        assertFalse(introTemplate.contains("<video class=\"ytc-home-hero__video\"></video>"));

        assertFalse(introStyles.contains("/creators/static/images/"));
    }

    @Test
    void youtubeShellLayoutIsExtractedWithStandardTagsAndMainConsumesLocalShellAssets() throws IOException {
        String layoutTemplate = readResource("templates/layout/youtube-shell.html");
        String previewTemplate = readResource("templates/layout/layout.html");
        String mainTemplate = readResource("templates/main/main.html");
        String shellStyles = readResource("static/css/layout/youtube-shell-overrides.css");
        String shellScript = readResource("static/js/layout/youtube-shell-bridge.js");
        String chatStyles = readResource("static/css/layout/chat-fab.css");
        String chatScript = readResource("static/js/layout/chat-fab.js");

        assertTrue(layoutTemplate.contains("th:fragment=\"ytShellHead(pageTitle)\""));
        assertTrue(layoutTemplate.contains("th:fragment=\"ytShellChrome(activeItemKey)\""));
        assertTrue(layoutTemplate.contains("th:fragment=\"ytShellScripts()\""));
        assertTrue(layoutTemplate.contains("data-yt-shell-root"));
        assertTrue(layoutTemplate.contains("data-yt-shell-menu-toggle"));
        assertTrue(layoutTemplate.contains("data-yt-shell-overlay"));
        assertTrue(layoutTemplate.contains("data-yt-shell-drawer"));
        assertTrue(layoutTemplate.contains("data-yt-shell-mobile-search"));
        assertTrue(layoutTemplate.contains("/css/layout/youtube-shell-overrides.css"));
        assertTrue(layoutTemplate.contains("/css/layout/chat-fab.css"));
        assertTrue(layoutTemplate.contains("/css/common/font.css"));
        assertTrue(layoutTemplate.contains("/js/layout/youtube-shell-bridge.js"));
        assertTrue(layoutTemplate.contains("/js/layout/chat-fab.js"));
        assertTrue(layoutTemplate.contains("/images/logo.png"));
        assertTrue(layoutTemplate.contains("신고 기록"));
        assertTrue(layoutTemplate.contains("YouTube Music"));
        assertTrue(layoutTemplate.contains("YouTube Kids"));
        assertTrue(layoutTemplate.contains("data-yt-chat-toggle"));
        assertTrue(layoutTemplate.contains("data-yt-chat-layer"));
        assertTrue(layoutTemplate.contains("data-yt-chat-panel"));
        assertTrue(layoutTemplate.contains("data-yt-chat-room-list"));

        assertTrue(previewTemplate.contains("templates/layout/youtube-shell :: ytShellHead"));
        assertTrue(previewTemplate.contains("templates/layout/youtube-shell :: ytShellChrome"));
        assertTrue(previewTemplate.contains("templates/layout/youtube-shell :: ytShellScripts"));
        assertTrue(previewTemplate.contains("layout-preview"));

        assertTrue(mainTemplate.contains("templates/layout/youtube-shell :: ytShellHead"));
        assertTrue(mainTemplate.contains("templates/layout/youtube-shell :: ytShellChrome"));
        assertTrue(mainTemplate.contains("templates/layout/youtube-shell :: ytShellScripts"));
        assertTrue(mainTemplate.contains("data-main-root"));

        assertNoCustomTags(layoutTemplate);
        assertNoCustomTags(previewTemplate);

        assertTrue(shellStyles.contains(".yt-shell"));
        assertTrue(shellStyles.contains(".yt-shell__header"));
        assertTrue(shellStyles.contains(".yt-shell__guide"));
        assertTrue(shellStyles.contains(".yt-shell__page-content"));
        assertTrue(shellScript.contains("data-yt-shell-root"));
        assertTrue(shellScript.contains("data-yt-shell-menu-toggle"));
        assertTrue(chatStyles.contains(".yt-chat-fab"));
        assertTrue(chatStyles.contains(".yt-chat-panel"));
        assertTrue(chatStyles.contains(".yt-chat-room"));
        assertTrue(chatScript.contains("data-yt-chat-toggle"));
        assertTrue(chatScript.contains("data-yt-chat-room-list"));
    }

    @Test
    void mainTemplateUsesOnlyStandardHtmlTagsForMoviesScreen() throws IOException {
        String mainTemplate = readResource("templates/main/main.html");
        String mainStyles = readResource("static/css/main/main-standardized.css");
        String mainScript = readResource("static/js/main/main-standardized.js");

        assertTrue(mainTemplate.contains("templates/layout/youtube-shell :: ytShellHead"));
        assertTrue(mainTemplate.contains("templates/layout/youtube-shell :: ytShellChrome"));
        assertTrue(mainTemplate.contains("templates/layout/youtube-shell :: ytShellScripts"));
        assertTrue(mainTemplate.contains("/css/main/main-standardized.css"));
        assertTrue(mainTemplate.contains("/js/main/main-standardized.js"));
        assertTrue(mainTemplate.contains("data-main-root"));
        assertTrue(mainTemplate.contains("영화 및 프로그램"));
        assertTrue(mainTemplate.contains("나를 위한 Primetime 영화 추천"));
        assertTrue(mainTemplate.contains("최신작"));
        assertTrue(mainTemplate.contains("명작"));
        assertTrue(mainTemplate.contains("아바타: 불과 재"));
        assertTrue(mainTemplate.contains("F1 (F1 The Movie)"));
        assertTrue(mainTemplate.contains("하늘의 푸르름을 아는 사람이여"));

        assertFalse(mainTemplate.matches("(?s).*</?(?:ytd|yt|tp-yt|iron|paper|dom|badge-shape|custom-style|.*-view-model)[a-z0-9:_-]*\\b.*"));

        assertTrue(mainStyles.contains(".movies-page"));
        assertTrue(mainStyles.contains(".movies-shelf__track"));
        assertTrue(mainScript.contains("data-main-shelf"));
        assertTrue(mainScript.contains("data-main-chip"));
    }

    @Test
    void layoutTemplateLoadsCommonFontOverridesThatDefineSharedFontVariables() throws IOException {
        String layoutTemplate = readResource("templates/layout/layout.html");
        String commonFontStyles = readResource("static/css/common/font.css");

        assertTrue(layoutTemplate.contains("templates/layout/youtube-shell :: ytShellHead"));

        assertTrue(commonFontStyles.contains("--common-font-family"));
        assertTrue(commonFontStyles.contains("--font-family: var(--common-font-family)"));
        assertTrue(commonFontStyles.contains("--display-font-family: var(--common-font-family)"));
        assertTrue(commonFontStyles.contains("--ytd-user-comment-font-family: var(--common-font-family)"));
        assertTrue(commonFontStyles.contains("--ytd-caption-font-family: var(--common-font-family)"));
        assertTrue(commonFontStyles.contains("font-size: 16px"));
        assertTrue(commonFontStyles.contains("font-size: inherit"));
        assertTrue(commonFontStyles.contains("html,"));
        assertTrue(commonFontStyles.contains("button,"));
        assertTrue(commonFontStyles.contains("@import url(\"https://fonts.googleapis.com/css2?family=Roboto"));
        assertTrue(commonFontStyles.contains("Noto+Sans+KR"));
    }

    private void assertNoCustomTags(String markup) {
        assertFalse(markup.matches("(?is).*</?(?:ytd|yt|tp-yt|iron|paper|dom|badge-shape|custom-style|ps-dom-if|.*-view-model)[a-z0-9:_-]*\\b.*"));
    }

    private boolean resourceExists(String path) {
        return new ClassPathResource(path).exists();
    }

    private String readResource(String path) throws IOException {
        ClassPathResource resource = new ClassPathResource(path);
        assertNotNull(resource);
        try (InputStream stream = resource.getInputStream()) {
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
