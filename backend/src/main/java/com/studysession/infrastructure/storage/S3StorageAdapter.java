package com.studysession.infrastructure.storage;

import com.studysession.domain.repository.FileStorageRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.InputStream;
import java.net.URI;

@Component
public class S3StorageAdapter implements FileStorageRepository {

    private final S3Client s3Client;
    private final String bucket;

    public S3StorageAdapter(
            @Value("${storage.endpoint}") String endpoint,
            @Value("${storage.access-key}") String accessKey,
            @Value("${storage.secret-key}") String secretKey,
            @Value("${storage.bucket}") String bucket,
            @Value("${storage.region:auto}") String region) {
        this.bucket = bucket;
        this.s3Client = S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .forcePathStyle(true)
                .build();
    }

    @Override
    public String upload(String key, InputStream inputStream, long size, String contentType) {
        s3Client.putObject(
                PutObjectRequest.builder().bucket(bucket).key(key).contentType(contentType).build(),
                RequestBody.fromInputStream(inputStream, size));
        return key;
    }

    @Override
    public InputStream download(String key) {
        return s3Client.getObject(GetObjectRequest.builder().bucket(bucket).key(key).build());
    }

    @Override
    public void delete(String key) {
        s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
    }
}
