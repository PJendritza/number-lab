"""Synthetic style augmentation, not a dataset of children's handwriting."""
import numpy as np
from PIL import Image, ImageDraw

def samples(count, seed):
 rng=np.random.default_rng(seed)
 pixels=[]; labels=[]
 for digit in (1,7):
  for _ in range(count):
   top=rng.uniform(45,85);bottom=rng.uniform(235,280);stem=rng.uniform(145,190);end=stem+rng.uniform(-30,20)
   if digit==1:
    strokes=[[(stem-rng.uniform(35,85),top+rng.uniform(30,70)),(stem,top),(end,bottom)]]
    if rng.random()<.25:strokes.append([(end-rng.uniform(30,50),bottom),(end+rng.uniform(30,50),bottom)])
   else:
    left=rng.uniform(55,105);right=rng.uniform(215,265);end=rng.uniform(100,165)
    strokes=[[(left,top+rng.uniform(-8,12)),(right,top),(end,bottom)]]
    if rng.random()<.85:
     mid=(top+bottom)/2+rng.uniform(-15,15)
     strokes.append([(end-rng.uniform(15,45),mid),(right-rng.uniform(5,30),mid+rng.uniform(-10,10))])
   image=Image.new('L',(320,320));draw=ImageDraw.Draw(image);width=int(rng.integers(9,23))
   for stroke in strokes:
    points=[(int(x+rng.uniform(-3,3)),int(y+rng.uniform(-3,3))) for x,y in stroke]
    draw.line(points,fill=255,width=width,joint='curve')
    for x,y in points:draw.ellipse((x-width/2,y-width/2,x+width/2,y+width/2),fill=255)
   crop=image.crop(image.getbbox());scale=20/max(crop.size)
   size=(max(1,round(crop.width*scale)),max(1,round(crop.height*scale)))
   scaled=crop.resize(size,Image.Resampling.BILINEAR);out=Image.new('L',(28,28));out.paste(scaled,((28-size[0])//2,(28-size[1])//2))
   a=np.array(out,dtype='float32')/255;ys,xs=np.indices(a.shape);mass=a.sum();dx=int(np.floor(13.5-(xs*a).sum()/mass+.5));dy=int(np.floor(13.5-(ys*a).sum()/mass+.5))
   centered=Image.new('L',(28,28));centered.paste(out,(dx,dy));pixels.append(np.array(centered,dtype='float32').reshape(-1)/255);labels.append(digit)
 return np.array(pixels),np.array(labels)
