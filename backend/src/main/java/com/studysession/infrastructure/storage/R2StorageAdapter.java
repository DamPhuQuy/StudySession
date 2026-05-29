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
public class R2StorageAdapter implements FileStorageRepository {

    private final S3Client r2Client;
    private final String bucket;
    private final String publicUrl;

    public R2StorageAdapter(
            @Value("${r2.endpoint}") String endpoint,
            @Value("${r2.access-key}") String accessKey,
            @Value("${r2.secret-key}") String secretKey,
            @Value("${r2.bucket}") String bucket,
            @Value("${r2.public-url:}") String publicUrl) {
        this.bucket = bucket;
        this.publicUrl = publicUrl;
        this.r2Client = S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of("auto"))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .forcePathStyle(true)
                .build();
    }

    @Override
    public String upload(String key, InputStream inputStream, long size, String contentType) {
        r2Client.putObject(
                PutObjectRequest.builder().bucket(bucket).key(key).contentType(contentType).build(),
                RequestBody.fromInputStream(inputStream, size));
        return publicUrl.isEmpty() ? key : publicUrl + "/" + key;
    }

    @Override
    public InputStream download(String key) {
        return r2Client.getObject(GetObjectRequest.builder().bucket(bucket).key(key).build());
    }

    @Override
    public void delete(String key) {
        r2Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
    }
}
