# docs/ai templates

Skeletons for every document the initializer generates. Conventions:

- Frontmatter is the contract: `doc`, `purpose`, `authority` (`canonical | mirror | reference | historical`), `hosts_rules`, `mirrors_rules`, `last_reviewed`. Keep exactly these keys.
- `{{PROJECT}}`, `{{DATE}}`, `{{...}}` are placeholders — every one must be replaced or its line removed before the file is written. `<!-- … -->` comments are guidance for the agent and are deleted from the output.
- Headings marked *(if applicable)* are removed when the project has nothing real to put under them. Never leave an empty section "for later".
- `authority: mirror` sections must reference the canonical home by rule ID; they never restate a rule as an independent authority.
- Wording that already exists in a proven system (the owner's CRM project) is preferred over invention; project facts are never invented.
