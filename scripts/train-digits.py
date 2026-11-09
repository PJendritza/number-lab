"""Rebuild the bundled digit classifier. See docs/HANDWRITING.md for inputs."""
import argparse
import gzip
import hashlib
import json
from pathlib import Path
import numpy as np
from sklearn.neural_network import MLPClassifier

parser = argparse.ArgumentParser()
parser.add_argument('data', type=Path, help='Directory containing the four MNIST gzip files')
args = parser.parse_args()
checksums = {
 'train-images-idx3-ubyte.gz': '440fcabf73cc546fa21475e81ea370265605f56be210a4024d2ca8f203523609',
 'train-labels-idx1-ubyte.gz': '3552534a0a558bbed6aed32b30c495cca23d567ec52cac8be1a0730e8010255c',
 't10k-images-idx3-ubyte.gz': '8d422c7b0a1c1c79245a5bcf07fe86e33eeafee792b84584aec276f5a2dbc4e6',
 't10k-labels-idx1-ubyte.gz': 'f7ae60f92e00ec6debd23a6088c31dbd2371eca3ffa0defaefb259924204aec6',
}
for name, expected in checksums.items():
 if hashlib.sha256((args.data / name).read_bytes()).hexdigest() != expected:
  raise ValueError(f'Checksum mismatch: {name}')
def images(name):
 return np.frombuffer(gzip.decompress((args.data/name).read_bytes()),dtype=np.uint8,offset=16).reshape(-1,784).astype('float32')/255
def labels(name):
 return np.frombuffer(gzip.decompress((args.data/name).read_bytes()),dtype=np.uint8,offset=8)
model = MLPClassifier(hidden_layer_sizes=(80,),max_iter=35,random_state=42,early_stopping=True)
model.fit(images('train-images-idx3-ubyte.gz'),labels('train-labels-idx1-ubyte.gz'))
print('Held-out MNIST accuracy:',model.score(images('t10k-images-idx3-ubyte.gz'),labels('t10k-labels-idx1-ubyte.gz')))
root=Path(__file__).resolve().parents[1]
(root/'app/models/digits.json').write_text(json.dumps({'weights':[w.T.round(6).tolist() for w in model.coefs_],'biases':[b.round(6).tolist() for b in model.intercepts_]},separators=(',',':')))

# Independent, target-blind shape reference set for rejecting out-of-domain ink.
# Select only training samples; test fixtures are never used as references.
raw=np.frombuffer(gzip.decompress((args.data/'train-images-idx3-ubyte.gz').read_bytes()),dtype=np.uint8,offset=16).reshape(-1,784)
training_labels=labels('train-labels-idx1-ubyte.gz')
rng=np.random.default_rng(71)
shapes=[]
for digit in range(10):
 rows=raw[rng.choice(np.where(training_labels==digit)[0],80,replace=False)]
 shapes.append([''.join(format(int(v),'x') for v in np.round(row/17).astype('uint8')) for row in rows])
(root/'app/models/digit-shapes.json').write_text(json.dumps(shapes,separators=(',',':')))
