package com.app.bideo.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Arrays;
import java.util.stream.Collectors;

@Aspect
@Component
@Slf4j
public class LogAspect {
    @Around("logStatusAnnotated()")
    public void around(ProceedingJoinPoint joinPoint) throws Throwable{
        log.info("{}: {}",
                joinPoint.getSignature().getName(),
                Arrays.stream(joinPoint.getArgs()).map(String::valueOf).collect(Collectors.joining(", ")));
        joinPoint.proceed();
    }

    @AfterReturning(value = "logStatusWithReturnAnnotated()", returning = "returnValue")
    public void afterReturning(JoinPoint joinPoint, Object returnValue) throws IOException {
        log.info("{}: {}",
                joinPoint.getSignature().getName(),
                Arrays.stream(joinPoint.getArgs()).map(String::valueOf).collect(Collectors.joining(", ")));
        log.info("Return: {}", returnValue);
    }

    @Pointcut("@annotation(com.app.app.aop.annotation.LogStatus)")
    public void logStatusAnnotated(){}

    @Pointcut("@annotation(com.app.app.aop.annotation.LogStatusWithReturn)")
    public void logStatusWithReturnAnnotated(){}
}

















