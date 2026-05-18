package com.app.bideo.controller.work;

import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.dto.common.LikeToggleResponseDTO;
import com.app.bideo.dto.common.TagResponseDTO;
import com.app.bideo.dto.interaction.CommentCreateRequestDTO;
import com.app.bideo.dto.work.WorkCreateRequestDTO;
import com.app.bideo.dto.work.WorkCreateResponseDTO;
import com.app.bideo.dto.work.WorkDetailResponseDTO;
import com.app.bideo.dto.work.WorkListResponseDTO;
import com.app.bideo.dto.work.WorkSearchDTO;
import com.app.bideo.dto.work.WorkUpdateRequestDTO;
import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.service.common.S3FileService;
import com.app.bideo.service.work.WorkService;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/works")
@RequiredArgsConstructor
public class WorkAPIController {

    private final WorkService workService;
    private final S3FileService s3FileService;

    @Value("${fastapi.base-url:http://127.0.0.1:8000}")
    private String fastApiBaseUrl;

    // 작품 등록
    @PostMapping
    public WorkCreateResponseDTO write(
            @RequestParam(required = false) Long memberId,
            @ModelAttribute WorkCreateRequestDTO requestDTO,
            @RequestParam(required = false) MultipartFile mediaFile,
            @RequestParam(required = false) MultipartFile thumbnailFile
    ) {
        return workService.write(memberId, requestDTO, mediaFile, thumbnailFile);
    }

    // 작품 목록 조회
    @GetMapping
    public PageResponseDTO<WorkListResponseDTO> list(@ModelAttribute WorkSearchDTO searchDTO) {
        return workService.getWorkList(searchDTO);
    }

    @GetMapping("/tags/suggestions")
    public List<TagResponseDTO> tagSuggestions(@RequestParam String keyword) {
        return workService.getTagSuggestions(keyword);
    }

