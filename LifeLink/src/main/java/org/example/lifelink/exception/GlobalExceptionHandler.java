package org.example.lifelink.exception;

import org.example.lifelink.dto.auth.ApiErrorResponse;
import org.example.lifelink.entity.VerificationStatus;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Object> handleEmailAlreadyExists(EmailAlreadyExistsException ex, WebRequest req) {
        return buildErrorResponse(ex, ex.getMessage(), HttpStatus.CONFLICT, req);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataIntegrityViolation(DataIntegrityViolationException ex, WebRequest req) {
        String msg = "The submitted information conflicts with existing data.";
        return buildErrorResponse(ex, msg, HttpStatus.CONFLICT, req);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Object> handleUnauthorized(UnauthorizedException ex, WebRequest req) {
        return buildErrorResponse(ex, ex.getMessage(), HttpStatus.UNAUTHORIZED, req);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        Map<String, String> validationErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> validationErrors.putIfAbsent(error.getField(), error.getDefaultMessage()));

        Map<String, Object> errorMap = new LinkedHashMap<>();
        errorMap.put("errorMessage", "Validation failed");
        errorMap.put("validationErrors", validationErrors);
        errorMap.put("errorTime", LocalDateTime.now().toString());
        errorMap.put("errorStatus", HttpStatus.BAD_REQUEST.value());

        return handleExceptionInternal(ex, errorMap, headers, HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleUnexpectedException(Exception ex, WebRequest req) {
        String msg = "An unexpected server error occurred.";
        return buildErrorResponse(ex, msg, HttpStatus.INTERNAL_SERVER_ERROR, req);
    }

    private ResponseEntity<Object> buildErrorResponse(Exception ex, String message, HttpStatus status, WebRequest request) {
        Map<String, Object> errorMap = Map.of("errorMessage", message, "errorTime", LocalDateTime.now().toString(), "errorStatus", status.value());
        return handleExceptionInternal(ex, errorMap, new HttpHeaders(), status, request);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Object> handleBadCredentials(BadCredentialsException exception, WebRequest request) {

    Map<String, Object> errorMap = Map.of("errorCode","INVALID_CREDENTIALS",
            "errorMessage", "Email or password is incorrect", "errorTime", LocalDateTime.now().toString(), "errorStatus", HttpStatus.UNAUTHORIZED.value());

        return handleExceptionInternal(exception, errorMap, new HttpHeaders(), HttpStatus.UNAUTHORIZED, request);
    }

    @ExceptionHandler(AccountNotApprovedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccountNotApproved(AccountNotApprovedException exception) {
        VerificationStatus verificationStatus = exception.getVerificationStatus();

        String code;
        String message;

        if (verificationStatus == VerificationStatus.REJECTED) {
            code = "ACCOUNT_REJECTED";
            message = "Your application was not approved. Please contact LifeLink support.";
        } else {
            code = "ACCOUNT_UNDER_REVIEW";
            message = "Your application is currently under review. Please wait for administrator approval.";
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiErrorResponse(code, message, HttpStatus.FORBIDDEN.value()));
    }
}