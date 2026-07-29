# TODO

## Publish to pi.dev/packages

No manual submission exists. The [gallery](https://pi.dev/packages) auto-indexes
any npm package tagged with the `pi-package` keyword (already set in
`package.json`).

- [ ] Bump version in `package.json` if needed (currently `0.1.0`)
- [ ] Create the GitHub repo and push:
      `gh repo create leonardo-meireles/pi-stop-slop --public --source=. --push`
- [ ] `npm login` (one-time)
- [ ] `npm publish --access public`
- [ ] Wait a few minutes, then confirm the listing at
      `pi.dev/packages/pi-stop-slop`
- [ ] Verify install end-to-end in a scratch directory:
      `pi install npm:pi-stop-slop`

### Optional gallery polish

- [ ] Add a `video` or `image` field under the `pi` key in `package.json`
      for a gallery preview thumbnail. A short terminal recording showing
      `/stop-slop strict` changing the model's output live would sell this
      better than static text.

### Before publishing, check positioning

- [ ] `pi-paper-lab` already exists in similar territory ("Anti-AI
      rewrite... domain-agnostic"). Skim its README first to make sure
      pi-stop-slop's pitch (general STE for any prose, zero-latency mode
      injection via system prompt, not post-processing) reads as clearly
      differentiated.
