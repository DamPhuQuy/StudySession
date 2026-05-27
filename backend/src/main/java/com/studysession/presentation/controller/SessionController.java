package com.studysession.presentation.controller;

import com.studysession.application.dto.SessionDto;
import com.studysession.application.usecase.CreateSessionUseCase;
import com.studysession.application.usecase.DeleteSessionUseCase;
import com.studysession.application.usecase.GetSessionUseCase;
import com.studysession.application.usecase.ListSessionsUseCase;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "*")
public class SessionController {

    private final CreateSessionUseCase createSession;
    private final GetSessionUseCase getSession;
    private final ListSessionsUseCase listSessions;
    private final DeleteSessionUseCase deleteSession;

    public SessionController(
            CreateSessionUseCase createSession,
            GetSessionUseCase getSession,
            ListSessionsUseCase listSessions,
            DeleteSessionUseCase deleteSession) {
        this.createSession = createSession;
        this.getSession = getSession;
        this.listSessions = listSessions;
        this.deleteSession = deleteSession;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SessionDto upload(@RequestParam("file") MultipartFile file) throws Exception {
        return createSession.execute(file);
    }

    @GetMapping("/{id}")
    public SessionDto get(@PathVariable String id) {
        return getSession.execute(id);
    }

    @GetMapping
    public List<SessionDto> list() {
        return listSessions.execute();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        deleteSession.execute(id);
    }
}
