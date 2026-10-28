<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep board artwork in a retained client-side scene and render it on a viewport-sized canvas; this preserves artwork during resizing and zooming while keeping the controls independent of the scene transform.
- Keep the mushaf reader in a separate portaled dialog and insert its already-loaded original image into the board scene; this isolates reader presentation from board transforms and avoids a second download or resampling on insertion.
- Paint a white paper backing under inserted mushaf images without modifying their pixels; transparent scan backgrounds must not reveal the dark board behind Quran text.
- Use centeredImageBounds for image placement with viewport, zoom and pan inputs; this keeps full-image placement consistent and independently testable.
- Keep an explicit available-page inventory keyed by each scan's printed page number and navigate only that inventory; upload filenames can be offset and incomplete, so numeric filename ranges alone would mislabel pages or request missing scans.
