package com.app.bideo.controller.downloads;

import com.app.bideo.dto.work.WorkDTO;
import com.app.bideo.dto.work.WorkFileResponseDTO;
import com.app.bideo.repository.work.WorkDAO;
import com.app.bideo.service.common.S3FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Controller
@RequestMapping("/wish")
@RequiredArgsConstructor
public class DownloadsController {

    private final WorkDAO workDAO;
    private final S3FileService s3FileService;

    @GetMapping
    public String downloadsPage() {
        return "downloads/downloads";   
    }

    @GetMapping("/works/{workId}")
    public ResponseEntity<ByteArrayResource> downloadWork(@PathVariable Long workId) {
        WorkDTO work = workDAO.findById(workId)
                .orElseThrow(() -> new IllegalArgumentException("작품을 찾을 수 없습니다."));

        List<WorkFileResponseDTO> files = workDAO.findFilesByWorkId(workId);
        WorkFileResponseDTO targetFile = files.stream()
                .filter(file -> file != null && file.getFileUrl() != null)
                .filter(file -> file.getSortOrder() != null && file.getSortOrder() > 0)
                .min(Comparator.comparing(WorkFileResponseDTO::getSortOrder))
                .orElseGet(() -> files.stream()
                        .filter(file -> file != null && file.getFileUrl() != null)
                        .findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("다운로드할 작품 파일을 찾을 수 없습니다.")));

        String fileName = buildDownloadFilename(work.getTitle(), targetFile);
        byte[] fileBytes = s3FileService.downloadBytes(targetFile.getFileUrl());
        byte[] zipBytes = buildZipBytes(fileName, fileBytes);
        String zipFileName = buildZipFileName(work.getTitle());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, buildContentDisposition(zipFileName))
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(zipBytes.length)
                .body(new ByteArrayResource(zipBytes));
    }

    private String buildDownloadFilename(String title, WorkFileResponseDTO file) {
        String safeTitle = (title == null || title.isBlank() ? "bideo-work" : title.trim())
                .replaceAll("[\\\\/:*?\"<>|]", "_");
        String extension = resolveExtension(file);
        return safeTitle + extension;
    }

    private String resolveExtension(WorkFileResponseDTO file) {
        String fileUrl = file.getFileUrl();
        if (fileUrl != null) {
            int queryIndex = fileUrl.indexOf('?');
            String path = queryIndex >= 0 ? fileUrl.substring(0, queryIndex) : fileUrl;
            int dotIndex = path.lastIndexOf('.');
            if (dotIndex >= 0) {
                return path.substring(dotIndex);
            }
        }

        String fileType = file.getFileType() == null ? "" : file.getFileType();
        if (fileType.startsWith("video/")) return ".mp4";
        if ("image/png".equals(fileType)) return ".png";
        if ("image/jpeg".equals(fileType)) return ".jpg";
        if ("image/webp".equals(fileType)) return ".webp";
        return "";
    }

    private String buildZipFileName(String title) {
        String safeTitle = (title == null || title.isBlank() ? "bideo-work" : title.trim())
                .replaceAll("[\\\\/:*?\"<>|]", "_");
        return safeTitle + ".zip";
    }

    private String buildContentDisposition(String fileName) {
        String fallback = toAsciiFileName(fileName);
        String encoded = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");
        return "attachment; filename=\"" + fallback + "\"; filename*=UTF-8''" + encoded;
    }

    private String toAsciiFileName(String fileName) {
        String normalized = (fileName == null || fileName.isBlank() ? "download.zip" : fileName)
                .replaceAll("[^\\x20-\\x7E]", "_")
                .replace("\"", "_");

        if (!normalized.contains(".")) {
            normalized += ".zip";
        }
        return normalized;
    }

    private byte[] buildZipBytes(String fileName, byte[] fileBytes) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            try (ZipOutputStream zipOutputStream = new ZipOutputStream(outputStream)) {
                zipOutputStream.putNextEntry(new ZipEntry(fileName));
                zipOutputStream.write(fileBytes);
                zipOutputStream.closeEntry();
            }
            return outputStream.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("ZIP 다운로드 생성에 실패했습니다.", e);
        }
    }
}
