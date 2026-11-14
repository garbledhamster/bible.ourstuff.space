import subprocess
import tempfile
import unittest
from pathlib import Path

from serve import SharedBible, UpdateError


def git(path, *args):
    return subprocess.check_output(["git", "-C", str(path), *args], text=True).strip()


class SharedBibleTest(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        root = Path(temporary.name)
        self.remote = root / "upstream"
        self.remote.mkdir()
        git(self.remote, "init", "--initial-branch=main")
        git(self.remote, "config", "user.name", "Test")
        git(self.remote, "config", "user.email", "test@example.com")
        (self.remote / "guide.md").write_text("First guide")
        git(self.remote, "add", "guide.md")
        git(self.remote, "commit", "-qm", "First release")
        self.project = root / "project"
        self.project.mkdir()
        self.shared = self.project / "shared"
        git(self.project, "clone", "-q", str(self.remote), str(self.shared))
        self.previous = git(self.shared, "rev-parse", "HEAD")
        self.notes = self.project / "notes.json"
        self.notes.write_text('["A project note"]\n')
        (self.remote / "guide.md").write_text("Second guide")
        git(self.remote, "commit", "-qam", "Second release")
        self.latest = git(self.remote, "rev-parse", "HEAD")
        self.bible = SharedBible(self.shared, upstream=str(self.remote), published=lambda: self.latest)

    def test_check_then_install(self):
        self.assertEqual(self.bible.check()["status"], "available")
        self.assertEqual(git(self.shared, "rev-parse", "HEAD"), self.previous)
        outcome = self.bible.install(self.previous, self.latest)
        self.assertEqual(outcome["installed"], self.latest)
        self.assertEqual((self.shared / "guide.md").read_text(), "Second guide")
        self.assertEqual(self.notes.read_text(), '["A project note"]\n')
        self.assertEqual(self.bible.check()["status"], "current")
        self.assertEqual(self.bible.install(self.previous, self.latest)["status"], "current")

    def test_edited_shared_copy_is_preserved(self):
        (self.shared / "guide.md").write_text("Local edits")
        with self.assertRaises(UpdateError):
            self.bible.install(self.previous, self.latest)
        self.assertEqual(git(self.shared, "rev-parse", "HEAD"), self.previous)
        self.assertEqual((self.shared / "guide.md").read_text(), "Local edits")

    def test_request_must_match_latest_release(self):
        with self.assertRaises(UpdateError):
            self.bible.install(self.previous, "0" * 40)
        self.assertEqual(git(self.shared, "rev-parse", "HEAD"), self.previous)

    def test_failed_download_leaves_previous_release_active(self):
        self.remote.rename(self.remote.with_name("offline"))
        with self.assertRaises(UpdateError):
            self.bible.install(self.previous, self.latest)
        self.assertEqual(git(self.shared, "rev-parse", "HEAD"), self.previous)
        self.assertEqual((self.shared / "guide.md").read_text(), "First guide")
