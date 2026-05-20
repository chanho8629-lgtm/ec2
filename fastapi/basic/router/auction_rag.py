from fastapi import APIRouter, status

from domain.AuctionRag import (
    AuctionRagAnalyzeRequest,
    AuctionRagAnalyzeResponse,
    AuctionRagIndexRequest,
    AuctionRagIndexResponse,
)
from service.auction_rag_service import AuctionRagService

router = APIRouter(prefix="/api/auction/rag", tags=["Auction RAG"])

auction_rag_service = AuctionRagService()


@router.post("/index", response_model=AuctionRagIndexResponse, status_code=status.HTTP_200_OK)
async def index_auction_rag_report(request: AuctionRagIndexRequest):
    return await auction_rag_service.index_report(request.file_path, request.output_dir)


@router.post("/analyze", response_model=AuctionRagAnalyzeResponse, status_code=status.HTTP_200_OK)
async def analyze_auction_with_rag(request: AuctionRagAnalyzeRequest):
    return await auction_rag_service.analyze(request)
