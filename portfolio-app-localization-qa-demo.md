# Synthetic app-localization QA sample — English to Russian

> Demonstration only. These strings are fictional and were created for this portfolio with AI assistance. They are not client work, not evidence of paid translation experience, and not a substitute for a human proofreader's own review. One current Upwork brief explicitly requests no machine translation; do not present this AI-assisted sample as a human-only test.

## Review method

1. Compare each Russian string against the English source.
2. Preserve variables, tags, numbering, and UI behavior exactly.
3. Prefer short, neutral, everyday Russian.
4. Flag ambiguity instead of inventing product behavior.
5. Check consistency across repeated terms and buttons.

## Example review table

| English source | Existing Russian draft | Suggested Russian edit | QA note |
|---|---|---|---|
| Your changes haven't been saved yet. | Ваши изменения пока не были сохранены. | Изменения ещё не сохранены. | Shorter and natural for a status message. |
| Try again in a few minutes. | Попробуйте снова через несколько минут. | Повторите попытку через несколько минут. | Neutral, standard UI wording. |
| This link has expired. Request a new one. | Эта ссылка истекла. Запросите новую. | Срок действия ссылки истёк. Запросите новую. | More precise: links expire by validity period. |
| Delete "{item_name}"? | Удалить "{item_name}"? | Удалить «{item_name}»? | Keeps the exact variable name; Russian quotation marks improve typography. |
| Your session will expire in {minutes} minutes. | Ваша сессия закончится через {minutes} минут. | Сеанс завершится через {minutes} мин. | Keeps the placeholder intact. Verify plural handling in the product's localization system. |
| We couldn't load your files. Check your connection and try again. | Мы не смогли загрузить ваши файлы. Проверьте соединение и попробуйте снова. | Не удалось загрузить файлы. Проверьте подключение и повторите попытку. | More concise and consistent with neutral product UI. |

## Placeholder and formatting checks

- `{item_name}` and `{minutes}` are unchanged.
- No HTML tags, code variables, or numbering are introduced or removed.
- The plural form after `{minutes}` must be checked against the application's actual localization format; a simple placeholder may not support correct Russian plural forms.
- The product glossary should decide whether the app uses «сеанс» or «сессия» consistently.

## Scope note for a real project

Before quoting, request the source file, the exact localization format, glossary, character limits, and rules for placeholders/tags. Agree on a small paid sample and the full delivery scope. A human reviewer must verify every final line against the source.
