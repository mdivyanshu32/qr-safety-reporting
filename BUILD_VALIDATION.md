# Build validation

This release removes the custom `@Query` annotations from `ReportRepository` and uses Spring Data derived count methods instead. This avoids the previous `cannot find symbol: class Query` compilation failure.

GitHub Actions is included under `.github/workflows/build.yml` and validates both the Spring Boot backend and Vite frontend on every push/PR to `main`.

Render should deploy only after the GitHub Actions build is green.
