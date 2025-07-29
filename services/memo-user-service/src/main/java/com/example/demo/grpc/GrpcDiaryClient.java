package com.example.demo.grpc;

import com.example.demo.grpc.DiaryProto.DiaryRequest;
import com.example.demo.grpc.DiaryProto.DiaryResponse;
import com.example.demo.grpc.DiaryServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.stereotype.Component;

@Component
public class GrpcDiaryClient {

    private final DiaryServiceGrpc.DiaryServiceBlockingStub blockingStub;

    // 自动创建 gRPC Channel
    public GrpcDiaryClient() {
        ManagedChannel channel = ManagedChannelBuilder
                .forAddress("localhost", 50052)
                .usePlaintext()
                .build();

        this.blockingStub = DiaryServiceGrpc.newBlockingStub(channel);
    }

    public String addDiaryEntry(String userId, String content) {
        DiaryRequest request = DiaryRequest.newBuilder()
                .setUserId(userId)
                .setContent(content)
                .build();

        DiaryResponse response = blockingStub.addDiary(request);
        return response.getStatus();
    }
}
