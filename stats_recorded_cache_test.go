package main

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/michal-franc/issue-viewer/internal/tracker"
)

func TestRecordedStatsCacheInvalidation(t *testing.T) {
	c := newStatsCache()
	issue := &tracker.Issue{FilePath: filepath.Join(t.TempDir(), "issue.md"), Slug: "one", Title: "First", Status: "idea"}
	issues := []*tracker.Issue{issue}
	if rows, totals := c.recordedStats("test", issues); len(rows) != 0 || len(totals) != 0 {
		t.Fatal("missing sidecar should produce no totals")
	}
	sidecar := tracker.StatsSidecarPath(issue.FilePath)
	write := func(tokens string) {
		t.Helper()
		if err := os.WriteFile(sidecar, []byte(`{"transitions":[{"from":"idea","to":"done","dynamic_tokens":`+tokens+`}]}`), 0644); err != nil {
			t.Fatal(err)
		}
	}
	check := func(tokens int) {
		t.Helper()
		rows, totals := c.recordedStats("test", issues)
		if len(rows) != 1 || len(totals) != 1 || totals[0].TotalDynamicTokens != tokens || totals[0].Title != issue.Title || totals[0].Status != issue.Status {
			t.Fatalf("rows=%+v totals=%+v", rows, totals)
		}
	}
	write("10")
	check(10)
	check(10)    // cache hit
	write("123") // only the sidecar changes, not the issue markdown
	check(123)
	issue.Title, issue.Status = "Renamed", "done"
	check(123)
	if err := os.Remove(sidecar); err != nil {
		t.Fatal(err)
	}
	if rows, totals := c.recordedStats("test", issues); len(rows) != 0 || len(totals) != 0 {
		t.Fatal("deleted sidecar remained cached")
	}
}
