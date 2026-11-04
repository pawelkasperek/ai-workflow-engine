package tracker

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadIssuesCacheTracksContentAndIsolatesMutations(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "issue.md")
	write := func(title string) {
		t.Helper()
		data := "---\ntitle: " + title + "\nlabels: [original]\ncustom: [value]\n---\nBody."
		if err := os.WriteFile(path, []byte(data), 0644); err != nil {
			t.Fatal(err)
		}
	}
	load := func() *Issue {
		t.Helper()
		issues, err := LoadIssues(dir)
		if err != nil || len(issues) != 1 {
			t.Fatalf("issues=%v err=%v", issues, err)
		}
		return issues[0]
	}
	write("First")
	info, err := os.Stat(path)
	if err != nil {
		t.Fatal(err)
	}
	first := load()
	first.Title = "mutated"
	first.Slug = "mutated"
	first.Labels[0] = "mutated"
	first.ExtraFields[0].Values[0] = "mutated"
	second := load()
	if second.Title != "First" || second.Slug != "first" || second.Labels[0] != "original" || second.ExtraFields[0].Values[0] != "value" {
		t.Fatalf("cached issue leaked mutation: %+v", second)
	}
	// Same byte length and modification time must not conceal an edit.
	write("Other")
	if err := os.Chtimes(path, info.ModTime(), info.ModTime()); err != nil {
		t.Fatal(err)
	}
	if got := load(); got.Title != "Other" || got.Slug != "other" {
		t.Fatalf("stale issue after edit: %+v", got)
	}
	if err := os.Remove(path); err != nil {
		t.Fatal(err)
	}
	if issues, err := LoadIssues(dir); err != nil || len(issues) != 0 {
		t.Fatalf("deleted issue remained: %v %v", issues, err)
	}
}
