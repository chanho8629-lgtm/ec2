from fastapi import APIRouter, Depends, status
from typing import List
from domain.product import ProductCreate, ProductUpdate, ProductRead
from service.product_service import ProductService

# API 경로 그룹화 및 태그 설정
router = APIRouter(prefix="/products", tags=["Products"])

# 서비스 인스턴스 생성
product_service = ProductService()

# 1. 상품 등록
@router.post("/", response_model=int, status_code=status.HTTP_201_CREATED)
async def create_product(product_in: ProductCreate):
    # SwaggerUI에 표시할 내용 작성(/docs)
    """
    새로운 상품을 등록합니다.
    """
    return await product_service.create_product(product_in)

# 2. 상품 상세 조회
@router.get("/{product_id}", response_model=ProductRead)
async def get_product(product_id: int):
    """
    특정 ID의 상품 정보를 조회합니다.
    """
    return await product_service.get_product(product_id)

# 3. 상품 전체 목록 조회
@router.get("/", response_model=List[ProductRead])
async def get_all_products():
    """
    등록된 모든 상품 목록을 가져옵니다.
    """
    return await product_service.get_all_products()

# 4. 상품 수정
@router.put("/{product_id}", response_model=bool)
async def update_product(product_id: int, product_in: ProductUpdate):
    """
    기존 상품 정보를 전체 수정합니다.
    """
    return await product_service.update_product(product_id, product_in)

# 5. 상품 삭제
@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int):
    """
    상품을 삭제합니다. (성공 시 응답 본문 없음)
    """
    await product_service.delete_product(product_id)
    return None