package com.studysession.domain.repository;

import java.io.InputStream;

public interface FileStorageRepository {
    String upload(String key, InputStream inputStream, long size, String contentType);
    InputStream download(String key);
    void delete(String key);
}
