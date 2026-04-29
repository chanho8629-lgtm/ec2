package com.app.bideo.service.common;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3FileService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${cloud.aws.s3.bucket:}")
    private String bucket;

    private static final Duration PRESIGNED_URL_DURATION = Duration.ofDays(7);

    /**
     * 모든 파일은 S3에 저장한다. bucket 미설정 또는 업로드 실패 시 예외를 던진다.
     */
    public String upload(String directory, MultipartFile file) {
        requireBucket();

        String extension = extractExtension(file.getOriginalFilename());
        String key = directory + "/" + UUID.randomUUID() + extension;

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromBytes(file.getBytes()));
            return key;
        } catch (Exception e) {
            throw new IllegalStateException("S3 업로드에 실패했습니다.", e);
        }
    }

    /**
     * S3 키에 대해 Pre-signed URL을 생성한다.
     * 외부 URL(http, https), data/blob URI는 그대로 반환한다.
     * null/blank는 null 반환.
     */
    public String getPresignedUrl(String key) {
        if (key == null || key.isBlank()) {
            return null;
        }

        String normalizedKey = key.trim();

        if (normalizedKey.startsWith("http://")
                || normalizedKey.startsWith("https://")
                || normalizedKey.startsWith("data:")
                || normalizedKey.startsWith("blob:")) {
            return normalizedKey;
        }

        requireBucket();

        String s3Key = normalizedKey.startsWith("/") ? normalizedKey.substring(1) : normalizedKey;

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(PRESIGNED_URL_DURATION)
                .getObjectRequest(GetObjectRequest.builder()
                        .bucket(bucket)
                        .key(s3Key)
                        .build())
                .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    private void requireBucket() {
        if (bucket == null || bucket.isBlank()) {
            throw new IllegalStateException("S3 bucket이 설정되지 않았습니다. cloud.aws.s3.bucket 프로퍼티를 확인하세요.");
        }
    }

    private String extractExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}
