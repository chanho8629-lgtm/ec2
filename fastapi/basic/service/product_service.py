from repository.product_repository import ProductRepository
from domain.product import ProductCreate, ProductUpdate, ProductRead
from fastapi import HTTPException

class ProductService:
    def __init__(self):
        self.product_repo = ProductRepository()

    # 1. 상품 등록
    async def create_product(self, product: ProductCreate) -> int:
        product_id = await self.product_repo.create(
            name=product.product_name,
            price=product.product_price
        )
        return product_id

    # 2. 상품 상세 조회
    async def get_product(self, product_id: int) -> ProductRead:
        product_data = await self.product_repo.find_by_id(product_id)
        if not product_data:
            raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")
        return ProductRead(**product_data)

    # 3. 상품 전체 목록 조회
    async def get_all_products(self):
        products = await self.product_repo.find_all()
        # 리스트 내의 dict들을 각각 ProductRead 객체로 변환
        return [ProductRead(**p) for p in products]

    # 4. 상품 수정
    async def update_product(self, product_id: int, product: ProductUpdate) -> bool:
        # 기존 상품이 있는지 먼저 확인
        existing = await self.product_repo.find_by_id(product_id)
        if not existing:
            raise HTTPException(status_code=404, detail="수정할 상품이 없습니다.")

        success = await self.product_repo.update(
            product_id=product_id,
            name=product.product_name,
            price=product.product_price
        )
        if not success:
            raise HTTPException(status_code=404, detail="수정할 상품은 존재하지만 실패했습니다.")
        return True

    # 5. 상품 삭제
    async def delete_product(self, product_id: int) -> bool:
        success = await self.product_repo.delete(product_id)
        if not success:
            raise HTTPException(status_code=404, detail="삭제할 상품이 존재하지 않습니다.")
        return True