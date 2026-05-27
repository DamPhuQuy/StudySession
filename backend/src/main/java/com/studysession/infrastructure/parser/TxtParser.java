package com.studysession.infrastructure.parser;

import com.studysession.domain.model.Question;
import com.studysession.domain.repository.FileParser;
import com.studysession.domain.repository.QuestionExtractor;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class TxtParser implements FileParser {

    private final QuestionExtractor questionExtractor;

    public TxtParser(QuestionExtractor questionExtractor) {
        this.questionExtractor = questionExtractor;
    }

    @Override
    public boolean supports(String fileExtension) {
        return "txt".equals(fileExtension);
    }

    @Override
    public List<Question> parse(InputStream inputStream) {
        String text = new BufferedReader(new InputStreamReader(inputStream))
                .lines().collect(Collectors.joining("\n"));
        return questionExtractor.extract(text);
    }
}
