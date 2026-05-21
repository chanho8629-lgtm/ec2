from datetime import datetime
import os
from pathlib import Path
from fastapi import HTTPException
from fastapi.concurrency import run_in_threadpool
from kiwipiepy import Kiwi


from domain.Work import (
    WorkClassificationRequest,
    WorkClassificationResponse,
    WorkRegressionFeatures,
    WorkRegressionResponse,
)

try:
    from dotenv import load_dotenv
except ModuleNotFoundError:
    load_dotenv = None

if load_dotenv:
    load_dotenv()


_MODELS_DIR = Path(__file__).resolve().parents[1] / "models"

WORK_REGRESSOR_PATH = _MODELS_DIR / "bideo_regressor.pkl"
WORK_REGRESSOR_FEATURES_PATH = _MODELS_DIR / "bideo_regressor_features.pkl"

WORK_CLASSIFIER_PATH = _MODELS_DIR / "bideo_classifier.pkl"
WORK_CLASSIFIER_FEATURES_PATH = _MODELS_DIR / "bideo_classifier_features.pkl"
WORK_CLASSIFIER_THRESHOLD_PATH = _MODELS_DIR / "bideo_threshold.pkl"
WORK_LABEL_ENCODERS_PATH = _MODELS_DIR / "bideo_label_encoders.pkl"
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://bideo:1234@localhost:5432/bideo").strip()


# Work 조회수 회귀 예측 서비스
# 라우터에서 받은 feature를 모델 입력 순서에 맞춰 정렬한 뒤 predict를 실행한다.
class WorkService:
    def __init__(self):
        self.work_regressor = None
        self.work_regressor_features = None
        self.work_classifier = None
        self.work_classifier_features = None
        self.work_classifier_threshold = None
        self.work_label_encoders = None
        self.kiwi = None
        self.kiwi_checked = False

    # pkl 모델은 처음 요청이 들어왔을 때 한 번만 로드해서 재사용한다.
    def load_work_regressor(self):
        if self.work_regressor is None:
            try:
                import joblib
            except ModuleNotFoundError as e:
                raise HTTPException(status_code=500, detail="joblib 패키지가 설치되어 있지 않습니다.") from e

            self.work_regressor = joblib.load(WORK_REGRESSOR_PATH)
            self.work_regressor_features = joblib.load(WORK_REGRESSOR_FEATURES_PATH)

    # 분류 pkl 파일도 처음 요청이 들어왔을 때 한 번만 로드해서 재사용한다.
    def load_work_classifier(self):
        if self.work_classifier is None:
            try:
                import joblib
            except ModuleNotFoundError as e:
                raise HTTPException(status_code=500, detail="joblib 패키지가 설치되어 있지 않습니다.") from e

            self.work_classifier = joblib.load(WORK_CLASSIFIER_PATH)
            self.work_classifier_features = joblib.load(WORK_CLASSIFIER_FEATURES_PATH)
            self.work_classifier_threshold = float(joblib.load(WORK_CLASSIFIER_THRESHOLD_PATH))
            self.work_label_encoders = joblib.load(WORK_LABEL_ENCODERS_PATH)

    # feature 이름 순서를 bideo_regressor_features.pkl 기준으로 맞춰 예상 조회수를 예측한다.
    async def predict_views(self, features: WorkRegressionFeatures) -> WorkRegressionResponse:
        self.load_work_regressor()

        feature_dict = features.model_dump()
        values = [feature_dict[name] for name in self.work_regressor_features]
        prediction = self.work_regressor.predict([values])
        now = datetime.now()

        return WorkRegressionResponse(
            predicted_views=int(prediction[0]),
            created_datetime=now,
            updated_datetime=now
        )

    # 저장된 LabelEncoder와 feature 순서를 맞춰 고조회수 여부를 분류한다.
    async def classify_popular(self, request: WorkClassificationRequest) -> WorkClassificationResponse:
        self.load_work_classifier()

        feature_dict = request.model_dump()
        for column in ["category", "quality", "license_type", "creator_tier"]:
            encoder = self.work_label_encoders[column]
            try:
                feature_dict[column] = int(encoder.transform([feature_dict[column]])[0])
            except ValueError as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"{column} 값이 학습된 라벨에 없습니다: {request.model_dump()[column]}"
                ) from e

        values = [feature_dict[name] for name in self.work_classifier_features]
        popular_probability = float(self.work_classifier.predict_proba([values])[0][1])
        predicted_popular = int(popular_probability >= self.work_classifier_threshold)
        now = datetime.now()

        return WorkClassificationResponse(
            predicted_popular=predicted_popular,
            predicted_label="고조회수" if predicted_popular == 1 else "저조회수",
            popular_probability=popular_probability,
            threshold=self.work_classifier_threshold,
            created_datetime=now,
            updated_datetime=now
        )

    def _get_kiwi(self):
        if self.kiwi_checked:
            return self.kiwi

        self.kiwi_checked = True
        try:
            from kiwipiepy import Kiwi
            self.kiwi = Kiwi()
        except ModuleNotFoundError:
            self.kiwi = None

        return self.kiwi
