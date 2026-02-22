import os
import shutil
import tempfile
import subprocess
from langchain_core.documents import Document
from pathlib import Path

class RepoLoader:
    def __init__(self, repo_url: str):
        self.repo_url = repo_url
        self.temp_dir = tempfile.mkdtemp()

    def clone_repo(self):
        """Clones the repository to a temporary directory."""
        print(f"Cloning {self.repo_url} to {self.temp_dir}...")
        try:
            # Use shallow clone to avoid fetching history and hanging
            subprocess.run(["git", "clone", "--depth", "1", self.repo_url, self.temp_dir], check=True, capture_output=True)
            return self.temp_dir
        except subprocess.CalledProcessError as e:
            print(f"Error cloning repository: {e.stderr.decode('utf-8')}")
            self.cleanup()
            raise Exception("Failed to clone repository. Make sure the URL is public and valid.")

    def load_code(self):
        """Loads code files from the cloned repository, limiting size."""
        print(f"Loading code files from {self.temp_dir}...")
        extensions = [".py", ".js", ".ts", ".html", ".css", ".md", ".txt"]
        docs = []
        max_files_per_ext = 30 # Limit size to prevent hangs
        
        base_path = Path(self.temp_dir)
        exclude_dirs = {"node_modules", "dist", "build", "vendor", ".git", ".next"}

        for ext in extensions:
            print(f"Searching for *{ext} files...")
            count = 0
            for file_path in base_path.rglob(f"*{ext}"):
                # Skip excluded directories
                if any(part in exclude_dirs for part in file_path.parts):
                    continue
                
                try:
                    content = file_path.read_text(encoding="utf-8")
                    docs.append(Document(page_content=content, metadata={"source": str(file_path)}))
                    count += 1
                except Exception:
                    pass # Skip unreadable files silently
                
                if count >= max_files_per_ext:
                    break
            
            print(f"Found {count} files with {ext} extension.")
            
        print(f"Total documents loaded (capped): {len(docs)}")
        return docs
        
        print(f"Total documents loaded: {len(docs)}")
        return docs

    def cleanup(self):
        """Deletes the temporary directory."""
        if os.path.exists(self.temp_dir):
            def on_error(func, path, exc_info):
                import stat
                if not os.access(path, os.W_OK):
                    os.chmod(path, stat.S_IWUSR)
                    func(path)
            shutil.rmtree(self.temp_dir, onerror=on_error)
            print(f"Cleaned up {self.temp_dir}")
