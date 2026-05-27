package com.studysession.domain.repository;

import com.studysession.domain.model.Question;

import java.util.List;

public interface FileParser {
    List<Question> parse(java.io.InputStream inputStream);
    boolean supports(String fileExtension);
}
