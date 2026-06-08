package com.app.bideo.controller.portfolio;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
@RequestMapping("/portfolio")
public class PortfolioController {

    @GetMapping("/flowchart")
    public String flowchart(@RequestParam(defaultValue = "overview") String view,
                            @RequestParam(defaultValue = "fixed") String capture,
                            Model model) {
        model.addAttribute("initialView", view);
        model.addAttribute("captureMode", capture);
        return "portfolio/flowchart";
    }

    @ResponseBody
    @GetMapping("/api/flowchart")
    public PortfolioFlowResponse flowchartData() {
        return new PortfolioFlowResponse(
                List.of(
                        new PlanningInsight(
                                "Creator-first artwork commerce",
                                "The service was planned around creators who need one place to upload a work, present it in a gallery, sell it immediately, or open an auction without moving between separate tools.",
                                "A single registration flow had to connect metadata, media upload, tags, gallery exposure, sale status, and optional auction creation."
                        ),
                        new PlanningInsight(
                                "Trust before payment completion",
                                "Because art purchases and auction wins affect ownership state, the payment flow cannot rely on a browser success callback alone.",
                                "Bootpay receipt verification, order validation, work status updates, and gallery link cleanup were placed in the backend transaction boundary."
                        ),
                        new PlanningInsight(
                                "Portfolio evidence over feature listing",
                                "The portfolio page was designed to show implementation decisions, failure reproduction, fix evidence, and final verification instead of only listing screens.",
                                "The capture modes separate failure screenshots from fixed screenshots so troubleshooting can be explained step by step."
                        ),
                        new PlanningInsight(
                                "AI as a workflow assistant",
                                "AI was positioned as support for registration quality, classification, image generation, auction analysis, and documentation rather than as a standalone gimmick.",
                                "FastAPI integrations are shown next to the Spring Boot flow so evaluators can see where model output enters the product."
                        )
                ),
                List.of(
                        new ImageEvidence(
                                "/images/portfolio/planning-curation.png",
                                "Curated gallery commerce",
                                "Explains the main planning idea: one uploaded work should become a curated gallery item and a commercial artwork without duplicate registration."
                        ),
                        new ImageEvidence(
                                "/images/portfolio/planning-upload.png",
                                "Artwork upload to gallery",
                                "Shows why upload, artwork metadata, gallery selection, and image presentation were planned as one creator workflow."
                        ),
                        new ImageEvidence(
                                "/images/portfolio/planning-discovery.png",
                                "Discovery and recommendation",
                                "Supports the requirement that works need tags, search surfaces, similar works, and AI-backed discovery after registration."
                        ),
                        new ImageEvidence(
                                "/images/portfolio/planning-commerce-s3.png",
                                "Auction, payment, and S3 state",
                                "Combines the transaction-heavy part of the plan: winning bid, receipt verification, database update, and secure image delivery."
                        )
                ),
                List.of(
                        new PortfolioModule(
                                "work",
                                "Artwork CRUD + S3 Delivery",
                                "A full artwork lifecycle from registration to public feed rendering.",
                                "Backend",
                                List.of(
                                        new FlowStep("01", "Thymeleaf Form", "work-register.html collects metadata, media, tags, gallery, and auction options."),
                                        new FlowStep("02", "Controller", "WorkAPIController.write binds multipart files and authenticated member id."),
                                        new FlowStep("03", "Service Transaction", "WorkService validates ownership, saves WorkVO, and orchestrates files, tags, and auction setup."),
                                        new FlowStep("04", "AWS S3", "S3FileService.upload(\"works\", file) stores media and keeps only the object key in PostgreSQL."),
                                        new FlowStep("05", "MyBatis", "WorkMapper writes tbl_work, tbl_work_file, tbl_work_tag, tbl_gallery_work, and optional tbl_auction."),
                                        new FlowStep("06", "Read Model", "WorkService.applyFileUrls converts S3 keys into presigned URLs for feed/detail responses.")
                                )
                        ),
                        new PortfolioModule(
                                "gallery",
                                "Gallery CRUD + Curated Works",
                                "Gallery cover upload, ownership validation, linked artwork curation, and presigned image delivery.",
                                "UI/UX",
                                List.of(
                                        new FlowStep("01", "Gallery Form", "gallery-register.html handles cover file, selected works, and tags."),
                                        new FlowStep("02", "Controller", "GalleryAPIController.write/update delegates authenticated member context."),
                                        new FlowStep("03", "S3 Cover", "S3FileService.upload(\"galleries\", coverFile) returns a persistent coverImage key."),
                                        new FlowStep("04", "Transactional Save", "GalleryService saves gallery metadata, work links, tag rows, and work count."),
                                        new FlowStep("05", "Detail View", "GalleryService joins gallery, tags, and work thumbnails."),
                                        new FlowStep("06", "Public Render", "The page receives presigned cover and thumbnail URLs without exposing bucket internals.")
                                )
                        ),
                        new PortfolioModule(
                                "payment",
                                "Bootpay Payment Verification",
                                "Server-side receipt verification before finalizing order, payment, and artwork status.",
                                "Backend",
                                List.of(
                                        new FlowStep("01", "Client Payment", "pay.js starts Bootpay.requestPayment and receives receiptId."),
                                        new FlowStep("02", "Confirm API", "PaymentAPIController.confirmBootpayPayment receives paymentId and receiptId."),
                                        new FlowStep("03", "Receipt Lookup", "BootpayClient.getReceipt validates the PG receipt server-to-server."),
                                        new FlowStep("04", "Guard Rails", "PaymentService checks price, status, order_id, buyer, and work consistency."),
                                        new FlowStep("05", "Finalize", "paymentDAO.completePayment and orderDAO.updateStatus(\"PAID\") close the transaction."),
                                        new FlowStep("06", "Inventory Update", "workDAO.updateStatus(\"SOLD\") and galleryDAO.deleteWorkLinkByWorkId remove sold work from galleries.")
                                )
                        ),
                        new PortfolioModule(
                                "auction",
                                "Auction Bid + Scheduled Close",
                                "Bid validation, winning-bid replacement, notification, and pending payment generation.",
                                "Realtime",
                                List.of(
                                        new FlowStep("01", "Bid Request", "AuctionController.placeBid receives auctionId and bidPrice."),
                                        new FlowStep("02", "Validation", "BidCommandService rejects inactive, expired, seller-owned, or below-minimum bids."),
                                        new FlowStep("03", "Winning Bid", "bidDAO.clearPreviousWinning and bidDAO.save mark the current winner atomically."),
                                        new FlowStep("04", "Current Price", "auctionDAO.updateCurrentPrice stores price and unique bidder count."),
                                        new FlowStep("05", "Scheduler", "AuctionClosureService.closeExpiredAuctions closes expired auctions."),
                                        new FlowStep("06", "Pending Payment", "The winner receives a generated order/payment and a WebSocket close event.")
                                )
                        )
                ),
                List.of(
                        new AiUseCase("Price Regression", "FastAPI /api/work/regression predicts expected artwork price from metadata and visual quality features."),
                        new AiUseCase("Style Classification", "FastAPI /api/work/classification classifies category/style to support registration and discovery."),
                        new AiUseCase("Image Pipeline", "FastAPI /api/ai/image/pipeline generates or transforms a prompt image and uploads the result to S3."),
                        new AiUseCase("Auction RAG", "AuctionRagService summarizes bid history and risk signals for auction decision support.")
                ),
                List.of(
                        new TroubleshootingCase(
                                "s3-url",
                                "S3 object key was saved correctly, but the UI rendered the raw key instead of a presigned URL.",
                                "Image preview broken on artwork detail. Network tab showed 404 because the browser requested works/demo.png from the app host.",
                                "Moved URL conversion into WorkService.applyFileUrls and GalleryService list/detail responses.",
                                "Verified feed, detail, gallery cover, and thumbnail rendering with presigned URLs."
                        ),
                        new TroubleshootingCase(
                                "bootpay-receipt",
                                "Client success callback was trusted before receipt validation.",
                                "Payment looked complete in the browser while server state stayed PENDING after order_id mismatch.",
                                "Changed confirm flow to call BootpayClient.getReceipt and compare amount, status, order_id, buyer, and work.",
                                "Confirmed invalid receipt stays PENDING and valid receipt updates payment/order/work atomically."
                        ),
                        new TroubleshootingCase(
                                "auction-race",
                                "Multiple bidders could race around the current winning bid update.",
                                "Two winning bids appeared during rapid manual bid testing.",
                                "Wrapped BidCommandService.placeBid in a transaction and clears previous winning bid before saving the new one.",
                                "Repeated parallel bid tests keep exactly one winning bid per auction."
                        )
                )
        );
    }

    public record PortfolioFlowResponse(
            List<PlanningInsight> planningInsights,
            List<ImageEvidence> imageEvidence,
            List<PortfolioModule> modules,
            List<AiUseCase> aiUseCases,
            List<TroubleshootingCase> troubleshooting
    ) {}

    public record PlanningInsight(String title, String analysis, String implementationDecision) {}

    public record ImageEvidence(String imageUrl, String title, String analysis) {}

    public record PortfolioModule(
            String key,
            String title,
            String summary,
            String lane,
            List<FlowStep> steps
    ) {}

    public record FlowStep(String number, String title, String detail) {}

    public record AiUseCase(String title, String detail) {}

    public record TroubleshootingCase(
            String key,
            String title,
            String before,
            String fix,
            String after
    ) {}
}
