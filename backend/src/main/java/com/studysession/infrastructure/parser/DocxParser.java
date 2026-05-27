package com.studysession.infrastructure.parser;

import com.studysession.domain.model.Question;
import com.studysession.domain.repository.FileParser;
import com.studysession.domain.repository.QuestionExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class DocxParser implements FileParser {

    private final QuestionExtractor questionExtractor;

    public DocxParser(QuestionExtractor questionExtractor) {
        this.questionExtractor = questionExtractor;
    }

    @Override
    public boolean supports(String fileExtension) {
        return "docx".equals(fileExtension);
    }

    @Override
    public List<Question> parse(InputStream inputStream) {
        try (XWPFDocument doc = new XWPFDocument(inputStream)) {
            String text = doc.getParagraphs().stream()
                    .map(XWPFParagraph::getText)
                    .collect(Collectors.joining("\n"));
            return questionExtractor.extract(text);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse docx", e);
        }
    }
}
