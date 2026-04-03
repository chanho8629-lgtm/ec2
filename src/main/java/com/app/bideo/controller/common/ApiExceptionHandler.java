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
        HttpStatus status = switch (message) {
            case "login required" -> HttpStatus.UNAUTHORIZED;
            case "forbidden" -> HttpStatus.FORBIDDEN;
            case "comment not allowed" -> HttpStatus.CONFLICT;
            default -> HttpStatus.CONFLICT;
        };
        return ResponseEntity.status(status).body(message);
    }

    private String resolveMessage(RuntimeException exception, String fallback) {
        String message = exception.getMessage();
        return message == null || message.isBlank() ? fallback : message;
    }
}
