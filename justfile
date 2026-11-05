default:
    @just --list

# Zależności tutoriala z lockfile.
tutorial-install:
    just --justfile tutorial/justfile install

# Polski poradnik na http://localhost:10780.
tutorial-dev:
    just --justfile tutorial/justfile dev

# Build React + TanStack Start + Fumadocs.
tutorial-build:
    just --justfile tutorial/justfile build

# Podgląd zbudowanego poradnika.
tutorial-preview:
    just --justfile tutorial/justfile preview

# Pełne lokalne CI poradnika.
tutorial-ci:
    just --justfile tutorial/justfile ci
