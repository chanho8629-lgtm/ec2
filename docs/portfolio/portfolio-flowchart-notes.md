# BIDEO Portfolio Flowchart Capture Notes

## Added page

- URL: `/portfolio/flowchart`
- API: `/portfolio/api/flowchart`
- Capture modes:
  - `/portfolio/flowchart?capture=overview`
  - `/portfolio/flowchart?capture=error`
  - `/portfolio/flowchart?capture=fixed`
  - `/portfolio/flowchart?view=backend&capture=overview`
  - `/portfolio/flowchart?view=ai&capture=overview`

## Screenshot set

Saved in `docs/portfolio/screenshots`.

- `01-overview.png`: UI/UX architecture flowchart
- `02-backend.png`: backend service and persistence flow
- `03-ai-usage.png`: FastAPI and AI usage notes
- `04-troubleshooting-failure.png`: controlled failure capture
- `05-troubleshooting-fixed.png`: fixed-state capture

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
