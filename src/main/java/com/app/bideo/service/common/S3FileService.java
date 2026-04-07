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

import java.io.InputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3FileService {

    private static final Path ROOT_UPLOAD_DIR = Paths.get("uploads");

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    // Pre-signed URL 유효 기간 (7일)
    private static final Duration PRESIGNED_URL_DURATION = Duration.ofDays(7);

    /**
     * S3에 파일을 업로드하고 S3 키를 반환한다.
     * 반환된 키를 DB에 저장하고, 조회 시 getPresignedUrl()로 접근 URL을 생성한다.
     */
    public String upload(String directory, MultipartFile file) {
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
            return saveToLocal(directory, key, file, e);
        }
    }

    /**
     * DB에 저장된 S3 키로 Pre-signed URL을 생성한다.
     * null이거나 빈 값이면 null을 반환한다.
     */
    public String getPresignedUrl(String key) {
        if (key == null || key.isBlank()) {
            return null;
        }

        String normalizedKey = key.trim();

        if (normalizedKey.startsWith("/uploads/")
                || normalizedKey.startsWith("/")
                || normalizedKey.startsWith("http://")
                || normalizedKey.startsWith("https://")
                || normalizedKey.startsWith("data:")
                || normalizedKey.startsWith("blob:")) {
            return normalizedKey;
        }

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(PRESIGNED_URL_DURATION)
                .getObjectRequest(GetObjectRequest.builder()
                        .bucket(bucket)
                        .key(normalizedKey)
                        .build())
                .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    private String extractExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    private String saveToLocal(String directory, String key, MultipartFile file, Exception cause) {
        Path targetDirectory = ROOT_UPLOAD_DIR.resolve(directory);
        Path targetFile = ROOT_UPLOAD_DIR.resolve(key).normalize();

        try {
            Files.createDirectories(targetDirectory);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }
            return "/uploads/" + key.replace("\\", "/");
        } catch (IOException e) {
            throw new RuntimeException("S3 file upload failed", cause);
        }
    }
}
