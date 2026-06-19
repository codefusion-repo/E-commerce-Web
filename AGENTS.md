# AGENTS.md

## Contract

AGENTS.md is the repository-wide terminal-agent adapter and bootloader for
`codefusion-repo/E-commerce-Web`.

This file is not the source of truth. The project-os-v2-min kernel is the
source of truth for generic operating behavior (actors, execution modes,
boundaries, workflows, evidence, outputs, statuses). This repository's own
evidence and explicit PM decisions are the authority for all product, domain,
and implementation facts.

This file must stay compact. It must not store issue/PR/branch/validation
state, review verdicts, roadmap state, planning state, or any live
traceability.

## Repository identity

Standard metadata block. Keep these field names and order so agents and the
future Operations Console read adapters the same way across repositories.
`REPOSITORY_LOCAL_PATH`, `KERNEL_LOCAL_PATH`, and `KERNEL_VERSION_ADOPTED` are
per-machine/adoption configuration, not live project state.

PROJECT_NAME = e-commerce-demo
REPOSITORY_NAME = codefusion-repo/E-commerce-Web
REPOSITORY_LOCAL_PATH = $HOME/projects/personal/ecommerce
DEFAULT_BRANCH = main
WORK_BRANCH_PATTERN = work/*
PM_FACING_LANGUAGE = es
KERNEL_REPOSITORY = codefusion-repo/project-os-v2
KERNEL_LOCAL_PATH = $HOME/projects/personal/project-os-v2/kernel
KERNEL_VERSION_ADOPTED = target-dogfood-baseline-2026-06-16

## Kernel resolution

Before non-trivial work, resolve behavior from the kernel at
`KERNEL_LOCAL_PATH`: read `manifest.json` and follow its
`resolution_sequence` exactly. The manifest is the canonical sequence; this
adapter only points to it. Fail closed per `boundary.fail_closed` if the kernel
is missing, ambiguous, or conflicting.

## Live state

Reconstruct project state from GitHub and git at task time, per the kernel
traceability protocol: current issue, linked PRs, the canonical roadmap issue
`null`, and `docs/decisions/` ADRs when present. Never trust
internal memory or durable files for live state.

## Project-specific notes

- Never expose or request secrets, credentials, tokens, private keys, keystores, `.env`, `key.properties`, Play Console credentials, purchase tokens, private tester data, or sensitive payloads.