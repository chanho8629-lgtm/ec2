from pydantic import BaseModel, Field
from typing import Optional


class AuctionRagIndexRequest(BaseModel):
    file_path: Optional[str] = None
    output_dir: str = "./rag_output"


class AuctionRagIndexResponse(BaseModel):
    indexed: bool
    file_path: str
    message: str


class AuctionRagAnalyzeRequest(BaseModel):
    title: str = ""
    description: str = ""
    category: str = ""
    tags: list[str] = Field(default_factory=list)
    start_price: int = 0
    current_price: int = 0
    bid_count: int = 0
    bidder_count: int = 0
    view_count: int = 0
    like_count: int = 0
    image_base64: Optional[str] = None
    image_path: Optional[str] = None
    image_url: Optional[str] = None
    fast_mode: bool = True


class AuctionRagAnalyzeResponse(BaseModel):
    image_analysis: str
    auction_report: str
    used_rag: bool
    indexed_document_hint: str
