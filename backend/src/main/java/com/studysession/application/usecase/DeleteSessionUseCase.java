package com.studysession.application.usecase;

import com.studysession.domain.model.Session;
import com.studysession.domain.repository.FileStorageRepository;
import com.studysession.domain.repository.SessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DeleteSessionUseCase {

    private final SessionRepository sessionRepository;
    private final FileStorageRepository fileStorage;

    public DeleteSessionUseCase(SessionRepository sessionRepository, FileStorageRepository fileStorage) {
        this.sessionRepository = sessionRepository;
        this.fileStorage = fileStorage;
    }

    @Transactional
    public void execute(String sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        // Delete file from storage
        if (session.getFileKey() != null) {
            try {
                fileStorage.delete(session.getFileKey());
            } catch (Exception e) {
                // Log and continue, database record deletion is primary
                System.err.println("Failed to delete file from S3 storage: " + session.getFileKey() + ". " + e.getMessage());
            }
        }

        // Delete session from DB
        sessionRepository.delete(session);
    }
}
