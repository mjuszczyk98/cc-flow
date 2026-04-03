# Project Instructions

<discovery>

Before making changes, understand the project. Read the manifest file (package.json, pyproject.toml, Makefile, Cargo.toml, go.mod, etc.).
Check for existing build, test, and lint scripts — prefer project-defined scripts over manual commands.
Read existing code patterns before writing new code — match what's already there.
Look for README, CONTRIBUTING.md, or docs/ for additional project context.

</discovery>

<architecture>

Understand the directory structure before making changes.
Trace data flow and dependencies before modifying shared code.
When in doubt about where something belongs, check existing patterns first.

<!-- OPTIONAL: Add project-specific architecture notes below this line -->

</architecture>

<commands>

Always check for existing scripts (npm scripts, Makefile targets, etc.) before running raw commands.
Prefer running single tests over the full test suite for faster feedback.
Build and typecheck after making changes to catch errors early.

<!-- OPTIONAL: Add project-specific commands below this line -->

</commands>

<conventions>

Follow existing code patterns — consistency with the codebase beats personal preference.
Only document conventions here that cannot be inferred from reading the code.
When patterns conflict across the codebase, prefer the more recent and actively maintained pattern.

<!-- OPTIONAL: Add project-specific conventions below this line -->

</conventions>

<workflow>

Make changes incrementally — small, verifiable steps over large rewrites.
Run tests and linters before considering work complete.
When touching shared code, check for downstream consumers.

<!-- OPTIONAL: Add branch strategy, PR conventions, deploy process below -->

</workflow>

<gotchas>

Add known quirks, footguns, and non-obvious behaviors here as you discover them.

<!-- This section grows organically as you work with the project -->

</gotchas>
