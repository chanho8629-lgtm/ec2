from database import db
from typing import List, Optional

class ProductRepository:
    # 1. 생성 (Create)
    async def create(self, name: str, price: int) -> dict:
        async with db.get_connection() as conn:
            query = """
                INSERT INTO tbl_product (product_name, product_price)
                VALUES ($1, $2)
                RETURNING id
            """
            # fetchrow: 결과행
            # fetchval: 첫 번째 컬럼의 값
            product_id = await conn.fetchval(query, name, price) # name: $1, price: $2
            return product_id

    # 2. 단건 조회 (Read - Single)
    # Optional: 값이 있을 수도 있고, 없을 수도 있음
    async def find_by_id(self, product_id: int) -> Optional[dict]:
        async with db.get_connection() as conn:
            query = "SELECT * FROM tbl_product WHERE id = $1"
            row = await conn.fetchrow(query, product_id)
            return dict(row) if row else None

    # 3. 전체 목록 조회 (Read - List)
    async def find_all(self) -> List[dict]:
        async with db.get_connection() as conn:
            query = "SELECT * FROM tbl_product ORDER BY id DESC"
            rows = await conn.fetch(query)
            return [dict(row) for row in rows]

    # 4. 수정 (Update)
    async def update(self, product_id: int, name: str, price: int) -> bool:
        async with db.get_connection() as conn:
            query = """
                UPDATE tbl_product 
                SET product_name = $1, product_price = $2, updated_datetime = NOW()
                WHERE id = $3
            """
            result = await conn.execute(query, name, price, product_id)
            return result == "UPDATE 1"

    # 5. 삭제 (Delete)
    async def delete(self, product_id: int) -> bool:
        async with db.get_connection() as conn:
            query = "DELETE FROM tbl_product WHERE id = $1"
            # execute()는 영향을 받은 행의 상태를 문자열로 반환 (예: "DELETE 1")
            result = await conn.execute(query, product_id)
            return result == "DELETE 1"