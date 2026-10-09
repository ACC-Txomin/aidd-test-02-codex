<!-- BEGIN solidkey-aidd -->
## SolidKey Git Policy

Before executing any request or direct command that may edit files and create a
commit—including `$gsd-fast`, `$gsd-quick`, phase execution, or equivalent—read
and follow `.solidkey/policies/git.md`.

Complete its mandatory work-branch preflight before the first edit, staging
operation, mutating subagent dispatch, or commit. Never perform committable work
directly on `main` or `dev`. Reuse the correct existing work branch when one is
already checked out.

Treat GSD as the workflow owner. These instructions only activate SolidKey
policy; they do not replace GSD planning, execution, verification, or shipping.

On Windows, use PowerShell 7 or later. Write project text files as UTF-8 without
BOM on the first write and follow the repository's text-file configuration.
<!-- END solidkey-aidd -->
