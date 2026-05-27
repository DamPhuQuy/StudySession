package com.studysession.application.usecase;

import com.studysession.application.dto.QuestionDto;
import com.studysession.application.dto.SessionDto;
import com.studysession.domain.model.Question;
import com.studysession.domain.model.Session;
import com.studysession.domain.repository.FileParser;
import com.studysession.domain.repository.FileStorageRepository;
import com.studysession.domain.repository.SessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.UUID;

@Service
public class CreateSessionUseCase {

    private final FileStorageRepository fileStorage;
    private final SessionRepository sessionRepository;
    private final List<FileParser> parsers;

    public CreateSessionUseCase(
            FileStorageRepository fileStorage,
            SessionRepository sessionRepository,
            List<FileParser> parsers) {
        this.fileStorage = fileStorage;
        this.sessionRepository = sessionRepository;
        this.parsers = parsers;
    }

    public SessionDto execute(MultipartFile file) throws Exception {
        String originalName = file.getOriginalFilename();
        String extension = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase();
        String fileKey = UUID.randomUUID() + "." + extension;

        byte[] fileBytes = file.getBytes();

        // Upload file
        fileStorage.upload(fileKey, new ByteArrayInputStream(fileBytes), fileBytes.length, file.getContentType());

        // Parse questions
        FileParser parser = parsers.stream()
                .filter(p -> p.supports(extension))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported file type: " + extension));

        List<Question> questions;
        try (ByteArrayInputStream parseStream = new ByteArrayInputStream(fileBytes)) {
            questions = parser.parse(parseStream);
        }

        // Create session
        Session session = new Session(originalName, fileKey);
        for (int i = 0; i < questions.size(); i++) {
            Question q = questions.get(i);
            q.setQuestionNumber(i + 1);
            q.setSession(session);
        }
        session.setQuestions(questions);
        sessionRepository.save(session);

        return toDto(session);
    }

    private SessionDto toDto(Session s) {
        List<QuestionDto> qDtos = s.getQuestions().stream()
                .map(q -> new QuestionDto(q.getId(), q.getQuestionNumber(), q.getContent(),
                        q.getChoices(), q.getCorrectAnswer(), q.getExplanation()))
                .toList();
        return new SessionDto(s.getId(), s.getFileName(), s.getCreatedAt(), qDtos);
    }
}
