# BIDEO Portfolio Flowchart Capture Notes

## Added page

- URL: `/portfolio/flowchart`
- API: `/portfolio/api/flowchart`
- Capture modes:
  - `/portfolio/flowchart?view=planning&capture=overview`
  - `/portfolio/flowchart?capture=overview`
  - `/portfolio/flowchart?capture=error`
  - `/portfolio/flowchart?capture=fixed`
  - `/portfolio/flowchart?view=backend&capture=overview`
  - `/portfolio/flowchart?view=ai&capture=overview`

## Screenshot set

Saved in `docs/portfolio/screenshots`.

- `00-planning-background.png`: main planning background with generated portfolio image evidence
- `01-overview.png`: UI/UX architecture flowchart
- `02-backend.png`: backend service and persistence flow
- `03-ai-usage.png`: FastAPI and AI usage notes
- `04-troubleshooting-failure.png`: controlled failure capture
- `05-troubleshooting-fixed.png`: fixed-state capture

## Main planning background

### Why this project needed one connected flow

BIDEO is planned as an artwork commerce platform rather than a simple upload board. One uploaded artwork moves through several states: draft metadata, S3 media, public feed item, gallery collection item, direct-sale product, auction target, payment target, and finally sold inventory. Because those states are connected, the portfolio flowchart was built around transaction boundaries instead of only screen order.

### Product problem

- Creators need to upload work once and reuse it in feed, gallery, sale, and auction contexts.
- Buyers need visible artwork, trusted payment confirmation, and clear ownership state after purchase or auction close.
- The system needs to keep heavy media in AWS S3 while saving stable metadata and object keys in PostgreSQL.
- AI should support creator decisions and evaluator explanation without hiding the core Spring Boot backend flow.

### Planning decisions reflected in the page

- Artwork registration includes metadata, multipart files, tags, gallery links, and optional auction setup.
- Gallery creation is treated as curation, so cover images and selected works are saved together.
- Payment completion requires Bootpay server-side receipt verification before order, work, and gallery state changes.
- Auction bidding is transactional so only one winning bid remains after rapid bid attempts.
- Troubleshooting screenshots are intentionally separated into failure and fixed capture modes.

### Image evidence used

The planning tab uses generated portfolio assets saved in `src/main/resources/static/images/portfolio`:

- `planning-curation.png`: creator-first gallery commerce and curated artwork presentation.
- `planning-upload.png`: upload, metadata, and gallery exposure as one creator workflow.
- `planning-discovery.png`: search, tags, similar works, and AI-backed discovery.
- `planning-commerce-s3.png`: auction, payment verification, database state, and secure media delivery.

## Troubleshooting story for portfolio

### S3 image URL issue

- Before: the database saved an S3 object key correctly, but the UI attempted to render the raw key.
- Symptom: artwork preview requested an app-host path such as `works/demo.png` and showed a broken image.
- Fix: move URL conversion into service response shaping through `WorkService.applyFileUrls` and gallery list/detail URL conversion.
- After: feed, detail, gallery cover, and thumbnail views render presigned S3 URLs.

### Bootpay confirmation issue

- Before: the client success callback could make payment look complete before server verification.
- Symptom: browser showed success while server-side payment stayed `PENDING` after receipt mismatch.
- Fix: confirm with `BootpayClient.getReceipt` and validate price, status, order id, buyer, and work.
- After: invalid receipts stay pending and valid receipts update payment, order, work, and gallery links transactionally.

### Auction race issue

- Before: rapid bids could leave ambiguity around the current winning bid.
- Symptom: manual parallel bid testing could produce more than one apparent winner.
- Fix: wrap `BidCommandService.placeBid` in a transaction, clear previous winning bid, save the new bid, and update auction current price.
- After: each auction has exactly one winning bid after repeated bid tests.

## AI usage points

- Price regression via FastAPI work regression endpoint.
- Style/category classification via FastAPI classification endpoint.
- Image pipeline with generated/transformed images uploaded to S3.
- Auction RAG summary for bid history and risk explanation.
