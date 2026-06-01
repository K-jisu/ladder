package com.ladder.slack_ladder.game;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 참가자/결과 목록을 받아 사다리타기 한 판을 진행한다.
 */
@Service
public class LadderService {

    private final LadderGenerator generator;

    public LadderService(LadderGenerator generator) {
        this.generator = generator;
    }

    /**
     * 사다리를 생성하고 각 참가자의 도착 결과를 계산한다.
     *
     * @param participants 참가자 이름 목록
     * @param results      결과 목록(참가자 수와 동일해야 함)
     */
    public LadderResult play(List<String> participants, List<String> results) {
        if (participants == null || results == null) {
            throw new IllegalArgumentException("참가자와 결과는 null일 수 없습니다.");
        }
        if (participants.size() != results.size()) {
            throw new IllegalArgumentException("참가자 수와 결과 수가 같아야 합니다.");
        }
        if (participants.size() < 2) {
            throw new IllegalArgumentException("참가자는 최소 2명이어야 합니다.");
        }

        int n = participants.size();
        int rows = LadderGenerator.DEFAULT_ROWS;
        List<Bridge> bridges = generator.generateBridges(n, rows);

        Map<Integer, Integer> mapping = new LinkedHashMap<>();
        for (int i = 0; i < n; i++) {
            int[] path = generator.tracePath(i, bridges, rows);
            mapping.put(i, path[rows]);
        }

        return new LadderResult(List.copyOf(participants), List.copyOf(results), bridges, rows, mapping);
    }
}
