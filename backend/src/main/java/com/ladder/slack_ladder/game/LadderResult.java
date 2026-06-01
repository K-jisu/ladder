package com.ladder.slack_ladder.game;

import java.util.List;
import java.util.Map;

/**
 * 사다리타기 한 판의 결과.
 *
 * @param participants 참가자 이름 목록(세로줄 순서)
 * @param results      도착 칸의 결과 목록
 * @param bridges      생성된 다리 배치(이미지 렌더링에 사용)
 * @param rows         사다리 행 수
 * @param mapping      참가자 인덱스 → 도착한 결과 인덱스 (일대일 매핑)
 */
public record LadderResult(
        List<String> participants,
        List<String> results,
        List<Bridge> bridges,
        int rows,
        Map<Integer, Integer> mapping
) {

    /** 특정 참가자가 도착한 결과 문자열. */
    public String resultFor(int participantIndex) {
        return results.get(mapping.get(participantIndex));
    }
}
