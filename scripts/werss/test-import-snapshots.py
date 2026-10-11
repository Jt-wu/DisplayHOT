import json
from pathlib import Path
import runpy
import subprocess
import tempfile
import unittest
from unittest.mock import patch


class ImportSnapshotsTest(unittest.TestCase):
    def run_import(self, failures):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'data').mkdir()
            (root / 'data/snapshot.json').write_text('[]')
            (root / 'data/snapshot-failures.json').write_text(json.dumps(failures))
            (root / 'import-results.json').write_text('[{"sourceId":"old","ok":true}]')

            def command(args, **kwargs):
                return subprocess.CompletedProcess(args, 1 if 'node' in args else 0, stdout='')

            with patch('pathlib.Path', return_value=root), patch('subprocess.run', side_effect=command):
                with self.assertRaises(SystemExit) as exit:
                    runpy.run_path(str(Path(__file__).with_name('import-snapshots.py')), run_name='__main__')
            self.assertEqual(exit.exception.code, 1)
            return json.loads((root / 'import-results.json').read_text())

    def test_all_failed_is_not_success_and_replaces_old_results(self):
        self.assertEqual(self.run_import([{'sourceId': 'test-source', 'error': 'WereadMPAPIError'}]),
                         [{'sourceId': 'test-source', 'ok': False}])

    def test_empty_snapshot_clears_stale_success_and_fails(self):
        self.assertEqual(self.run_import([]), [])


if __name__ == '__main__':
    unittest.main()