    // 쇼츠형 추천 피드 — 다음 작품 batch 반환
    @GetMapping("/feed")
    public List<WorkListResponseDTO> feed(
            @RequestParam(required = false) List<Long> excludeIds,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) Integer limit
    ) {
        return workService.getFeed(excludeIds, category, tag, limit);
    }

    // 작품 상세 조회
    @GetMapping("/{id}")
    public WorkDetailResponseDTO detail(@PathVariable Long id) {
        return workService.getWorkDetail(id);
    }

    @PostMapping("/{id}/views")
    public void increaseViewCount(@PathVariable Long id,
                                  @AuthenticationPrincipal CustomUserDetails userDetails) {
        workService.increaseViewCount(id, userDetails != null ? userDetails.getId() : null);
    }

    // 작품 수정
    @PutMapping("/{id}")
    public WorkDetailResponseDTO update(
            @PathVariable Long id,
            @RequestParam(required = false) Long memberId,
            @RequestBody WorkUpdateRequestDTO requestDTO
    ) {
        return workService.update(id, memberId, requestDTO);
    }

    // 작품 수정 폼 저장
    @PostMapping("/{id}/edit")
    public WorkDetailResponseDTO updateFromForm(
            @PathVariable Long id,
            @RequestParam(required = false) Long memberId,
            @ModelAttribute WorkUpdateRequestDTO requestDTO,
            @RequestParam(required = false) MultipartFile mediaFile,
            @RequestParam(required = false) MultipartFile thumbnailFile
    ) {
        return workService.update(id, memberId, requestDTO, mediaFile, thumbnailFile);
    }

    // 작품 댓글 등록
    @PostMapping("/{id}/comments")
    public WorkDetailResponseDTO writeComment(
            @PathVariable Long id,
            @RequestParam(required = false) Long memberId,
            @RequestBody CommentCreateRequestDTO requestDTO
    ) {
        return workService.writeComment(id, memberId, requestDTO.getContent());
    }

    @PostMapping("/{id}/likes")
    public LikeToggleResponseDTO toggleLike(
            @PathVariable Long id,
            @RequestParam(required = false) Long memberId
    ) {
        return workService.toggleLike(id, memberId);
    }

    // 기존 작품 API 안에서 FastAPI 이미지 파이프라인을 호출한다.
    @PostMapping("/ai/image/pipeline")
    public ImagePipelineResponse runImagePipeline(@RequestBody ImagePipelineRequest requestDTO) {
        ImagePipelineRequest request = new ImagePipelineRequest(
                requestDTO.prompt(),
                requestDTO.size() == null || requestDTO.size().isBlank() ? "1024x1024" : requestDTO.size()
        );

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(10));
        requestFactory.setReadTimeout(Duration.ofMinutes(5));

        FastApiImagePipelineResponse fastApiResponse = RestClient.builder()
                .baseUrl(fastApiBaseUrl)
                .requestFactory(requestFactory)
                .build()
                .post()
                .uri("/api/ai/image/pipeline")
                .body(request)
                .retrieve()
                .body(FastApiImagePipelineResponse.class);

        if (fastApiResponse == null) {
            throw new IllegalStateException("FastAPI 이미지 파이프라인 응답이 비어 있습니다.");
        }

        ParsedDescription parsedDescription = parseDescription(fastApiResponse.description());
        if (fastApiResponse.imageKey() == null || fastApiResponse.imageKey().isBlank()
                || fastApiResponse.imageUrl() == null || fastApiResponse.imageUrl().isBlank()) {
            throw new IllegalStateException("FastAPI S3 이미지 응답이 비어 있습니다.");
        }

        return new ImagePipelineResponse(
                fastApiResponse.imageKey(),
                fastApiResponse.imageUrl(),
                parsedDescription.title(),
                parsedDescription.description(),
                fastApiResponse.fileType() == null || fastApiResponse.fileType().isBlank() ? "image/png" : fastApiResponse.fileType(),
                fastApiResponse.fileSize() == null ? 0 : fastApiResponse.fileSize(),
                Boolean.TRUE.equals(fastApiResponse.cacheHit())
        );
    }

    // 현재 이미지에 대한 제목/설명만 생성한다. 새 이미지는 만들지 않는다.
    @PostMapping("/ai/image/describe")
    public ImageDescriptionResponse describeImage(@RequestBody ImageDescriptionRequest requestDTO) {
        String imageUrl = requestDTO.imageUrl();
        if ((imageUrl == null || imageUrl.isBlank()) && requestDTO.imageKey() != null && !requestDTO.imageKey().isBlank()) {
            imageUrl = s3FileService.getPresignedUrl(requestDTO.imageKey());
        }
        if (imageUrl == null || imageUrl.isBlank()) {
            throw new IllegalArgumentException("설명할 이미지가 없습니다.");
        }

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(10));
        requestFactory.setReadTimeout(Duration.ofMinutes(5));

        FastApiImageAnalyzeResponse fastApiResponse = RestClient.builder()
                .baseUrl(fastApiBaseUrl)
                .requestFactory(requestFactory)
                .build()
                .post()
                .uri("/api/ai/image/analyze")
                .body(new FastApiImageAnalyzeRequest(imageUrl))
                .retrieve()
                .body(FastApiImageAnalyzeResponse.class);

        if (fastApiResponse == null) {
            throw new IllegalStateException("FastAPI 이미지 설명 응답이 비어 있습니다.");
        }

        ParsedDescription parsedDescription = parseDescription(fastApiResponse.description());
        return new ImageDescriptionResponse(
                parsedDescription.title(),
                parsedDescription.description(),
                Boolean.TRUE.equals(fastApiResponse.cacheHit())
        );
    }

    // 작성폼 입력값을 FastAPI 회귀/분류 모델에 전달해 조회수와 고조회수 여부를 예측한다.
    @PostMapping("/ai/prediction")
    public WorkPredictionResponse predictWork(@RequestBody WorkPredictionRequest requestDTO) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(10));
        requestFactory.setReadTimeout(Duration.ofMinutes(5));

        RestClient fastApiClient = RestClient.builder()
                .baseUrl(fastApiBaseUrl)
                .requestFactory(requestFactory)
                .build();

        CompletableFuture<FastApiRegressionResponse> regressionFuture = CompletableFuture.supplyAsync(() -> fastApiClient.post()
                .uri("/api/work/regression")
                .body(requestDTO.regression())
                .retrieve()
                .body(FastApiRegressionResponse.class));

        CompletableFuture<FastApiClassificationResponse> classificationFuture = CompletableFuture.supplyAsync(() -> fastApiClient.post()
                .uri("/api/work/classification")
                .body(requestDTO.classification())
                .retrieve()
                .body(FastApiClassificationResponse.class));

        FastApiRegressionResponse regression = regressionFuture.join();
        FastApiClassificationResponse classification = classificationFuture.join();

        if (regression == null || classification == null) {
            throw new IllegalStateException("FastAPI 회귀/분류 응답이 비어 있습니다.");
        }

        Integer predictedViews = regression.predictedViews() != null ? regression.predictedViews() : 0;
        Double rawPopularProbability = classification.popularProbability() != null ? classification.popularProbability() : 0D;
        Integer estimatedLikes = estimateLikes(predictedViews, requestDTO.regression());
        Double adjustedPopularProbability = calculateAdjustedPopularProbability(
                predictedViews,
                estimatedLikes,
                rawPopularProbability,
                requestDTO.regression()
        );
        Double resolvedThreshold = classification.threshold() == null ? 0.5D : classification.threshold();
        Integer finalPredictedPopular = adjustedPopularProbability >= resolvedThreshold ? 1 : 0;
        String finalPredictedLabel = finalPredictedPopular == 1 ? "고조회수" : "저조회수";

        return new WorkPredictionResponse(
                predictedViews,
                estimatedLikes,
                estimateCount(predictedViews, requestDTO.regression(), "comments", 0.009D, 1),
                estimateCount(predictedViews, requestDTO.regression(), "shares", 0.006D, 1),
                finalPredictedPopular,
                finalPredictedLabel,
                adjustedPopularProbability,
                Math.round(adjustedPopularProbability * 1000D) / 10D,
                resolvedThreshold,
                calculatePredictionConfidence(predictedViews, adjustedPopularProbability, requestDTO.regression()),
                resolvePredictionGrade(predictedViews, adjustedPopularProbability),
                resolveViewBand(predictedViews),
                resolveModelSignal(predictedViews, rawPopularProbability, adjustedPopularProbability, requestDTO.regression())
        );
    }

    // 작품 삭제
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        workService.delete(id);
    }

    private ParsedDescription parseDescription(String rawDescription) {
        if (rawDescription == null || rawDescription.isBlank()) {
            return new ParsedDescription("AI 생성 작품", "");
        }

        String normalized = rawDescription.replace("\r\n", "\n").trim();
        String title = "AI 생성 작품";
        String description = normalized;

        int titleIndex = normalized.indexOf("제목:");
        int contentIndex = normalized.indexOf("내용:");

        if (titleIndex >= 0 && contentIndex > titleIndex) {
            title = normalized.substring(titleIndex + "제목:".length(), contentIndex).trim();
            description = normalized.substring(contentIndex + "내용:".length()).trim();
        } else if (titleIndex >= 0) {
            String afterTitle = normalized.substring(titleIndex + "제목:".length()).trim();
            int lineBreak = afterTitle.indexOf('\n');
            if (lineBreak >= 0) {
                title = afterTitle.substring(0, lineBreak).trim();
                description = afterTitle.substring(lineBreak + 1).trim();
            } else {
                title = afterTitle;
                description = "";
            }
        }

        if (title.isBlank()) {
            title = "AI 생성 작품";
        }

        return new ParsedDescription(title, description);
    }

    private Integer toInteger(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String text && !text.isBlank()) {
            return Integer.parseInt(text);
        }
        return 0;
    }

    private Double toDouble(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        if (value instanceof String text && !text.isBlank()) {
            return Double.parseDouble(text);
        }
        return 0D;
    }

    private Integer estimateLikes(Integer predictedViews, Map<String, Object> regression) {
        int currentLikes = toInteger(regression.get("likes"));
        if (predictedViews <= 0) {
            return currentLikes;
        }

        double aiQualityScore = toDouble(regression.get("ai_quality_score"));
        double normalizedQuality = aiQualityScore > 1D ? aiQualityScore / 100D : aiQualityScore;
        double likeRate = Math.min(0.12D, Math.max(0.018D, 0.025D + normalizedQuality * 0.045D));
        return Math.max(currentLikes, (int) Math.round(predictedViews * likeRate));
    }

    private Integer estimateCount(Integer predictedViews, Map<String, Object> regression, String key, double rate, int minimumWhenViewed) {
        int currentValue = toInteger(regression.get(key));
        if (predictedViews <= 0) {
            return currentValue;
        }

        return Math.max(currentValue, Math.max(minimumWhenViewed, (int) Math.round(predictedViews * rate)));
    }

    private Double calculateAdjustedPopularProbability(Integer predictedViews, Integer estimatedLikes, Double modelProbability, Map<String, Object> regression) {
        int engagementScore = toInteger(regression.get("engagement_score"));
        double aiQualityScore = toDouble(regression.get("ai_quality_score"));
        double normalizedQuality = aiQualityScore > 1D ? aiQualityScore / 100D : aiQualityScore;
        double safeModelProbability = modelProbability == null ? 0D : modelProbability;
        double viewSignal = Math.min(1D, Math.log1p(Math.max(predictedViews, 0)) / Math.log1p(50000D));
        double likeSignal = Math.min(1D, Math.log1p(Math.max(estimatedLikes, 0)) / Math.log1p(3000D));
        double engagementSignal = Math.min(1D, Math.log1p(Math.max(engagementScore, 0)) / Math.log1p(5000D));
        double adjustedProbability = safeModelProbability * 0.45D
                + viewSignal * 0.22D
                + likeSignal * 0.14D
                + engagementSignal * 0.08D
                + normalizedQuality * 0.03D;

        if (predictedViews >= 20000 || estimatedLikes >= 1500) {
            adjustedProbability = Math.max(adjustedProbability, 0.65D);
        } else if (predictedViews >= 10000 || estimatedLikes >= 700 || engagementScore >= 1200) {
            adjustedProbability = Math.max(adjustedProbability, 0.48D);
        }

        return Math.round(Math.min(0.98D, Math.max(0.02D, adjustedProbability)) * 1000D) / 1000D;
    }

    private Double calculatePredictionConfidence(Integer predictedViews, Double popularProbability, Map<String, Object> regression) {
        double aiQualityScore = toDouble(regression.get("ai_quality_score"));
        double normalizedQuality = aiQualityScore > 1D ? aiQualityScore / 100D : aiQualityScore;
        double probabilityDistance = Math.abs(popularProbability - 0.5D) * 2D;
        double volumeSignal = Math.min(1D, Math.log1p(Math.max(predictedViews, 0)) / Math.log1p(50000D));
        double confidence = 0.32D + probabilityDistance * 0.34D + volumeSignal * 0.18D + normalizedQuality * 0.16D;
        return Math.round(Math.min(0.98D, Math.max(0.2D, confidence)) * 1000D) / 1000D;
    }

    private String resolvePredictionGrade(Integer predictedViews, Double popularProbability) {
        if (predictedViews >= 50000 || popularProbability >= 0.75D) {
            return "상위 노출 기대";
        }
        if (predictedViews >= 10000 || popularProbability >= 0.6D) {
            return "성장 가능";
        }
        if (predictedViews >= 3000 || popularProbability >= 0.4D) {
            return "보통";
        }
        return "초기 반응 낮음";
    }

    private String resolveViewBand(Integer predictedViews) {
        if (predictedViews >= 50000) {
            return "5만회 이상";
        }
        if (predictedViews >= 10000) {
            return "1만~5만회";
        }
        if (predictedViews >= 3000) {
            return "3천~1만회";
        }
        if (predictedViews >= 1000) {
            return "1천~3천회";
        }
        return "1천회 미만";
    }

    private String resolveModelSignal(Integer predictedViews, Double modelProbability, Double adjustedProbability, Map<String, Object> regression) {
        double aiQualityScore = toDouble(regression.get("ai_quality_score"));
        double watchRate = toDouble(regression.get("watch_completion_rate"));
        return "품질 " + Math.round(aiQualityScore * 10D) / 10D + "점, 완주율 "
                + Math.round(watchRate * 1000D) / 10D + "%, 반응점수 "
                + toInteger(regression.get("engagement_score")) + ", 조회수 구간 " + resolveViewBand(predictedViews)
                + ", 모델확률 " + Math.round(modelProbability * 1000D) / 10D + "%"
                + ", 보정확률 " + Math.round(adjustedProbability * 1000D) / 10D + "%";
    }

    private String resolveWorkThumbnailUrl(String thumbnailUrl) {
        if (thumbnailUrl == null || thumbnailUrl.isBlank()) {
            return "";
        }
        String normalizedUrl = thumbnailUrl.trim();
        if (normalizedUrl.startsWith("http://")
                || normalizedUrl.startsWith("https://")
                || normalizedUrl.startsWith("data:")
                || normalizedUrl.startsWith("blob:")) {
            return normalizedUrl;
        }
        try {
            return s3FileService.getPresignedUrl(normalizedUrl);
        } catch (RuntimeException e) {
            return normalizedUrl;
        }
    }

    public record ImagePipelineRequest(String prompt, String size) {
    }

    public record ImagePipelineResponse(
            String imageKey,
            String imageUrl,
            String title,
            String description,
            String fileType,
            Integer fileSize,
            Boolean cacheHit
    ) {
    }

    public record ImageDescriptionRequest(String imageKey, String imageUrl) {
    }

    public record ImageDescriptionResponse(String title, String description, Boolean cacheHit) {
    }

    public record WorkPredictionRequest(Map<String, Object> regression, Map<String, Object> classification) {
    }

    public record WorkPredictionResponse(
            Integer predictedViews,
            Integer estimatedLikes,
            Integer estimatedComments,
            Integer estimatedShares,
            Integer predictedPopular,
            String predictedLabel,
            Double popularProbability,
            Double popularProbabilityPercent,
            Double threshold,
            Double confidence,
            String predictionGrade,
            String viewBand,
            String modelSignal
    ) {
    }

    private record FastApiRegressionResponse(@JsonProperty("predicted_views") Integer predictedViews) {
    }

    private record FastApiClassificationResponse(
            @JsonProperty("predicted_popular") Integer predictedPopular,
            @JsonProperty("predicted_label") String predictedLabel,
            @JsonProperty("popular_probability") Double popularProbability,
            Double threshold
    ) {
    }

    private record FastApiImageAnalyzeRequest(String image_path) {
    }

    private record FastApiImageAnalyzeResponse(String description, @JsonProperty("cache_hit") Boolean cacheHit) {
    }

    private record FastApiImagePipelineResponse(
            @JsonProperty("image_path") String imagePath,
            String description,
            @JsonProperty("regenerated_image_path") String regeneratedImagePath,
            @JsonProperty("cache_hit") Boolean cacheHit,
            @JsonProperty("image_key") String imageKey,
            @JsonProperty("image_url") String imageUrl,
            @JsonProperty("file_type") String fileType,
            @JsonProperty("file_size") Integer fileSize
    ) {
    }

    private record ParsedDescription(String title, String description) {
    }

}
