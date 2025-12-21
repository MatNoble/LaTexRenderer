from setuptools import setup, find_packages

setup(
    name="latexrender",
    version="0.1.0",
    description="A Markdown to LaTeX converter specialized for academic writing",
    author="MatNoble",
    packages=find_packages(),
    install_requires=[
        "mistune>=3.0",
        "python-frontmatter",
        "fastapi",
        "uvicorn",
        "python-multipart",
    ],
    entry_points={
        "console_scripts": [
            "lxrender=latexrender.main:main",
        ],
    },
    python_requires=">=3.8",
)
