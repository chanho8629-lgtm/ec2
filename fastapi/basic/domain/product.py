from pydantic import BaseModel, Field
from datetime import datetime

# 공통 필드
# Base 모델은 초기화 생성자가 만들어져 있다.
# ProductBase(**product)로 초기화 가능!
class ProductBase(BaseModel):
    product_name: str
    product_price: int = Field(..., ge=0) # 0원 이상만 허용

# 생성 시 받을 데이터 (Input)
class ProductCreate(ProductBase):
    pass

# 수정 시 받을 데이터 (Update)
class ProductUpdate(ProductBase):
    pass

# 응답용 데이터 (Output)
class ProductRead(ProductBase):
    id: int
    created_datetime: datetime
    updated_datetime: datetime
