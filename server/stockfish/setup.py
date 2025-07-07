from setuptools import setup, find_packages

setup(
    name="chess-stockfish",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        'python-chess==1.999',
        'numpy==1.24.3',
        'flask==2.3.3',
        'flask-cors==4.0.0'
    ],
    python_requires='>=3.9',
)
