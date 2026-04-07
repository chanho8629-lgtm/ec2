package com.app.bideo.controller.common;

import com.app.bideo.controller.gallery.GalleryAPIController;
import com.app.bideo.controller.interaction.BookmarkAPIController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(assignableTypes = {
        GalleryAPIController.class,
        BookmarkAPIController.class
})
public class ApiExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(resolveMessage(exception, "bad request"));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalState(IllegalStateException exception) {
        String message = resolveMessage(exception, "request failed");
        HttpStatus status;
        if ("login required".equals(message)) {
            status = HttpStatus.UNAUTHORIZED;
        } else if ("forbidden".equals(message)) {
            status = HttpStatus.FORBIDDEN;
        } else if ("comment not allowed".equals(message)) {
            status = HttpStatus.CONFLICT;
        } else if (message.startsWith("S3 file upload failed")) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        } else {
            status = HttpStatus.CONFLICT;
        }
        return ResponseEntity.status(status).body(message);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntime(RuntimeException exception) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(resolveMessage(exception, "internal server error"));
    }

    private String resolveMessage(RuntimeException exception, String fallback) {
        String message = exception.getMessage();
        return message == null || message.isBlank() ? fallback : message;
    }
}
