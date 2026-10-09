#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { resolve, join, relative } from "node:path";

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

const args = process.argv.slice(2);
const issueArg = args.find((arg) => /^#?\d+$/.test(arg));
if (!issueArg) {
  fail("Usage: node .solidkey/bin/fetch-issue.mjs ISSUE [--project=PATH] [--repo=OWNER/REPO]");
}

const issueNumber = issueArg.replace(/^#/, "");
const projectArg = args.find((arg) => arg.startsWith("--project="));
const repoArg = args.find((arg) => arg.startsWith("--repo="));
const project = resolve(projectArg ? projectArg.slice("--project=".length) : process.cwd());

function gh(parameters) {
  try {
    return execFileSync("gh", parameters, {
      cwd: project,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    const detail = error?.stderr?.toString().trim();
    fail(detail || `GitHub CLI failed: gh ${parameters.join(" ")}`);
  }
}

const requestedRepository = repoArg ? repoArg.slice("--repo=".length) : undefined;
const issueArguments = ["issue", "view", issueNumber];
if (requestedRepository) issueArguments.push("--repo", requestedRepository);
issueArguments.push("--json", "number,title,body,state,url");
const issue = JSON.parse(gh(issueArguments));
const issueUrl = new URL(issue.url);
const [owner, repositoryName] = issueUrl.pathname.split("/").filter(Boolean);
const repository = requestedRepository || `${owner}/${repositoryName}`;

const slug = issue.title
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 80) || "issue";

const issuesDirectory = join(project, ".issues");
mkdirSync(issuesDirectory, { recursive: true });

const existing = existsSync(issuesDirectory)
  ? readdirSync(issuesDirectory).find((name) => name.startsWith(`${issue.number}-`) && name.endsWith(".md"))
  : undefined;
const destination = join(issuesDirectory, existing || `${issue.number}-${slug}.md`);
const downloadedAt = new Date().toISOString();
const body = String(issue.body || "").replace(/\r\n?/g, "\n").trimEnd();
const yamlString = (value) => JSON.stringify(String(value));

const content = [
  "---",
  `repository: ${yamlString(repository)}`,
  `issue: ${issue.number}`,
  `url: ${yamlString(issue.url)}`,
  `title: ${yamlString(issue.title)}`,
  `state: ${String(issue.state).toLowerCase()}`,
  `downloaded_at: ${yamlString(downloadedAt)}`,
  "---",
  "",
  body,
  "",
].join("\n");

// Node's utf8 writer emits UTF-8 without BOM. Content is normalized to LF above.
writeFileSync(destination, content, { encoding: "utf8" });
process.stdout.write(`${relative(project, destination).replaceAll("\\", "/")}\n`);
