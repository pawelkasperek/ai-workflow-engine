package main

import (
	"os"
	"path/filepath"
	"testing"
)

// TestMain points XDG_DATA_HOME at an empty directory so no test reads this
// machine's queued report-bug files (Status page and sidebar counts), and
// XDG_STATE_HOME too so a test viewer never overwrites the real viewer.json.
func TestMain(m *testing.M) {
	// Integration fixtures and the Makefile live at the repository root,
	// while go test starts in the command's package directory.
	if err := os.Chdir(filepath.Join("..", "..")); err != nil {
		panic(err)
	}
	dir, err := os.MkdirTemp("", "issue-viewer-test-xdg-")
	if err == nil {
		os.Setenv("XDG_DATA_HOME", dir)
		os.Setenv("XDG_STATE_HOME", filepath.Join(dir, "state"))
	}
	code := m.Run()
	if err == nil {
		os.RemoveAll(dir)
	}
	os.Exit(code)
}
