package storage

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
)

// FSStore implements Store using the local filesystem.
type FSStore struct {
	root      string // root directory for stored files
	publicURL string // URL prefix, e.g. "/api/v1/media"
}

// NewFS creates a new FSStore rooted at the given directory.
func NewFS(root, publicURL string) (*FSStore, error) {
	if err := os.MkdirAll(root, 0750); err != nil {
		return nil, fmt.Errorf("storage: fs init: %w", err)
	}
	if publicURL == "" {
		publicURL = "/api/v1/media"
	}
	return &FSStore{root: root, publicURL: publicURL}, nil
}

func (f *FSStore) Put(_ context.Context, key, contentType string, data []byte) (string, error) {
	path := filepath.Join(f.root, filepath.FromSlash(key))
	if err := os.MkdirAll(filepath.Dir(path), 0750); err != nil {
		return "", fmt.Errorf("storage: fs mkdir %s: %w", key, err)
	}
	if err := os.WriteFile(path, data, 0640); err != nil {
		return "", fmt.Errorf("storage: fs put %s: %w", key, err)
	}
	return f.URL(key), nil
}

func (f *FSStore) Get(_ context.Context, key string) ([]byte, error) {
	path := filepath.Join(f.root, filepath.FromSlash(key))
	return os.ReadFile(path)
}

func (f *FSStore) URL(key string) string {
	return f.publicURL + "/" + key
}
