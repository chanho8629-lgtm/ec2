\encoding UTF8

-- 기존 작성폼에서 0~1 스케일로 저장된 AI 품질 점수를
-- 노트북 학습 데이터와 같은 40~99점 스케일로 정규화한다.
update tbl_work
   set ai_quality_score = round((40 + ai_quality_score * 59)::numeric, 1)::double precision
 where ai_quality_score > 0
   and ai_quality_score <= 1;
